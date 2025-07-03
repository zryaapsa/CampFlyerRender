import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../backend/supabase";

function Payment() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const startedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId || startedRef.current) return;
    startedRef.current = true;

    const startPayment = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();
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
  console.log("Pembayaran berhasil:", result);
  const { error } = await supabase
    .from("orders")
    .update({ status: "success" })
    .eq("id", data.id); 
  if (error) {
    console.error("Gagal update status:", error.message);
  }
  sessionStorage.setItem("recent_order_id", data.id);
  setTimeout(() => {
    navigate("/history");
  }, 1000);
}

        });

      } catch (err) {
        alert("❌ Gagal: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    startPayment();
  }, [orderId, navigate]);

  if (loading)
    return <p className="text-white text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex justify-center items-center">
      <div className="bg-white text-gray-900 p-6 rounded-xl w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-2">Pembayaran</h2>
        {order && <p className="mb-2">Order ID: {order.id}</p>}
        <p className="text-sm text-gray-500">QR akan muncul di popup</p>
      </div>
    </div>
  );
}

export default Payment;
