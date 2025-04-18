import { useEffect, useState } from 'react';
import { getProfiles, getExpenses } from '../utils/supabaseApi';

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProfiles(),
      getExpenses()
    ]).then(([profiles, expenses]) => {
      setProfiles(profiles);
      setExpenses(expenses);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento dashboard...</div>;

  // Calcolo saldo per profilo
  const saldo = {};
  profiles.forEach(p => saldo[p.id] = 0);
  expenses.forEach(e => {
    if (e.profile_id && saldo[e.profile_id] !== undefined) {
      saldo[e.profile_id] += parseFloat(e.amount);
    }
  });

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center mb-4">Dashboard Spese Totali</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {profiles.map(p => (
            <div key={p.id} className="flex flex-col items-center gap-2 bg-gray-50 rounded-lg p-4 shadow-inner">
              <img src={p.avatar_url || '/avatar1.png'} alt={p.name} className="w-16 h-16 rounded-full object-cover border" />
              <span className="font-semibold text-lg">{p.name}</span>
              <span className="text-2xl font-bold text-primary">€ {saldo[p.id]?.toFixed(2) || '0.00'}</span>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Tutte le spese</h3>
          <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {expenses.map(e => (
              <li key={e.id} className="flex justify-between items-center bg-gray-100 rounded-lg px-3 py-2">
                <span>{e.desc}</span>
                <span className="font-bold">€ {parseFloat(e.amount).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
