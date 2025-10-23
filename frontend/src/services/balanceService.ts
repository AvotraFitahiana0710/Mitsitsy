import { balanceAPI } from './api';

export const balanceService = {
  // Récupérer le solde actuel
  getCurrentBalance: async () => {
    try {
      const response = await balanceAPI.get();
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du solde');
    }
  },

  // Effectuer un dépôt
  makeDeposit: async (montant: number, type: string, description: string) => {
    try {
      const response = await balanceAPI.deposit(montant, type, description);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du dépôt');
    }
  },

  // Effectuer un retrait
  makeWithdrawal: async (montant: number, description: string) => {
    try {
      const response = await balanceAPI.withdraw(montant, description);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du retrait');
    }
  },

  // Récupérer l'historique
  getHistory: async (page = 1, limit = 20) => {
    try {
      const response = await balanceAPI.getHistory(page, limit);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de l\'historique');
    }
  }
};
