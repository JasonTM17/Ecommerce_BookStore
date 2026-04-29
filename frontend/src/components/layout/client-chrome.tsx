"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const ChatbotWidget = dynamic(
  () =>
    import("@/components/chatbot").then((module) => ({
      default: module.ChatbotWidget,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

export function ClientChrome() {
  const pathname = usePathname();
  const shouldHideChatbot =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/payment/return";

  if (shouldHideChatbot) {
    return null;
  }

  return (
    <>
      <ChatbotWidget />
    </>
  );
}
