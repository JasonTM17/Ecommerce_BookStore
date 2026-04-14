import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../store/AuthContext";
import { ShoppingCart } from "lucide-react-native";

export function CartScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
        <Text style={styles.emptyText}>Đăng nhập để xem giỏ hàng của bạn trên mobile.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.buttonText}>Đi tới đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

const styles = StyleSheet.create({
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
