import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../store/AuthContext";

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();

  const menuItems = [
    { title: "Đơn hàng của tôi", description: "Mở lịch sử mua hàng", action: () => navigation.navigate("Orders") },
    { title: "Khám phá sản phẩm", description: "Trở lại catalog mobile", action: () => navigation.navigate("Products") },
    { title: "Chatbot hỗ trợ", description: "Mở màn chat Grok", action: () => navigation.navigate("Chatbot") },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.firstName?.charAt(0)?.toUpperCase() || "U"}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName || "Người dùng"}</Text>
        <Text style={styles.email}>{user?.email || "email@example.com"}</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.title} style={styles.menuItem} onPress={item.action}>
            <View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
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
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563eb",
  },
  avatarText: {
    fontSize: 30,
    fontWeight: "700",
    color: "#ffffff",
  },
  name: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  email: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
  },
  menu: {
    marginTop: 16,
    backgroundColor: "#ffffff",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  menuDescription: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },
  menuArrow: {
    fontSize: 24,
    color: "#9ca3af",
  },
  logoutButton: {
    margin: 16,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#fef2f2",
    padding: 16,
  },
  logoutText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "600",
  },
});
