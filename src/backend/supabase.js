import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ecfbyepywdkfpbczzzsk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZmJ5ZXB5d2RrZnBiY3p6enNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDI2MzEsImV4cCI6MjA2NjY3ODYzMX0.c1k8xgLPpNffR11n5JSf6YQGdLDJ15QuEOIzAmsZ72w'
const BUCKET_NAME = 'campaigns';


export const supabase = createClient(supabaseUrl, supabaseAnonKey)

//User 
export async function registerUser(name, email, password) {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: 'user' } }
  });

  if (signUpError) throw signUpError;

  const user = signUpData.user;


  const { error: insertError } = await supabase.from('users').insert({
    user_id: user.id,
    name,
    email,
    role: 'user'
  });

  if (insertError) throw insertError;

  return user;
}


//Partner 
export async function registerPartner(name, email, password) {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: 'partner' } }
  })
  if (signUpError) throw signUpError
  return signUpData.user
}


export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return data.user
}

//Campaign
export const createCampaign = async (form) => {
  try {
    let foto_url = null;

    if (form.foto) {
      const fileName = `${Date.now()}_${form.foto.name}`;
      
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`images/${fileName}`, form.foto);

      if (uploadError) throw uploadError;

      
      const { publicUrl } = supabase
        .storage
        .from(BUCKET_NAME)
        .getPublicUrl(`images/${fileName}`).data;

      foto_url = publicUrl;
    }

    const { error: insertError } = await supabase
      .from(BUCKET_NAME)
      .insert([{
        campaign_name: form.campaign_name,
        keterangan: form.keterangan,
        jam: form.jam,
        tanggal: form.tanggal,
        kursi: form.kursi,
        harga: form.harga,
        foto_url: foto_url,         
        owner_id: form.owner_id,
      }]);

    if (insertError) throw insertError;

  } catch (error) {
    console.error("Gagal create campaign:", error);
    throw error;
  }
};

