import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getProfiles, getExpenses, createExpense } from '../../utils/supabaseApi';
import AvatarUpload from '../../components/AvatarUpload';

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getProfiles().then(list => {
      const p = list.find(x => x.id == id);
      setProfile(p);
    });
    getExpenses().then(list => {
      setExpenses(list.filter(e => e.profile_id == id));
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!desc || !amount) return;
    try {
      const exp = await createExpense({ desc, amount: parseFloat(amount), profile_id: id, date: new Date().toISOString() });
      setExpenses([exp, ...expenses]);
      setDesc('');
      setAmount('');
    } catch {
      setError('Errore salvataggio spesa');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center text-red-500">Profilo non trovato</div>;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <img src={profile.avatar_url || '/avatar1.png'} alt={profile.name} className="w-24 h-24 rounded-full object-cover border" />
          <h2 className="text-2xl font-bold">{profile.name}</h2>
        </div>
        <form onSubmit={handleAddExpense} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Descrizione"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            className="border rounded px-4 py-2 w-full focus:outline-none focus:ring focus:border-blue-400"
            required
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Importo (€)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="border rounded px-4 py-2 w-full focus:outline-none focus:ring focus:border-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-primary text-white font-bold text-lg shadow hover:bg-primary/90 transition"
          >
            Aggiungi spesa
          </button>
        </form>
        {error && <div className="text-center text-red-500">{error}</div>}
        <div>
          <h3 className="text-lg font-semibold mb-2">Le tue spese</h3>
          <ul className="flex flex-col gap-2">
            {expenses.map(e => (
              <li key={e.id} className="flex justify-between items-center bg-gray-100 rounded-lg px-3 py-2">
                <span>{e.desc}</span>
                <span className="font-bold">€ {e.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
