import React, { useState, useMemo, useCallback } from "react";
import { suggestionTabGroups } from "@/data/suggestions";
import { Sparkles, Compass, Code, GraduationCap } from "lucide-react";

interface WelcomeMessageProps {
  userName: string;
  onSuggestionClick?: (question: string, shouldAutoSubmit?: boolean) => void;
  hasInput?: boolean;
}

export const WelcomeMessage = React.memo(({ userName, onSuggestionClick, hasInput }: WelcomeMessageProps) => {
  const tabs = useMemo(() => Object.keys(suggestionTabGroups), []);
  const [activeTab, setActiveTab] = useState<string>(tabs[0] ?? "Create");

  const questions = suggestionTabGroups[activeTab] ?? [];

  const handleClick = useCallback((q: string) => {
    onSuggestionClick?.(q, false);
  }, [onSuggestionClick]);

  const getTabIcon = (tabName: string) => {
    switch (tabName) {
      case "Create":
        return <Sparkles className="w-4 h-4" />;
      case "Explore":
        return <Compass className="w-4 h-4" />;
      case "Code":
        return <Code className="w-4 h-4" />;
      case "Learn":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (hasInput) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-8 sm:pt-20 px-4 sm:px-6 relative overflow-y-auto pb-56">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Welcome Message */}
        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-4 sm:mb-8 md:mb-12 text-foreground">
          How can I help you, {userName}?
        </h1>

        <div className="relative mb-4 sm:mb-6">
          <div className="inline-flex items-center bg-muted/30 rounded-xl p-1 border border-border/50 shadow-sm backdrop-blur-sm overflow-x-auto gap-1 sm:gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-3 sm:px-6 py-2 rounded-lg font-medium transition-all duration-300 ease-out flex items-center gap-1 sm:gap-2 cursor-pointer ${activeTab === tab
                    ? "bg-background text-foreground shadow-md transform scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                {activeTab === tab && (
                  <div className="absolute inset-0 bg-purple-100 dark:bg-purple-900/30 rounded-lg" />
                )}
                <span className="relative z-10">{getTabIcon(tab)}</span>
                <span className="relative z-10 hidden sm:inline">{tab}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 max-w-2xl mx-auto max-h-none md:max-h-[60vh] overflow-visible md:overflow-y-auto pr-1">
          {questions.map((question, idx) => (
            <div
              key={`${activeTab}-${idx}`}
              className="group relative"
            >
              <button
                onClick={() => handleClick(question)}
                className="w-full p-2 sm:p-4 text-left bg-card border border-border/50 rounded-lg hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/20 transition-all duration-300 ease-out group-hover:scale-[1.01] group-hover:-translate-y-0.5 cursor-pointer relative"
              >
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-6 sm:h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground text-sm leading-relaxed group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200">
                        {question}
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-purple-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute top-32 left-10 w-32 h-32 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-32 right-10 w-40 h-40 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl" />
    </div>
  );
});

WelcomeMessage.displayName = 'WelcomeMessage'; 