import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../backend/supabase";
import Navbar from "../components/navbar"; // Kita tambahkan Navbar untuk konsistensi

function Payment() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [snapToken, setSnapToken] = useState("");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // useEffect ini sekarang hanya bertugas mengambil data & token
        const fetchToken = async () => {
            try {
                const { data, error } = await supabase.from("orders").select("*, campaigns(campaign_name)").eq("id", orderId).single();
                if (error || !data) throw new Error("Order tidak ditemukan.");
                setOrder(data);

                const response = await fetch("/api/create-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: data.id,
                        grossAmount: data.amount
                    }),
                });
                const result = await response.json();
                if (!response.ok || !result.token) throw new Error(result.error || "Gagal mendapatkan token.");
                
                setSnapToken(result.token); // Simpan token di state
            } catch (err) {
                alert("❌ Gagal: " + err.message);
                navigate("/history");
            } finally {
                setLoading(false);
            }
        };
        fetchToken();
    }, [orderId, navigate]);

    // Fungsi ini HANYA dipanggil saat tombol di-klik
    const handlePayNow = () => {
        if (!snapToken) {
            alert("Token pembayaran belum siap, coba lagi sebentar.");
            return;
        }
        setProcessing(true);
        window.snap.pay(snapToken, {
            onSuccess: () => { navigate("/history"); },
            onPending: () => { navigate("/history"); },
            onError: () => { navigate("/history"); },
            onClose: () => {
                // Saat popup ditutup, kita tidak lagi memproses, cukup izinkan pengguna mencoba lagi
                setProcessing(false); 
                console.log("Popup ditutup oleh pengguna.");
            }
        });
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center items-center">
                <div className="w-full max-w-lg bg-gray-800/80 border border-gray-700/40 rounded-2xl shadow-2xl p-8 text-center space-y-6">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Konfirmasi Pembayaran</h2>
                    {loading ? (
                        <div className="animate-pulse space-y-3">
                            <div className="h-5 bg-gray-700 rounded w-full"></div>
                            <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto"></div>
                            <div className="h-12 bg-gray-600 rounded-full mt-4"></div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="text-gray-400">Anda akan melakukan pembayaran untuk:</p>
                                <p className="text-xl font-semibold text-white mt-1">{order?.campaigns?.campaign_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Total Pembayaran</p>
                                <p className="text-3xl font-bold text-yellow-300">Rp {Number(order?.amount).toLocaleString("id-ID")}</p>
                            </div>
                            <button 
                                onClick={handlePayNow} 
                                disabled={processing || !snapToken} 
                                className="w-full py-3 rounded-full font-bold text-lg shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export default Payment;