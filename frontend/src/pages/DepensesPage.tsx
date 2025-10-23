import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Filter, X, Calendar, Tag } from "lucide-react";
import type { Expense, CreateExpenseData } from "../types";
import { expenseService } from "../services/expenseService";
import { formatAriary } from "../utils/format";
import { useBalance } from "../contexts/BalanceContext";
// Catégories disponibles
const CATEGORIES = [
  "alimentation",
  "transport",
  "logement",
  "loisirs",
  "santé",
  "éducation",
  "shopping",
  "autres",
];

export const DepensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { refreshBalance } = useBalance();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Formulaire
  const [formData, setFormData] = useState<CreateExpenseData>({
    titre: "",
    montant: 0,
    categorie: "alimentation",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  // Charger les dépenses
  const loadExpenses = async (page = 1) => {
    setLoading(true);
    try {
      const response = await expenseService.getExpenses(
        page,
        pagination.limit,
        filterCategory || undefined
      );
      setExpenses(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [filterCategory]);

  // Gérer les changements du formulaire
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "montant" ? parseFloat(value) || 0 : value,
    }));
  };

  // Créer ou mettre à jour une dépense
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingExpense) {
        // Mise à jour
        const updatedExpense = await expenseService.updateExpense(
          editingExpense._id,
          formData
        );
        setExpenses((prev) =>
          prev.map((exp) =>
            exp._id === updatedExpense._id ? updatedExpense : exp
          )
        );
        setEditingExpense(null);
      } else {
        // Création
        const newExpense = await expenseService.createExpense(formData);
        setExpenses((prev) => [newExpense, ...prev]);
      }

      // Rafraîchir le solde après mutation
      await refreshBalance();

      // Réinitialiser le formulaire
      setFormData({
        titre: "",
        montant: 0,
        categorie: "alimentation",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
      setShowForm(false);
    } catch (error: any) {
      alert("Erreur: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Éditer une dépense
  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      titre: expense.titre,
      montant: expense.montant,
      categorie: expense.categorie,
      date: expense.date.split("T")[0],
      description: expense.description || "",
    });
    setShowForm(true);
  };

  // Supprimer une dépense
  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) {
      return;
    }

    try {
      await expenseService.deleteExpense(id);
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
      // Rafraîchir le solde après suppression
      await refreshBalance();
      alert("Dépense supprimée avec succès");
    } catch (error: any) {
      alert("Erreur: " + error.message);
    }
  };

  // Annuler l'édition/création
  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
    setFormData({
      titre: "",
      montant: 0,
      categorie: "alimentation",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR");
  };

  // Formater le montant
  {
    {
      formatAriary(expenses.montant);
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout et filtre */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Enregistrez et gérez vos dépenses
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Filtre par catégorie */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Bouton d'ajout */}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Dépense</span>
          </button>
        </div>
      </div>

      {/* Formulaire de création/édition */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {editingExpense ? "Modifier la dépense" : "Nouvelle Dépense"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Courses alimentaires"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (Ar) *
                </label>
                <input
                  type="number"
                  name="montant"
                  value={formData.montant}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description optionnelle..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading
                  ? "En cours..."
                  : editingExpense
                  ? "Modifier"
                  : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des dépenses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Liste des Dépenses ({pagination.total})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Chargement des dépenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filterCategory
              ? `Aucune dépense dans la catégorie "${filterCategory}"`
              : "Aucune dépense enregistrée"}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-800">
                        {expense.titre}
                      </h4>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          expense.categorie === "alimentation"
                            ? "bg-green-100 text-green-800"
                            : expense.categorie === "transport"
                            ? "bg-blue-100 text-blue-800"
                            : expense.categorie === "logement"
                            ? "bg-purple-100 text-purple-800"
                            : expense.categorie === "loisirs"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {expense.categorie}
                      </span>
                    </div>

                    {expense.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {expense.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(expense.date)}
                      </span>
                      <span className="font-semibold text-red-600">
                        {formatAriary(expense.montant)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 flex justify-center">
            <div className="flex space-x-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => loadExpenses(page)}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    pagination.page === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
