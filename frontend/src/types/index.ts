import type { LucideIcon } from "lucide-react";
export interface User {
  _id: string;
  nom: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    nom: string;
    email: string;
    token: string;
  };
}

export interface Expense {
  _id: string;
  titre: string;
  montant: number;
  categorie: string;
  date: string;
  description?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  titre: string;
  montant: number;
  categorie: string;
  date?: string;
  description?: string;
}

export interface UpdateExpenseData {
  titre?: string;
  montant?: number;
  categorie?: string;
  date?: string;
  description?: string;
}

export interface Balance {
  soldeActuel: number;
  historique: Transaction[];
}

export interface Transaction {
  type: 'depot' | 'retrait' | 'depense' | 'salaire' | 'ajustement';
  montant: number;
  description: string;
  date: string;
  soldeApres: number;
  reference?: string;
}

export interface ExpenseStats {
  categories: Array<{
    _id: string;
    total: number;
    count: number;
  }>;
  totalDepenses: number;
  moyenneParCategorie: Array<{
    _id: string;
    total: number;
    count: number;
    pourcentage: string;
  }>;
}

export type IconType = LucideIcon;

// Tes autres types existants...
export interface User {
  _id: string;
  nom: string;
  email: string;
}

// ... reste de tes types