import { useEffect, useState, useRef } from "react";
import { supabase } from "../../backend/supabase";
import Navbar from "../components/navbar";
import { QRCodeCanvas } from "qrcode.react";

function History() {
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);
    const [recentOrderId, setRecentOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const recentRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: sessionData } = await supabase.auth.getSession();
            const currentUser = sessionData?.session?.user;
            setUser(currentUser);

            if (!currentUser) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("orders")
                .select(
                    `
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
        `
                )
                .eq("user_id", currentUser.id)
                .order("created_at", { ascending: false });

            if (!error && data) setOrders(data);

            const id = sessionStorage.getItem("recent_order_id");
            if (id) {
                setRecentOrderId(id);
                sessionStorage.removeItem("recent_order_id");
            }

            setLoading(false);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (recentOrderId && recentRef.current) {
            recentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [orders, recentOrderId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "success":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
            case "pending":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
            default:
                return "bg-red-500/20 text-red-400 border-red-500/30";
        }
    };

    return (
        <>
            <Navbar user={user} />

            {/* Dark Mode Background */}
            <div className="min-h-screen bg-gray-900 relative overflow-hidden">
                {/* Subtle Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="text-center mb-12 pt-8">
                        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                            Histori <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Pemesanan</span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">Kelola dan pantau semua transaksi Anda</p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-16">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDelay: "1s" }}></div>
                            </div>
                            <p className="ml-4 text-gray-300 text-lg font-medium">Memuat histori...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && orders.length === 0 && (
                        <div className="text-center py-16">
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-gray-700/50">
                                <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Transaksi</h3>
                                <p className="text-gray-400">Histori pemesanan Anda akan muncul di sini</p>
                            </div>
                        </div>
                    )}

                    {/* Orders Grid */}
                    {!loading && orders.length > 0 && (
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {orders.map((order, index) => {
                                    const campaign = order.campaigns;
                                    const isRecent = order.id === recentOrderId;
                                    const previewURL = campaign?.foto_url || "https://via.placeholder.com/400x300/374151/9CA3AF?text=No+Image";

                                    return (
                                        <div key={order.id} ref={isRecent ? recentRef : null} onClick={() => setSelectedOrder(order)} className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${isRecent ? "ring-2 ring-purple-500 shadow-lg shadow-purple-500/20" : ""}`} style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 h-full flex flex-col">
                                                {/* Image Container */}
                                                <div className="relative overflow-hidden h-48">
                                                    <img src={previewURL} alt={campaign?.campaign_name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                    {/* Status Badge */}
                                                    <div className="absolute top-4 right-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>{order.status.toUpperCase()}</span>
                                                    </div>

                                                    {/* Recent Badge */}
                                                    {isRecent && (
                                                        <div className="absolute top-4 left-4">
                                                            <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg animate-pulse">Terbaru</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-6 flex-1 flex flex-col">
                                                    {/* Title dengan tinggi tetap */}
                                                    <div className="h-16 flex items-start mb-4">
                                                        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">{campaign?.campaign_name}</h3>
                                                    </div>

                                                    {/* Date & Time */}
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div className="flex items-center text-gray-400">
                                                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-sm">{campaign?.tanggal}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-400">
                                                            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span className="text-sm">{campaign?.jam}</span>
                                                        </div>
                                                    </div>

                                                    {/* Payment Method */}
                                                    <div className="flex items-center text-gray-400 mb-4">
                                                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                        <span className="text-sm">{order.metode}</span>
                                                    </div>

                                                    {/* Order Date */}
                                                    <div className="flex items-center text-gray-400 mb-4">
                                                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-sm">Dipesan {formatDate(order.created_at)}</span>
                                                    </div>

                                                    {/* Amount */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-gray-400 text-sm">Total Pembayaran</span>
                                                        <span className="text-2xl font-bold text-purple-400">Rp {Number(order.amount).toLocaleString("id-ID")}</span>
                                                    </div>

                                                    {/* QR Code Preview */}
                                                    <div className="flex justify-center mb-4">
                                                        <div className="bg-white p-2 rounded-lg">
                                                            <QRCodeCanvas value={order.id} size={80} />
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div className="mt-auto pt-4 border-t border-gray-700/50">
                                                        <span className="inline-flex items-center text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors duration-300">
                                                            Lihat Tiket
                                                            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Tiket dengan Dark Theme */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-4 w-full max-w-xs text-center relative transform transition-all duration-300 scale-100">
                        {/* Close Button */}
                        <button onClick={() => setSelectedOrder(null)} className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors duration-200 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Header */}
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-white mb-1">🎫 Tiket Anda</h3>
                            <p className="text-gray-300 text-xs">{selectedOrder.campaigns?.campaign_name}</p>
                        </div>

                        {/* QR Code */}
                        <div className="mb-4">
                            <div className="bg-white p-2 rounded-xl inline-block shadow-lg">
                                <QRCodeCanvas value={selectedOrder.id} size={120} />
                            </div>
                        </div>

                        {/* Ticket Info */}
                        <div className="space-y-2 mb-4">
                            <div className="bg-gray-700/50 rounded-lg p-2">
                                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Nomor Tiket</p>
                                <p className="text-purple-400 font-bold font-mono text-xs break-all">{selectedOrder.id}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-700/50 rounded-lg p-2">
                                    <p className="text-gray-400 text-[10px] uppercase tracking-wide">Tanggal</p>
                                    <p className="text-white font-semibold text-xs">{selectedOrder.campaigns?.tanggal}</p>
                                </div>
                                <div className="bg-gray-700/50 rounded-lg p-2">
                                    <p className="text-gray-400 text-[10px] uppercase tracking-wide">Waktu</p>
                                    <p className="text-white font-semibold text-xs">{selectedOrder.campaigns?.jam}</p>
                                </div>
                            </div>

                            <div className="bg-gray-700/50 rounded-lg p-2">
                                <p className="text-gray-400 text-[10px] uppercase tracking-wide">Status</p>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status.toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mb-4">
                            <p className="text-blue-400 text-xs">
                                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Tunjukkan QR code ini saat pendaftaran acara
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button onClick={() => setSelectedOrder(null)} className="flex-1 px-2 py-2 bg-gray-700 text-xs text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium">
                                Tutup
                            </button>
                            <button
                                onClick={() => {
                                    window.print();
                                }}
                                className="flex-1 px-2 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-xs text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium"
                            >
                                Cetak Tiket
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default History;
