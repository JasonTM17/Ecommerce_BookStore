import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ShoppingCart, Trash2, BookOpen } from "lucide-react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../store/AuthContext";
import api from "../../api/client";

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  price: number;
  currentPrice: number;
  quantity: number;
  subtotal: number;
}

interface Cart {
  id: number;
  totalItems: number;
  totalPrice: number;
  items: CartItem[];
}

export function CartScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery<Cart>({
    queryKey: ["mobile-cart"],
    queryFn: async () => {
      const response = await api.get("/cart");
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      await api.put(`/cart/items/${itemId}?quantity=${quantity}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-cart"] });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      await api.delete(`/cart/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-cart"] });
    },
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
        <Text style={styles.emptyText}>Đăng nhập để xem và thanh toán giỏ hàng của bạn.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.buttonText}>Đi tới đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <ShoppingCart color="#d1d5db" size={80} style={{ marginBottom: 20 }} />
        <Text style={styles.emptyTitle}>Giỏ hàng của bạn đang trống</Text>
        <Text style={styles.emptyText}>
          Hãy tiếp tục khám phá các tủ sách và chọn cho mình những tác phẩm ưng ý nhất nhé!
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Products")}>
          <Text style={styles.buttonText}>Khám phá sản phẩm</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Giỏ hàng ({cart.totalItems})</Text>
      </View>

      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.placeholder]}>
                  <BookOpen color="#9ca3af" size={24} />
                </View>
              )}
            </View>
            <View style={styles.details}>
              <Text style={styles.name} numberOfLines={2}>
                {item.productName}
              </Text>
              <Text style={styles.price}>{item.currentPrice.toLocaleString("vi-VN")}đ</Text>
              
              <View style={styles.actionsBox}>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.qtBtn}
                    onPress={() => {
                      if (item.quantity > 1) {
                        updateQuantityMutation.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                      }
                    }}
                  >
                    <Text style={styles.qtText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtBtn}
                    onPress={() => updateQuantityMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                  >
                    <Text style={styles.qtText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => removeItemMutation.mutate(item.id)} style={styles.removeBtn}>
                  <Trash2 color="#ef4444" size={20} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tạm tính:</Text>
          <Text style={styles.summaryValue}>{cart.totalPrice.toLocaleString("vi-VN")}đ</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate("Checkout")}>
          <Text style={styles.checkoutText}>Tiến hành Đặt hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563eb",
    marginTop: 4,
  },
  actionsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  qtBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  qtText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
  },
  qtValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  removeBtn: {
    padding: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#4b5563",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#dc2626",
  },
  checkoutBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 16,
  },
  checkoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  emptyText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
  },
  button: {
    marginTop: 24,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
