"use client";

import { AIMessageText } from "@/components/message";

export function AIMessage(props: { value: string }) {
  const data = props.value;

  if (!data) {
    return null;
  }

  return <AIMessageText content={data} />;
}
