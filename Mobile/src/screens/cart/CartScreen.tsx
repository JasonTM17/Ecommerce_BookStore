import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../store/AuthContext";

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
      <Text style={styles.emptyTitle}>Giỏ hàng mobile đang chờ phase tiếp theo</Text>
      <Text style={styles.emptyText}>
        Backend và auth đã được nối đúng. Luồng giỏ hàng sẽ là phase mobile tiếp theo để giữ pass này gọn và ổn định.
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
