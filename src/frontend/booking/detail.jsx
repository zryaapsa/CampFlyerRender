import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../backend/supabase";
import LoginCard from "../components/card";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";

const DetailCampaign = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [showCard, setShowCard] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            const { data: authData } = await supabase.auth.getUser();
            const authUser = authData?.user;
            setUser(authUser);

            if (authUser) {
                const { data: userProfile } = await supabase.from("users").select("role").eq("user_id", authUser.id).single();
                if (userProfile) setUserData(userProfile);
            }

            const { data, error } = await supabase.from("campaigns").select("*").eq("id", id).single();
            if (error || !data) {
                toast.error("Campaign tidak ditemukan.");
                navigate("/home");
                return;
            }
            
            setCampaign(data);
            setLoading(false);
        };

        fetchAllData();
    }, [id, navigate]);

    const handleBooking = () => {
        if (!user) {
            toast.warning("Silakan login terlebih dahulu untuk daftar.");
            setShowCard(true);
            return;
        }
        navigate(`/checkout/${id}`);
    };

    const handleEdit = () => {
        navigate(`/editcampaign/${id}`);
    };

    const handleDelete = async () => {
        const confirm = window.confirm("Yakin ingin menghapus campaign ini?");
        if (!confirm) return;
        const { error } = await supabase.from("campaigns").delete().eq("id", id);
        if (error) {
            toast.error("Gagal menghapus campaign.");
        } else {
            toast.success("Campaign berhasil dihapus.");
            setTimeout(() => {
                navigate("/home");
            }, 1500);
        }
    };

    const badge = (icon, text, color) => (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
            {icon}
            {text}
        </span>
    );

    return (
        <AnimatePresence mode="wait">
            <motion.div key={id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.4 }}>
                <ToastContainer position="top-right" autoClose={3000} />
                <div className="p-2 sm:p-8 bg-gray-900 min-h-screen text-white flex justify-center items-center">
                    <motion.div className="max-w-3xl w-full bg-gray-800/80 rounded-2xl shadow-2xl p-4 sm:p-10 space-y-6 border border-gray-700/40" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
                        
                        <div className="text-center mb-2">
                            {loading ? (
                                <>
                                    <div className="animate-pulse h-10 bg-gray-700 rounded-lg w-3/4 mx-auto mb-4"></div>
                                    <div className="flex justify-center gap-2">
                                        <div className="animate-pulse h-6 bg-gray-700 rounded-full w-24"></div>
                                        <div className="animate-pulse h-6 bg-gray-700 rounded-full w-20"></div>
                                        <div className="animate-pulse h-6 bg-gray-700 rounded-full w-28"></div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-2 drop-shadow-lg">{campaign.campaign_name}</h1>
                                    <div className="flex flex-wrap justify-center gap-2 mb-2">
                                        {badge(<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, campaign.tanggal, "bg-blue-700/20 text-blue-300 border border-blue-700/30")}
                                        {badge(<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, campaign.jam, "bg-purple-700/20 text-purple-300 border border-purple-700/30")}
                                        {badge(<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, `Kursi: ${campaign.kursi}`, "bg-emerald-700/20 text-emerald-300 border border-emerald-700/30")}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-center">
                            {loading ? (
                                <div className="animate-pulse bg-gray-700 w-full max-w-xl h-72 rounded-xl"></div>
                            ) : (
                                <div className="relative group max-w-xl w-full">
                                    <img src={campaign.foto_url} alt={campaign.campaign_name} className="w-full max-h-[420px] object-contain rounded-xl border-4 border-white/10 shadow-xl bg-gray-900 cursor-zoom-in transition-transform duration-300 group-hover:scale-105" onClick={() => setShowImageModal(true)} />
                                    <span className="absolute bottom-2 right-2 bg-black/60 text-xs text-white px-2 py-1 rounded shadow group-hover:opacity-100 opacity-80 transition">Klik untuk perbesar</span>
                                </div>
                            )}
                        </div>

                        {showImageModal && !loading && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setShowImageModal(false)}>
                                <img src={campaign.foto_url} alt={campaign.campaign_name} className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl border-4 border-white/20" />
                            </div>
                        )}

                        {!loading && (
                            <div className="flex flex-wrap justify-center gap-4 items-center mb-2">
                                {badge(<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, `Jam: ${campaign.jam}`, "bg-indigo-700/20 text-indigo-300 border border-indigo-700/30")}
                                {badge(<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, `Harga: Rp ${Number(campaign.harga).toLocaleString("id-ID")}`, "bg-yellow-700/20 text-yellow-300 border border-yellow-700/30")}
                            </div>
                        )}

                        <div className="bg-gray-900/70 rounded-xl p-5 shadow-inner border border-gray-700/30">
                            {loading ? (
                                <div className="space-y-3">
                                    <div className="h-5 bg-gray-700 rounded w-1/4 animate-pulse"></div>
                                    <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
                                </div>
                            ) : (
                                <>
                                    <p className="text-white font-semibold mb-2 text-lg flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Keterangan
                                    </p>
                                    <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">{campaign.keterangan}</p>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
                            {loading ? (
                                <div className="animate-pulse bg-gray-700 h-12 w-48 rounded-full mx-auto"></div>
                            ) : (
                                <>
                                    {userData?.role !== "partner" && (
                                        <button onClick={handleBooking} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 rounded-full text-white font-bold text-lg shadow-lg transition-all duration-300">
                                            Daftar Sekarang
                                        </button>
                                    )}
                                    {userData?.role === "partner" && (
                                        <>
                                            <button onClick={handleEdit} className="bg-yellow-500 hover:bg-yellow-600 px-6 py-2 rounded-full text-white font-semibold transition shadow">
                                                Edit
                                            </button>
                                            <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full text-white font-semibold transition shadow">
                                                Hapus
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
                {!user && showCard && <LoginCard onClose={() => setShowCard(false)} />}
            </motion.div>
        </AnimatePresence>
    );
};

export default DetailCampaign;