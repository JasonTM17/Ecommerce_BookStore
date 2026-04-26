"use client";

import dynamic from "next/dynamic";

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

const FlashSaleBanner = dynamic(
  () =>
    import("@/components/flashsale").then((module) => ({
      default: module.FlashSaleBanner,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

export function ClientChrome() {
  return (
    <>
      <FlashSaleBanner />
      <ChatbotWidget />
    </>
  );
}
