import { createContext, useContext } from 'react';
import { RootStore } from '@/stores/RootStore';

export const StoreContext = createContext<RootStore | null>(null);

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
