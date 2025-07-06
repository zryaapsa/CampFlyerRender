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
                const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single();
                if (error) throw new Error(error.message);
                setOrder(data);

                const response = await fetch("http://localhost:5000/payment/create", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: data.id,
                        grossAmount: data.amount || 10000,
                    }),
                });

                const result = await response.json();
                if (!result.token) throw new Error("Gagal ambil Snap token");

                window.snap.pay(result.token, {
                    onSuccess: async function (result) {
                        console.log("✅ Pembayaran berhasil:", result);

                        // Update status order
                        const { error: statusError } = await supabase.from("orders").update({ status: "success" }).eq("id", data.id);
                        if (statusError) console.error("❌ Gagal update status:", statusError.message);

                        // Kurangi kursi dari fungsi RPC
                        const { error: updateCampaignError } = await supabase.rpc("kurangi_kursi", {
                            campaign_id_input: data.campaign_id,
                        });
                        if (updateCampaignError) {
                            console.error("❌ Gagal update kursi:", updateCampaignError.message);
                        } else {
                            console.log("✅ Kursi dikurangi.");
                        }

                        sessionStorage.setItem("recent_order_id", data.id);

                        setShowSuccess(true);
                    },
                    onClose: () => console.warn("🛑 Pembayaran ditutup"),
                });
            } catch (err) {
                alert("❌ Gagal: " + err.message);
            } finally {
                setLoading(false);
            }
        };

        startPayment();
    }, [orderId, navigate]);

    if (loading) return <p className="text-white text-center mt-10">Loading...</p>;

    return (
        <>
            <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center items-center">
                <div className="bg-white text-gray-900 p-6 rounded-xl w-full max-w-md text-center">
                    <h2 className="text-2xl font-bold mb-2">Pembayaran</h2>
                    {order && <p className="mb-2">Order ID: {order.id}</p>}
                    <p className="text-sm text-gray-500">Bentar ya lagi hubungin Bang Midtrans</p>
                </div>
            </div>

            {showSuccess && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white text-gray-900 p-6 rounded-xl text-center w-full max-w-sm shadow-lg">
                        <h3 className="text-xl font-bold mb-4">✅ Pembayaran Berhasil!</h3>
                        <p className="text-gray-600 mb-4">Terima kasih. Tiket kamu sudah dikonfirmasi. Kamu bisa lihat detail tiket kamu di histori</p>
                        <button onClick={() => navigate("/history")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                            Histori Pembelian
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Payment;
