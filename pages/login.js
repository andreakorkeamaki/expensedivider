import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn, getUser } from '../utils/supabaseApi';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Se l'utente è già autenticato, reindirizza alla dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);
  
  // Controlla se c'è un parametro di registrazione completata nell'URL
  useEffect(() => {
    if (router.query.registered === 'true') {
      setError('Registrazione completata con successo. Ora puoi accedere.');
    }
  }, [router.query]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Inserisci email e password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting login with:', email);
      const { user: authUser, session } = await signIn(email, password);
      console.log('Login successful:', authUser, session);
      
      if (authUser) {
        login(authUser); // Aggiorna il contesto di autenticazione
        console.log('User set in auth context, redirecting...');
        router.push('/dashboard');
      } else {
        setError('Login riuscito ma nessun utente restituito');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(`Errore di accesso: ${err.message || 'Verifica email e password.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center">Accedi</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-600 transition mt-2"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
          
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </form>
        
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Non hai un account?{' '}
            <Link href="/register" className="text-blue-500 hover:underline">
              Registrati
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
