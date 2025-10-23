import React, { useState, useEffect } from "react";
import {
  Filter,
  Download,
  Calendar,
  Tag,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Wallet,
  RefreshCw,
  Search,
} from "lucide-react";
import { historyService, type HistoryItem } from "../services/historyService";
import { formatAriary } from "../utils/format";

type FilterType = "all" | "depenses" | "depots" | "retraits";

export const HistoricsPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });

  // Charger l'historique
  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await historyService.getCompleteHistory(1, 100); // Plus d'éléments pour le filtrage
      setHistory(data.items);
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Filtrer l'historique
  const filteredHistory = history.filter((item) => {
    // Filtre par type
    if (activeFilter !== "all") {
      if (activeFilter === "depenses" && item.type !== "depense") return false;
      if (
        activeFilter === "depots" &&
        !["depot", "salaire"].includes(item.type)
      )
        return false;
      if (activeFilter === "retraits" && item.type !== "retrait") return false;
    }

    // Filtre par recherche
    if (
      searchTerm &&
      !item.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Filtre par date
    if (dateRange.start && new Date(item.date) < new Date(dateRange.start))
      return false;
    if (dateRange.end && new Date(item.date) > new Date(dateRange.end))
      return false;

    return true;
  });

  // Obtenir les informations d'affichage selon le type
  const getTransactionInfo = (item: HistoryItem) => {
    switch (item.type) {
      case "depense":
        return {
          icon: ShoppingCart,
          color: "text-red-600",
          bgColor: "bg-red-50",
          sign: "-",
          label: "Dépense",
        };
      case "depot":
        return {
          icon: TrendingUp,
          color: "text-green-600",
          bgColor: "bg-green-50",
          sign: "+",
          label: "Dépôt",
        };
      case "salaire":
        return {
          icon: Wallet,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          sign: "+",
          label: "Salaire",
        };
      case "retrait":
        return {
          icon: TrendingDown,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          sign: "-",
          label: "Retrait",
        };
      case "ajustement":
        return {
          icon: RefreshCw,
          color: "text-purple-600",
          bgColor: "bg-purple-50",
          sign: "±",
          label: "Ajustement",
        };
      default:
        return {
          icon: Tag,
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          sign: "",
          label: "Transaction",
        };
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

  // Calculer les statistiques
  const stats = {
    totalDepenses: filteredHistory
      .filter((item) => item.type === "depense")
      .reduce((sum, item) => sum + item.montant, 0),
    totalDepots: filteredHistory
      .filter((item) => ["depot", "salaire"].includes(item.type))
      .reduce((sum, item) => sum + item.montant, 0),
    totalRetraits: filteredHistory
      .filter((item) => item.type === "retrait")
      .reduce((sum, item) => sum + item.montant, 0),
    count: filteredHistory.length,
  };

  // Exporter les données (simulation)
  const handleExport = () => {
    const csvContent = [
      [
        "Date",
        "Type",
        "Description",
        "Catégorie",
        "Montant (Ar)",
        "Solde après",
      ],
      ...filteredHistory.map((item) => [
        formatDate(item.date),
        getTransactionInfo(item).label,
        item.description,
        item.categorie || "-",
        item.montant.toString(),
        item.soldeApres ? item.soldeApres.toString() : "-",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historique-mitsitsy-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setActiveFilter("all");
    setSearchTerm("");
    setDateRange({ start: "", end: "" });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Historique des Transactions
          </h1>
          <p className="text-gray-600">
            Consultez l'historique complet de vos finances
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-gray-800">{stats.count}</div>
          <div className="text-sm text-gray-600">Transactions</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            -{formatAriary(stats.totalDepenses)}
          </div>
          <div className="text-sm text-gray-600">Dépenses totales</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            +{formatAriary(stats.totalDepots)}
          </div>
          <div className="text-sm text-gray-600">Dépôts totaux</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            -{formatAriary(stats.totalRetraits)}
          </div>
          <div className="text-sm text-gray-600">Retraits totaux</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Filtre par type */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                {
                  key: "all",
                  icon: (
                    <Tag className="inline-block mr-1 h-4 w-4 align-text-bottom" />
                  ),
                  label: "Tous",
                },
                {
                  key: "depenses",
                  icon: (
                    <ShoppingCart className="inline-block mr-1 h-4 w-4 align-text-bottom" />
                  ),
                  label: "Dépenses",
                },
                {
                  key: "depots",
                  icon: (
                    <Download className="inline-block mr-1 h-4 w-4 align-text-bottom" />
                  ),
                  label: "Dépôts",
                },
                {
                  key: "retraits",
                  icon: (
                    <TrendingDown className="inline-block mr-1 h-4 w-4 align-text-bottom" />
                  ),
                  label: "Retraits",
                },
              ] as const
            ).map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeFilter === key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une transaction..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Dates */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Date début"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Date fin"
            />
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Résultats du filtrage */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredHistory.length} transaction(s) trouvée(s)
          {(activeFilter !== "all" ||
            searchTerm ||
            dateRange.start ||
            dateRange.end) && (
            <button
              onClick={resetFilters}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Liste des transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            Chargement de l'historique...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {history.length === 0
              ? "Aucune transaction enregistrée"
              : "Aucune transaction ne correspond aux filtres"}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredHistory.map((item) => {
              const {
                icon: Icon,
                color,
                bgColor,
                sign,
                label,
              } = getTransactionInfo(item);
              const isPositive = sign === "+";

              return (
                <div
                  key={item.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${bgColor}`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-semibold text-gray-800">
                            {label}
                          </span>
                          {item.categorie && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <Tag className="h-3 w-3 mr-1" />
                              {item.categorie}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-2">{item.description}</p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(item.date)}
                          </span>
                          {item.soldeApres && (
                            <span>Solde: {formatAriary(item.soldeApres)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {sign}
                        {formatAriary(item.montant)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{label}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
