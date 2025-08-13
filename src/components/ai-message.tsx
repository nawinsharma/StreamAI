"use client";

import { AIMessageText } from "@/components/message";
import { useEffect } from "react";

export function AIMessage(props: { value: string }) {
  const data = props.value;

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        const messagesContainer = document.querySelector('[data-messages-container]');
        if (messagesContainer) {
          const endRef = messagesContainer.querySelector('[data-messages-end]');
          if (endRef) {
            endRef.scrollIntoView({
              behavior: "smooth",
              block: "end",
              inline: "nearest"
            });
          }
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (!data) {
    return null;
  }

  return <AIMessageText content={data} />;
}
