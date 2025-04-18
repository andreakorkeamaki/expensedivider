import { useState } from 'react';
import { createProfile } from '../../utils/supabaseApi';
import AvatarUpload from '../../components/AvatarUpload';

export default function NewProfile() {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#60a5fa');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const profile = await createProfile({ name, avatar_url: avatarUrl, color });
      window.location.href = `/profile/${profile.id}`;
    } catch (err) {
      setError('Errore nella creazione del profilo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center">Crea un nuovo profilo</h2>
        <AvatarUpload profileId={name || 'temp'} onUpload={setAvatarUrl} />
        {avatarUrl && (
          <img src={avatarUrl} alt="avatar" className="w-20 h-20 mx-auto rounded-full object-cover border" />
        )}
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border rounded px-4 py-2 w-full focus:outline-none focus:ring focus:border-blue-400"
          required
        />
        <div className="flex items-center gap-2">
          <label className="text-sm">Colore profilo:</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-primary text-white font-bold text-lg shadow hover:bg-primary/90 transition"
          disabled={loading}
        >
          {loading ? 'Creazione...' : 'Crea profilo'}
        </button>
        {error && <div className="text-center text-red-500">{error}</div>}
      </form>
    </main>
  );
}
