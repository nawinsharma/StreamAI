import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { quickActions } from "@/data/suggestions";

interface QuickActionsProps {
  onActionClick: (action: string, shouldAutoSubmit: boolean) => void;
}

export const QuickActions = React.memo(({ onActionClick }: QuickActionsProps) => {
  const handleActionClick = useCallback((action: string, autoSubmit: boolean) => {
    onActionClick(action, autoSubmit);
  }, [onActionClick]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
      {quickActions.map((action, index) => (
        <Button
          key={index}
          onClick={() => handleActionClick(action.action, action.autoSubmit)}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
        >
          <span className="text-2xl">{action.icon}</span>
          <span className="text-xs text-center">{action.label}</span>
        </Button>
      ))}
    </div>
  );
});

QuickActions.displayName = 'QuickActions'; 