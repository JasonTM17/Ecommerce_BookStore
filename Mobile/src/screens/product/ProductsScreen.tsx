import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { useAuth } from "../../store/AuthContext";
import api from "../../api/client";
import { useQuery } from "@tanstack/react-query";

interface Product {
  id: number;
  name: string;
  author: string;
  price: number;
  currentPrice: number;
  imageUrl: string;
  avgRating: number;
}

export function ProductsScreen() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await api.get("/products", { params: { size: 20 } });
      return response.data.data.content as Product[];
    },
  });

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImage}>
        {item.imageUrl ? (
          <Text style={styles.emoji}>📚</Text>
        ) : (
          <Text style={styles.emoji}>📚</Text>
        )}
      </View>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.productAuthor} numberOfLines={1}>{item.author}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.currentPrice}>
          {item.currentPrice?.toLocaleString("vi-VN") || item.price.toLocaleString("vi-VN")}đ
        </Text>
        {item.currentPrice && item.currentPrice < item.price && (
          <Text style={styles.originalPrice}>
            {item.price.toLocaleString("vi-VN")}đ
          </Text>
        )}
      </View>
      <View style={styles.ratingContainer}>
        <Text style={styles.rating}>⭐ {item.avgRating?.toFixed(1) || "0.0"}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sản phẩm</Text>
      </View>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  listContainer: {
    padding: 12,
  },
  row: {
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    aspectRatio: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emoji: {
    fontSize: 48,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  productAuthor: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ef4444",
  },
  originalPrice: {
    fontSize: 12,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  ratingContainer: {
    marginTop: 4,
  },
  rating: {
    fontSize: 12,
    color: "#6b7280",
  },
});
