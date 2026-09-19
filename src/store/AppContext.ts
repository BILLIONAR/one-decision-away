import { createContext } from 'react';
import type { AppContextType } from './useApp';

// Keep the context identity stable when Vite refreshes the provider or its hook.
export const AppContext = createContext<AppContextType | null>(null);
