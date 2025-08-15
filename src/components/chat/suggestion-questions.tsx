import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { suggestionQuestions } from "@/data/suggestions";

interface SuggestionQuestionsProps {
  onQuestionClick: (question: string, shouldAutoSubmit?: boolean) => void;
}

export const SuggestionQuestions = React.memo(({ onQuestionClick }: SuggestionQuestionsProps) => {
  const handleQuestionClick = useCallback((question: string) => {
    onQuestionClick(question, false);
  }, [onQuestionClick]);

  return (
    <div className="mb-4">
      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        <div className="flex gap-2 animate-scroll hover:pause-scroll">
          {suggestionQuestions.map((suggestion, index) => (
            <Button
              key={`first-${index}`}
              onClick={() => handleQuestionClick(suggestion)}
              variant="outline"
              size="sm"
              className="rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-primary/20 active:scale-95 hover:bg-primary/5 hover:border-primary/30 hover:text-primary whitespace-nowrap flex-shrink-0"
            >
              {suggestion}
            </Button>
          ))}
          {suggestionQuestions.map((suggestion, index) => (
            <Button
              key={`second-${index}`}
              onClick={() => handleQuestionClick(suggestion)}
              variant="outline"
              size="sm"
              className="rounded-full transition-all duration-300 hover:scale-105 hover:shadow-md hover:shadow-primary/20 active:scale-95 hover:bg-primary/5 hover:border-primary/30 hover:text-primary whitespace-nowrap flex-shrink-0"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});

SuggestionQuestions.displayName = 'SuggestionQuestions'; 