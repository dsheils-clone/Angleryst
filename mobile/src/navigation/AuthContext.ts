import { createContext, useContext } from 'react';

export const AuthContext = createContext<{
  setHasToken: (hasToken: boolean) => void;
}>({ setHasToken: () => {} });

export function useAuth() {
  return useContext(AuthContext);
}
