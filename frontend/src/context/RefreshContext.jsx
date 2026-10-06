import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNotifications } from './NotificationContext';

const RefreshContext = createContext(null);

export function RefreshProvider({ children }) {
  const [refreshTick, setRefreshTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { fetchNotifications } = useNotifications();

  const triggerRefresh = useCallback(() => {
    setIsRefreshing(true);
    setRefreshTick((prev) => prev + 1);

    // Refresh notifications count in background as well
    if (fetchNotifications) {
      fetchNotifications();
    }

    // Provide smooth visual spinning feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }, [fetchNotifications]);

  return (
    <RefreshContext.Provider value={{ refreshTick, isRefreshing, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};
