import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { getInvitationByCode, acceptInvitation, getUserProfile, hasUserProfile } from '../utils/supabaseApi';
import Link from 'next/link';

export default function AcceptInvitation() {
  const router = useRouter();
  const { code } = router.query;
  const { user } = useAuth();
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadInvitation() {
      if (!code) return;
      
      try {
        const invitationData = await getInvitationByCode(code);
        
        if (!invitationData) {
          setError('Invito non valido o scaduto');
          setLoading(false);
          return;
        }
        
        if (invitationData.accepted) {
          setError('Questo invito è già stato accettato');
          setLoading(false);
          return;
        }
        
        setInvitation(invitationData);
      } catch (err) {
        console.error('Errore nel caricamento dell\'invito:', err);
        setError('Errore nel caricamento dell\'invito');
      } finally {
        setLoading(false);
      }
    }
    
    loadInvitation();
  }, [code]);

  // Se l'utente non è loggato, mostra opzioni di accesso o registrazione
  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-center">Accetta l'invito</h2>
          
          <p className="text-center text-gray-600 mb-4">
            Devi accedere o registrarti per accettare questo invito
          </p>
          
          <div className="flex flex-col gap-4">
            <Link href={`/login?redirect=/accept-invitation?code=${code}`}>
              <button className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-600 transition">
                Accedi
              </button>
            </Link>
            
            <Link href={`/register?redirect=/accept-invitation?code=${code}`}>
              <button className="w-full border border-blue-500 text-blue-500 font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-50 transition">
                Registrati
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Controlla se l'utente ha già un profilo
  useEffect(() => {
    async function checkUserProfile() {
      if (!user) return;
      
      try {
        const hasProfile = await hasUserProfile(user.id);
        
        if (!hasProfile) {
          router.push('/create-profile');
        }
      } catch (err) {
        console.error('Errore nel controllo del profilo:', err);
      }
    }
    
    checkUserProfile();
  }, [user, router]);

  const handleAcceptInvitation = async () => {
    if (!user || !invitation) return;
    
    setAccepting(true);
    setError('');
    
    try {
      const userProfile = await getUserProfile(user.id);
      
      if (!userProfile) {
        router.push('/create-profile');
        return;
      }
      
      await acceptInvitation(invitation.id, userProfile.id);
      setSuccess('Invito accettato con successo!');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Errore nell\'accettazione dell\'invito:', err);
      setError(`Errore: ${err.message || 'Impossibile accettare l\'invito'}`);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Caricamento...</div>;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center">Accetta l'invito</h2>
        
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
        
        {invitation && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Sei stato invitato da <strong>{invitation.sender?.name || 'un utente'}</strong> a condividere le spese.
            </p>
            
            <button
              onClick={handleAcceptInvitation}
              disabled={accepting}
              className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-600 transition mt-4"
            >
              {accepting ? 'Accettazione in corso...' : 'Accetta invito'}
            </button>
          </div>
        )}
        
        <div className="border-t pt-4 mt-4">
          <Link href="/dashboard">
            <button className="w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md shadow hover:bg-gray-300 transition">
              Torna alla dashboard
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
