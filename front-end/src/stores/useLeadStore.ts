import { create } from 'zustand';
import { api } from '@/lib/api';
import { Lead, LeadStage, PaginatedResult } from '@/types';

// O Estado inicial limpo para cada coluna do Kanban
const initialStageState = {
  data: [],
  page: 1,
  total: 0,
  hasMore: true,
  isLoadingMore: false
};

const STAGES: LeadStage[] = ['NEW', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

type StageData = {
  data: Lead[];
  page: number;
  total: number;
  hasMore: boolean;
  isLoadingMore: boolean;
};

interface LeadState {
  leadsByStage: Record<LeadStage, StageData>;
  isInitialLoading: boolean;
  searchQuery: string;
  
  // Actions
  setSearchQuery: (query: string) => void;
  fetchInitialStages: (query?: string) => Promise<void>;
  fetchNextPage: (stage: LeadStage) => Promise<void>;
  addLead: (lead: Lead) => void;
  updateLeadStage: (leadId: string, newStage: LeadStage, oldStage: LeadStage) => void;
}

export const useLeadStore = create<LeadState>((set, get) => ({
  leadsByStage: {
    NEW: { ...initialStageState },
    QUALIFIED: { ...initialStageState },
    PROPOSAL: { ...initialStageState },
    WON: { ...initialStageState },
    LOST: { ...initialStageState }
  },
  isInitialLoading: true,
  searchQuery: '',

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // Faz a primeira carga das colunas (Ex: primeiras 20 de cada uma)
  fetchInitialStages: async (query = '') => {
    set({ isInitialLoading: true });
    try {
      const promises = STAGES.map(stage => 
        api.get<PaginatedResult<Lead>>(`/leads?limit=20&page=1&stage=${stage}&q=${query}`)
      );
      
      const results = await Promise.all(promises);
      
      const newLeadsByStage = {} as Record<LeadStage, StageData>;
      
      results.forEach((res, index) => {
        const stage = STAGES[index];
        newLeadsByStage[stage] = {
          data: res.data.data,
          page: 1,
          total: res.data.meta?.total || 0,
          hasMore: res.data.meta ? res.data.meta.page < res.data.meta.totalPages : false,
          isLoadingMore: false
        };
      });

      set({ leadsByStage: newLeadsByStage, isInitialLoading: false });
    } catch (error) {
      console.error('Erro ao buscar as boards iniciais:', error);
      set({ isInitialLoading: false });
    }
  },

  // Paginação sob demanda por coluna (Infinite Scroll)
  fetchNextPage: async (stage: LeadStage) => {
    const currentState = get().leadsByStage[stage];
    if (!currentState.hasMore || currentState.isLoadingMore) return;

    // Atualiza status colocalizando
    set(state => ({
      leadsByStage: {
        ...state.leadsByStage,
        [stage]: { ...currentState, isLoadingMore: true }
      }
    }));

    try {
      const nextPage = currentState.page + 1;
      const query = get().searchQuery;
      const res = await api.get<PaginatedResult<Lead>>(`/leads?limit=20&page=${nextPage}&stage=${stage}&q=${query}`);
      
      set(state => ({
        leadsByStage: {
          ...state.leadsByStage,
          [stage]: {
            data: [...state.leadsByStage[stage].data, ...res.data.data],
            page: nextPage,
            total: res.data.meta?.total || 0,
            hasMore: res.data.meta ? res.data.meta.page < res.data.meta.totalPages : false,
            isLoadingMore: false
          }
        }
      }));
    } catch (error) {
      console.error(`Erro ao paginar a coluna ${stage}:`, error);
      set(state => ({
        leadsByStage: {
          ...state.leadsByStage,
          [stage]: { ...currentState, isLoadingMore: false }
        }
      }));
    }
  },

  // Quando criar um novo lead, sempre joga na ponta da tabela 'Novos'
  addLead: (lead: Lead) => {
    set((state) => {
      const newStage = 'NEW';
      const col = state.leadsByStage[newStage];
      return {
        leadsByStage: {
          ...state.leadsByStage,
          [newStage]: {
            ...col,
            data: [lead, ...col.data],
            total: col.total + 1
          }
        }
      };
    });
  },

  // Atualização otimista ao arrastar/editar status
  updateLeadStage: (leadId: string, newStage: LeadStage, oldStage: LeadStage) => {
    set((state) => {
      const oldCol = state.leadsByStage[oldStage];
      const newCol = state.leadsByStage[newStage];

      const leadToMove = oldCol.data.find(l => l._id === leadId);
      if (!leadToMove) return state;

      return {
        leadsByStage: {
          ...state.leadsByStage,
          [oldStage]: {
            ...oldCol,
            data: oldCol.data.filter(l => l._id !== leadId),
            total: oldCol.total - 1
          },
          [newStage]: {
            ...newCol,
            data: [{ ...leadToMove, stage: newStage }, ...newCol.data],
            total: newCol.total + 1
          }
        }
      };
    });
  }
}));
