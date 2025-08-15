import React from "react";
import { QuickActions } from "./quick-actions";

interface WelcomeMessageProps {
  userName: string;
  onActionClick: (action: string, shouldAutoSubmit: boolean) => void;
}

export const WelcomeMessage = React.memo(({ userName, onActionClick }: WelcomeMessageProps) => {
  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Welcome {userName}</h1>
        <p className="text-muted-foreground mb-8">
          Start a conversation with your AI assistant. You can ask questions, analyze images, or get help with various tasks.
        </p>
        {/* Quick Actions */}
        <QuickActions onActionClick={onActionClick} />
      </div>
    </div>
  );
});

WelcomeMessage.displayName = 'WelcomeMessage'; 