import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useAuth } from "../../store/AuthContext";
import api from "../../api/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export function ChatbotScreen() {
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!message.trim() || !isAuthenticated) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/chatbot/message", {
        message: userMessage.content,
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.data.reply,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Xin lỗi, mình đang gặp chút trục trặc. Bạn thử lại sau nhé!",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "Tìm sách về Python",
    "Sách self-help hay",
    "Đơn hàng của tôi",
    "Mã giảm giá",
  ];

  if (!isAuthenticated) {
    return (
      <View style={styles.unauthenticatedContainer}>
        <Text style={styles.unauthenticatedIcon}>💬</Text>
        <Text style={styles.unauthenticatedTitle}>Đăng nhập để chat</Text>
        <Text style={styles.unauthenticatedText}>
          Vui lòng đăng nhập để sử dụng trợ lý AI
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListHeaderComponent={
          messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeIcon}>👋</Text>
              <Text style={styles.welcomeTitle}>Xin chào!</Text>
              <Text style={styles.welcomeText}>
                Mình là trợ lý bán sách của BookStore. Bạn cần tìm sách gì hôm nay?
              </Text>
              <View style={styles.quickQuestions}>
                {quickQuestions.map((q, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.quickButton}
                    onPress={() => {
                      setMessage(q);
                    }}
                  >
                    <Text style={styles.quickButtonText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.role === "user" ? styles.userMessage : styles.aiMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                item.role === "user" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.role === "user" ? styles.userText : styles.aiText,
                ]}
              >
                {item.content}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={null}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!message.trim() || loading}
        >
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  welcomeContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  welcomeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  quickQuestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  quickButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  quickButtonText: {
    fontSize: 12,
    color: "#3b82f6",
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  aiMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: "#ffffff",
  },
  aiText: {
    color: "#1f2937",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  sendButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  unauthenticatedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  unauthenticatedIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  unauthenticatedTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  unauthenticatedText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
