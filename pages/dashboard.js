import { useEffect, useState } from 'react';
import { getProfiles, getExpenses } from '../utils/supabaseApi';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    // Carica i profili e le spese dal database
    async function loadData() {
      try {
        const profilesData = await getProfiles();
        setProfiles(profilesData);
        
        const expensesData = await getExpenses();
        setExpenses(expensesData);
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento dashboard...</div>;

  // Calcolo saldo per profilo
  // Placeholder: saldo calculation will be reimplemented with new backend
  const saldo = {};
  expenses.forEach(e => {
    if (e.profile_id && saldo[e.profile_id] !== undefined) {
      saldo[e.profile_id] += parseFloat(e.amount);
    }
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Dashboard Spese Totali</h2>
          <div className="flex gap-2 items-center">
            {user && (
              <div className="text-sm text-gray-600">
                {user.email}
              </div>
            )}
            <button 
              onClick={logout} 
              className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300 transition"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {profiles.length > 0 ? profiles.map(p => (
            <Link href={`/profile/${p.id}`} key={p.id}>
              <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-lg p-4 shadow-inner cursor-pointer hover:bg-gray-100 transition">
                <img src={p.avatar_url || '/avatar1.png'} alt={p.name} className="w-16 h-16 rounded-full object-cover border" />
                <span className="font-semibold text-lg">{p.name}</span>
                <span className="text-2xl font-bold text-blue-500">€ {saldo[p.id]?.toFixed(2) || '0.00'}</span>
              </div>
            </Link>
          )) : (
            <div className="col-span-2 text-center py-8">
              <p className="text-gray-500 mb-4">Nessun profilo trovato</p>
              <Link href="/profile/new">
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                  Crea nuovo profilo
                </button>
              </Link>
            </div>
          )}
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Tutte le spese</h3>
          <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {expenses.map(e => (
              <li key={e.id} className="flex justify-between items-center bg-gray-100 rounded-lg px-3 py-2">
                <span>{e.description}</span>
                <span className="font-bold">€ {parseFloat(e.amount).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
