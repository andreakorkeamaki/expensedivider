import { createClient } from '@supabase/supabase-js'

// Ottieni queste credenziali dalla dashboard di Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Crea un singolo client Supabase per l'intera app
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
