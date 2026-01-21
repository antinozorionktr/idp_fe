import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// App-wide store
export const useAppStore = create(
  persist(
    (set, get) => ({
      // System status
      systemStatus: null,
      isSystemHealthy: false,
      
      // Collections
      collections: [],
      activeCollection: 'documents',
      
      // Documents
      documents: [],
      selectedDocument: null,
      
      // Processing state
      isProcessing: false,
      processingProgress: 0,
      lastProcessedDocument: null,
      
      // Query state
      queryHistory: [],
      lastQuery: null,
      
      // UI state
      sidebarOpen: true,
      theme: 'dark',
      
      // Actions
      setSystemStatus: (status) => set({ 
        systemStatus: status,
        isSystemHealthy: status?.status === 'healthy'
      }),
      
      setCollections: (collections) => set({ collections }),
      
      setActiveCollection: (collection) => set({ activeCollection: collection }),
      
      setDocuments: (documents) => set({ documents }),
      
      setSelectedDocument: (document) => set({ selectedDocument: document }),
      
      setProcessing: (isProcessing, progress = 0) => set({ 
        isProcessing, 
        processingProgress: progress 
      }),
      
      setLastProcessedDocument: (doc) => set({ lastProcessedDocument: doc }),
      
      addToQueryHistory: (query) => set((state) => ({
        queryHistory: [query, ...state.queryHistory].slice(0, 50),
        lastQuery: query
      })),
      
      clearQueryHistory: () => set({ queryHistory: [], lastQuery: null }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      // Reset store
      reset: () => set({
        systemStatus: null,
        isSystemHealthy: false,
        collections: [],
        documents: [],
        selectedDocument: null,
        isProcessing: false,
        processingProgress: 0,
        lastProcessedDocument: null,
      }),
    }),
    {
      name: 'idp-storage',
      partialize: (state) => ({
        activeCollection: state.activeCollection,
        queryHistory: state.queryHistory,
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
      }),
    }
  )
);

// Toast notifications store (non-persistent)
export const useToastStore = create((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Date.now();
    const newToast = { id, ...toast };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));
    
    // Auto-remove after duration
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration || 5000);
    }
    
    return id;
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
  
  clearToasts: () => set({ toasts: [] }),
}));
