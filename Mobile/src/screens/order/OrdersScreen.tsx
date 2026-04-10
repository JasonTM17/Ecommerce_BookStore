import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import api from "../../api/client";
import { useQuery } from "@tanstack/react-query";

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export function OrdersScreen() {
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await api.get("/orders/my");
      return response.data.data as Order[];
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "#f59e0b";
      case "CONFIRMED": return "#3b82f6";
      case "SHIPPING": return "#8b5cf6";
      case "DELIVERED": return "#22c55e";
      case "CANCELLED": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING": return "Chờ xác nhận";
      case "CONFIRMED": return "Đã xác nhận";
      case "SHIPPING": return "Đang giao";
      case "DELIVERED": return "Đã giao";
      case "CANCELLED": return "Đã hủy";
      default: return status;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đơn hàng của tôi</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
        </View>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + "20" }]}>
                <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                  {getStatusText(order.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </Text>
            <Text style={styles.orderAmount}>
              {order.totalAmount.toLocaleString("vi-VN")}đ
            </Text>
          </View>
        ))
      )}
    </ScrollView>
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
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
  },
  orderCard: {
    backgroundColor: "#ffffff",
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderDate: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3b82f6",
  },
});
