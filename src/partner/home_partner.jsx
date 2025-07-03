import { useEffect, useState } from "react";
import Navbar from "../frontend/components/navbar";
import { supabase } from "../backend/supabase";
import { useNavigate, Link } from "react-router-dom";

function HomePartner() {
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndCampaigns = async () => {
      try {
        
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw error || new Error("User belum login");

        setUser(user);

       
        const { data, error: fetchError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("owner_id", user.id);

        if (fetchError) throw fetchError;

        setCampaigns(data);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndCampaigns();
  }, []);

return (
  <>
    <Navbar />
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Campaign Saya</h1>
        <Link
          to="/campaignform"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition duration-200"
        >
          + Tambah Campaign
        </Link>
      </div>

      {loading && <p className="text-gray-300">Memuat campaign...</p>}

      {!loading && campaigns.length === 0 && (
        <p className="text-gray-400">Kamu belum membuat campaign.</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((item) => {
          let previewURL = item.foto_url || "https://via.placeholder.com/400x200?text=No+Image";

          return (
            <Link to={`/campaign/${item.id}`} key={item.id}>
              <div className="bg-white shadow-md p-4 rounded-xl border border-gray-200 hover:shadow-lg transition duration-200 cursor-pointer">
                <img
                  src={previewURL}
                  alt={item.campaign_name}
                  className="w-full h-auto object-contain rounded-md mb-3"
                />
                <p className="text-xl font-semibold text-blue-700">{item.campaign_name}</p>
                <p className="text-gray-600">{item.tanggal} • {item.jam}</p>
                <p className="text-sm text-gray-500">{item.kursi} kursi tersedia</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </>
);

}

export default HomePartner;
