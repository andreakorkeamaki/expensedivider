import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getProfiles, getExpenses, createExpense, deleteProfile } from '../../utils/supabaseApi';
import AvatarUpload from '../../components/AvatarUpload';

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [description, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProfiles().then(list => {
      const p = list.find(x => x.id == id);
      setProfile(p);
    });
    getExpenses().then(list => {
      setExpenses(list.filter(e => e.paid_by == id));
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!description || !amount) return;
    try {
      const exp = await createExpense({ description, amount: parseFloat(amount), paid_by: id, date: new Date().toISOString() });
      setExpenses([exp, ...expenses]);
      setDesc('');
      setAmount('');
    } catch {
      setError('Errore salvataggio spesa');
    }
  };

  const handleDeleteProfile = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    setError('');
    
    try {
      await deleteProfile(id);
      router.push('/');
    } catch (err) {
      setError('Errore durante eliminazione del profilo');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
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
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => setShowDeleteConfirm(true)} 
              className="px-3 py-1 bg-red-500 text-white text-sm rounded shadow hover:bg-red-600 transition"
              disabled={isDeleting}
            >
              {isDeleting ? 'Eliminazione...' : 'Elimina profilo'}
            </button>
          </div>
          {showDeleteConfirm && (
            <div className="mt-2 p-3 border border-red-300 bg-red-50 rounded-lg text-center">
              <p className="mb-2 text-red-700">Sei sicuro di voler eliminare questo profilo? Tutte le spese associate verranno eliminate.</p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)} 
                  className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                  disabled={isDeleting}
                >
                  Annulla
                </button>
                <button 
                  onClick={handleDeleteProfile} 
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={isDeleting}
                >
                  Conferma eliminazione
                </button>
              </div>
            </div>
          )}
        </div>
        <form onSubmit={handleAddExpense} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Descrizione"
            value={description}
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
            className="w-full py-2 rounded-xl bg-blue-500 text-white font-bold text-lg shadow hover:bg-blue-600 transition"
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
                <span>{e.description}</span>
                <span className="font-bold">€ {e.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
