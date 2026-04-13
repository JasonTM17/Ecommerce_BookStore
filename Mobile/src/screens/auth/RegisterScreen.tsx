import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../store/AuthContext";

export function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(form);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>BookStore</Text>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Đăng ký để bắt đầu mua sắm trên mobile.</Text>
      </View>

      <View style={styles.form}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Họ *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập họ"
              value={form.firstName}
              onChangeText={(value) => setForm({ ...form, firstName: value })}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Tên *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên"
              value={form.lastName}
              onChangeText={(value) => setForm({ ...form, lastName: value })}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            value={form.phoneNumber}
            onChangeText={(value) => setForm({ ...form, phoneNumber: value })}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Đăng ký</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.secondaryText}>Đã có tài khoản? Quay lại đăng nhập</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  logo: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: "#2563eb",
  },
  title: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    color: "#6b7280",
  },
  form: {
    flex: 1,
  },
  error: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    padding: 12,
    color: "#dc2626",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#2563eb",
    padding: 16,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 12,
  },
  secondaryText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "600",
  },
});
