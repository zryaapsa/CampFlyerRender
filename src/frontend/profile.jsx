import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../backend/auth";
import { supabase } from "../backend/supabase";
import FullScreenLoader from "../frontend/components/loader"; // Gunakan loader Anda

const Profile = () => {
    const navigate = useNavigate();
    const { user, userData, loading, setUser } = useAuth(); // Ambil userData dari context

    const handleLogout = async () => {
        const confirmLogout = window.confirm("Apakah Anda yakin ingin logout?");
        if (!confirmLogout) return;

        try {
            await supabase.auth.signOut();
            setUser(null);
            navigate("/");
        } catch (err) {
            console.error("Gagal logout:", err.message);
        }
    };

    if (loading) {
        return <FullScreenLoader message="Memuat profil..." />;
    }

    if (!user) {
        // Arahkan ke home jika tidak ada user, ini lebih baik daripada menampilkan pesan error
        useEffect(() => {
            navigate("/home");
        }, [navigate]);
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 flex justify-center items-center px-4 sm:px-6 lg:px-8 py-10">
            <div className="w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-10 text-white space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                        Profil Saya
                    </h1>
                    <span className={`mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full ${userData?.role === 'partner' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {userData?.role === 'partner' ? 'Partner' : 'User'}
                    </span>
                </div>

                {/* Detail Informasi */}
                <div className="space-y-4 border-t border-b border-gray-700 py-6">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-400">Nama</p>
                        <p className="font-medium text-white">{userData?.name || "Tidak tersedia"}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-gray-400">Email</p>
                        <p className="font-medium text-white">{user.email}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-gray-400">Bergabung Sejak</p>
                        <p className="text-gray-300">{new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="space-y-4">
                    {userData?.role === 'partner' && (
                        <Link to="/homepartner" className="block w-full text-center bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-lg shadow-lg">
                            Kembali ke Dashboard
                        </Link>
                    )}
                    <button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700 transition text-white font-semibold py-3 rounded-lg shadow-lg">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;