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
export async function getProfiles(withoutCouple = false) {
  let query = supabase.from('profiles').select('*').order('id');
  
  // Se withoutCouple è true, restituisci solo profili senza couple_id
  if (withoutCouple) {
    query = query.is('couple_id', null);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 è "No rows returned" - non è un errore in questo caso
  return data || null;
}

export async function hasUserProfile(userId) {
  const profile = await getUserProfile(userId);
  return !!profile;
}

export async function createProfile({ name, avatar_url, color, user_id }) {
  // Verifica se l'utente ha già un profilo
  const existingProfile = await getUserProfile(user_id);
  if (existingProfile) {
    throw new Error('Un profilo per questo utente esiste già');
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ name, avatar_url, color, user_id }])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateProfile(id, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteProfile(id) {
  // Elimina tutte le spese associate al profilo
  const { error: expensesError } = await supabase
    .from('expenses')
    .delete()
    .eq('paid_by', id);
    
  if (expensesError) throw expensesError;
  
  // Rimuovi il profilo da eventuali coppie
  const profileData = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', id)
    .single();
    
  if (profileData.data?.couple_id) {
    // Dissocia anche il partner dalla coppia
    await supabase
      .from('profiles')
      .update({ couple_id: null })
      .eq('couple_id', profileData.data.couple_id);
      
    // Elimina la coppia
    await supabase
      .from('couples')
      .delete()
      .eq('id', profileData.data.couple_id);
  }
  
  // Poi elimina il profilo
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  
  return { success: true };
}

export async function uploadAvatar(file, filename) {
  const { data, error } = await supabase
    .storage
    .from('avatars')
    .upload(filename, file, { upsert: true });
    
  if (error) throw error;
  return data;
}

export function getAvatarUrl(filename) {
  return supabase.storage.from('avatars').getPublicUrl(filename).data.publicUrl;
}

// --- COUPLE API --- //
export async function createCouple(profile1Id, profile2Id) {
  // Prima creiamo la coppia
  const { data: couple, error: coupleError } = await supabase
    .from('couples')
    .insert([{ created_at: new Date() }])
    .select()
    .single();
    
  if (coupleError) throw coupleError;
  
  // Poi aggiorniamo entrambi i profili con l'ID della coppia
  const { error: profile1Error } = await supabase
    .from('profiles')
    .update({ couple_id: couple.id })
    .eq('id', profile1Id);
    
  if (profile1Error) throw profile1Error;
  
  const { error: profile2Error } = await supabase
    .from('profiles')
    .update({ couple_id: couple.id })
    .eq('id', profile2Id);
    
  if (profile2Error) throw profile2Error;
  
  return couple;
}

export async function getCouple(coupleId) {
  const { data, error } = await supabase
    .from('couples')
    .select('*, profiles(*)')
    .eq('id', coupleId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function getCoupleByProfileId(profileId) {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', profileId)
    .single();
    
  if (profileError) throw profileError;
  
  if (!profile.couple_id) return null;
  
  return getCouple(profile.couple_id);
}

// --- INVITATION API --- //
export async function createCoupleInvitation(senderId, recipientId, recipientEmail = null) {
  const invitationCode = generateInvitationCode();
  
  const { data, error } = await supabase
    .from('invitations')
    .insert([{ 
      sender_id: senderId,
      recipient_id: recipientId,
      recipient_email: recipientEmail,
      code: invitationCode,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 giorni
    }])
    .select()
    .single();
    
  if (error) throw error;
  
  // Qui potrebbe essere implementato l'invio di email con il link di invito
  // contenente il codice di invito: /accept-invitation?code=XYZ
  
  return data;
}

export async function getInvitationByCode(code) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, sender:profiles!sender_id(*), recipient:profiles!recipient_id(*)')
    .eq('code', code)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function acceptInvitation(invitationId, recipientId) {
  const { data: invitation, error: invitationError } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', invitationId)
    .single();
    
  if (invitationError) throw invitationError;
  
  // Crea una coppia tra sender e recipient
  const couple = await createCouple(invitation.sender_id, recipientId);
  
  // Segna l'invito come accettato
  const { error: updateError } = await supabase
    .from('invitations')
    .update({ 
      accepted: true,
      accepted_at: new Date(),
      recipient_id: recipientId // Aggiorna il recipient_id se l'invito era via email
    })
    .eq('id', invitationId);
    
  if (updateError) throw updateError;
  
  return couple;
}

export async function getPendingInvitationsForUser(profileId) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, sender:profiles!sender_id(*)')
    .eq('recipient_id', profileId)
    .eq('accepted', false)
    .lt('expires_at', new Date());
    
  if (error) throw error;
  return data || [];
}

// --- EXPENSES API --- //
export async function getExpenses(coupleId = null) {
  let query = supabase.from('expenses').select('*').order('date', { ascending: false });
  
  if (coupleId) {
    query = query.eq('couple_id', coupleId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createExpense(expense) {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expense])
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateExpense(id, updates) {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function deleteExpense(id) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
}

// --- HELPER FUNCTIONS --- //
function generateInvitationCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
