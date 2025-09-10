import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export interface Label {
  name: string;
  color: string;
}

export interface Member {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
}

export interface Board {
  _id: string;
  title: string;
  description?: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  members: Member[];
  backgroundColor: string;
  backgroundImage?: string;
  isPrivate: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  labels: Label[];
  lastActivity: string;
  userRole?: string;
  createdAt: string;
  updatedAt: string;
}

export interface List {
  _id: string;
  title: string;
  board: string;
  position: number;
  isArchived: boolean;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  _id: string;
  title: string;
  description?: string;
  list: string;
  board: string;
  position: number;
  assignedUsers: Array<{
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  labels: Label[];
  dueDate?: string;
  dueDateCompleted: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: Array<{
    _id: string;
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
  }>;
  comments: Array<{
    _id: string;
    content: string;
    author: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    createdAt: string;
    updatedAt: string;
    isEdited: boolean;
  }>;
  checklist: Array<{
    _id: string;
    text: string;
    completed: boolean;
    position: number;
    completedBy?: string;
    completedAt?: string;
  }>;
  cover?: string;
  isArchived: boolean;
  startDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: string;
  updatedAt: string;
}

interface BoardState {
  boards: Board[];
  currentBoard: Board | null;
  currentBoardLists: List[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    favorite?: boolean;
    archived?: boolean;
  };
}

const initialState: BoardState = {
  boards: [],
  currentBoard: null,
  currentBoardLists: [],
  loading: false,
  error: null,
  searchQuery: '',
  filters: {},
};

// Async thunks
export const fetchBoards = createAsyncThunk(
  'board/fetchBoards',
  async (params: { page?: number; limit?: number; search?: string; favorite?: boolean; archived?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/boards', { params });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch boards');
    }
  }
);

export const fetchBoard = createAsyncThunk(
  'board/fetchBoard',
  async (boardId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/boards/${boardId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch board');
    }
  }
);

export const createBoard = createAsyncThunk(
  'board/createBoard',
  async (boardData: { title: string; description?: string; backgroundColor?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/boards', boardData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create board');
    }
  }
);

export const updateBoard = createAsyncThunk(
  'board/updateBoard',
  async ({ boardId, boardData }: { boardId: string; boardData: Partial<Board> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/boards/${boardId}`, boardData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update board');
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'board/deleteBoard',
  async (boardId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/boards/${boardId}`);
      return boardId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete board');
    }
  }
);

export const fetchLists = createAsyncThunk(
  'board/fetchLists',
  async (boardId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/boards/${boardId}/lists`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lists');
    }
  }
);

export const createList = createAsyncThunk(
  'board/createList',
  async ({ boardId, listData }: { boardId: string; listData: { title: string; position?: number } }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/boards/${boardId}/lists`, listData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create list');
    }
  }
);

export const updateList = createAsyncThunk(
  'board/updateList',
  async ({ boardId, listId, listData }: { boardId: string; listId: string; listData: Partial<List> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/boards/${boardId}/lists/${listId}`, listData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update list');
    }
  }
);

export const deleteList = createAsyncThunk(
  'board/deleteList',
  async ({ boardId, listId }: { boardId: string; listId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/boards/${boardId}/lists/${listId}`);
      return listId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete list');
    }
  }
);

export const reorderLists = createAsyncThunk(
  'board/reorderLists',
  async ({ boardId, listId, newPosition }: { boardId: string; listId: string; newPosition: number }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/boards/${boardId}/lists/reorder`, { listId, newPosition });
      return { listId, newPosition };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder lists');
    }
  }
);

export const createCard = createAsyncThunk(
  'board/createCard',
  async ({ boardId, cardData }: { boardId: string; cardData: { title: string; description?: string; listId: string; position?: number; labels?: Label[]; dueDate?: string; priority?: string } }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/boards/${boardId}/cards`, cardData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create card');
    }
  }
);

export const updateCard = createAsyncThunk(
  'board/updateCard',
  async ({ boardId, cardId, cardData }: { boardId: string; cardId: string; cardData: Partial<Card> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/boards/${boardId}/cards/${cardId}`, cardData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update card');
    }
  }
);

export const deleteCard = createAsyncThunk(
  'board/deleteCard',
  async ({ boardId, cardId }: { boardId: string; cardId: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/boards/${boardId}/cards/${cardId}`);
      return cardId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete card');
    }
  }
);

