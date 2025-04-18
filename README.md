# Gestione Spese di Coppia

Web app per gestire e dividere le spese di coppia, pronta per deploy su Vercel.

## 🚀 Setup locale

1. Installa le dipendenze:
   ```bash
   npm install
   ```
2. Crea un file `.env.local` con le chiavi Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=la_tua_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=la_tua_anon_key
   ```
3. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

## 🌐 Deploy su Vercel
- Collega la repo a Vercel
- Imposta le variabili ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` nelle impostazioni Vercel
- Deploy automatico

## 📱 Mobile-first & UI moderna
- UI 100% responsive, ottimizzata per mobile
- Componenti arrotondati, avatar grandi, pulsanti touch-friendly
- Modalità chiara/scura (personalizzabile)

## 🗄️ Stack tecnologico
- **Next.js** (React)
- **Tailwind CSS** + shadcn/ui
- **Supabase** (Postgres + Storage)

## ✨ Funzionalità principali
- Profili dinamici con foto e colore personalizzato
- Spese associate a ogni profilo, dashboard riepilogativa
- Upload foto profilo (salvate su Supabase Storage)
- Tutto sincronizzato tra dispositivi/browser

## 🔐 Nessuna autenticazione richiesta
- Tutti possono creare profili e aggiungere spese
- (Opzionale: puoi aggiungere un PIN per ogni profilo)

## 📂 Struttura cartelle
- `/pages` — pagine Next.js (home, dashboard, profilo)
- `/components` — componenti UI riutilizzabili
- `/utils` — funzioni API Supabase
- `/styles/globals.css` — Tailwind CSS

## 🛠️ Personalizza
- Cambia colori, layout, animazioni modificando Tailwind
- Modifica la dashboard o aggiungi grafici come preferisci

---

Progetto demo MVP senza autenticazione né backend: i dati sono salvati in memoria/localStorage.

Per domande o personalizzazioni, apri una issue o chiedi direttamente!
