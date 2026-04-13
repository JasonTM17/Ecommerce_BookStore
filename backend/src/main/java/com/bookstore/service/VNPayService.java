package com.bookstore.service;

import com.bookstore.dto.response.PaymentResponse;
import com.bookstore.entity.*;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayService {

    private final PaymentTransactionRepository transactionRepository;
    private final OrderRepository orderRepository;
    private final EmailService emailService;

    @Value("${vnpay.url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String vnpayUrl;

    @Value("${vnpay.merchant.id:}")
    private String merchantId;

    @Value("${vnpay.merchant.key:}")
    private String merchantKey;

    @Value("${vnpay.return.url:http://localhost:3000/payment/return}")
    private String returnUrl;

    @Value("${vnpay.ipn.url:http://localhost:8080/api/payments/vnpay/ipn}")
    private String ipnUrl;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    @Transactional
    public PaymentResponse createPayment(Long orderId, String ipAddress) {
        Order order = orderRepository.findByIdWithUser(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!PaymentMethod.VNPAY.name().equals(order.getPaymentMethod())) {
            throw new BadRequestException("Đơn hàng không hỗ trợ thanh toán VNPay");
        }

        PaymentTransaction transaction = transactionRepository.findByOrderId(orderId)
                .orElse(PaymentTransaction.builder()
                        .order(order)
                        .paymentMethod(PaymentMethod.VNPAY)
                        .paymentStatus(PaymentStatus.PENDING)
                        .amount(order.getTotalAmount())
                        .ipAddress(ipAddress)
                        .build());

        String transactionId = generateTransactionId();
        transaction.setTransactionId(transactionId);
        transaction.setExpiredAt(LocalDateTime.now().plusMinutes(30));
        transactionRepository.save(transaction);

        String paymentUrl = buildPaymentUrl(order, transaction, ipAddress);
        log.info("VNPay payment URL created for order {}: {}", orderId, paymentUrl);

        return PaymentResponse.builder()
                .success(true)
                .transactionId(transactionId)
                .paymentUrl(paymentUrl)
                .amount(order.getTotalAmount())
                .expiresAt(transaction.getExpiredAt())
                .message("Redirect to VNPay to complete payment")
                .build();
    }

    private String buildPaymentUrl(Order order, PaymentTransaction transaction, String ipAddress) {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", merchantId);
        params.put("vnp_Amount", String.valueOf(order.getTotalAmount().multiply(BigDecimal.valueOf(100)).intValue()));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_BankCode", "");
        params.put("vnp_Locale", "vn");
        params.put("vnp_OrderInfo", "Thanh toán đơn hàng " + order.getOrderNumber());
        params.put("vnp_OrderType", "bookstore");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_IpAddr", ipAddress);
        params.put("vnp_CreateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        params.put("vnp_ExpireDate", transaction.getExpiredAt().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
        params.put("vnp_TxnRef", transaction.getTransactionId());

        String queryString = buildQueryString(params);
        String secureHash = hmacSHA512(merchantKey, queryString);
        return vnpayUrl + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    @Transactional
    public PaymentResponse handleReturn(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        String transactionId = params.get("vnp_TxnRef");
        String vnpResponseCode = params.get("vnp_ResponseCode");
        String vnpTransactionNo = params.get("vnp_TransactionNo");

        if (!verifySignature(params, secureHash)) {
            return PaymentResponse.builder()
                    .success(false)
                    .message("Invalid signature")
                    .build();
        }

        PaymentTransaction transaction = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "id", transactionId));

        if ("00".equals(vnpResponseCode)) {
            transaction.setPaymentStatus(PaymentStatus.SUCCESS);
            transaction.setVnpResponseCode(vnpResponseCode);
            transaction.setVnpTransactionNo(vnpTransactionNo);
            transaction.setPaidAt(LocalDateTime.now());
            transactionRepository.save(transaction);

            Order order = transaction.getOrder();
            order.setPaymentStatus(PaymentStatus.SUCCESS);
            orderRepository.save(order);

            log.info("VNPay payment successful for transaction {}", transactionId);

            return PaymentResponse.builder()
                    .success(true)
                    .transactionId(transactionId)
                    .amount(transaction.getAmount())
                    .message("Thanh toán thành công!")
                    .orderNumber(order.getOrderNumber())
                    .build();
        } else {
            transaction.setPaymentStatus(PaymentStatus.FAILED);
            transaction.setVnpResponseCode(vnpResponseCode);
            transactionRepository.save(transaction);

            log.warn("VNPay payment failed for transaction {}: {}", transactionId, vnpResponseCode);

            return PaymentResponse.builder()
                    .success(false)
                    .transactionId(transactionId)
                    .message("Thanh toán thất bại. Mã lỗi: " + vnpResponseCode)
                    .build();
        }
    }

    @Transactional
    public PaymentResponse handleIPN(Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        String transactionId = params.get("vnp_TxnRef");
        String vnpResponseCode = params.get("vnp_ResponseCode");
        String vnpTransactionNo = params.get("vnp_TransactionNo");

        if (!verifySignature(params, secureHash)) {
            return PaymentResponse.builder()
                    .success(false)
                    .message("Invalid signature")
                    .build();
        }

        PaymentTransaction transaction = transactionRepository.findByTransactionId(transactionId).orElse(null);
        if (transaction == null) {
            return PaymentResponse.builder().success(false).message("Transaction not found").build();
        }

        if ("00".equals(vnpResponseCode)) {
            if (transaction.getPaymentStatus() != PaymentStatus.SUCCESS) {
                transaction.setPaymentStatus(PaymentStatus.SUCCESS);
                transaction.setVnpResponseCode(vnpResponseCode);
                transaction.setVnpTransactionNo(vnpTransactionNo);
                transaction.setPaidAt(LocalDateTime.now());
                transactionRepository.save(transaction);

                Order order = transaction.getOrder();
                order.setPaymentStatus(PaymentStatus.SUCCESS);
                orderRepository.save(order);

                sendOrderConfirmationEmail(order);
            }
        } else {
            transaction.setPaymentStatus(PaymentStatus.FAILED);
            transaction.setVnpResponseCode(vnpResponseCode);
            transactionRepository.save(transaction);
        }

        return PaymentResponse.builder()
                .success("00".equals(vnpResponseCode))
                .transactionId(transactionId)
                .message("00".equals(vnpResponseCode) ? "Success" : "Failed")
                .build();
    }

    @Transactional
    public PaymentResponse refund(Long orderId, BigDecimal amount, String reason) {
        PaymentTransaction transaction = transactionRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", "orderId", orderId));

        if (transaction.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new BadRequestException("Giao dịch chưa được thanh toán");
        }

        if (transaction.getRefundAmount().add(amount).compareTo(transaction.getAmount()) > 0) {
            throw new BadRequestException("Số tiền hoàn vượt quá số tiền đã thanh toán");
        }

        transaction.setRefundAmount(transaction.getRefundAmount().add(amount));
        transaction.setRefundedAt(LocalDateTime.now());
        transaction.setRefundReason(reason);

        if (transaction.getRefundAmount().compareTo(transaction.getAmount()) >= 0) {
            transaction.setPaymentStatus(PaymentStatus.REFUNDED);
        } else {
            transaction.setPaymentStatus(PaymentStatus.PARTIALLY_REFUNDED);
        }

        transactionRepository.save(transaction);
        log.info("Refund processed for transaction {}: {} VND", transaction.getTransactionId(), amount);

        return PaymentResponse.builder()
                .success(true)
                .transactionId(transaction.getTransactionId())
                .amount(amount)
                .message("Hoàn tiền thành công")
                .build();
    }

    private boolean verifySignature(Map<String, String> params, String secureHash) {
        params.remove("vnp_SecureHash");
        params.remove("vnp_SecureHashType");

        String queryString = buildQueryString(params);
        String mySecureHash = hmacSHA512(merchantKey, queryString);

        return mySecureHash.equals(secureHash);
    }

    private String buildQueryString(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                try {
                    sb.append(entry.getKey())
                      .append("=")
                      .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString()))
                      .append("&");
                } catch (Exception e) {
                    log.error("Error encoding param: {}", entry.getKey(), e);
                }
            }
        }
        if (sb.length() > 0) {
            sb.setLength(sb.length() - 1);
        }
        return sb.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] hash = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("HMAC SHA512 error", e);
            return "";
        }
    }

    private String generateTransactionId() {
        return "TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void sendOrderConfirmationEmail(Order order) {
        try {
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("customerName", order.getUser().getFullName());
            orderData.put("orderNumber", order.getOrderNumber());
            orderData.put("totalAmount", formatCurrency(order.getTotalAmount()));
            orderData.put("paymentMethod", "VNPay");
            emailService.sendOrderConfirmationEmail(order.getUser().getEmail(), orderData);
        } catch (Exception e) {
            log.warn("Could not send order confirmation email: {}", e.getMessage());
        }
    }

    private String formatCurrency(BigDecimal amount) {
        return String.format("%,.0fđ", amount.doubleValue()).replace(",", ".");
    }
}
