import { authAPI } from './api';
import type { User } from '../types';

export const accountService = {
  // Mettre à jour le profil utilisateur
  updateProfile: async (profileData: { nom?: string; email?: string }): Promise<User> => {
    try {
      const response = await authAPI.updateProfile(profileData);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  },

  // Changer le mot de passe
  changePassword: async (passwordData: { 
    currentPassword: string; 
    newPassword: string;
  }): Promise<void> => {
    try {
      const response = await authAPI.changePassword(passwordData);
      if (!response.success) {
        throw new Error(response.message);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  }
};