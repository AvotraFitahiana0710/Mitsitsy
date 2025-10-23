import { useState } from "react";
import { menuItems } from "../constants/MenuItems";
import { useAuth } from "../contexts/AuthContext";
import { LogOut, User as UserIcon, Mail, X, Menu } from "lucide-react";

type Page = "dashboard" | "account" | "historics" | "depenses" | "solde";

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-900 via-indigo-800 to-purple-900 shadow-lg transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-center h-20 bg-gradient-to-r from-blue-800 to-blue-600 text-white shadow-lg">
            <div className="text-center">
              <span className="text-xl font-display font-bold tracking-wide">
                Mitsitsy
              </span>
              <p className="text-xs text-blue-100 mt-1">Gestion de Dépenses</p>
            </div>
          </div>

          {/* User Info */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.nom}
                </p>
                <p className="text-xs text-blue-200 truncate flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items avec ICÔNES */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    currentPage === item.id
                      ? "bg-white/20 text-white font-semibold shadow-inner border-l-4 border-white"
                      : "text-gray-200 hover:bg-white/10 hover:text-white border-l-4 border-transparent"
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="ml-3">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Footer avec déconnexion */}
          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-200 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </button>
            <p className="text-xs text-gray-400 text-center">Mitsitsy v1.0</p>
          </div>
        </div>
      </div>
    </>
  );
};
