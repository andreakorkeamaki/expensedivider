import { useRef, useState } from 'react';
import { uploadAvatar, getAvatarUrl } from '../utils/supabaseApi';

export default function AvatarUpload({ profileId, onUpload }) {
  const fileInput = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const filename = `${profileId}_${Date.now()}`;
      await uploadAvatar(file, filename);
      const url = getAvatarUrl(filename);
      onUpload(url);
    } catch (err) {
      setError('Errore upload foto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        className="px-3 py-1 bg-primary text-white rounded shadow hover:bg-primary/80"
        onClick={() => fileInput.current.click()}
        disabled={loading}
        type="button"
      >
        {loading ? 'Caricamento...' : 'Carica foto profilo'}
      </button>
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
}
