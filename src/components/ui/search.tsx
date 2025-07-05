"use client";

import { AIMessageComponent } from "@/components/message";

export const SearchLoading = () => (
  <AIMessageComponent>
    <div className="px-6 py-4 rounded-3xl rounded-bl-lg bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 shadow-lg border border-gray-200/50 backdrop-blur-sm">
      <div className="text-sm leading-relaxed font-medium">
        <span className="animate-pulse">Searching the web</span>
        <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
        <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
        <span className="animate-pulse" style={{ animationDelay: '0.6s' }}>.</span>
      </div>
    </div>
  </AIMessageComponent>
);
