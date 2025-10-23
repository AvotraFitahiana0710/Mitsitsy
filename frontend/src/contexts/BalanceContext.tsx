import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { balanceService } from '../services/balanceService';

type BalanceContextType = {
  balance: number | null;
  loading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  setBalance: React.Dispatch<React.SetStateAction<number | null>>;
};

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await balanceService.getCurrentBalance();
      // Adapter à la forme de la réponse API
      const value = (data as any)?.soldeActuel ?? (data as any)?.value ?? null;
      setBalance(value);
    } catch (e: any) {
      setError(e?.message || 'Erreur lors du chargement du solde');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Chargement initial
    refreshBalance();
  }, [refreshBalance]);

  const value = useMemo(
    () => ({ balance, loading, error, refreshBalance, setBalance }),
    [balance, loading, error, refreshBalance]
  );

  return <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>;
};

export const useBalance = () => {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error('useBalance doit être utilisé dans un BalanceProvider');
  return ctx;
};
