import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../backend/supabase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../backend/auth';

const EditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    campaign_name: '',
    keterangan: '',
    jam: '',
    tanggal: '',
    kursi: '',
    harga: '',
    foto_url: '',
    category_id: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Jangan jalankan fetch jika user belum ada
    if (!user) return;

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Ambil data kategori dan data campaign secara bersamaan
        const [catRes, campaignRes] = await Promise.all([
          supabase.from('categories').select('*').order('name', { ascending: true }),
          supabase.from('campaigns').select('*').eq('id', id).single()
        ]);

        if (catRes.error) throw catRes.error;
        setCategories(catRes.data || []);
        
        if (campaignRes.error) throw campaignRes.error;
        const campaignData = campaignRes.data;

        // Validasi kepemilikan
        if (campaignData.owner_id !== user.id) {
            toast.error("Akses ditolak. Anda bukan pemilik campaign ini.");
            navigate('/homepartner');
            return;
        }

        setForm(campaignData);
      } catch (error) {
        toast.error("Gagal mengambil data campaign: " + error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Kita tidak mengupdate foto_url, jadi kita kecualikan dari data yang dikirim
    const { foto_url, ...updateData } = form;

    const { error } = await supabase.from('campaigns').update(updateData).eq('id', id);

    if (error) {
      toast.error("Gagal memperbarui campaign: " + error.message);
    } else {
      toast.success("Campaign berhasil diperbarui!");
      setTimeout(() => navigate(`/campaign/${id}`), 1500);
    }
    setProcessing(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex justify-center items-center text-white">Memuat data editor...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <ToastContainer position="top-center" theme="dark" />
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8 space-y-6 border border-gray-700/50">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4 text-center">Edit Campaign</h2>
        
        {/* Tampilkan preview gambar yang sudah ada */}
        {form.foto_url && (
            <div className="aspect-video bg-gray-700 rounded-xl overflow-hidden border border-gray-600">
                <img src={form.foto_url} alt="Campaign Flyer" className="w-full h-full object-contain" />
            </div>
        )}

        <div>
            <label className="block text-sm text-gray-300 mb-1">Nama Campaign</label>
            <input type="text" name="campaign_name" value={form.campaign_name || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-md bg-gray-700 text-white" required />
        </div>

        <div>
            <label className="block text-sm text-gray-300 mb-1">Kategori</label>
            <select name="category_id" value={form.category_id || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-md bg-gray-700 text-white" required>
                <option value="" disabled>Pilih Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-300 mb-1">Tanggal</label><input type="date" name="tanggal" value={form.tanggal || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"/></div>
          <div><label className="block text-sm text-gray-300 mb-1">Jam</label><input type="time" name="jam" value={form.jam || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"/></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm text-gray-300 mb-1">Jumlah Kursi</label><input type="number" name="kursi" value={form.kursi || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"/></div>
          <div><label className="block text-sm text-gray-300 mb-1">Harga (Rp)</label><input type="number" name="harga" value={form.harga || ''} onChange={handleChange} className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"/></div>
        </div>

        <div>
            <label className="block text-sm text-gray-300 mb-1">Deskripsi</label>
            <textarea name="keterangan" value={form.keterangan || ''} onChange={handleChange} rows="4" className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"/>
        </div>
        
        <button type="submit" disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-2 shadow-lg transition disabled:bg-gray-500">
          {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
};

export default EditCampaign;