import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  chatCount: number;
  maxChats: number;
  incrementChat: () => void;
  resetChats: () => void;
  isLimitReached: () => boolean;
  getRemainingChats: () => number;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chatCount: 0,
      maxChats: 5,
      
      incrementChat: () => {
        const { chatCount, maxChats } = get();
        if (chatCount < maxChats) {
          set({ chatCount: chatCount + 1 });
        }
      },
      
      resetChats: () => {
        set({ chatCount: 0 });
      },
      
      isLimitReached: () => {
        const { chatCount, maxChats } = get();
        return chatCount > maxChats;
      },
      
      getRemainingChats: () => {
        const { chatCount, maxChats } = get();
        return Math.max(0, maxChats - chatCount);
      },
    }),
    {
      name: 'chat-limit-storage',
      partialize: (state) => ({ chatCount: state.chatCount }),
    }
  )
); 