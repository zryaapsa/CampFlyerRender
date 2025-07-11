import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../backend/supabase";

function Payment() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);
    const startedRef = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!orderId || startedRef.current) return;
        startedRef.current = true;

        const startPayment = async () => {
            try {
                // Ambil data order dari Supabase
                const { data, error } = await supabase.from("orders").select("*, campaigns(campaign_name)").eq("id", orderId).single();
                if (error || !data) throw new Error("Order tidak ditemukan atau sudah diproses.");
                setOrder(data);
                setLoading(false); // Langsung set loading false agar UI bisa tampil

                // Panggil backend untuk membuat token Midtrans
                const response = await fetch("http://localhost:5000/payment/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: data.id,
                        grossAmount: data.amount || 10000,
                    }),
                });

                const result = await response.json();
                if (!result.token) throw new Error("Gagal mendapatkan token pembayaran dari server.");

                // Tampilkan popup pembayaran Midtrans
                window.snap.pay(result.token, {
                    onSuccess: function (result) {
                        // --- INI PERUBAHAN PALING PENTING ---
                        // Logika penting (update status, kurangi kursi) sudah dipindah ke Webhook di backend agar aman.
                        // Frontend hanya bertugas menampilkan pesan sukses dan mengarahkan user.
                        
                        console.log("✅ Pembayaran berhasil di sisi klien:", result);
                        sessionStorage.setItem("recent_order_id", data.id);
                        setShowSuccess(true);
                    },
                    onPending: function (result) {
                        console.log("⌛ Pembayaran tertunda:", result);
                        alert("Pembayaran Anda sedang diproses. Silakan cek halaman histori untuk status terbaru.");
                        navigate("/history");
                    },
                    onError: function (result) {
                        console.error("❌ Pembayaran gagal:", result);
                        alert("Pembayaran gagal. Silakan coba lagi.");
                        navigate(`/checkout/${data.campaign_id}`);
                    },
                    onClose: () => {
                        console.warn("🛑 Popup pembayaran ditutup oleh pengguna.");
                        // Arahkan pengguna kembali agar tidak terjebak di halaman kosong
                        alert("Anda menutup jendela pembayaran. Anda bisa mencobanya lagi dari halaman histori.");
                        navigate("/history");
                    }
                });
            } catch (err) {
                console.error("Gagal memulai pembayaran:", err.message);
                alert("❌ Gagal: " + err.message);
                navigate("/home"); // Arahkan ke home jika ada error fatal
            }
            // Tidak ada `finally` di sini agar loading state tidak berubah lagi
        };

        startPayment();
    }, [orderId, navigate]);

    // Hapus 'if (loading) return...' untuk menghilangkan layar putih
    
    return (
        <>
            <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center items-center">
                <div className="bg-gray-800/80 border border-gray-700/40 p-8 rounded-2xl w-full max-w-md text-center shadow-lg">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto"></div>
                            <div className="h-4 bg-gray-700 rounded w-full mx-auto"></div>
                            <div className="h-5 bg-gray-700 rounded w-1/2 mx-auto mt-2"></div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Menyiapkan Pembayaran</h2>
                            <p className="mb-2 text-gray-300">Order untuk: <span className="font-bold text-white">{order?.campaigns?.campaign_name}</span></p>
                            <p className="text-sm text-gray-400">Jendela pembayaran Midtrans akan segera muncul...</p>
                        </>
                    )}
                </div>
            </div>

            {/* Modal Sukses */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 text-white border border-gray-700 p-8 rounded-2xl text-center w-full max-w-sm shadow-2xl">
                        <h3 className="text-2xl font-bold mb-4 text-emerald-400">✅ Pembayaran Berhasil!</h3>
                        <p className="text-gray-300 mb-6">Terima kasih. Tiket Anda sudah dikonfirmasi. Anda akan diarahkan ke halaman histori.</p>
                        <button onClick={() => navigate("/history")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">
                            Lihat Histori Pembelian
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Payment;