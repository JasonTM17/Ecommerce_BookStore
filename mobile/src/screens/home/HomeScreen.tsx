import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BookOpen } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../store/AuthContext";
import api from "../../api/client";

interface Product {
  id: number;
  name: string;
  author?: string;
  currentPrice: number;
  price: number;
  imageUrl?: string;
}

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["mobile-home-products"],
    queryFn: async () => {
      const response = await api.get("/products", { params: { size: 10 } });
      return response.data.content ?? [];
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào, {user?.firstName || "bạn"}!</Text>
        <Text style={styles.subtitle}>Đây là baseline mobile để bạn tiếp tục phát triển từ cùng backend hiện tại.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lối tắt nhanh</Text>
        <View style={styles.shortcutGrid}>
          <TouchableOpacity style={styles.shortcut} onPress={() => navigation.navigate("Products")}>
            <Text style={styles.shortcutTitle}>Sản phẩm</Text>
            <Text style={styles.shortcutText}>Mở catalog mobile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcut} onPress={() => navigation.navigate("Orders")}>
            <Text style={styles.shortcutTitle}>Đơn hàng</Text>
            <Text style={styles.shortcutText}>Theo dõi đơn đã đặt</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sách nổi bật</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Products")}>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {products.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productCard}
              onPress={() => navigation.navigate("ProductDetail", { productId: product.id })}
            >
              <View style={styles.productImageContainer}>
                {product.imageUrl ? (
                  <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, styles.placeholderImage]}>
                    <BookOpen color="#9ca3af" size={32} />
                  </View>
                )}
              </View>
              <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
              <Text style={styles.productAuthor} numberOfLines={1}>{product.author || "Tác giả cập nhật sau"}</Text>
              <Text style={styles.productPrice}>{product.currentPrice.toLocaleString("vi-VN")}đ</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.banner} onPress={() => navigation.navigate("Products")}>
        <Text style={styles.bannerTitle}>Flash Sale đồng bộ từ backend</Text>
        <Text style={styles.bannerText}>Màn web đang là showcase chính; mobile đã sẵn sàng dùng chung nguồn dữ liệu.</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#2563eb",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#dbeafe",
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  seeAll: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
  shortcutGrid: {
    flexDirection: "row",
    gap: 12,
  },
  shortcut: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  shortcutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  shortcutText: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280",
  },
  productCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    padding: 10,
  },
  productImageContainer: {
    aspectRatio: 3 / 4,
    overflow: "hidden",
    borderRadius: 12,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5e7eb",
  },
  placeholderText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#9ca3af",
  },
  productName: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  productAuthor: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },
  productPrice: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: "#2563eb",
  },
  banner: {
    margin: 16,
    borderRadius: 18,
    backgroundColor: "#fee2e2",
    padding: 18,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#b91c1c",
  },
  bannerText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#7f1d1d",
  },
});
