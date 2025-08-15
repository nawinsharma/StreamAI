import { QuickAction } from "@/types/chat";

export const suggestionQuestions = [
  "what's the current weather of Bengaluru",
  "What can you help me with?",
  "Explain a complex concept",
  "write the code of 3 sum in java",
  "Create a plan for my goals"
];

export const quickActions: QuickAction[] = [
  { 
    icon: "💡", 
    label: "Make a plan", 
    action: "Help me create a plan", 
    autoSubmit: true 
  },
  { 
    icon: "💻", 
    label: "what's the current weather of Bengaluru", 
    action: "what's the current weather of Bengaluru", 
    autoSubmit: true 
  },
  { 
    icon: "✍️", 
    label: "Help me write", 
    action: "Help me write content", 
    autoSubmit: true 
  },
  { 
    icon: "➕", 
    label: "Code", 
    action: "Code of 3 sum in jave?", 
    autoSubmit: true 
  }
]; 