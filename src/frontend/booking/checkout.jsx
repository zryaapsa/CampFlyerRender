import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabase";
import Navbar from "../components/navbar";

function Checkout() {
  const { campaignId } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("qris");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData?.session?.user;
        setUser(sessionUser);

        const { data: campaignData, error: campaignError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", campaignId)
          .single();

        if (campaignError) throw campaignError;
        setCampaign(campaignData);
      } catch (err) {
        console.error("Gagal memuat data:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campaignId]);

  







  const handlePayment = async () => {
    if (!user || !campaign || processing) return;
    setProcessing(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          campaign_id: campaign.id,
          status: "pending",
          metode: paymentMethod,
          amount: campaign.harga,
        })
        .select()
        .single();

      if (orderError) throw orderError;


      navigate(`/payment/${orderData.id}`);
    } catch (err) {
      alert("❌ Gagal: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-white">Memuat data...</p>;
  if (!campaign)
    return <p className="text-center mt-10 text-red-500">Campaign tidak ditemukan.</p>;
















  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center items-center">
        <div className="bg-white text-gray-900 p-6 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Checkout Campaign</h2>

            <img
            src={campaign.foto_url}
            alt={campaign.campaign_name}
            className="w-full h-auto object-contain rounded mb-3"
          />


          <p className="font-semibold text-xl">{campaign.campaign_name}</p>
          <p>{campaign.tanggal} • {campaign.jam}</p>
          <p className="text-sm text-gray-500 mb-2">{campaign.kursi} kursi tersedia</p>
          <p className="text-lg font-bold mb-4">
            Total: Rp {Number(campaign.harga).toLocaleString("id-ID")}
          </p>

          <div className="mb-4">
            <label className="block mb-2 font-semibold">Metode Pembayaran</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="qris">Midtrans</option>
              <option value="cod" disabled>Bayar di Tempat (belum tersedia)</option>
              <option value="manual" disabled>Transfer Manual (belum tersedia)</option>
            </select>
          </div>

          <button
            onClick={handlePayment}
            disabled={processing}
            className={`w-full text-white py-2 rounded ${
              processing ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {processing ? "Memproses..." : "Konfirmasi & Pesan"}
          </button>
        </div>
      </div>
    </>
  );
}

export default Checkout;
