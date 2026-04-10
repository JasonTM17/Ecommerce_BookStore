import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useAuth } from "../../store/AuthContext";

export function RegisterScreen() {
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
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(form);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>📚 BookStore</Text>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Đăng ký để bắt đầu mua sắm!</Text>
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
              onChangeText={(v) => setForm({ ...form, firstName: v })}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Tên *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên"
              value={form.lastName}
              onChangeText={(v) => setForm({ ...form, lastName: v })}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
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
            onChangeText={(v) => setForm({ ...form, password: v })}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            value={form.phoneNumber}
            onChangeText={(v) => setForm({ ...form, phoneNumber: v })}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
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
    fontSize: 32,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 24,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  form: {
    flex: 1,
  },
  error: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
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
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
