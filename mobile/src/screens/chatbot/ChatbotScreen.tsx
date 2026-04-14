import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../store/AuthContext";
import api from "../../api/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export function ChatbotScreen() {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!message.trim() || !isAuthenticated) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await api.post("/chatbot/message", { message: userMessage.content });
      const aiMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: response.data.data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((current) => [...current, aiMessage]);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content: "Xin lỗi, chatbot đang tạm thời bận. Bạn vui lòng thử lại sau nhé.",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Vui lòng đăng nhập</Text>
        <Text style={styles.emptyText}>Trợ lý AI thông minh của chúng tôi luôn sẵn sàng hỗ trợ bạn tìm sách và giải đáp thắc mắc. Hãy đăng nhập để bắt đầu trò chuyện nhé!</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.primaryButtonText}>Đi tới đăng nhập</Text>
        </TouchableOpacity>
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
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.messageRow, item.role === "user" ? styles.userRow : styles.assistantRow]}>
            <View style={[styles.messageBubble, item.role === "user" ? styles.userBubble : styles.assistantBubble]}>
              <Text style={[styles.messageText, item.role === "user" ? styles.userText : styles.assistantText]}>
                {item.content}
              </Text>
            </View>
          </View>
        )}
        ListHeaderComponent={
          messages.length === 0 ? (
            <View style={styles.welcome}>
              <Text style={styles.welcomeTitle}>Chatbot đã sẵn sàng</Text>
              <Text style={styles.welcomeText}>Bạn có thể hỏi về sách, đơn hàng, flash sale hoặc khuyến mãi.</Text>
            </View>
          ) : null
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập tin nhắn..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={[styles.primaryButton, !message.trim() && styles.disabledButton]} onPress={sendMessage} disabled={!message.trim() || loading}>
          <Text style={styles.primaryButtonText}>{loading ? "Đang gửi..." : "Gửi"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  list: {
    flexGrow: 1,
    padding: 16,
  },
  welcome: {
    paddingVertical: 24,
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  welcomeText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: "#6b7280",
  },
  messageRow: {
    marginBottom: 12,
  },
  userRow: {
    alignItems: "flex-end",
  },
  assistantRow: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "82%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: "#2563eb",
  },
  assistantBubble: {
    backgroundColor: "#ffffff",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: "#ffffff",
  },
  assistantText: {
    color: "#111827",
  },
  inputBar: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 12,
  },
  input: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  emptyText: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
  },
});
