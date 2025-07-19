import { useEffect, useState, useRef } from "react";
import { supabase } from "../backend/supabase";
import { useNavigate, Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from "../backend/auth";
import { User as UserIcon, LogOut as LogOutIcon } from 'lucide-react';

function HomePartner() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({ total_campaigns: 0, total_pendaftar: 0, total_pendapatan: 0 });
  const [successfulOrders, setSuccessfulOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        navigate('/home');
        return;
    }
    const fetchPartnerData = async () => {
      setLoading(true);
      try {
        const [campaignsRes, statsRes, ordersRes] = await Promise.all([
          supabase.from("campaigns").select("*, categories(name)").eq("owner_id", user.id).order("created_at", { ascending: false }),
          supabase.rpc('get_partner_stats'),
          supabase.rpc('get_partner_successful_orders')
        ]);

        if (campaignsRes.error) throw campaignsRes.error;
        setCampaigns(campaignsRes.data || []);
        if (statsRes.error) throw statsRes.error;
        if (statsRes.data && statsRes.data.length > 0) setStats(statsRes.data[0]);
        if (ordersRes.error) throw ordersRes.error;
        setSuccessfulOrders(ordersRes.data || []);
      } catch (err) {
        console.error("Gagal mengambil data partner:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPartnerData();

    const handleClickOutside = (event) => {
        if (profileRef.current && !profileRef.current.contains(event.target)) {
            setProfileDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user, navigate]);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?");
    if (confirmLogout) {
      const { error } = await supabase.auth.signOut();
      if (error) {
          alert(error.message);
      } else {
          setUser(null);
          navigate('/home');
      }
    }
  };

  const chartData = campaigns.map(c => ({
      name: c.campaign_name.substring(0, 15) + (c.campaign_name.length > 15 ? '...' : ''),
      Kursi_Tersedia: c.kursi || 0,
  }));

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-white">CampFlyer Partner</h1>
        <div className="flex items-center gap-6">
          <Link to="/campaignform" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg transition text-sm">
            + Tambah Campaign
          </Link>
          <div className="relative" ref={profileRef}>
            <button onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-700/50 transition">
              <UserIcon className="w-6 h-6 text-gray-300" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-sm text-gray-400">Login sebagai</p>
                    <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300">
                    <LogOutIcon className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="text-center text-gray-400 py-10">Memuat data dashboard...</div>
      ) : (
        <div className="space-y-8">
          {/* Kartu Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50"><h3 className="text-gray-400 text-sm font-medium">Total Campaign</h3><p className="text-3xl font-bold mt-2">{stats.total_campaigns}</p></div>
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50"><h3 className="text-gray-400 text-sm font-medium">Total Pendaftar (Lunas)</h3><p className="text-3xl font-bold mt-2">{stats.total_pendaftar}</p></div>
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50"><h3 className="text-gray-400 text-sm font-medium">Total Pendapatan</h3><p className="text-3xl font-bold mt-2">Rp {Number(stats.total_pendapatan).toLocaleString('id-ID')}</p></div>
          </div>

          {/* Grafik dan Daftar Campaign */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50">
                <h3 className="text-xl font-semibold mb-4">Ketersediaan Kursi per Campaign</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} /><XAxis dataKey="name" stroke="#A0AEC0" fontSize={12} tick={{ fill: '#A0AEC0' }} /><YAxis stroke="#A0AEC0" fontSize={12} tick={{ fill: '#A0AEC0' }} /><Tooltip contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #4A5568', borderRadius: '0.5rem' }} labelStyle={{ color: '#E2E8F0' }} /><Bar dataKey="Kursi_Tersedia" fill="#4299E1" radius={[4, 4, 0, 0]} /></BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50">
              <h3 className="text-xl font-semibold mb-4">Campaign Terbaru</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {campaigns.length > 0 ? campaigns.slice(0, 5).map(item => (
                  <Link to={`/campaign/${item.id}`} key={item.id} className="block p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors duration-200">
                    <div className="flex justify-between items-center"><div><p className="font-semibold text-white line-clamp-1">{item.campaign_name}</p><p className="text-xs text-gray-400 mt-1">{item.categories?.name || 'Tanpa Kategori'}</p></div><span className="text-xs font-semibold text-blue-400">&rarr;</span></div>
                  </Link>
                )) : (<p className="text-gray-500 text-sm mt-6 text-center">Anda belum membuat campaign.</p>)}
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mt-6 border border-gray-700/50">
            <h3 className="text-xl font-semibold mb-4">Detail Pendaftar Lunas</h3>
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-gray-300 uppercase bg-gray-700/50 sticky top-0">
                    <tr className="border-b border-gray-700">
                        <th scope="col" className="px-6 py-3">Campaign</th>
                        <th scope="col" className="px-6 py-3">Pembeli</th>
                        <th scope="col" className="px-6 py-3">Waktu Lunas</th>
                        <th scope="col" className="px-6 py-3">Nomor Tiket</th>
                    </tr>
                </thead>
                <tbody>
                  {successfulOrders.length > 0 ? successfulOrders.map(order => (
                    <tr key={order.order_id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{order.campaign_name}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{order.buyer_name}</div>
                        <div className="text-xs text-gray-500">{order.buyer_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {new Date(order.settlement_time).toLocaleString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 font-mono text-blue-400 text-xs">{order.order_id}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="text-center py-8 text-gray-500">Belum ada pendaftar yang lunas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePartner;