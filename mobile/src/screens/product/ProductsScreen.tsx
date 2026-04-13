import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BookOpen } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/client";

interface Product {
  id: number;
  name: string;
  author?: string;
  price: number;
  currentPrice: number;
  imageUrl?: string;
  avgRating?: number;
}

export function ProductsScreen() {
  const navigation = useNavigation<any>();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["mobile-products"],
    queryFn: async () => {
      const response = await api.get("/products", { params: { size: 20 } });
      return response.data.content ?? [];
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sản phẩm</Text>
        <Text style={styles.subtitle}>Danh mục mobile đang dùng trực tiếp dữ liệu từ backend hiện tại.</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}>
            <View style={styles.imageWrapper}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.placeholder]}>
                  <BookOpen color="#9ca3af" size={32} />
                </View>
              )}
            </View>
            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
            <Text style={styles.author} numberOfLines={1}>{item.author || "Tác giả đang cập nhật"}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>{item.currentPrice.toLocaleString("vi-VN")}đ</Text>
              {item.currentPrice < item.price ? (
                <Text style={styles.originalPrice}>{item.price.toLocaleString("vi-VN")}đ</Text>
              ) : null}
            </View>
            <Text style={styles.rating}>⭐ {(item.avgRating ?? 0).toFixed(1)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#6b7280",
  },
  list: {
    padding: 12,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    padding: 12,
  },
  imageWrapper: {
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },
  placeholderText: {
    fontSize: 26,
    fontWeight: "700",
    color: "#9ca3af",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  author: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },
  priceRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#dc2626",
  },
  originalPrice: {
    fontSize: 12,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  rating: {
    marginTop: 6,
    fontSize: 12,
    color: "#6b7280",
  },
});
