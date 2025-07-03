import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../backend/supabase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    campaign_name: '',
    tanggal: '',
    jam: '',
    kursi: '',
    keterangan: '',
    harga: '',
    foto_url: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaign = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast.error("Gagal mengambil data campaign");
        console.error(error);
        return;
      }

      setForm(data);
      setLoading(false);
    };

    fetchCampaign();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from('campaigns')
      .update(form)
      .eq('id', id);

    if (error) {
      toast.error("Gagal memperbarui campaign");
      console.error(error);
    } else {
      toast.success("Campaign berhasil diperbarui");
      setTimeout(() => navigate(`/detailcampaign/${id}`), 1500);
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Memuat data...</div>;
  }

  return (
 <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center px-4 sm:px-6 lg:px-8 py-10">
    <ToastContainer />
    <div className="w-full max-w-screen-sm bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg">
      <h1 className="text-2xl sm:text-3xl font-bold text-blue-400 mb-6 text-center">
        Edit Campaign
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Nama Campaign</label>
          <input
            type="text"
            name="campaign_name"
            value={form.campaign_name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Tanggal</label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Jam</label>
            <input
              type="time"
              name="jam"
              value={form.jam}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Jumlah Kursi</label>
            <input
              type="number"
              name="kursi"
              value={form.kursi}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Harga</label>
            <input
              type="number"
              name="harga"
              value={form.harga}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Foto URL</label>
          <input
            type="text"
            name="foto_url"
            value={form.foto_url}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Deskripsi</label>
          <textarea
            name="keterangan"
            rows="4"
            value={form.keterangan}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  </div>
);
};

export default EditCampaign;
