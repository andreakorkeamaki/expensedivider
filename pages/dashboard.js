import { useEffect, useState } from 'react';
import { getUserProfile, getProfiles, getExpenses, getCoupleByProfileId, getPendingInvitationsForUser } from '../utils/supabaseApi';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [coupleData, setCoupleData] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Carica il profilo dell'utente, la coppia e le spese
    async function loadData() {
      try {
        // 1. Ottieni il profilo dell'utente
        const profile = await getUserProfile(user.id);
        
        // Se l'utente non ha ancora un profilo, reindirizzalo alla creazione
        if (!profile) {
          router.push('/create-profile');
          return;
        }
        
        setUserProfile(profile);
        
        // 2. Controlla se l'utente fa parte di una coppia
        if (profile.couple_id) {
          const couple = await getCoupleByProfileId(profile.id);
          setCoupleData(couple);
          
          // Trova il profilo del partner
          if (couple && couple.profiles) {
            const partner = couple.profiles.find(p => p.id !== profile.id);
            setPartnerProfile(partner);
          }
          
          // Carica le spese della coppia
          const coupleExpenses = await getExpenses(profile.couple_id);
          setExpenses(coupleExpenses);
        } else {
          // 3. Se non ha una coppia, controlla se ha inviti in sospeso
          const invitations = await getPendingInvitationsForUser(profile.id);
          setPendingInvitations(invitations);
          
          // Reindirizza alla pagina di selezione partner se non ha ancora una coppia
          // e non è arrivato da quella pagina
          if (!router.query.from || router.query.from !== 'select-partner') {
            router.push('/select-partner');
            return;
          }
        }
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento dashboard...</div>;

  // Calcolo del saldo e chi deve a chi
  const calculateBalance = () => {
    if (!userProfile || !partnerProfile) return { userOwes: 0, partnerOwes: 0 };
    
    let userTotal = 0;
    let partnerTotal = 0;
    
    expenses.forEach(expense => {
      const amount = parseFloat(expense.amount);
      if (expense.paid_by === userProfile.id) {
        userTotal += amount;
      } else if (expense.paid_by === partnerProfile.id) {
        partnerTotal += amount;
      }
    });
    
    const totalExpenses = userTotal + partnerTotal;
    const halfTotal = totalExpenses / 2;
    
    return {
      userTotal,
      partnerTotal,
      userOwes: userTotal < halfTotal ? (halfTotal - userTotal) : 0,
      partnerOwes: partnerTotal < halfTotal ? (halfTotal - partnerTotal) : 0,
      totalExpenses
    };
  };
  
  const balance = calculateBalance();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento dashboard...</div>;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Dashboard Spese Coppia</h2>
          <div className="flex gap-2 items-center">
            {userProfile && (
              <div className="flex items-center gap-2">
                <img 
                  src={userProfile.avatar_url || '/avatar-placeholder.png'} 
                  alt={userProfile.name} 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm text-gray-600">{userProfile.name}</span>
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
        
        {/* Se l'utente non ha ancora una coppia, mostra messaggio appropriato */}
        {!coupleData && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Non sei ancora in una coppia. Seleziona un partner o accetta un invito.</p>
            <Link href="/select-partner">
              <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                Seleziona partner
              </button>
            </Link>
            
            {pendingInvitations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Inviti in sospeso</h3>
                <ul className="flex flex-col gap-2">
                  {pendingInvitations.map(invitation => (
                    <li key={invitation.id} className="flex justify-between items-center bg-gray-100 rounded-lg p-3">
                      <div>
                        <span>Invito da </span>
                        <strong>{invitation.sender?.name || 'un utente'}</strong>
                      </div>
                      <Link href={`/accept-invitation?code=${invitation.code}`}>
                        <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition">
                          Accetta
                        </button>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Se l'utente ha una coppia, mostra il saldo e le spese */}
        {coupleData && partnerProfile && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Profilo utente */}
              <Link href={`/profile/${userProfile.id}`}>
                <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-lg p-4 shadow-inner cursor-pointer hover:bg-gray-100 transition">
                  <img 
                    src={userProfile.avatar_url || '/avatar-placeholder.png'} 
                    alt={userProfile.name} 
                    className="w-16 h-16 rounded-full object-cover border" 
                  />
                  <span className="font-semibold text-lg">{userProfile.name}</span>
                  <span className="text-2xl font-bold text-blue-500">€ {balance.userTotal.toFixed(2)}</span>
                  {balance.userOwes > 0 && (
                    <span className="text-sm text-red-500">Devi €{balance.userOwes.toFixed(2)} a {partnerProfile.name}</span>
                  )}
                </div>
              </Link>
              
              {/* Profilo partner */}
              <Link href={`/profile/${partnerProfile.id}`}>
                <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-lg p-4 shadow-inner cursor-pointer hover:bg-gray-100 transition">
                  <img 
                    src={partnerProfile.avatar_url || '/avatar-placeholder.png'} 
                    alt={partnerProfile.name} 
                    className="w-16 h-16 rounded-full object-cover border" 
                  />
                  <span className="font-semibold text-lg">{partnerProfile.name}</span>
                  <span className="text-2xl font-bold text-blue-500">€ {balance.partnerTotal.toFixed(2)}</span>
                  {balance.partnerOwes > 0 && (
                    <span className="text-sm text-red-500">Ti deve €{balance.partnerOwes.toFixed(2)}</span>
                  )}
                </div>
              </Link>
            </div>
            
            <div className="text-center bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Spese totali della coppia</h3>
              <span className="text-3xl font-bold text-green-500">€ {balance.totalExpenses.toFixed(2)}</span>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Ultime spese</h3>
                <Link href="/expenses/new">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm">
                    Aggiungi spesa
                  </button>
                </Link>
              </div>
              
              {expenses.length > 0 ? (
                <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                  {expenses.map(expense => (
                    <li key={expense.id} className="flex justify-between items-center bg-gray-100 rounded-lg px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-medium">{expense.description}</span>
                        <span className="text-xs text-gray-500">
                          Pagato da {expense.paid_by === userProfile.id ? userProfile.name : partnerProfile.name}
                        </span>
                      </div>
                      <span className="font-bold">€ {parseFloat(expense.amount).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 py-4">Nessuna spesa registrata</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
