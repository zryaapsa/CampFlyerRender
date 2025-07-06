import { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import { supabase } from "../backend/supabase";
import LoginCard from "./components/card";
import { Link } from "react-router-dom";

function Home() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showCard, setShowCard] = useState(false);

    const fetchCampaigns = async () => {
        try {
            const { data, error } = await supabase.from("campaigns").select("*");
            if (error) throw error;
            setCampaigns(data);
        } catch (err) {
            console.error("Gagal mengambil campaign:", err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        };

        checkUser();
        fetchCampaigns();

        // 🔄 Event listener untuk refresh data saat user kembali ke tab ini
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                console.log("🔁 Halaman aktif kembali, refresh kursi...");
                fetchCampaigns();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    return (
        <>
            <Navbar user={user} onLoginClick={() => setShowCard(true)} />

            {/* Dark Mode Background */}
            <div className="min-h-screen bg-gray-900 relative overflow-hidden">
                {/* Subtle Dark Mode Animated Background */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: "2s" }}></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{ animationDelay: "4s" }}></div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                    {/* Hero Landing Section */}
                    {!user && (
                        <div className="text-center mb-16 pt-16">
                            <div className="max-w-4xl mx-auto">
                                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                                    Tingkatkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Skill</span> Anda
                                </h1>
                                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">Bergabunglah dengan ribuan profesional yang telah mengembangkan karier mereka melalui bootcamp dan workshop premium kami</p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                                    <button onClick={() => setShowCard(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                                        Mulai Perjalanan Anda
                                    </button>
                                    <button className="border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300">Pelajari Lebih Lanjut</button>
                                </div>

                                {/* Features Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                                        <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-2">Bootcamp Intensif</h3>
                                        <p className="text-gray-400 text-sm">Program pembelajaran intensif dengan mentor berpengalaman</p>
                                    </div>

                                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                                        <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-2">Workshop Praktis</h3>
                                        <p className="text-gray-400 text-sm">Sesi hands-on dengan project real-world</p>
                                    </div>

                                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                                        <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-2">Komunitas Aktif</h3>
                                        <p className="text-gray-400 text-sm">Networking dengan profesional dari berbagai industri</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Welcome Header for Logged In Users */}
                    {user && (
                        <div className="text-center mb-12 pt-8">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                                Selamat Datang Kembali,{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                    <br />
                                    {user.email}
                                </span>
                            </h1>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">Lanjutkan perjalanan pembelajaran Anda dengan campaign terbaru</p>
                        </div>
                    )}

                    {/* Campaign Section Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{user ? "Campaign Tersedia" : "Campaign Populer"}</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">{user ? "Pilih campaign yang sesuai dengan minat dan jadwal Anda" : "Daftar sekarang untuk mengakses semua campaign eksklusif"}</p>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-16">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-gray-600 border-t-purple-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{ animationDelay: "1s" }}></div>
                            </div>
                            <p className="ml-4 text-gray-300 text-lg font-medium">Memuat campaign...</p>
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && campaigns.length === 0 && (
                        <div className="text-center py-16">
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-gray-700/50">
                                <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Campaign</h3>
                                <p className="text-gray-400">Campaign menarik akan segera hadir</p>
                            </div>
                        </div>
                    )}

                    {/* Campaign Grid - Konsisten untuk semua card */}
                    {!loading && campaigns.length > 0 && (
                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {campaigns.map((item, index) => {
                                    const previewURL = item.foto_url || "https://via.placeholder.com/400x300/374151/9CA3AF?text=No+Image";
                                    return (
                                        <div key={item.id} className="group transform transition-all duration-300 hover:scale-105 hover:-translate-y-2" style={{ animationDelay: `${index * 100}ms` }}>
                                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 h-full flex flex-col">
                                                <Link
                                                    to={user ? `/campaign/${item.id}` : "#"}
                                                    className="flex flex-col h-full"
                                                    onClick={
                                                        !user
                                                            ? (e) => {
                                                                  e.preventDefault();
                                                                  setShowCard(true);
                                                              }
                                                            : undefined
                                                    }
                                                >
                                                    {/* Image Container - Konsisten tinggi */}
                                                    <div className="relative overflow-hidden h-48">
                                                        <img src={previewURL} alt={item.campaign_name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                                        {/* Gradient Overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                        {/* Campaign Status Badge */}
                                                        <div className="absolute top-4 right-4">
                                                            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">{item.kursi} Kursi</span>
                                                        </div>

                                                        {/* Lock Icon for Non-Users */}
                                                        {!user && (
                                                            <div className="absolute top-4 left-4">
                                                                <div className="bg-gray-900/80 backdrop-blur-sm rounded-full p-2">
                                                                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content - Konsisten padding dan layout */}
                                                    <div className="p-6 flex-1 flex flex-col">
                                                        {/* Title dengan tinggi tetap */}
                                                        <div className="h-16 flex items-start mb-4">
                                                            <h3 className="text-xl font-bold text-white leading-tight group-hover:text-purple-300 transition-colors duration-300 line-clamp-2">{item.campaign_name}</h3>
                                                        </div>

                                                        {/* Date & Time dengan posisi tetap */}
                                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                                            <div className="flex items-center text-gray-400">
                                                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                                <span className="text-sm">{item.tanggal}</span>
                                                            </div>

                                                            <div className="flex items-center text-gray-400">
                                                                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span className="text-sm">{item.jam}</span>
                                                            </div>
                                                        </div>

                                                        {/* Action Button - Konsisten posisi */}
                                                        <div className="mt-auto pt-4 border-t border-gray-700/50">
                                                            <span className="inline-flex items-center text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors duration-300">
                                                                {user ? "Lihat Detail" : "Daftar untuk Akses"}
                                                                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* CTA Section for Non-Users */}
                    {!user && campaigns.length > 0 && (
                        <div className="mt-16 text-center">
                            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-gray-700/50">
                                <h3 className="text-2xl font-bold text-white mb-4">Siap Bergabung?</h3>
                                <p className="text-gray-400 mb-6">Daftarkan diri Anda sekarang dan dapatkan akses ke semua campaign premium</p>
                                <button onClick={() => setShowCard(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105">
                                    Daftar Sekarang
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showCard && <LoginCard onClose={() => setShowCard(false)} />}
        </>
    );
}

export default Home;
