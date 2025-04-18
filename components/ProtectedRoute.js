import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

// Componente per proteggere le rotte che richiedono autenticazione
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se non sta caricando e non c'è un utente, reindirizza al login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Mostra un loader mentre verifica l'autenticazione
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Verifica accesso...</h2>
          <p className="text-gray-500">Attendere prego</p>
        </div>
      </div>
    );
  }

  // Se c'è un utente autenticato, mostra il contenuto della pagina
  return <>{children}</>;
}
