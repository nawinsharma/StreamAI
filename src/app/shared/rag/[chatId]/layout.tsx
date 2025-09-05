import type { Metadata } from "next";
import { Header } from "@/components/ui/Header";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function SharedRagChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-background flex flex-col">
      <Header 
        showBackButton={true}
        backButtonHref="/"
        backButtonLabel="Back"
      />
      {children}
    </div>
  );
}
