import { expenseAPI, balanceAPI } from './api';

export interface DashboardStats {
  soldeActuel: number;
  totalDepensesMois: number;
  totalDepensesAnnee: number;
  moyenneMensuelle: number;
  categoriesStats: Array<{
    _id: string;
    total: number;
    count: number;
    pourcentage: string;
  }>;
  depensesRecent: Array<{
    _id: string;
    titre: string;
    montant: number;
    categorie: string;
    date: string;
  }>;
  evolutionMensuelle: Array<{
    mois: string;
    total: number;
  }>;
}

export const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      console.log('Chargement des statistiques dashboard...');

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Récupérer les données en parallèle avec gestion d'erreurs
      const [balanceResponse, expensesResponse, recentExpensesResponse] = await Promise.all([
        balanceAPI.get().catch(err => {
          console.error('Erreur balance:', err);
          return { soldeActuel: 0 };
        }),
        expenseAPI.getStats().catch(err => {
          console.error('Erreur stats dépenses:', err);
          return { categories: [], moyenneParCategorie: [] };
        }),
        expenseAPI.getAll(1, 5).catch(err => {
          console.error('Erreur dépenses récentes:', err);
          return { data: [] };
        })
      ]);

      console.log('Réponses API:', {
        balance: balanceResponse,
        expenses: expensesResponse,
        recent: recentExpensesResponse
      });

      // Extraire les données avec des valeurs par défaut sécurisées
      const soldeActuel = balanceResponse?.soldeActuel || 0;
      const categoriesStats = expensesResponse?.moyenneParCategorie || [];
      const depensesRecent = recentExpensesResponse?.data || [];
      
      // Calculer le total des dépenses du mois
      const totalDepensesMois = categoriesStats.reduce((sum: number, cat: any) => {
        return sum + (cat.total || 0);
      }, 0);

      // Calculer les autres métriques
  const totalDepensesAnnee = await getYearlyTotal();
      const moyenneMensuelle = totalDepensesAnnee / (currentMonth || 1);

      const stats: DashboardStats = {
        soldeActuel,
        totalDepensesMois,
        totalDepensesAnnee,
        moyenneMensuelle,
        categoriesStats,
        depensesRecent,
        evolutionMensuelle: await getMonthlyExpenses(currentYear)
      };

      console.log('Statistiques calculées:', stats);
      return stats;

    } catch (error: any) {
      console.error('Erreur globale dashboard:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la récupération des statistiques';
      throw new Error(errorMessage);
    }
  }
};

// Helper pour les dépenses mensuelles
const getMonthlyExpenses = async (year: number) => {
  try {
    // Pour l'instant, on retourne des données simulées
    // À remplacer par un appel API réel quand disponible
    const months = [];
    for (let month = 1; month <= 12; month++) {
      months.push({
        mois: `${month.toString().padStart(2, '0')}/${year}`,
        total: Math.random() * 100000
      });
    }
    return months;
  } catch (error) {
    console.error('Erreur dépenses mensuelles:', error);
    return [];
  }
};

// Helper pour le total annuel
const getYearlyTotal = async (): Promise<number> => {
  try {
    // Simuler un total annuel - à remplacer par un appel API
    return 450000;
  } catch (error) {
    console.error('Erreur total annuel:', error);
    return 0;
  }
};