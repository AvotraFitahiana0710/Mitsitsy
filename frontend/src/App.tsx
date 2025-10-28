import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { BalanceProvider, useBalance } from "./contexts/BalanceContext";
import { DashboardPage } from "./pages/DashboardPage";
import { DepensesPage } from "./pages/DepensesPage";
import { SoldePage } from "./pages/SoldePage";
import { Navigation } from "./components/Navigation";
import { Wallet, RefreshCw } from "lucide-react";
import { Login } from "./pages/Login";
import { formatAriary } from "./utils/format";
import { HistoricsPage } from "./pages/HistoricsPage";
import { AccountPage } from "./pages/AccountPage";
import type { Page } from "./constants/MenuItems";

// Composant Header réutilisable avec solde
const Header: React.FC<{ currentPage: Page }> = ({ currentPage }) => {
  const { user } = useAuth();
  const { balance: solde, loading, refreshBalance } = useBalance();

  const pageTitles: Record<Page, string> = {
    dashboard: "Tableau de Bord",
    depenses: "Gestion des Dépenses",
    solde: "Gestion du Solde",
    historics: "Historiques",
    account: "",
  };

  // Charger le solde au montage du composant via le contexte
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // Recharger le solde
  const handleRefresh = () => {
    refreshBalance();
  };

  // Formater le montant

  {
    solde !== null ? formatAriary(solde) : "...";
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky pl-64 top-0 z-20">
      <div className="flex justify-between items-center px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {pageTitles[currentPage]}
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Bonjour, <span className="font-semibold">{user?.nom}</span>
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Affichage du solde compact*/}

          <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
            <Wallet className="h-4 w-4 text-green-600" />
            <div className="text-sm font-semibold text-green-700">
              {loading ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : solde !== null ? (
                formatAriary(solde)
              ) : (
                "Erreur"
              )}
            </div>
            <button
              onClick={handleRefresh}
              className="p-1 text-green-600 hover:text-green-700 rounded transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>

          {/* Bouton déconnexion */}
          {/* <button
            onClick={logout}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </button> */}
        </div>
      </div>
    </header>
  );
};

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const { user } = useAuth();

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardPage />;
      case "depenses":
        return <DepensesPage />;
      case "solde":
        return <SoldePage />;
      case "historics":
        return <HistoricsPage />;
      case "account":
        return <AccountPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <Header currentPage={currentPage} />
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8">{renderPage()}</div>
      </main>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppWithBalanceProvider />
    </AuthProvider>
  );
};

const AppWithBalanceProvider: React.FC = () => {
  const { user } = useAuth();
  if (!user) {
    // Pas de BalanceProvider sur la page de login
    return <Login />;
  }
  return (
    <BalanceProvider>
      <div className="App">
        <AppContent />
      </div>
    </BalanceProvider>
  );
};

export default App;
