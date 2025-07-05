import { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import { supabase } from "../backend/supabase";
import LoginCard from "./components/card";
import { Link } from 'react-router-dom';

function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showCard, setShowCard] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase.from("campaigns").select("*");
      if (error) throw error;
      setCampaigns(data);
    } catch (err) {
      console.error("Gagal mengambil campaign:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();
    fetchCampaigns();

    // 🔄 Refresh data saat user kembali ke tab ini
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("🔁 Halaman aktif kembali, refresh kursi...");
        fetchCampaigns();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <>
      <Navbar user={user} onLoginClick={() => setShowCard(true)} />
      <div className="p-4 sm:p-6 bg-gray-900 min-h-screen">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-white text-center">
          {user ? `Halo, ${user.email}` : "Daftar Campaign Tersedia"}
        </h2>

        {loading && (
          <div className="flex justify-center py-8">
            <p className="text-gray-400 animate-pulse">Memuat campaign...</p>
          </div>
        )}

        {!loading && campaigns.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-700">Belum ada campaign yang tersedia.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 py-10">
          {campaigns.map((item) => {
            const previewURL = item.foto_url || "https://via.placeholder.com/400x200?text=No+Image";
            return (
              <div key={item.id} className="flex justify-center">
                <div className="bg-white rounded-xl shadow-lg p-3 w-[400px] md:w-[440px] lg:w-[500px]">
                  <Link to={`/campaign/${item.id}`}>
                    <img
                      src={previewURL}
                      alt={item.campaign_name}
                      className="w-full h-auto rounded-md object-cover"
                    />
                    <div className="pt-2 text-xl">
                      <p className="font-semibold text-blue-700 leading-snug">
                        {item.campaign_name}
                      </p>
                      <p className="text-gray-600 md:text-sm">
                        {item.tanggal} • {item.jam}
                      </p>
                      <p className="text-gray-500 md:text-sm">
                        {item.kursi} kursi tersedia
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!user && showCard && <LoginCard onClose={() => setShowCard(false)} />}
    </>
  );
}

export default Home;
