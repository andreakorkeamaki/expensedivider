import { supabase } from './supabaseClient';

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
