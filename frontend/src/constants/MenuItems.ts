import { 
  LayoutDashboard, 
  TrendingUp, 
  Wallet, 
  History, 
  User 
} from "lucide-react";
import type { IconType } from "../types"; // On va créer ce type
 // On va créer ce type

export type Page = "dashboard" | "depenses" | "solde" | "historics" | "account";

export const menuItems: { 
  id: Page; 
  icon: IconType; 
  label: string; 
}[] = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Tableau de bord',
  },
  {
    id: 'depenses',
    icon: TrendingUp,
    label: 'Gestion des dépenses',
  },
  {
    id: 'solde',
    icon: Wallet,
    label: 'Gestion du solde',
  },
  {
    id: 'historics',
    icon: History,
    label: 'Historiques',
  },
  {
    id: 'account',
    icon: User,
    label: 'Mon compte',
  }
];