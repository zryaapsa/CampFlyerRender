// src/backend/supabase.js

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const BUCKET_NAME = "campaigns";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

//User
export async function registerUser(name, email, password) {
  // Hanya perlu signUp, trigger di database akan mengurus sisanya.
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        role: "user", // Pastikan 'role' dikirim dalam options agar trigger bisa membacanya
      },
    },
  });

  if (signUpError) throw signUpError;


  return signUpData.user;
}

//Partner
export async function registerPartner(name, email, password) {

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        role: "req-partner", // Mengirim role untuk approval admin
      },
    },
  });
  if (signUpError) throw signUpError;
  return signUpData.user;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
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

      // --- PERBAIKAN: Kode pengambilan publicUrl yang lebih aman ---
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`images/${fileName}`);

      foto_url = urlData.publicUrl;
    }

    // --- PERBAIKAN: Nama tabel seharusnya 'campaigns', bukan BUCKET_NAME jika berbeda ---
    const { error: insertError } = await supabase.from("campaigns").insert([
      {
        campaign_name: form.campaign_name,
        keterangan: form.keterangan,
        jam: form.jam,
        tanggal: form.tanggal,
        kursi: form.kursi,
        harga: form.harga,
        foto_url: foto_url,
        owner_id: form.owner_id,
        // Jangan lupa tambahkan category_id jika form sudah diupdate
        // category_id: form.category_id
      },
    ]);

    if (insertError) throw insertError;
  } catch (error) {
    console.error("Gagal create campaign:", error);
    throw error;
  }
};
