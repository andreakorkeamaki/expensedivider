import supabase from './supabaseClient'

// --- AUTH API --- //
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function isLoggedIn() {
  const user = await getUser();
  return !!user;
}

// --- PROFILE API --- //
export async function getProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('id');
  if (error) throw error;
  return data;
}

export async function createProfile({ name, avatar_url, color }) {
  const { data, error } = await supabase.from('profiles').insert([{ name, avatar_url, color }]).select().single();
  if (error) throw error;
  return data;
}

export async function updateProfile(id, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteProfile(id) {
  // Prima eliminiamo tutte le spese associate al profilo
  const { error: expensesError } = await supabase.from('expenses').delete().eq('paid_by', id);
  if (expensesError) throw expensesError;
  
  // Poi eliminiamo il profilo
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw error;
  
  return { success: true };
}

export async function uploadAvatar(file, filename) {
  const { data, error } = await supabase.storage.from('avatars').upload(filename, file, { upsert: true });
  if (error) throw error;
  return data;
}

export function getAvatarUrl(filename) {
  return supabase.storage.from('avatars').getPublicUrl(filename).data.publicUrl;
}

// --- EXPENSES API --- //
export async function getExpenses() {
  const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createExpense(expense) {
  const { data, error } = await supabase.from('expenses').insert([expense]).select().single();
  if (error) throw error;
  return data;
}

export async function updateExpense(id, updates) {
  const { data, error } = await supabase.from('expenses').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}
