import React, { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BookOpen, ShoppingCart } from "lucide-react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../store/AuthContext";
import api from "../../api/client";

type RootStackParamList = {
  ProductDetail: { productId: number };
};

interface Product {
  id: number;
  name: string;
  author?: string;
  publisher?: string;
  description?: string;
  price: number;
  currentPrice: number;
  imageUrl?: string;
  category?: { name: string };
  stockQuantity?: number;
}

export function ProductDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "ProductDetail">>();
  const { productId } = route.params;

  const { data: product } = useQuery<Product>({
    queryKey: ["mobile-product-detail", productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    },
  });

  const queryClient = useQueryClient();
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      await api.post("/cart/items", { productId, quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mobile-cart"] });
      Alert.alert("Thành công", "Đã thêm sản phẩm vào giỏ hàng!", [
        { text: "Tiếp tục mua sắm", style: "cancel" },
        { text: "Xem giỏ hàng", onPress: () => navigation.navigate("Cart") }
      ]);
    },
    onError: () => {
      Alert.alert("Lỗi", "Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
    }
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để thêm vào giỏ hàng.", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng nhập", onPress: () => navigation.navigate("Login") }
      ]);
      return;
    }
    addToCartMutation.mutate();
  };

  return (
    <View style={styles.screenWrapper}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.imageContainer}>
        {product?.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <BookOpen color="#9ca3af" size={64} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.category}>{product?.category?.name || "Đang tải..."}</Text>
        <Text style={styles.title}>{product?.name || "Đang tải chi tiết sách..."}</Text>
        <Text style={styles.author}>Tác giả: {product?.author || "Đang cập nhật"}</Text>

        <View style={styles.priceCard}>
          <Text style={styles.currentPrice}>{(product?.currentPrice || 0).toLocaleString("vi-VN")}đ</Text>
          {product && product.currentPrice < product.price ? (
            <Text style={styles.originalPrice}>{product.price.toLocaleString("vi-VN")}đ</Text>
          ) : null}
          <Text style={styles.stock}>Còn hàng ({product?.stockQuantity ?? 0} sản phẩm)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.bodyText}>
            {product?.description || "Chưa có bài viết mô tả chi tiết cho sản phẩm này."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin thêm</Text>
          <Text style={styles.bodyText}>Nhà xuất bản: {product?.publisher || "Đang cập nhật"}</Text>
        </View>
      </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityBtn} 
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Text style={styles.quantityBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityBtn} 
            onPress={() => setQuantity(Math.min(product?.stockQuantity || 1, quantity + 1))}
          >
            <Text style={styles.quantityBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={[styles.addToCartBtn, !product?.stockQuantity && styles.disabledBtn]} 
          onPress={handleAddToCart}
          disabled={!product?.stockQuantity || addToCartMutation.isPending}
        >
          <ShoppingCart color="#fff" size={20} />
          <Text style={styles.addToCartText}>
            {product?.stockQuantity ? "Thêm vào giỏ" : "Hết hàng"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    aspectRatio: 1,
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
  placeholderText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#9ca3af",
  },
  content: {
    padding: 16,
  },
  category: {
    fontSize: 12,
    textTransform: "uppercase",
    color: "#6b7280",
  },
  title: {
    marginTop: 6,
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },
  author: {
    marginTop: 8,
    fontSize: 15,
    color: "#4b5563",
  },
  priceCard: {
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    padding: 16,
  },
  currentPrice: {
    fontSize: 30,
    fontWeight: "700",
    color: "#2563eb",
  },
  originalPrice: {
    marginTop: 6,
    fontSize: 16,
    textDecorationLine: "line-through",
    color: "#9ca3af",
  },
  stock: {
    marginTop: 8,
    fontSize: 14,
    color: "#16a34a",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4b5563",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityBtn: {
    padding: 8,
  },
  quantityBtnText: {
    fontSize: 20,
    color: "#374151",
    fontWeight: "500",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginHorizontal: 12,
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  disabledBtn: {
    backgroundColor: "#9ca3af",
  },
  addToCartText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
