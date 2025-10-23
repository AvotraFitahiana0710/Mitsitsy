import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  PieChart,
  History,
  Target,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  dashboardService,
  type DashboardStats,
} from "../services/dashboardService";
import { StatCard } from "../components/StatCard";
import { CategoryProgress } from "../components/CategoryProgress";
import { formatAriary } from "../utils/format";

// Couleurs pour les catégories
const categoryColors = {
  alimentation: "bg-red-500",
  transport: "bg-blue-500",
  logement: "bg-purple-500",
  loisirs: "bg-green-500",
  santé: "bg-pink-500",
  éducation: "bg-indigo-500",
  shopping: "bg-orange-500",
  autres: "bg-gray-500",
};

const progressColors = {
  alimentation: "bg-red-500",
  transport: "bg-blue-500",
  logement: "bg-purple-500",
  loisirs: "bg-green-500",
  santé: "bg-pink-500",
  éducation: "bg-indigo-500",
  shopping: "bg-orange-500",
  autres: "bg-gray-500",
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les statistiques
  const loadDashboardStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const dashboardStats = await dashboardService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err: any) {
      setError(err.message);
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardStats}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tableau de Bord</h1>
          <p className="text-gray-600">
            Vue d'ensemble de vos finances et statistiques
          </p>
        </div>

        <button
          onClick={loadDashboardStats}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Solde Actuel"
          value={formatAriary(stats.soldeActuel)}
          subtitle="Disponible"
          icon={<Wallet className="h-8 w-8" />}
          color="green"
        />

        <StatCard
          title="Dépenses ce mois"
          value={formatAriary(stats.totalDepensesMois)}
          subtitle={`Moyenne: ${formatAriary(stats.moyenneMensuelle)}`}
          icon={<TrendingDown className="h-8 w-8" />}
          color="red"
        />

        <StatCard
          title="Dépenses annuelles"
          value={formatAriary(stats.totalDepensesAnnee)}
          subtitle="Cette année"
          icon={<Calendar className="h-8 w-8" />}
          color="purple"
        />

        <StatCard
          title="Catégories utilisées"
          value={stats.categoriesStats.length}
          subtitle="Diversité des dépenses"
          icon={<PieChart className="h-8 w-8" />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition par catégorie */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Répartition des Dépenses
              </h2>
              <Target className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-1">
              {stats.categoriesStats.map((category) => (
                <CategoryProgress
                  key={category._id}
                  category={category._id}
                  amount={category.total}
                  percentage={parseFloat(category.pourcentage)}
                  color={
                    progressColors[
                      category._id as keyof typeof progressColors
                    ] || "bg-gray-500"
                  }
                />
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total des dépenses:</span>
                <span className="font-semibold">
                  {formatAriary(stats.totalDepensesMois)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dernières dépenses */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Dernières Dépenses
              </h2>
              <History className="h-5 w-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {stats.depensesRecent.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucune dépense récente
                </p>
              ) : (
                stats.depensesRecent.map((depense) => (
                  <div
                    key={depense._id}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                          categoryColors[
                            depense.categorie as keyof typeof categoryColors
                          ] || "bg-gray-500"
                        }`}
                      >
                        {depense.categorie.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">
                          {depense.titre}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {depense.categorie}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-red-600 text-sm">
                        -{formatAriary(depense.montant)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(depense.date)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {stats.depensesRecent.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                  Voir tout l'historique →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conseils et insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Insights & Conseils
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-800">
                Économies potentielles
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Votre plus grande dépense est{" "}
              {stats.categoriesStats[0]?._id || "..."}. Pensez à comparer les
              prix pour économiser.
            </p>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-800">
                Objectif mensuel
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Vous avez dépensé {formatAriary(stats.totalDepensesMois)} ce mois.
              Votre moyenne est de {formatAriary(stats.moyenneMensuelle)}.
            </p>
          </div>
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Résumé Financier
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatAriary(stats.soldeActuel)}
            </div>
            <div className="text-sm text-gray-600">Solde disponible</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {formatAriary(stats.totalDepensesMois)}
            </div>
            <div className="text-sm text-gray-600">Dépenses ce mois</div>
          </div>

          <div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats.categoriesStats.length}
            </div>
            <div className="text-sm text-gray-600">Catégories actives</div>
          </div>
        </div>
      </div>
    </div>
  );
};
