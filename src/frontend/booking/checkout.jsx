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
            setLoading(true);
            try {
                const { data: sessionData } = await supabase.auth.getSession();
                const sessionUser = sessionData?.session?.user;
                if (!sessionUser) { navigate("/home"); return; }
                setUser(sessionUser);
                const { data: campaignData, error: campaignError } = await supabase.from("campaigns").select("*").eq("id", campaignId).single();
                if (campaignError || !campaignData) { alert("Campaign tidak ditemukan."); navigate("/home"); return; }
                setCampaign(campaignData);
            } catch (err) {
                console.error("Gagal memuat data:", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [campaignId, navigate]);

    const handlePayment = async () => {
        if (!user || !campaign || processing) return;
        setProcessing(true);
        try {
            // Memanggil satu-satunya endpoint yang kita definisikan untuk alur ini
            const response = await fetch("/api/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    campaignId: campaign.id,
                    userId: user.id,
                    amount: campaign.harga,
                    paymentMethod: paymentMethod,
                }),
            });

            // Langsung cek respons sebelum mencoba .json()
            if (!response.ok) {
                // Tampilkan teks error dari server jika ada
                const errorText = await response.text();
                throw new Error(`Server merespons dengan error: ${response.status}. Pesan: ${errorText}`);
            }

            const result = await response.json();
            if (!result.token) {
                throw new Error(result.error || "Server tidak mengembalikan token.");
            }

            window.snap.pay(result.token, {
                onSuccess: () => { navigate("/history"); },
                onPending: () => { navigate("/history"); },
                onError: () => { navigate("/history"); },
                onClose: () => { navigate("/history"); }
            });

        } catch (err) {
            alert("❌ Gagal: " + err.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Navbar user={user} />
            <div className="min-h-screen bg-gray-900 text-white p-4 flex justify-center items-center">
                <div className="w-full max-w-lg bg-gray-800/80 border border-gray-700/40 rounded-2xl shadow-2xl p-4 sm:p-8">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4 text-center drop-shadow-lg">Checkout Campaign</h2>
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="bg-gray-700 w-full h-48 mx-auto rounded-xl"></div>
                            <div className="h-6 bg-gray-700 w-3/4 mx-auto rounded-lg"></div>
                            <div className="h-10 bg-gray-700 w-1/2 mx-auto rounded-full"></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="relative group w-full max-w-md">
                                    <img src={campaign.foto_url} alt={campaign.campaign_name} className="w-full max-h-[260px] object-contain rounded-xl border-4 border-white/10 shadow-xl bg-gray-900" />
                                </div>
                            </div>
                            <div className="text-center mb-2">
                                <p className="font-bold text-xl mb-1 text-blue-300">{campaign.campaign_name}</p>
                            </div>
                            <div className="text-center mb-4">
                                <span className="inline-block bg-yellow-700/20 text-yellow-300 border border-yellow-700/30 px-4 py-2 rounded-full text-lg font-bold shadow">Total: Rp {Number(campaign.harga).toLocaleString("id-ID")}</span>
                            </div>
                        </>
                    )}
                    <div className="mb-6 mt-6">
                        <label className="block mb-2 font-semibold text-white">Metode Pembayaran</label>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-blue-500">
                            <option value="qris">Midtrans</option>
                        </select>
                    </div>
                    <button onClick={handlePayment} disabled={processing || loading} className={`w-full py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-300 ${processing || loading ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"}`}>
                        {processing ? ( <span className="flex items-center justify-center gap-2"><span className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></span>Memproses...</span> ) : ( "Konfirmasi & Pesan" )}
                    </button>
                </div>
            </div>
        </>
    );
}

export default Checkout;