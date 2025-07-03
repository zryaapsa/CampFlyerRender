import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../backend/supabase';
import LoginCard from "../components/card"; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DetailCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // 🟢 simpan user lengkap termasuk role
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;
      setUser(authUser);

      if (authUser) {
        const { data: userProfile, error } = await supabase
          .from("users")
          .select("role")
          .eq("user_id", authUser.id)
          .single();

        if (!error && userProfile) {
          setUserData(userProfile); // simpan di userData, bukan user
        }
      }
    };

    const fetchCampaign = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Gagal ambil data campaign:', error.message);
      } else {
        setCampaign(data);
      }

      setLoading(false);
    };

    fetchUser();
    fetchCampaign();
  }, [id]);

  const handleBooking = () => {
    if (!user) {
      toast.warning("Silakan login terlebih dahulu untuk daftar.");
      setShowCard(true);
      return;
    }

    navigate(`/checkout/${id}`);
  };

  const handleEdit = () => {
    navigate(`/editcampaign/${id}`);
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Yakin ingin menghapus campaign ini?");
    if (!confirm) return;

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Gagal menghapus campaign.");
    } else {
      toast.success("Campaign berhasil dihapus.");
      setTimeout(() => {
        navigate('/home'); 
      }, 1500);
    }
  };

 return (
  <div>
    <ToastContainer position="top-right" autoClose={3000} />
    {loading ? (
      <p className="text-white p-6 text-center animate-pulse">Memuat detail campaign...</p>
    ) : !campaign ? (
      <p className="text-white p-6 text-center">Campaign tidak ditemukan</p>
    ) : (
      <div className="p-6 sm:p-20 bg-gray-900 min-h-screen text-white flex justify-center">
        <div className="max-w-3xl w-full bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-10 space-y-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-400 text-center">{campaign.campaign_name}</h1>
          
                  <img
            src={campaign.foto_url}
            alt={campaign.campaign_name}
            className="w-full max-h-[700px] object-contain rounded-lg bg-gray-800 p-2 mx-auto"
          />





          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm sm:text-base">
            <p className='text-xl'><span className="text-gray-400 text-xl">📅 Tanggal:</span> {campaign.tanggal}</p>
            <p className='text-xl'><span className="text-gray-400 text-xl">🕐 Jam:</span> {campaign.jam}</p>
            <p className='text-xl'><span className="text-gray-400 text-xl">💺 Kursi Tersedia:</span> {campaign.kursi}</p>
           
            <p className='text-xl'><span className="text-gray-400 text-xl">💸 Harga:</span> {campaign.harga}</p>
          </div>

          <div className="text-xl sm:text-base leading-relaxed text-gray-300 py-4">
            <p className="text-white font-semibold mb-1 text-xl">📋 Keterangan:</p>
            <p className='text-xl'>{campaign.keterangan}</p>
          </div>

          
          {userData?.role !== 'partner' && (
            <button
              onClick={handleBooking}
              className="w-full text-xl sm:w-auto bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-semibold transition"
            >
              Daftar Sekarang
            </button>
          )}

          {userData?.role === 'partner' && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleEdit}
                className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-lg text-white transition"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition"
              >
                Hapus
              </button>
            </div>
          )}
        </div>
      </div>
    )}

    {!user && showCard && <LoginCard onClose={() => setShowCard(false)} />}
  </div>
);

};

export default DetailCampaign;
