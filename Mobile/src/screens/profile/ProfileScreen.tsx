import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "../../store/AuthContext";

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const menuItems = [
    { title: "Hồ sơ cá nhân", icon: "👤", screen: "Profile" },
    { title: "Đơn hàng của tôi", icon: "📦", screen: "Orders" },
    { title: "Sách yêu thích", icon: "❤️", screen: "Wishlist" },
    { title: "Reading Tracker", icon: "📖", screen: "Reading" },
    { title: "Cài đặt thông báo", icon: "🔔", screen: "Notifications" },
    { title: "Hỗ trợ", icon: "💬", screen: "Support" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{user?.fullName || "Người dùng"}</Text>
        <Text style={styles.email}>{user?.email || "email@example.com"}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#6b7280",
  },
  menuContainer: {
    backgroundColor: "#ffffff",
    marginTop: 16,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    color: "#1f2937",
  },
  menuArrow: {
    fontSize: 20,
    color: "#9ca3af",
  },
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
});
