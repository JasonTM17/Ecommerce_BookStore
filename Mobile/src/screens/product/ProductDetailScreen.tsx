import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";

type RootStackParamList = {
  ProductDetail: { productId: number };
};

export function ProductDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "ProductDetail">>();
  const { productId } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.emoji}>📚</Text>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.content}>
        <Text style={styles.category}>Tiểu thuyết</Text>
        <Text style={styles.title}>Tên sách</Text>
        <Text style={styles.author}>Tác giả</Text>

        <View style={styles.ratingRow}>
          <Text style={styles.rating}>⭐ 4.8</Text>
          <Text style={styles.reviewCount}>(128 đánh giá)</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>199.000đ</Text>
          <Text style={styles.originalPrice}>250.000đ</Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-20%</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>
            Mô tả sách sẽ hiển thị ở đây...
          </Text>
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin chi tiết</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tác giả</Text>
            <Text style={styles.detailValue}>Tên tác giả</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nhà xuất bản</Text>
            <Text style={styles.detailValue}>NXB Trẻ</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số trang</Text>
            <Text style={styles.detailValue}>320</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.wishlistButton}>
            <Text style={styles.wishlistButtonText}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addToCartButton}>
            <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
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
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 100,
  },
  content: {
    padding: 16,
  },
  category: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  author: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  rating: {
    fontSize: 16,
    color: "#f59e0b",
    marginRight: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ef4444",
  },
  originalPrice: {
    fontSize: 16,
    color: "#9ca3af",
    textDecorationLine: "line-through",
    marginLeft: 12,
  },
  discountBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 22,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  wishlistButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  wishlistButtonText: {
    fontSize: 24,
  },
  addToCartButton: {
    flex: 1,
    height: 56,
    backgroundColor: "#3b82f6",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
