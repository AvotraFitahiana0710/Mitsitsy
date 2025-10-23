import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Download,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { accountService } from "../services/accountService";
import { balanceService } from "../services/balanceService";
import { expenseService } from "../services/expenseService";
import { formatAriary } from "../utils/format";

export const AccountPage: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "preferences" | "stats"
  >("profile");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // États pour l'édition du profil
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nom: user?.nom || "",
    email: user?.email || "",
  });

  // États pour le changement de mot de passe
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // États pour les préférences
  const [preferences, setPreferences] = useState({
    notifications: true,
    weeklyReport: false,
    lowBalanceAlert: true,
    currency: "MGA",
    language: "fr",
  });

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const [balanceData, expensesData] = await Promise.all([
        balanceService.getCurrentBalance(),
        expenseService.getStats(),
      ]);

      setStats({
        soldeActuel: balanceData.soldeActuel,
        totalDepenses: expensesData.totalDepenses,
        categories: expensesData.categories,
      });
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Mettre à jour le profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await accountService.updateProfile(profileData);

      // Mettre à jour le contexte et le localStorage
      updateUser(updatedUser);

      alert("Profil mis à jour avec succès!");
      setIsEditing(false);
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Changer le mot de passe
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);

    try {
      await accountService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      alert("Mot de passe changé avec succès!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      nom: user?.nom || "",
      email: user?.email || "",
    });
  };

  // Exporter les données
  const handleExportData = async () => {
    try {
      // Récupérer toutes les données nécessaires
      const [balanceData, expensesData, historyData] = await Promise.all([
        balanceService.getCurrentBalance(),
        expenseService.getStats(),
        balanceService.getHistory(1, 1000), // Récupérer beaucoup d'historique
      ]);

      // Préparer les données pour l'export
      const exportData = {
        profil: {
          nom: user?.nom,
          email: user?.email,
          dateExport: new Date().toISOString(),
        },
        solde: {
          actuel: balanceData.soldeActuel,
          historique: historyData.historique,
        },
        depenses: {
          total: expensesData.totalDepenses,
          categories: expensesData.categories,
          moyenneParCategorie: expensesData.moyenneParCategorie,
        },
      };

      // Créer le contenu CSV
      const csvContent = createCSVContent(exportData);

      // Télécharger le fichier
      downloadCSV(
        csvContent,
        `mitsitsy-export-${new Date().toISOString().split("T")[0]}.csv`
      );

      alert("Export réussi! Vérifiez vos téléchargements.");
    } catch (error: any) {
      alert("Erreur lors de l'export: " + error.message);
    }
  };

  // Fonction pour créer le contenu CSV
  const createCSVContent = (data: any) => {
    const lines = [];

    // En-tête
    lines.push("Mitsitsy - Export de données");
    lines.push(`Export généré le: ${new Date().toLocaleDateString("fr-FR")}`);
    lines.push("");

    // Section Profil
    lines.push("PROFIL UTILISATEUR");
    lines.push("Nom,Email");
    lines.push(`"${data.profil.nom}","${data.profil.email}"`);
    lines.push("");

    // Section Solde
    lines.push("SOLDE ACTUEL");
    lines.push("Montant");
    lines.push(`"${formatAriary(data.solde.actuel).replace(/"/g, '""')}"`);
    lines.push("");

    // Section Dépenses par catégorie
    lines.push("DÉPENSES PAR CATÉGORIE");
    lines.push("Catégorie,Montant total,Nombre de transactions,Pourcentage");
    data.depenses.categories.forEach((cat: any) => {
      const pourcentage =
        data.depenses.moyenneParCategorie.find((c: any) => c._id === cat._id)
          ?.pourcentage || "0";
      lines.push(
        `"${cat._id}","${cat.total}","${cat.count}","${pourcentage}%"`
      );
    });
    lines.push("");
    lines.push(`"TOTAL DÉPENSES","${data.depenses.total}","",""`);
    lines.push("");

    // Section Historique des transactions (limité aux 50 dernières)
    lines.push("HISTORIQUE DES TRANSACTIONS (50 dernières)");
    lines.push("Date,Type,Description,Montant,Solde après");
    data.solde.historique.slice(0, 50).forEach((transaction: any) => {
      const date = new Date(transaction.date).toLocaleDateString("fr-FR");
      const type = getTypeLabel(transaction.type);
      lines.push(
        `"${date}","${type}","${transaction.description}","${transaction.montant}","${transaction.soldeApres}"`
      );
    });

    return lines.join("\n");
  };

  // Fonction pour télécharger le CSV
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper pour les labels de type
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

  // Catégorie la plus utilisée
  const getTopCategory = () => {
    if (!stats?.categories?.length) return null;
    return stats.categories.reduce((prev: any, current: any) =>
      prev.total > current.total ? prev : current
    );
  };

  const topCategory = getTopCategory();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">👤 Mon Compte</h1>
            <p className="text-purple-100">
              Gérez vos informations personnelles et préférences
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <User className="h-6 w-6" />
            </div>
            <div className="text-right">
              <div className="font-semibold">{user?.nom}</div>
              <div className="text-purple-200 text-sm">{user?.email}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation latérale */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-2">
              {[
                {
                  id: "profile" as const,
                  icon: User,
                  label: "Profil",
                  description: "Informations personnelles",
                },
                {
                  id: "security" as const,
                  icon: Shield,
                  label: "Sécurité",
                  description: "Mot de passe",
                },
                {
                  id: "preferences" as const,
                  icon: Bell,
                  label: "Préférences",
                  description: "Notifications",
                },
                {
                  id: "stats" as const,
                  icon: Download,
                  label: "Statistiques",
                  description: "Vue d'ensemble",
                },
              ].map(({ id, icon: Icon, label, description }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeTab === id
                      ? "bg-blue-50 border border-blue-200 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-gray-500">{description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Déconnexion */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Lock className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="lg:col-span-3">
          {/* Onglet Profil */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Informations du profil
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Modifier</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Annuler</span>
                    </button>
                    <button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      <span>
                        {loading ? "Enregistrement..." : "Enregistrer"}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-2" />
                      Nom complet
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.nom}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            nom: e.target.value,
                          }))
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {user?.nom}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-2" />
                      Adresse email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        {user?.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations de compte */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Informations du compte
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Membre depuis:</span>
                      <div className="font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date().toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Statut:</span>
                      <div className="font-medium text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Compte actif
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === "security" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Sécurité du compte
              </h2>

              <form
                onSubmit={handleChangePassword}
                className="space-y-6 max-w-md"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      required
                      minLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          new: !prev.new,
                        }))
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      required
                      minLength={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {loading
                    ? "Changement en cours..."
                    : "Changer le mot de passe"}
                </button>
              </form>
            </div>
          )}

          {/* Onglet Préférences */}
          {activeTab === "preferences" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Préférences
              </h2>

              <div className="space-y-6">
                {/* Notifications */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        id: "notifications",
                        label: "Notifications générales",
                        description: "Recevoir les notifications importantes",
                      },
                      {
                        id: "weeklyReport",
                        label: "Rapport hebdomadaire",
                        description:
                          "Recevoir un résumé hebdomadaire par email",
                      },
                      {
                        id: "lowBalanceAlert",
                        label: "Alerte solde faible",
                        description: "Être alerté quand le solde est bas",
                      },
                    ].map(({ id, label, description }) => (
                      <div
                        key={id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-800">
                            {label}
                          </div>
                          <div className="text-sm text-gray-600">
                            {description}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setPreferences((prev) => ({
                              ...prev,
                              [id]: !prev[id as keyof typeof preferences],
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            preferences[id as keyof typeof preferences]
                              ? "bg-blue-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              preferences[id as keyof typeof preferences]
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paramètres régionaux */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Paramètres régionaux
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Devise
                      </label>
                      <select
                        value={preferences.currency}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            currency: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="MGA">Ariary Malgache (Ar)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar US ($)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Langue
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            language: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="fr">Français</option>
                        <option value="mg">Malagasy</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Statistiques */}
          {activeTab === "stats" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Statistiques du compte
                </h2>
                <button
                  onClick={handleExportData}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Exporter données</span>
                </button>
              </div>

              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatAriary(stats.soldeActuel)}
                    </div>
                    <div className="text-sm text-blue-800">Solde actuel</div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="text-2xl font-bold text-red-600">
                      {formatAriary(stats.totalDepenses)}
                    </div>
                    <div className="text-sm text-red-800">Dépenses totales</div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.categories?.length || 0}
                    </div>
                    <div className="text-sm text-green-800">
                      Catégories utilisées
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chargement des statistiques...
                </div>
              )}

              {/* Catégorie préférée */}
              {topCategory && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Catégorie la plus utilisée
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-800 capitalize">
                          {topCategory._id}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatAriary(topCategory.total)} •{" "}
                          {topCategory.count} transaction(s)
                        </div>
                      </div>
                      <div className="text-2xl">
                        {topCategory._id === "alimentation" && "🛒"}
                        {topCategory._id === "transport" && "🚗"}
                        {topCategory._id === "logement" && "🏠"}
                        {topCategory._id === "loisirs" && "🎮"}
                        {topCategory._id === "santé" && "🏥"}
                        {topCategory._id === "éducation" && "📚"}
                        {topCategory._id === "shopping" && "🛍️"}
                        {topCategory._id === "autres" && "📦"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