export const moveCard = createAsyncThunk(
  'board/moveCard',
  async ({ boardId, cardId, listId, position }: { boardId: string; cardId: string; listId: string; position: number }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/boards/${boardId}/cards/${cardId}/move`, { listId, position });
      return { cardId, listId, position };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move card');
    }
  }
);

export const reorderCards = createAsyncThunk(
  'board/reorderCards',
  async ({ boardId, listId, cardId, newPosition }: { boardId: string; listId: string; cardId: string; newPosition: number }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/boards/${boardId}/cards/reorder`, { listId, cardId, newPosition });
      return { listId, cardId, newPosition };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder cards');
    }
  }
);

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<{ favorite?: boolean; archived?: boolean }>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null;
      state.currentBoardLists = [];
    },
    updateCardInLists: (state, action: PayloadAction<Card>) => {
      const updatedCard = action.payload;
      state.currentBoardLists = state.currentBoardLists.map(list => ({
        ...list,
        cards: list.cards.map(card => 
          card._id === updatedCard._id ? updatedCard : card
        )
      }));
    },
    removeCardFromLists: (state, action: PayloadAction<string>) => {
      const cardId = action.payload;
      state.currentBoardLists = state.currentBoardLists.map(list => ({
        ...list,
        cards: list.cards.filter(card => card._id !== cardId)
      }));
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Boards
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Board
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload;
        state.currentBoardLists = action.payload.lists || [];
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Board
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.unshift(action.payload);
      })
      // Update Board
      .addCase(updateBoard.fulfilled, (state, action) => {
        const index = state.boards.findIndex(board => board._id === action.payload._id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard?._id === action.payload._id) {
          state.currentBoard = action.payload;
        }
      })
      // Delete Board
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter(board => board._id !== action.payload);
        if (state.currentBoard?._id === action.payload) {
          state.currentBoard = null;
          state.currentBoardLists = [];
        }
      })
      // Fetch Lists
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.currentBoardLists = action.payload;
      })
      // Create List
      .addCase(createList.fulfilled, (state, action) => {
        state.currentBoardLists.push(action.payload);
      })
      // Update List
      .addCase(updateList.fulfilled, (state, action) => {
        const index = state.currentBoardLists.findIndex(list => list._id === action.payload._id);
        if (index !== -1) {
          state.currentBoardLists[index] = action.payload;
        }
      })
      // Delete List
      .addCase(deleteList.fulfilled, (state, action) => {
        state.currentBoardLists = state.currentBoardLists.filter(list => list._id !== action.payload);
      })
      // Reorder Lists
      .addCase(reorderLists.fulfilled, (state, action) => {
        const { listId, newPosition } = action.payload;
        const listIndex = state.currentBoardLists.findIndex(list => list._id === listId);
        if (listIndex !== -1) {
          const [movedList] = state.currentBoardLists.splice(listIndex, 1);
          movedList.position = newPosition;
          state.currentBoardLists.splice(newPosition, 0, movedList);
          // Update positions
          state.currentBoardLists.forEach((list, index) => {
            list.position = index;
          });
        }
      })
      // Create Card
      .addCase(createCard.fulfilled, (state, action) => {
        const newCard = action.payload;
        const listIndex = state.currentBoardLists.findIndex(list => list._id === newCard.list);
        if (listIndex !== -1) {
          state.currentBoardLists[listIndex].cards.push(newCard);
        }
      })
      // Update Card
      .addCase(updateCard.fulfilled, (state, action) => {
        const updatedCard = action.payload;
        state.currentBoardLists = state.currentBoardLists.map(list => ({
          ...list,
          cards: list.cards.map(card => 
            card._id === updatedCard._id ? updatedCard : card
          )
        }));
      })
      // Delete Card
      .addCase(deleteCard.fulfilled, (state, action) => {
        const cardId = action.payload;
        state.currentBoardLists = state.currentBoardLists.map(list => ({
          ...list,
          cards: list.cards.filter(card => card._id !== cardId)
        }));
      })
      // Move Card
      .addCase(moveCard.fulfilled, (state, action) => {
        const { cardId, listId, position } = action.payload;
        
        // Find and remove card from current list
        let movedCard: Card | null = null;
        state.currentBoardLists = state.currentBoardLists.map(list => {
          const cardIndex = list.cards.findIndex(card => card._id === cardId);
          if (cardIndex !== -1) {
            movedCard = list.cards[cardIndex];
            list.cards.splice(cardIndex, 1);
            // Update positions of remaining cards
            list.cards.forEach((card, index) => {
              card.position = index;
            });
          }
          return list; 
        });

        // Add card to new list 
        if (movedCard) {
          movedCard.list = listId;
          movedCard.position = position;
          const targetListIndex = state.currentBoardLists.findIndex(list => list._id === listId);
          if (targetListIndex !== -1) {
            state.currentBoardLists[targetListIndex].cards.splice(position, 0, movedCard);
            // Update positions
            state.currentBoardLists[targetListIndex].cards.forEach((card, index) => {
              card.position = index; 
            });
          }
        }
      })
      // Reorder Cards
      .addCase(reorderCards.fulfilled, (state, action) => {
        const { listId, cardId, newPosition } = action.payload;
        const listIndex = state.currentBoardLists.findIndex(list => list._id === listId);
        if (listIndex !== -1) {
          const cardIndex = state.currentBoardLists[listIndex].cards.findIndex(card => card._id === cardId);
          if (cardIndex !== -1) {
            const [movedCard] = state.currentBoardLists[listIndex].cards.splice(cardIndex, 1);
            movedCard.position = newPosition;
            state.currentBoardLists[listIndex].cards.splice(newPosition, 0, movedCard);
            // Update positions
            state.currentBoardLists[listIndex].cards.forEach((card, index) => {
              card.position = index;
            });
          }
        }
      });
  },
});

export const { 
  clearError, 
  setSearchQuery, 
  setFilters, 
  clearCurrentBoard,
  updateCardInLists,
  removeCardFromLists
} = boardSlice.actions;
export default boardSlice.reducer;
