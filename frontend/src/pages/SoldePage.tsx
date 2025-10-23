import React, { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  History,
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { balanceService } from "../services/balanceService";
import { formatAriary } from "../utils/format";

interface Transaction {
  type: "depot" | "retrait" | "depense" | "salaire" | "ajustement";
  montant: number;
  description: string;
  date: string;
  soldeApres: number;
  reference?: string;
}

interface BalanceData {
  soldeActuel: number;
  historique: Transaction[];
}

export const SoldePage: React.FC = () => {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"operations" | "historique">(
    "operations"
  );
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  // États pour les formulaires
  const [depositData, setDepositData] = useState({
    montant: 0,
    type: "depot",
    description: "",
  });

  const [withdrawData, setWithdrawData] = useState({
    montant: 0,
    description: "",
  });

  // Charger le solde et l'historique
  const loadBalanceData = async () => {
    setLoading(true);
    try {
      const [balanceData, historyData] = await Promise.all([
        balanceService.getCurrentBalance(),
        balanceService.getHistory(1, 50),
      ]);

      setBalance({
        soldeActuel: balanceData.soldeActuel,
        historique: historyData.historique,
      });
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalanceData();
  }, []);

  // Gérer le dépôt
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await balanceService.makeDeposit(
        depositData.montant,
        depositData.type,
        depositData.description
      );

      // Recharger les données
      await loadBalanceData();

      // Réinitialiser le formulaire
      setDepositData({ montant: 0, type: "depot", description: "" });
      setShowDepositForm(false);

      alert("Dépôt effectué avec succès!");
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Gérer le retrait
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!balance || withdrawData.montant > balance.soldeActuel) {
      alert("Solde insuffisant pour ce retrait");
      return;
    }

    setLoading(true);

    try {
      await balanceService.makeWithdrawal(
        withdrawData.montant,
        withdrawData.description
      );

      // Recharger les données
      await loadBalanceData();

      // Réinitialiser le formulaire
      setWithdrawData({ montant: 0, description: "" });
      setShowWithdrawForm(false);

      alert("Retrait effectué avec succès!");
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Obtenir l'icône et la couleur selon le type de transaction
  const getTransactionInfo = (type: string) => {
    switch (type) {
      case "depot":
      case "salaire":
        return {
          icon: TrendingUp,
          color: "text-green-600",
          bgColor: "bg-green-50",
        };
      case "retrait":
        return {
          icon: TrendingDown,
          color: "text-red-600",
          bgColor: "bg-red-50",
        };
      case "depense":
        return {
          icon: Minus,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
        };
      default:
        return { icon: History, color: "text-gray-600", bgColor: "bg-gray-50" };
    }
  };

  // Obtenir le libellé du type
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      depot: "Dépôt",
      retrait: "Retrait",
      depense: "Dépense",
      salaire: "Salaire",
      ajustement: "Ajustement",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec solde */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gestion du Solde</h1>
            <p className="text-blue-100">
              Consultez et gérez votre solde financier
            </p>
          </div>

          <button
            onClick={loadBalanceData}
            disabled={loading}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Actualiser</span>
          </button>
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <div className="bg-white/20 p-4 rounded-lg">
            <Wallet className="h-8 w-8" />
          </div>
          <div>
            <div className="text-blue-100 text-sm">Solde actuel</div>
            <div className="text-3xl font-bold">
              {loading
                ? "Chargement..."
                : balance
                ? formatAriary(balance.soldeActuel)
                : "0 Ar"}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("operations")}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                activeTab === "operations"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Wallet className="inline-block mr-2 h-5 w-5 align-text-bottom" />
              Opérations
            </button>
            <button
              onClick={() => setActiveTab("historique")}
              className={`flex-1 py-4 px-6 text-center font-medium text-sm ${
                activeTab === "historique"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <TrendingUp className="inline-block mr-2 h-5 w-5 align-text-bottom" />
              Historique
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Onglet Opérations */}
          {activeTab === "operations" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Carte Dépôt */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Plus className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Déposer de l'argent
                    </h3>
                  </div>

                  <p className="text-gray-600 mb-4">
                    Ajoutez de l'argent à votre solde (salaire, virement, etc.)
                  </p>

                  {!showDepositForm ? (
                    <button
                      onClick={() => setShowDepositForm(true)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                    >
                      Faire un dépôt
                    </button>
                  ) : (
                    <form onSubmit={handleDeposit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Montant (Ar)
                        </label>
                        <input
                          type="number"
                          value={depositData.montant}
                          onChange={(e) =>
                            setDepositData((prev) => ({
                              ...prev,
                              montant: parseFloat(e.target.value) || 0,
                            }))
                          }
                          required
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="10000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={depositData.type}
                          onChange={(e) =>
                            setDepositData((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="depot">Dépôt</option>
                          <option value="salaire">Salaire</option>
                          <option value="cadeau">Cadeau</option>
                          <option value="autres">Autres</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={depositData.description}
                          onChange={(e) =>
                            setDepositData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          placeholder="Ex: Salaire du mois de Mars"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowDepositForm(false)}
                          className="flex-1 py-2 px-4 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {loading ? "En cours..." : "Déposer"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Carte Retrait */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-red-100 p-2 rounded-full">
                      <Minus className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Retirer de l'argent
                    </h3>
                  </div>

                  <p className="text-gray-600 mb-4">
                    Retirez de l'argent de votre solde (espèces, transfert,
                    etc.)
                  </p>

                  {!showWithdrawForm ? (
                    <button
                      onClick={() => setShowWithdrawForm(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                    >
                      Faire un retrait
                    </button>
                  ) : (
                    <form onSubmit={handleWithdraw} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Montant (Ar)
                        </label>
                        <input
                          type="number"
                          value={withdrawData.montant}
                          onChange={(e) =>
                            setWithdrawData((prev) => ({
                              ...prev,
                              montant: parseFloat(e.target.value) || 0,
                            }))
                          }
                          required
                          min="1"
                          max={balance?.soldeActuel || 0}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="5000"
                        />
                        {balance && (
                          <p className="text-sm text-gray-500 mt-1">
                            Solde disponible:{" "}
                            {formatAriary(balance.soldeActuel)}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={withdrawData.description}
                          onChange={(e) =>
                            setWithdrawData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Ex: Retrait espèce"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowWithdrawForm(false)}
                          className="flex-1 py-2 px-4 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {loading ? "En cours..." : "Retirer"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Onglet Historique */}
          {activeTab === "historique" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Historique des transactions ({balance?.historique.length || 0})
              </h3>

              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Chargement de l'historique...
                </div>
              ) : !balance?.historique.length ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune transaction enregistrée
                </div>
              ) : (
                <div className="space-y-3">
                  {balance.historique.map((transaction, index) => {
                    const {
                      icon: Icon,
                      color,
                      bgColor,
                    } = getTransactionInfo(transaction.type);
                    const isPositive = ["depot", "salaire"].includes(
                      transaction.type
                    );

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${bgColor}`}>
                            <Icon className={`h-5 w-5 ${color}`} />
                          </div>

                          <div>
                            <div className="font-medium text-gray-800">
                              {getTypeLabel(transaction.type)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {transaction.description}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(transaction.date)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-semibold ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isPositive ? "+" : "-"}
                            {formatAriary(transaction.montant)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Solde: {formatAriary(transaction.soldeApres)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
