import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {product?.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>B</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.category}>{product?.category?.name || "Danh mục đang cập nhật"}</Text>
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
            {product?.description || "Màn chi tiết mobile đã nối dữ liệu thật. Luồng thêm vào giỏ sẽ là bước hoàn thiện tiếp theo của app native."}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin thêm</Text>
          <Text style={styles.bodyText}>Nhà xuất bản: {product?.publisher || "Đang cập nhật"}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
});
