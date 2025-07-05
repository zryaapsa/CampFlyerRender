import { useEffect, useState, useRef } from "react";
import { supabase } from "../../backend/supabase";
import Navbar from "../components/navbar";
import { QRCodeCanvas } from "qrcode.react";

function History() {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [recentOrderId, setRecentOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null); // ⬅️ untuk modal
  const recentRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;
      setUser(currentUser);
      if (!currentUser) return;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          metode,
          amount,
          created_at,
          campaigns (
            id,
            campaign_name,
            tanggal,
            jam,
            foto_url
          )
        `)
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (!error && data) setOrders(data);

      const id = sessionStorage.getItem("recent_order_id");
      if (id) {
        setRecentOrderId(id);
        sessionStorage.removeItem("recent_order_id");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (recentOrderId && recentRef.current) {
      recentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [orders, recentOrderId]);

  return (
    <>
      <Navbar user={user} />
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Histori Pemesanan</h2>

        {orders.length === 0 ? (
          <p className="text-center text-gray-400">Belum ada transaksi.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => {
              const campaign = order.campaigns;
              const isRecent = order.id === recentOrderId;

              return (
                <div
                  key={order.id}
                  ref={isRecent ? recentRef : null}
                  onClick={() => setSelectedOrder(order)}
                  className="cursor-pointer bg-white text-gray-900 p-4 rounded-xl shadow hover:ring-2 ring-blue-400 transition-all"
                >
                  {campaign?.foto_url && (
                    <img
                      src={campaign.foto_url}
                      alt={campaign.campaign_name}
                      className="w-full max-h-[700px] object-contain rounded-lg bg-gray-800 p-2 mx-auto mb-3"
                    />
                  )}
                  <p className="font-bold text-lg">{campaign?.campaign_name}</p>
                  <p className="text-sm text-gray-600">{campaign?.tanggal} • {campaign?.jam}</p>
                  <p className="text-sm text-gray-600">Metode Pembayaran : {order.metode}</p>
                  <p className="text-sm mt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold
                      ${order.status === "success"
                        ? "bg-green-100 text-green-800"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                      }`}>{order.status.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-right font-bold text-blue-700 mt-4">
                    Rp {Number(order.amount).toLocaleString("id-ID")}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <QRCodeCanvas value={order.id} size={120} />
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">Klik untuk lihat tiket</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal tiket */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 rounded-xl shadow-lg p-6 w-full max-w-sm text-center relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-2">Tiket Kamu</h3>
            <p className="text-sm mb-1 text-gray-600">{selectedOrder.campaigns?.campaign_name}</p>
            <div className="my-4 flex justify-center">
              <QRCodeCanvas value={selectedOrder.id} size={160} />
            </div>
            <p className="text-xs text-gray-500">Tunjukkan QR ini saat pendaftaran</p>
            <p className="mt-2 font-mono text-sm">Nomor Tiket:</p>
            <p className="text-blue-700 font-bold">{selectedOrder.id}</p>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default History;
