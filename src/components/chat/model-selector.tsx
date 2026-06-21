"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CHAT_MODELS, DEFAULT_MODEL_ID, getModelById } from "@/lib/models";
import { useUser } from "@/context/UserContext";
import { ChevronDown, Lock, Sparkles } from "lucide-react";

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export const ModelSelector = React.memo(
  ({ value, onChange, disabled }: ModelSelectorProps) => {
    const user = useUser();
    const isPremium = Boolean(user?.isPremiumUser);

    const current = getModelById(value) ?? getModelById(DEFAULT_MODEL_ID)!;

    // Non-premium users can't change the model: show a disabled control on the
    // default model so the capability is visible but locked.
    if (!isPremium) {
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          title="Model selection is available for premium users"
          className="gap-1.5 text-xs text-muted-foreground"
        >
          <Lock className="w-3 h-3" />
          {getModelById(DEFAULT_MODEL_ID)!.label}
        </Button>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            className="gap-1.5 text-xs"
          >
            {current.provider === "anthropic" && (
              <Sparkles className="w-3 h-3 text-purple-500" />
            )}
            {current.label}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Model</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {CHAT_MODELS.map((model) => (
              <DropdownMenuRadioItem
                key={model.id}
                value={model.id}
                className="text-sm"
              >
                <span className="flex items-center gap-1.5">
                  {model.provider === "anthropic" && (
                    <Sparkles className="w-3 h-3 text-purple-500" />
                  )}
                  {model.label}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);

ModelSelector.displayName = "ModelSelector";
