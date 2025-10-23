import axios from 'axios';
import type { AuthResponse, User, Expense, Balance, ExpenseStats, Transaction } from '../types';

const API_URL = `${import.meta.env.BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (nom: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { nom, email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<{ success: boolean; data: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (profileData: { nom?: string; email?: string }): Promise<{ success: boolean; data: User; message?: string }> => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message?: string }> => {
    const response = await api.put('/auth/password', passwordData);
    return response.data;
  },
};

export const expenseAPI = {
  create: async (expenseData: Omit<Expense, '_id' | 'user' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: Expense; nouveauSolde: number }> => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  getAll: async (page = 1, limit = 10, categorie?: string): Promise<{
      message: string | undefined; success: boolean; data: Expense[]; pagination: any 
}> => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (categorie) params.append('categorie', categorie);
    
    const response = await api.get(`/expenses?${params}`);
    return response.data;
  },

  getStats: async (): Promise<{
      moyenneParCategorie: { _id: string; total: number; count: number; pourcentage: string; }[];
      categories: any; success: boolean; data: ExpenseStats 
}> => {
    const response = await api.get('/expenses/stats/summary');
    return response.data;
  },

  update: async (id: string, expenseData: Partial<Expense>): Promise<{ success: boolean; data: Expense }> => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};

export const balanceAPI = {
  get: async (): Promise<{
      soldeActuel: number;
    message: string | undefined; success: boolean; data: Balance 
}> => {
    const response = await api.get('/balance');
    return response.data;
  },

  deposit: async (montant: number, type: string, description: string): Promise<{
    message: string | undefined; success: boolean; data: { soldeActuel: number } 
}> => {
    const response = await api.post('/balance/depot', { montant, type, description });
    return response.data;
  },

  withdraw: async (montant: number, description: string): Promise<{
    message: string | undefined; success: boolean; data: { soldeActuel: number } 
}> => {
    const response = await api.post('/balance/retrait', { montant, description });
    return response.data;
  },

  getHistory: async (page = 1, limit = 20): Promise<{
    message: string | undefined; success: boolean; data: { soldeActuel: number; historique: Transaction[] } 
}> => {
    const response = await api.get(`/balance/historique?page=${page}&limit=${limit}`);
    return response.data;
  },
};




export default api;