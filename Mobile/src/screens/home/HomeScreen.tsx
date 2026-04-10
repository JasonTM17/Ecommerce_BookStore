import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { useAuth } from "../../store/AuthContext";
import api from "../../api/client";
import { useQuery } from "@tanstack/react-query";

interface Product {
  id: number;
  name: string;
  author: string;
  price: number;
  imageUrl: string;
  avgRating: number;
}

export function HomeScreen() {
  const { user } = useAuth();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/products", { params: { size: 10 } });
      return response.data.data.content as Product[];
    },
  });

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào, {user?.firstName || "Khách"}!</Text>
          <Text style={styles.subtitle}>Hôm nay bạn muốn đọc gì?</Text>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danh mục</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {["Sách mới", "Bestseller", "Self-help", "Tiểu thuyết", "Kỹ năng"].map((cat, i) => (
            <TouchableOpacity key={i} style={styles.categoryItem}>
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sách nổi bật</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {products.map((product) => (
            <TouchableOpacity key={product.id} style={styles.productCard}>
              <View style={styles.productImageContainer}>
                {product.imageUrl ? (
                  <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, styles.placeholderImage]}>
                    <Text style={styles.placeholderText}>📚</Text>
                  </View>
                )}
              </View>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.productAuthor} numberOfLines={1}>{product.author}</Text>
              <Text style={styles.productPrice}>
                {product.price.toLocaleString("vi-VN")}đ
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Flash Sale Banner */}
      <TouchableOpacity style={styles.flashSaleBanner}>
        <Text style={styles.flashSaleTitle}>⚡ FLASH SALE</Text>
        <Text style={styles.flashSaleSubtitle}>Giảm giá cực sốc hôm nay!</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#3b82f6",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 14,
    color: "#bfdbfe",
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: "#3b82f6",
  },
  categoryItem: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  productCard: {
    width: 150,
    marginRight: 12,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImageContainer: {
    aspectRatio: 3 / 4,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 32,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    padding: 8,
    paddingBottom: 4,
  },
  productAuthor: {
    fontSize: 12,
    color: "#6b7280",
    paddingHorizontal: 8,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#3b82f6",
    padding: 8,
    paddingTop: 4,
  },
  flashSaleBanner: {
    margin: 16,
    padding: 20,
    backgroundColor: "#ef4444",
    borderRadius: 16,
  },
  flashSaleTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  flashSaleSubtitle: {
    fontSize: 14,
    color: "#fecaca",
    marginTop: 4,
  },
});
