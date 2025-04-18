import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getProfiles, createCoupleInvitation, getUserProfile } from '../utils/supabaseApi';

export default function SelectPartner() {
  const router = useRouter();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        // Get the user's own profile
        const profile = await getUserProfile(user.id);
        setUserProfile(profile);
        
        // If user is already in a couple, go to dashboard
        if (profile?.couple_id) {
          router.push('/dashboard');
          return;
        }
        
        // Get available profiles (users who aren't in a couple)
        const profilesData = await getProfiles(true); // true = only get profiles without couple_id
        setProfiles(profilesData.filter(p => p.id !== profile?.id)); // Filter out own profile
      } catch (error) {
        console.error('Errore nel caricamento dei profili:', error);
        setError('Impossibile caricare i profili. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [user, router]);

  const handleSelectPartner = async (partnerId) => {
    try {
      setLoading(true);
      await createCoupleInvitation(userProfile.id, partnerId);
      setSuccess('Invito inviato con successo! In attesa di accettazione.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Errore nell\'invio dell\'invito:', err);
      setError(`Errore: ${err.message || 'Impossibile inviare l\'invito'}`);
      setLoading(false);
    }
  };

  const handleInviteByEmail = async (e) => {
    e.preventDefault();
    
    if (!inviteEmail) {
      setError('Inserisci un indirizzo email');
      return;
    }
    
    setSendingInvite(true);
    setError('');
    
    try {
      await createCoupleInvitation(userProfile.id, null, inviteEmail);
      setSuccess('Invito inviato via email! Condividi il link con il tuo partner.');
      setInviteEmail('');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Errore nell\'invio dell\'invito:', err);
      setError(`Errore: ${err.message || 'Impossibile inviare l\'invito'}`);
    } finally {
      setSendingInvite(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center">Scegli il tuo partner</h2>
        <p className="text-center text-gray-600">
          Seleziona un partner esistente o invita qualcuno a unirsi
        </p>
        
        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-md">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mt-4 mb-8">
          <h3 className="text-lg font-semibold mb-4">Partner disponibili</h3>
          
          {profiles.length > 0 ? (
            <ul className="grid grid-cols-1 gap-4">
              {profiles.map(profile => (
                <li key={profile.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <img 
                      src={profile.avatar_url || '/avatar-placeholder.png'} 
                      alt={profile.name} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className="font-medium">{profile.name}</span>
                  </div>
                  <button
                    onClick={() => handleSelectPartner(profile.id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    Seleziona
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">
              Nessun partner disponibile al momento
            </p>
          )}
        </div>
        
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Invita un nuovo partner</h3>
          
          <form onSubmit={handleInviteByEmail} className="flex flex-col gap-4">
            <div>
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email del partner
              </label>
              <input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="partner@example.com"
              />
            </div>
            
            <button
              type="submit"
              disabled={sendingInvite}
              className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-600 transition"
            >
              {sendingInvite ? 'Invio in corso...' : 'Invia invito'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
