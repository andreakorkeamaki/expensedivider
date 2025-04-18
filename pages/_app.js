import '../styles/globals.css';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';

// Pagine accessibili senza autenticazione
const publicPages = ['/login', '/register'];

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // Controlla se la pagina richiede autenticazione
  const isPublicPage = publicPages.includes(router.pathname);
  
  return (
    <>
      <Head>
        <title>Gestione Spese di Coppia</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AuthProvider>
        {isPublicPage ? (
          <Component {...pageProps} />
        ) : (
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
        )}
      </AuthProvider>
    </>
  );
}
