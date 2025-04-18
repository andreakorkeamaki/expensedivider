import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { createProfile, uploadAvatar, getAvatarUrl } from '../utils/supabaseApi';

export default function CreateProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect to dashboard if user already has a profile
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name) {
      setError('Inserisci il tuo nome');
      return;
    }

    if (!avatar) {
      setError('Carica una foto profilo');
      return;
    }

    if (!user || !user.id) {
      console.error('User ID mancante durante la creazione del profilo');
      setError('Errore: sessione utente non valida. Prova a effettuare nuovamente il login.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Inizio creazione profilo per user:', user.id);
      
      // Upload the avatar
      const filename = `${user.id}_${Date.now()}`;
      console.log('Caricamento avatar con filename:', filename);
      
      try {
        await uploadAvatar(avatar, filename);
        const avatarUrl = getAvatarUrl(filename);
        console.log('Avatar caricato con successo, URL:', avatarUrl.substring(0, 50) + '...');
        
        // Create the profile linking it to the authenticated user
        try {
          console.log('Tentativo di creazione profilo con user_id:', user.id);
          const profile = await createProfile({ 
            name, 
            avatar_url: avatarUrl,
            user_id: user.id,  // Associate with authenticated user
            color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
          });
          
          console.log('Profilo creato con successo:', profile);
          
          // Redirect to the partner selection page
          router.push('/select-partner');
        } catch (profileError) {
          console.error('Errore specifico nella creazione del profilo:', profileError);
          setError(`Errore nella creazione del profilo: ${profileError.message || 'Errore sconosciuto'}`);
        }
      } catch (avatarError) {
        console.error('Errore nel caricamento dell\'avatar:', avatarError);
        setError(`Errore nel caricamento dell'immagine: ${avatarError.message || 'Errore sconosciuto'}`);
      }
    } catch (err) {
      console.error('Errore generale durante la creazione del profilo:', err);
      setError(`Errore: ${err.message || 'Errore durante la creazione del profilo'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center">Crea il tuo profilo</h2>
        <p className="text-center text-gray-600">
          Completa il tuo profilo per iniziare a utilizzare l'app
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col items-center mb-4">
            <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden mb-2">
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Avatar preview" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            
            <label htmlFor="avatar" className="bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition">
              Carica foto
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow hover:bg-blue-600 transition mt-4"
          >
            {loading ? 'Creazione in corso...' : 'Crea profilo'}
          </button>
          
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </form>
      </div>
    </main>
  );
}
