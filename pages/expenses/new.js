import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, getCoupleByProfileId, createExpense } from '../../utils/supabaseApi';
import Link from 'next/link';

// Categorie predefinite per le spese
const CATEGORIES = [
  { id: 'groceries', name: 'Spesa', icon: '🛒' },
  { id: 'restaurant', name: 'Ristorante', icon: '🍽️' },
  { id: 'entertainment', name: 'Svago', icon: '🎭' },
  { id: 'travel', name: 'Viaggi', icon: '✈️' },
  { id: 'utilities', name: 'Bollette', icon: '💡' },
  { id: 'health', name: 'Salute', icon: '💊' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️' },
  { id: 'home', name: 'Casa', icon: '🏠' },
  { id: 'other', name: 'Altro', icon: '📋' }
];

export default function NewExpense() {
  const router = useRouter();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [coupleId, setCoupleId] = useState(null);
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    async function loadData() {
      try {
        // Ottieni il profilo dell'utente
        const profile = await getUserProfile(user.id);
        
        if (!profile) {
          router.push('/create-profile');
          return;
        }
        
        setUserProfile(profile);
        setPaidBy(profile.id);
        
        // Verifica se l'utente fa parte di una coppia
        if (!profile.couple_id) {
          router.push('/select-partner');
          return;
        }
        
        setCoupleId(profile.couple_id);
        
        // Ottieni la coppia e il profilo del partner
        const couple = await getCoupleByProfileId(profile.id);
        if (couple && couple.profiles) {
          const partner = couple.profiles.find(p => p.id !== profile.id);
          setPartnerProfile(partner);
        }
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
        setError('Errore nel caricamento dei dati del profilo');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user, router]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description || !amount || !paidBy || !date || !category) {
      setError('Compila tutti i campi necessari');
      return;
    }
    
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Inserisci un importo valido');
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      const expense = {
        description,
        amount: parseFloat(amount),
        paid_by: paidBy,
        date,
        category,
        couple_id: coupleId
      };
      
      await createExpense(expense);
      setSuccess('Spesa aggiunta con successo!');
      
      // Resetta il form
      setDescription('');
      setAmount('');
      setCategory('other');
      setDate(new Date().toISOString().split('T')[0]);
      
      // Reindirizza alla dashboard dopo un breve ritardo
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Errore nel salvataggio della spesa:', err);
      setError(`Errore: ${err.message || 'Impossibile salvare la spesa'}`);
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;
  }
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center">Aggiungi nuova spesa</h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-md">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrizione
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Es. Spesa al supermercato"
              required
            />
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Importo (€)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-md ${
                    category === cat.id 
                      ? 'bg-blue-100 border-2 border-blue-500' 
                      : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs mt-1">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1">
              Pagato da
            </label>
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 flex-1 p-3 rounded-md cursor-pointer ${
                paidBy === userProfile?.id ? 'bg-blue-100 border border-blue-500' : 'bg-gray-50 border border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="paidBy"
                  value={userProfile?.id}
                  checked={paidBy === userProfile?.id}
                  onChange={() => setPaidBy(userProfile?.id)}
                  className="hidden"
                />
                <img 
                  src={userProfile?.avatar_url || '/avatar-placeholder.png'} 
                  alt={userProfile?.name} 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>{userProfile?.name}</span>
              </label>
              
              <label className={`flex items-center gap-2 flex-1 p-3 rounded-md cursor-pointer ${
                paidBy === partnerProfile?.id ? 'bg-blue-100 border border-blue-500' : 'bg-gray-50 border border-gray-200'
              }`}>
                <input
                  type="radio"
                  name="paidBy"
                  value={partnerProfile?.id}
                  checked={paidBy === partnerProfile?.id}
                  onChange={() => setPaidBy(partnerProfile?.id)}
                  className="hidden"
                />
                <img 
                  src={partnerProfile?.avatar_url || '/avatar-placeholder.png'} 
                  alt={partnerProfile?.name} 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span>{partnerProfile?.name}</span>
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex gap-4 mt-6">
            <Link href="/dashboard" className="flex-1">
              <button 
                type="button"
                className="w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md shadow hover:bg-gray-300 transition"
              >
                Annulla
              </button>
            </Link>
            
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-600 transition"
            >
              {saving ? 'Salvataggio...' : 'Salva spesa'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
