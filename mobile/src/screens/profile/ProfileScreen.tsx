import React from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../store/AuthContext";

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedUser, setEditedUser] = React.useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    dateOfBirth: user?.dateOfBirth || "",
  });

  const handleUpdate = async () => {
    try {
      await updateProfile(editedUser);
      setIsEditing(false);
      Alert.alert("Thành công", "Đã cập nhật hồ sơ của bạn.");
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật hồ sơ.");
    }
  };

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
        {!isEditing ? (
          <>
            <Text style={styles.name}>{user?.fullName || "Người dùng"}</Text>
            <Text style={styles.email}>{user?.email || "email@example.com"}</Text>
            {user?.dateOfBirth && (
              <Text style={styles.dob}>Ngày sinh: {user.dateOfBirth}</Text>
            )}
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.editForm}>
            <TextInput
              style={styles.input}
              placeholder="Họ"
              value={editedUser.firstName}
              onChangeText={(text) => setEditedUser({ ...editedUser, firstName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Tên"
              value={editedUser.lastName}
              onChangeText={(text) => setEditedUser({ ...editedUser, lastName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Số điện thoại"
              value={editedUser.phoneNumber}
              onChangeText={(text) => setEditedUser({ ...editedUser, phoneNumber: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Ngày sinh (YYYY-MM-DD)"
              value={editedUser.dateOfBirth}
              onChangeText={(text) => setEditedUser({ ...editedUser, dateOfBirth: text })}
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={() => setIsEditing(false)}>
                <Text style={styles.btnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleUpdate}>
                <Text style={[styles.btnText, { color: "#fff" }]}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  dob: {
    marginTop: 4,
    fontSize: 13,
    color: "#9ca3af",
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  editForm: {
    width: "100%",
    marginTop: 20,
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 12,
    color: "#111827",
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#f3f4f6",
  },
  saveBtn: {
    backgroundColor: "#2563eb",
  },
  btnText: {
    fontSize: 15,
    fontWeight: "600",
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
