import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Collection {
  id: string;
  name: string;
  collectionName: string;
  summary?: string;
  type: 'pdf' | 'website' | 'text' | 'youtube';
  sourceUrl?: string;
  fileName?: string;
  fileSize?: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RagChat {
  id: string;
  title: string;
  collectionId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RagStore {
  // Collections
  collections: Collection[];
  selectedCollection: Collection | null;
  
  // RAG Chats
  ragChats: RagChat[];
  
  // UI State
  searchQuery: string;
  isUploadModalOpen: boolean;
  
  // Upload state
  isLoading: boolean;
  uploadProgress: number;
  error: string | null;
  
  // Actions
  addCollection: (collection: Collection) => void;
  setCollections: (collections: Collection[]) => void;
  removeCollection: (id: string) => void;
  setSelectedCollection: (collection: Collection | null) => void;
  
  addRagChat: (chat: RagChat) => void;
  removeRagChat: (id: string) => void;
  
  setSearchQuery: (query: string) => void;
  setUploadModalOpen: (open: boolean) => void;
  
  setLoading: (loading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setError: (error: string | null) => void;
}

export const useRagStore = create<RagStore>()(
  persist(
    (set, get) => ({
      // Initial state
      collections: [],
      selectedCollection: null,
      ragChats: [],
      searchQuery: '',
      isUploadModalOpen: false,
      isLoading: false,
      uploadProgress: 0,
      error: null,
      
      // Actions
      addCollection: (collection) => 
        set((state) => ({ 
          collections: [collection, ...state.collections] 
        })),
      
      setCollections: (collections) =>
        set({ collections }),
      
      removeCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter(c => c.id !== id),
          selectedCollection: state.selectedCollection?.id === id ? null : state.selectedCollection
        })),
      
      setSelectedCollection: (collection) =>
        set({ selectedCollection: collection }),
      
      addRagChat: (chat) =>
        set((state) => ({
          ragChats: [chat, ...state.ragChats]
        })),
      
      removeRagChat: (id) =>
        set((state) => ({
          ragChats: state.ragChats.filter(c => c.id !== id)
        })),
      
      setSearchQuery: (query) =>
        set({ searchQuery: query }),
      
      setUploadModalOpen: (open) =>
        set({ isUploadModalOpen: open }),
      
      setLoading: (loading) =>
        set({ isLoading: loading }),
      
      setUploadProgress: (progress) =>
        set({ uploadProgress: progress }),
      
      setError: (error) =>
        set({ error }),
    }),
    {
      name: 'rag-store',
      // Only persist collections and ragChats, not UI state
      partialize: (state) => ({
        collections: state.collections,
        ragChats: state.ragChats,
      }),
    }
  )
); 