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

// Tabbed suggestions shown on the welcome screen
export const suggestionTabGroups: Record<string, string[]> = {
  Create: [
    "Find me the current weather of Bengaluru, India",
    "Help me outline a sci-fi novel set in a post-apocalyptic world",
    "Create a character profile with sympathetic motives",
    "Give me 5 creative writing prompts for flash fiction",
  ],
  Explore: [
    "Good books for fans of Rick Rubin",
    "Countries ranked by number of corgis",
    "Most successful companies in the world",
    "How much does Claude cost?",
  ],
  Code: [
    "Write code to invert a binary search tree in Python",
    "What's the difference between Promise.all and Promise.allSettled?",
    "Explain Nextjs Server side rendering and Static Side Generation?",
    "Best practices for error handling in async/await",
  ],
  Learn: [
    "Beginner's guide to learn Artifical Intelligence?",
    "Explain the CAP theorem in distributed systems",
    "Why is AI so expensive?",
    "Are black holes real?",
  ],
};