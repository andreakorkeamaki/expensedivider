import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getUser, signOut } from '../utils/supabaseApi';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Controlla lo stato dell'autenticazione all'avvio
    async function loadUserData() {
      try {
        const currentUser = await getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Errore nel caricamento dell\'utente:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
