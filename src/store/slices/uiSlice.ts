import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    enabled: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
  modals: {
    createBoard: boolean;
    createList: boolean;
    createCard: boolean;
    editCard: boolean;
    cardDetails: boolean;
    boardSettings: boolean;
  };
  selectedCard: string | null;
  dragOverList: string | null;
  loading: {
    boards: boolean;
    board: boolean;
    lists: boolean;
    cards: boolean;
  };
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'system',
  notifications: {
    enabled: true,
    position: 'top-right',
  },
  modals: {
    createBoard: false,
    createList: false,
    createCard: false,
    editCard: false,
    cardDetails: false,
    boardSettings: false,
  },
  selectedCard: null,
  dragOverList: null,
  loading: {
    boards: false,
    board: false,
    lists: false,
    cards: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setNotifications: (state, action: PayloadAction<Partial<UIState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(modal => {
        state.modals[modal as keyof UIState['modals']] = false;
      });
    },
    setSelectedCard: (state, action: PayloadAction<string | null>) => {
      state.selectedCard = action.payload;
    },
    setDragOverList: (state, action: PayloadAction<string | null>) => {
      state.dragOverList = action.payload;
    },
    setLoading: (state, action: PayloadAction<{ key: keyof UIState['loading']; value: boolean }>) => {
      state.loading[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setSelectedCard,
  setDragOverList,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
