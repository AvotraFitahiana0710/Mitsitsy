import type { Expense, CreateExpenseData, UpdateExpenseData } from '../types';
import { expenseAPI } from './api';

export const expenseService = {
  // Créer une dépense
  createExpense: async (expenseData: CreateExpenseData): Promise<Expense> => {
    try {
      // Forcer la propriété 'date' à string si elle est undefined
      const payload = { ...expenseData, date: expenseData.date || new Date().toISOString() };
      const response = await expenseAPI.create(payload);
      if (response.success) {
        return response.data;
      }
      throw new Error((response as any).message || 'Erreur lors de la création de la dépense');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la création de la dépense');
    }
  },

  // Récupérer toutes les dépenses
  getExpenses: async (page = 1, limit = 10, categorie?: string) => {
    try {
      const response = await expenseAPI.getAll(page, limit, categorie);
      if (response.success) {
        return response;
      }
  throw new Error((response as any).message || 'Erreur lors de la récupération des dépenses');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des dépenses');
    }
  },

  // Mettre à jour une dépense
  updateExpense: async (id: string, expenseData: UpdateExpenseData): Promise<Expense> => {
    try {
      const response = await expenseAPI.update(id, expenseData);
      if (response.success) {
        return response.data;
      }
  throw new Error((response as any).message || 'Erreur lors de la mise à jour de la dépense');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la dépense');
    }
  },

  // Supprimer une dépense
  deleteExpense: async (id: string): Promise<void> => {
    try {
      const response = await expenseAPI.delete(id);
      if (!response.success) {
  throw new Error((response as any).message || 'Erreur lors de la suppression de la dépense');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la dépense');
    }
  },

  // Récupérer les statistiques
  getStats: async () => {
    try {
      const response = await expenseAPI.getStats();
      if (response.success) {
        return response.data;
      }
  throw new Error((response as any).message || 'Erreur lors de la récupération des statistiques');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des statistiques');
    }
  }
};