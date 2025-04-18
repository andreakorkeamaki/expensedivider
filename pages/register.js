import { useState } from 'react';
import { useRouter } from 'next/router';
import { signUp } from '../utils/supabaseApi';
import Link from 'next/link';

// Lista di email autorizzate a registrarsi
const ALLOWED_EMAILS = [
  'andrea@example.com',
  'partner@example.com'
];

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Inserisci email e password');
      return;
    }
    
    // Verifica se l'email è nella lista di quelle autorizzate
    if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
      setError('Email non autorizzata. Solo utenti specifici possono registrarsi.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await signUp(email, password);
      router.push('/login?registered=true');
    } catch (err) {
      console.error('Register error:', err);
      setError('Errore durante la registrazione. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center">Registrazione</h2>
        
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
            <p className="text-xs text-gray-500 mt-1">Solo email autorizzate possono registrarsi.</p>
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
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">Almeno 6 caratteri</p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-600 transition mt-2"
          >
            {loading ? 'Registrazione in corso...' : 'Registrati'}
          </button>
          
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </form>
        
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Hai già un account?{' '}
            <Link href="/login" className="text-blue-500 hover:underline">
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
