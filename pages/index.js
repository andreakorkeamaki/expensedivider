import { useState, useEffect } from 'react';
import { getProfiles } from '../utils/supabaseApi';

export default function Home() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getProfiles()
      .then(setProfiles)
      .catch(() => setError('Errore nel caricamento profili'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Gestione Spese di Coppia</h1>
      <div className="w-full max-w-md mx-auto flex flex-col gap-4">
        {loading && <div className="text-center">Caricamento profili...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        <div className="flex flex-col gap-4">
          {profiles.map((p) => (
            <a
              key={p.id}
              href={`/profile/${p.id}`}
              className="flex items-center gap-4 p-4 rounded-xl shadow bg-white hover:bg-gray-50 transition"
            >
              <img
                src={p.avatar_url || '/avatar1.png'}
                alt={p.name}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <span className="text-lg font-semibold">{p.name}</span>
            </a>
          ))}
        </div>
        <button
          className="mt-6 w-full py-3 rounded-xl bg-primary text-white font-bold text-lg shadow hover:bg-primary/90 transition"
          onClick={() => window.location.href = '/profile/new'}
        >
          + Crea profilo
        </button>
      </div>
    </main>
  );
}
