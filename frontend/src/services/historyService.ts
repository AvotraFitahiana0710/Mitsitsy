import { expenseAPI, balanceAPI } from './api';
import type { Expense, Transaction } from '../types';

export interface HistoryItem {
  type: 'depense' | 'depot' | 'retrait' | 'salaire' | 'ajustement';
  id: string;
  date: string;
  montant: number;
  description: string;
  categorie?: string;
  soldeApres?: number;
}

export const historyService = {
  // Récupérer l'historique complet (dépenses + transactions de solde)
  getCompleteHistory: async (page = 1, limit = 50): Promise<{ items: HistoryItem[], total: number }> => {
    try {
      // Récupérer les dépenses
      const expensesResponse = await expenseAPI.getAll(page, limit);
      // Récupérer l'historique du solde
      const balanceResponse = await balanceAPI.getHistory(page, limit * 2); // Plus d'historique pour compenser

      const expenseItems: HistoryItem[] = expensesResponse.data.map((expense: Expense) => ({
        type: 'depense',
        id: expense._id,
        date: expense.date,
        montant: expense.montant,
        description: expense.titre,
        categorie: expense.categorie
      }));

      const balanceItems: HistoryItem[] = balanceResponse.data.historique.map((transaction: Transaction) => ({
        type: transaction.type as any,
        id: transaction.reference || `balance_${Date.now()}_${Math.random()}`,
        date: transaction.date,
        montant: transaction.montant,
        description: transaction.description,
        soldeApres: transaction.soldeApres
      }));

      // Fusionner et trier par date (plus récent en premier)
      const allItems = [...expenseItems, ...balanceItems].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return {
        items: allItems.slice(0, limit), // Limiter au nombre demandé
        total: allItems.length
      };

    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'historique');
    }
  },

  // Récupérer seulement les dépenses
  getExpensesHistory: async (page = 1, limit = 50) => {
    try {
      const response = await expenseAPI.getAll(page, limit);
      return {
        items: response.data,
        pagination: response.pagination
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des dépenses');
    }
  },

  // Récupérer seulement les transactions de solde
  getBalanceHistory: async (page = 1, limit = 50) => {
    try {
      const response = await balanceAPI.getHistory(page, limit);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des transactions');
    }
  }
};