import React, { useState } from 'react';
import { createCampaign, supabase } from '../backend/supabase';

const CampaignForm = () => {
  const [form, setForm] = useState({
    campaign_name: '',
    keterangan: '',
    jam: '',
    tanggal: '',
    kursi: '',
    harga: '',
    foto_id: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, foto: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log("USER ID:", user.id);
      if (error || !user) throw error || new Error("User tidak ditemukan");

      const formWithOwner = {
        ...form,
        owner_id: user.id,
      };
      console.log("FORM YANG DIKIRIM:", formWithOwner);

      await createCampaign(formWithOwner);

      alert('Campaign berhasil ditambahkan!');
      setForm({
        campaign_name: '',
        keterangan: '',
        jam: '',
        tanggal: '',
        kursi: '',
        harga: '',
        foto_id: null,
      });
    } catch (err) {
      console.error('DETAIL ERROR:', err);
      alert(`Terjadi kesalahan saat menambahkan campaign: ${err.message}`);
    }
  };

  return (
   <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
  <form
    onSubmit={handleSubmit}
    className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 p-8"
  >
    
   <div className="aspect-video bg-gray-700 border border-gray-600 rounded-xl flex items-center justify-center overflow-hidden">
  {form.foto ? (
    <img
      src={URL.createObjectURL(form.foto)}
      alt="Preview"
      className="w-full h-full object-contain"
    />
  ) : (
    <span className="text-gray-400 font-medium">Preview Foto</span>
  )}
</div>


    
    <div className="flex flex-col gap-5 text-white">
      <div>
        <label className="block text-sm text-gray-300 mb-1">Nama Campaign</label>
        <input
          type="text"
          name="campaign_name"
          value={form.campaign_name}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Contoh: Musik Akhir Pekan"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Keterangan</label>
        <textarea
          name="keterangan"
          value={form.keterangan}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Deskripsi singkat campaign..."
        />
      </div>


      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block text-sm text-gray-300 mb-1">Jam</label>
          <input
            type="time"
            name="jam"
            value={form.jam}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-1/2">
          <label className="block text-sm text-gray-300 mb-1">Tanggal</label>
          <input
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Jumlah Kursi</label>
        <input
          type="number"
          name="kursi"
          value={form.kursi}
          onChange={handleChange}
          
          className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Harga Tiket</label>
        <input
          type="number"
          name="harga"
          value={form.harga}
          onChange={handleChange}
          
          className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">Upload Foto</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-500 file:text-white hover:file:bg-blue-700 bg-gray-700 text-white rounded-md"
        />
      </div>

      <button
        type="submit"
        className="bg-gray-600 hover:bg-blue-700 transition-all duration-200 text-white font-semibold py-2 px-4 rounded-md mt-2 shadow-sm"
      >
        Tambah Campaign
      </button>
    </div>
  </form>
</div>


  );
};

export default CampaignForm;
