import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Reindirizza alla dashboard
    router.push('/dashboard');
  }, [router]);

  // Mostra un loader durante il reindirizzamento
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8 text-center">Gestione Spese di Coppia</h1>
        <p className="text-gray-500">Reindirizzamento in corso...</p>
      </div>
    </main>
  );
}
