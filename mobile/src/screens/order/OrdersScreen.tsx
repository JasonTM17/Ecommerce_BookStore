import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import api from "../../api/client";

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
}

export function OrdersScreen() {
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["mobile-orders"],
    queryFn: async () => {
      const response = await api.get("/orders");
      return response.data.content ?? response.data ?? [];
    },
  });

  const statusText: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đơn hàng của tôi</Text>
        <Text style={styles.subtitle}>Kiểm tra trạng thái và lịch sử đơn hàng của bạn.</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptyText}>Khi bạn đặt mua sách, lịch sử theo dõi tiến trình giao hàng sẽ xuất hiện tại đây.</Text>
        </View>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{statusText[order.orderStatus] || order.orderStatus}</Text>
              </View>
            </View>
            <Text style={styles.date}>{new Date(order.createdAt).toLocaleDateString("vi-VN")}</Text>
            <Text style={styles.amount}>{order.totalAmount.toLocaleString("vi-VN")}đ</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 16,
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
    color: "#6b7280",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  emptyText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  badge: {
    borderRadius: 999,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1d4ed8",
  },
  date: {
    marginTop: 10,
    fontSize: 12,
    color: "#6b7280",
  },
  amount: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#2563eb",
  },
});
