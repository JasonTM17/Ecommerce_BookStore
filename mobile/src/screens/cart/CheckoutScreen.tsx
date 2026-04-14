import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../api/client";

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  price: number;
  currentPrice: number;
  quantity: number;
}

interface Cart {
  items: CartItem[];
  totalPrice: number;
}

export function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();

  const [receiverName, setReceiverName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const { data: cart } = useQuery<Cart>({
    queryKey: ["mobile-cart"],
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // Create order
      if (!cart || cart.items.length === 0) return;
      
      const orderItems = cart.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const payload = {
        items: orderItems,
        shippingAddress: address,
        shippingPhone: phone,
        shippingReceiverName: receiverName,
        shippingMethod: "Giao hàng tiêu chuẩn",
        paymentMethod: "Thanh toán khi nhận hàng (COD)",
        notes: notes
      };

      await api.post("/orders", payload);
      // Clear cart
      await api.delete("/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-cart"] });
      queryClient.invalidateQueries({ queryKey: ["mobile-orders"] });
      
      Alert.alert("Đặt hàng thành công", "Cảm ơn bạn đã mua sách!", [
        { 
          text: "Xem đơn hàng", 
          onPress: () => {
            navigation.navigate("Main", { screen: "Products" }); // pop back to main
            navigation.navigate("Orders");
          } 
        }
      ]);
    },
    onError: () => {
      Alert.alert("Lỗi", "Không thể tạo đơn hàng. Vui lòng thử lại sau.");
    }
  });

  const handleCheckout = () => {
    if (!receiverName || !phone || !address) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ Tên, Số điện thoại và Địa chỉ giao hàng.");
      return;
    }
    checkoutMutation.mutate();
  };

  const totalPrice = cart?.totalPrice || 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          
          <Text style={styles.label}>Tên người nhận *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: Nguyễn Văn A"
            value={receiverName}
            onChangeText={setReceiverName}
          />

          <Text style={styles.label}>Số điện thoại *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ví dụ: 0912345678"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Địa chỉ giao hàng *</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
            multiline
            textAlignVertical="top"
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>Ghi chú đơn hàng (Tùy chọn)</Text>
          <TextInput
            style={styles.input}
            placeholder="Giao giờ hành chính, v.v..."
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Phương thức thanh toán</Text>
            <Text style={styles.summaryBold}>Thanh toán khi nhận hàng (COD)</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Thành tiền</Text>
            <Text style={styles.totalText}>{totalPrice.toLocaleString("vi-VN")}đ</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.submitBtn} 
          onPress={handleCheckout}
          disabled={checkoutMutation.isPending}
        >
          {checkoutMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Xác nhận Đặt hàng</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scroll: {
    padding: 16,
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  summaryBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 16,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: "#4b5563",
  },
  summaryBold: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1d4ed8",
  },
  totalText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#dc2626",
  },
  footer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  submitBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 16,
  },
  submitText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
