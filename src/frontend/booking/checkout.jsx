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
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: sessionData } = await supabase.auth.getSession();
                const sessionUser = sessionData?.session?.user;
                setUser(sessionUser);

                const { data: campaignData, error: campaignError } = await supabase.from("campaigns").select("*").eq("id", campaignId).single();

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

    // Helper badge
    const badge = (icon, text, color) => (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
            {icon}
            {text}
        </span>
    );

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{ animationDelay: "1s" }}></div>
                </div>
                <span className="ml-4 text-blue-100 text-lg font-medium">Memuat data...</span>
            </div>
        );
    if (!campaign) return <p className="text-center mt-10 text-red-500">Campaign tidak ditemukan.</p>;

    return (
        <>
            <Navbar user={user} />
            <div className="min-h-screen bg-gray-900 text-white p-4 flex justify-center items-center">
                <div className="w-full max-w-lg bg-gray-800/80 border border-gray-700/40 rounded-2xl shadow-2xl p-4 sm:p-8">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4 text-center drop-shadow-lg">Checkout Campaign</h2>

                    {/* Flyer / Gambar */}
                    <div className="flex justify-center mb-4">
                        <div className="relative group w-full max-w-md">
                            <img src={campaign.foto_url} alt={campaign.campaign_name} className="w-full max-h-[260px] object-contain rounded-xl border-4 border-white/10 shadow-xl bg-gray-900 cursor-zoom-in transition-transform duration-300 group-hover:scale-105" onClick={() => setShowImageModal(true)} />
                            <span className="absolute bottom-2 right-2 bg-black/60 text-xs text-white px-2 py-1 rounded shadow group-hover:opacity-100 opacity-80 transition">Klik untuk perbesar</span>
                        </div>
                    </div>
                    {/* Modal Preview Gambar */}
                    {showImageModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShowImageModal(false)}>
                            <img src={campaign.foto_url} alt={campaign.campaign_name} className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl border-4 border-white/20" />
                        </div>
                    )}

                    {/* Judul & Info */}
                    <div className="text-center mb-2">
                        <p className="font-bold text-xl mb-1 text-blue-300">{campaign.campaign_name}</p>
                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                            {badge(
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>,
                                campaign.tanggal,
                                "bg-blue-700/20 text-blue-300 border border-blue-700/30"
                            )}
                            {badge(
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>,
                                campaign.jam,
                                "bg-purple-700/20 text-purple-300 border border-purple-700/30"
                            )}
                            {badge(
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>,
                                `${campaign.kursi} kursi`,
                                "bg-emerald-700/20 text-emerald-300 border border-emerald-700/30"
                            )}
                        </div>
                    </div>

                    {/* Harga */}
                    <div className="text-center mb-4">
                        <span className="inline-block bg-yellow-700/20 text-yellow-300 border border-yellow-700/30 px-4 py-2 rounded-full text-lg font-bold shadow">Total: Rp {Number(campaign.harga).toLocaleString("id-ID")}</span>
                    </div>

                    {/* Metode Pembayaran */}
                    <div className="mb-6">
                        <label className="block mb-2 font-semibold text-white">Metode Pembayaran</label>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full p-3 border border-gray-600 rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-blue-500">
                            <option value="qris">Midtrans</option>
                            <option value="cod" disabled>
                                Bayar di Tempat (belum tersedia)
                            </option>
                            <option value="manual" disabled>
                                Transfer Manual (belum tersedia)
                            </option>
                        </select>
                    </div>

                    <button onClick={handlePayment} disabled={processing} className={`w-full py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-300 ${processing ? "bg-blue-400" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"}`}>
                        {processing ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></span>
                                Memproses...
                            </span>
                        ) : (
                            "Konfirmasi & Pesan"
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}

export default Checkout;
