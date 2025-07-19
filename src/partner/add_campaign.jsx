import React, { useState, useEffect } from 'react';
import { createCampaign, supabase } from '../backend/supabase';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddCampaign = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    campaign_name: '', keterangan: '', jam: '', tanggal: '', kursi: '', harga: '', foto: null, category_id: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
        if (!error) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm((prev) => ({ ...prev, foto: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan, silakan login ulang.");
      if (!form.foto) throw new Error("Foto campaign wajib diunggah.");

      await createCampaign({ ...form, owner_id: user.id });

      toast.success('Campaign berhasil ditambahkan!');
      setTimeout(() => {
        navigate('/homepartner');
      }, 1500);
    } catch (err) {
      toast.error(`Terjadi kesalahan: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
   <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
    <ToastContainer position="top-center" theme="dark" />
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 border border-gray-700/50">
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-full aspect-video bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center overflow-hidden">
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-gray-400">
              <p className="font-semibold">Upload Flyer Anda</p>
              <p className="text-xs mt-1">Rekomendasi rasio 16:9</p>
            </div>
          )}
        </div>
        <label htmlFor="file-upload" className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition">
          Pilih Gambar
        </label>
        <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
    
      <div className="flex flex-col gap-4 text-white">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2">Detail Campaign</h2>
        <div><label className="block text-sm text-gray-300 mb-1">Nama Campaign</label><input type="text" name="campaign_name" value={form.campaign_name} onChange={handleChange} className="w-full px-4 py-2 rounded-md bg-gray-700" required /></div>
        <div><label className="block text-sm text-gray-300 mb-1">Kategori</label><select name="category_id" value={form.category_id} onChange={handleChange} className="w-full px-4 py-2 rounded-md bg-gray-700" required><option value="" disabled>Pilih Kategori</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm">Tanggal</label><input type="date" name="tanggal" value={form.tanggal} onChange={handleChange} className="w-full px-4 py-2 rounded-md bg-gray-700"/></div>
          <div><label className="block text-sm">Jam</label><input type="time" name="jam" value={form.jam} onChange={handleChange} className="w-full px-4 py-2 rounded-md bg-gray-700"/></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm">Jumlah Kursi</label><input type="number" name="kursi" value={form.kursi} onChange={handleChange} className="w-full px-4 py-2 rounded-md bg-gray-700"/></div>
          <div><label className="block text-sm">Harga (Rp)</label><input type="number" name="harga" value={form.harga} onChange={handleChange} className="w-full px-4 py-2 rounded-md bg-gray-700"/></div>
        </div>
        <div><label className="block text-sm">Deskripsi</label><textarea name="keterangan" value={form.keterangan} onChange={handleChange} rows="4" className="w-full px-4 py-2 rounded-md bg-gray-700"/></div>
        <button type="submit" disabled={processing} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg mt-2 shadow-lg transition disabled:bg-gray-500">
          {processing ? 'Menyimpan...' : 'Buat Campaign'}
        </button>
      </div>
    </form>
   </div>
  );
};
export default AddCampaign;