package com.bookstore.service;

import com.bookstore.entity.Cart;
import com.bookstore.entity.Product;
import com.bookstore.entity.User;
import com.bookstore.repository.CartRepository;
import com.bookstore.repository.ProductRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledEmailService {

    private final EmailService emailService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;

    private static final int BATCH_SIZE = 100;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Value("${app.newsletter.enabled:true}")
    private boolean newsletterEnabled;

    @Value("${app.newsletter.cron:0 0 9 ? * SUN}")
    private String newsletterCron;

    @Value("${app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    /**
     * Gửi newsletter hàng tuần vào Chủ Nhật lúc 9:00 sáng
     * Cron: 0 0 9 ? * SUN
     */
    @Scheduled(cron = "${app.newsletter.cron:0 0 9 ? * SUN}")
    public void sendWeeklyNewsletter() {
        if (!newsletterEnabled) {
            log.info("Newsletter is disabled, skipping weekly send");
            return;
        }

        log.info("Starting weekly newsletter job at {}", LocalDateTime.now());
        long startTime = System.currentTimeMillis();

        try {
            // Lấy danh sách sản phẩm nổi bật
            List<Product> featuredProducts = productRepository.findTop8ByOrderByViewCountDesc();

            if (featuredProducts.isEmpty()) {
                log.warn("No featured products found for newsletter");
                featuredProducts = productRepository.findTop8ByOrderByCreatedAtDesc();
            }

            // Lấy danh sách sách bán chạy
            List<Product> bestSellers = productRepository.findTopProductsByOrderCount(PageRequest.of(0, 4));

            // Chuẩn bị dữ liệu newsletter
            Map<String, Object> newsletterData = prepareNewsletterData(featuredProducts, bestSellers);

            // Gửi email hàng loạt theo batch
            int totalSent = sendNewsletterToUsers(newsletterData);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Weekly newsletter completed: {} emails sent in {} ms", totalSent, duration);

        } catch (Exception e) {
            log.error("Error sending weekly newsletter: {}", e.getMessage(), e);
        }
    }

    /**
     * Gửi email chào mừng cho người dùng mới (chạy ngay sau khi đăng ký)
     */
    public void sendWelcomeNewsletter(User user) {
        try {
            Map<String, Object> newsletterData = new HashMap<>();
            newsletterData.put("subscriberName", user.getFirstName() != null ? user.getFirstName() : user.getEmail().split("@")[0]);
            newsletterData.put("featuredBookTitle", "Khám phá kho sách đồ sộ của chúng tôi!");
            newsletterData.put("featuredBookAuthor", "BookStore");
            newsletterData.put("featuredBookDescription", "Đăng ký ngay hôm nay để nhận nhiều ưu đãi hấp dẫn!");
            newsletterData.put("featuredBookPrice", "Nhiều ưu đãi");
            newsletterData.put("featuredBookOriginalPrice", "");
            newsletterData.put("featuredBookEmoji", "🎁");
            newsletterData.put("topProducts", Collections.emptyList());
            newsletterData.put("promoCode", "WELCOME10");
            newsletterData.put("promoTitle", "🎁 Ưu đãi đặc biệt cho thành viên mới!");
            newsletterData.put("promoDescription", "Giảm 10% cho đơn hàng đầu tiên");
            newsletterData.put("newsItems", Collections.emptyList());
            newsletterData.put("shopUrl", appBaseUrl + "/products");
            newsletterData.put("unsubscribeUrl", appBaseUrl + "/unsubscribe?email=" + user.getEmail());
            newsletterData.put("subject", "Chào mừng bạn đến với BookStore!");

            emailService.sendNewsletterEmail(user.getEmail(), newsletterData);
            log.info("Welcome newsletter sent to: {}", user.getEmail());

        } catch (Exception e) {
            log.error("Error sending welcome newsletter to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Gửi email thông báo đơn hàng mới cho admin
     */
    public void sendNewOrderNotification(String adminEmail, Map<String, Object> orderData) {
        try {
            Map<String, Object> adminData = new HashMap<>(orderData);
            adminData.put("subject", "🛒 Đơn hàng mới #" + orderData.get("orderNumber"));
            adminData.put("customerName", "Quản trị viên");

            emailService.sendOrderConfirmationEmail(adminEmail, adminData);
            log.info("New order notification sent to admin: {}", adminEmail);

        } catch (Exception e) {
            log.error("Error sending new order notification: {}", e.getMessage());
        }
    }

    /**
     * Gửi email reminder cho giỏ hàng bị bỏ quên lúc 18:00 hàng ngày
     */
    @Scheduled(cron = "${app.cart-reminder.cron:0 0 18 * * ?}")
    @Transactional
    public void sendAbandonedCartReminders() {
        log.info("Starting abandoned cart reminder job");

        // Giỏ hàng không có hoạt động trong 24h qua
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);
        List<Cart> abandonedCarts = cartRepository.findAbandonedCarts(threshold);

        for (Cart cart : abandonedCarts) {
            try {
                User user = cart.getUser();
                if (user.getEmail() == null || !Boolean.TRUE.equals(user.getIsEmailVerified())) {
                    continue;
                }

                Map<String, Object> data = new HashMap<>();
                data.put("subscriberName", user.getFullName());
                data.put("subject", "🛒 Hình như bạn quên gì đó trong giỏ hàng?");
                data.put("featuredBookTitle", "Đừng bỏ lỡ các ưu đãi hời!");
                data.put("featuredBookAuthor", "BookStore");
                data.put("featuredBookDescription", "Chúng tôi thấy bạn vẫn còn sản phẩm trong giỏ hàng. Hãy hoàn tất đơn hàng ngay để nhận ưu đãi.");
                data.put("promoCode", "COMEBACK10");
                data.put("promoTitle", "🎁 Tặng bạn mã giảm giá 10%!");
                data.put("promoDescription", "Sử dụng mã COMEBACK10 để giảm 10% cho đơn hàng của bạn.");
                data.put("shopUrl", appBaseUrl + "/cart");

                emailService.sendNewsletterEmail(user.getEmail(), data);

                cart.setReminderSentAt(LocalDateTime.now());
                cartRepository.save(cart);

            } catch (Exception e) {
                log.error("Failed to send cart reminder to user {}: {}", cart.getUser().getId(), e.getMessage());
            }
        }

        log.info("Abandoned cart reminder job completed: {} reminders processed", abandonedCarts.size());
    }

    /**
     * Gửi email chúc mừng sinh nhật lúc 8:00 sáng hàng ngày
     */
    @Scheduled(cron = "${app.birthday-email.cron:0 0 8 * * ?}")
    @Transactional
    public void sendBirthdayEmails() {
        log.info("Starting birthday email job");

        LocalDateTime now = LocalDateTime.now();
        int month = now.getMonthValue();
        int day = now.getDayOfMonth();

        List<User> birthdayUsers = userRepository.findByBirthday(month, day);

        for (User user : birthdayUsers) {
            try {
                Map<String, Object> data = new HashMap<>();
                data.put("subscriberName", user.getFullName());
                data.put("subject", "🎂 Chúc mừng sinh nhật " + (user.getFirstName() != null ? user.getFirstName() : "") + "!");
                data.put("featuredBookTitle", "Chúc mừng sinh nhật bạn!");
                data.put("featuredBookAuthor", "BookStore Team");
                data.put("featuredBookDescription", "Chúc bạn tuổi mới thật nhiều niềm vui, sức khỏe và có thêm nhiều trải nghiệm thú vị cùng những cuốn sách hay.");
                data.put("promoCode", "HPBD20");
                data.put("promoTitle", "🎁 Quà tặng sinh nhật dành riêng cho bạn!");
                data.put("promoDescription", "Gửi tặng bạn mã giảm giá 20% cho tất cả đơn hàng trong ngày hôm nay.");

                emailService.sendNewsletterEmail(user.getEmail(), data);
            } catch (Exception e) {
                log.error("Failed to send birthday email to {}: {}", user.getEmail(), e.getMessage());
            }
        }

        log.info("Birthday email job completed: {} emails sent", birthdayUsers.size());
    }

    private int sendNewsletterToUsers(Map<String, Object> newsletterData) {
        int page = 0;
        int totalSent = 0;

        while (true) {
            Page<User> usersPage = userRepository.findAllActiveUsers(PageRequest.of(page, BATCH_SIZE));

            if (usersPage.isEmpty()) {
                break;
            }

            for (User user : usersPage.getContent()) {
                if (user.getEmail() != null && Boolean.TRUE.equals(user.getIsEmailVerified())) {
                    try {
                        Map<String, Object> personalizedData = new HashMap<>(newsletterData);
                        personalizedData.put("subscriberName",
                                user.getFirstName() != null ? user.getFirstName() : user.getEmail().split("@")[0]);
                        personalizedData.put("unsubscribeUrl",
                                appBaseUrl + "/unsubscribe?email=" + user.getEmail() + "&token=" + generateUnsubscribeToken(user));

                        emailService.sendNewsletterEmail(user.getEmail(), personalizedData);
                        totalSent++;

                    } catch (Exception e) {
                        log.error("Failed to send newsletter to {}: {}", user.getEmail(), e.getMessage());
                    }
                }
            }

            if (!usersPage.hasNext()) {
                break;
            }
            page++;
        }

        return totalSent;
    }

    private Map<String, Object> prepareNewsletterData(List<Product> featuredProducts, List<Product> bestSellers) {
        Map<String, Object> data = new HashMap<>();

        // Sách nổi bật
        if (!featuredProducts.isEmpty()) {
            Product featured = featuredProducts.get(0);
            data.put("featuredBookTitle", featured.getName());
            data.put("featuredBookAuthor", featured.getAuthor() != null ? featured.getAuthor() : "Nhiều tác giả");
            data.put("featuredBookDescription", featured.getDescription() != null ?
                    (featured.getDescription().length() > 150 ?
                            featured.getDescription().substring(0, 150) + "..." :
                            featured.getDescription()) : "Một cuốn sách tuyệt vời");
            
            // Format price from BigDecimal
            java.math.BigDecimal price = featured.getCurrentPrice();
            data.put("featuredBookPrice", price != null ? formatPrice(price.doubleValue()) : "Liên hệ");
            
            // Check for discount - compare with original price
            if (featured.getDiscountPrice() != null && featured.getPrice() != null 
                    && featured.getDiscountPrice().compareTo(featured.getPrice()) < 0) {
                data.put("featuredBookOriginalPrice", formatPrice(featured.getPrice().doubleValue()));
            } else {
                data.put("featuredBookOriginalPrice", "");
            }
            
            data.put("featuredBookEmoji", getProductEmoji(featured.getCategory() != null ? featured.getCategory().getName() : ""));
        }

        // Top sản phẩm bán chạy
        List<Map<String, String>> topProducts = bestSellers.stream()
                .map(p -> {
                    Map<String, String> productMap = new HashMap<>();
                    productMap.put("title", p.getName());
                    productMap.put("author", p.getAuthor() != null ? p.getAuthor() : "Nhiều tác giả");
                    java.math.BigDecimal pPrice = p.getCurrentPrice();
                    productMap.put("price", pPrice != null ? formatPrice(pPrice.doubleValue()) : "Liên hệ");
                    productMap.put("emoji", getProductEmoji(p.getCategory() != null ? p.getCategory().getName() : ""));
                    return productMap;
                })
                .collect(Collectors.toList());
        data.put("topProducts", topProducts);

        // Tin tức/sự kiện
        List<Map<String, String>> newsItems = new ArrayList<>();

        Map<String, String> news1 = new HashMap<>();
        news1.put("title", "📚 Sách mới về kỹ năng sống");
        news1.put("summary", "Khám phá bộ sưu tập sách mới về phát triển bản thân và kỹ năng sống.");
        newsItems.add(news1);

        Map<String, String> news2 = new HashMap<>();
        news2.put("title", "🎉 Chương trình tích điểm đổi quà");
        news2.put("summary", "Tích lũy điểm thưởng với mỗi đơn hàng và đổi lấy những phần quà hấp dẫn.");
        newsItems.add(news2);

        data.put("newsItems", newsItems);

        // Khuyến mãi
        data.put("promoCode", "WEEKLY15");
        data.put("promoTitle", "🎁 Ưu đãi tuần này!");
        data.put("promoDescription", "Giảm 15% cho tất cả sách kỹ năng sống");

        return data;
    }

    private String formatPrice(double price) {
        if (price >= 1_000_000) {
            return String.format("%.1f triệuđ", price / 1_000_000);
        } else if (price >= 1000) {
            return String.format("%.0f.000đ", price / 1000);
        }
        return String.format("%.0fđ", price);
    }

    private String getProductEmoji(String category) {
        if (category == null) return "📚";
        String lowerCategory = category.toLowerCase();
        if (lowerCategory.contains("tiểu thuyết") || lowerCategory.contains("novel")) return "📖";
        if (lowerCategory.contains("trinh thám") || lowerCategory.contains("mystery")) return "🔍";
        if (lowerCategory.contains("khoa học") || lowerCategory.contains("science")) return "🔬";
        if (lowerCategory.contains("lịch sử") || lowerCategory.contains("history")) return "🏛️";
        if (lowerCategory.contains("kinh tế") || lowerCategory.contains("business")) return "💼";
        if (lowerCategory.contains("tâm lý") || lowerCategory.contains("psychology")) return "🧠";
        if (lowerCategory.contains("nấu ăn") || lowerCategory.contains("cooking")) return "🍳";
        if (lowerCategory.contains("trẻ em") || lowerCategory.contains("children")) return "👶";
        if (lowerCategory.contains("văn học") || lowerCategory.contains("literature")) return "✍️";
        if (lowerCategory.contains("ngôn tình") || lowerCategory.contains("romance")) return "💕";
        if (lowerCategory.contains("kiếm hiệp")) return "⚔️";
        if (lowerCategory.contains("truyện tranh") || lowerCategory.contains("comic")) return "🎨";
        return "📚";
    }

    private String generateUnsubscribeToken(User user) {
        // Simple token generation (in production, use proper cryptographic token)
        return UUID.nameUUIDFromBytes((user.getId() + user.getEmail() + "unsubscribe").getBytes()).toString();
    }
}
