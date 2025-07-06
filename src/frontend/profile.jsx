import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../backend/auth";
import { supabase } from "../backend/supabase";

const Profile = () => {
    const navigate = useNavigate();
    const { user, loading, setUser } = useAuth();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user?.id) {
                const { data, error } = await supabase.from("users").select("name, role").eq("user_id", user.id).single();

                if (error) {
                    console.error("Gagal ambil data user:", error.message);
                } else {
                    setUserData(data);
                }
            }
        };

        fetchUserData();
    }, [user]);

    const handleLogout = async () => {
        const confirmLogout = window.confirm("Yakin ingin logout?");
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
        return <div className="text-center mt-10 text-gray-600">Memuat data...</div>;
    }

    if (!user) {
        return <div className="text-center mt-10 text-red-500">Kamu belum login.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 flex justify-center items-center px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-screen-sm bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-10 text-white space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-400 text-center">Profil Saya</h1>

                <div className="space-y-4 text-sm sm:text-base">
                    <div>
                        <p className="text-gray-400 text-xl"> Nama</p>
                        <p className="font-medium text-white text-xl">{userData?.name || "Tidak tersedia"}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xl"> Email</p>
                        <p className="font-medium text-white text-xl">{user.email}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xl"> ID Pengguna</p>
                        <p className="text-gray-300 break-all text-xl">{user.id}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xl"> Waktu Dibuat</p>
                        <p className="text-gray-300 text-xl">{new Date(user.created_at).toLocaleString()}</p>
                    </div>
                </div>

                <div className="pt-4">
                    <button onClick={handleLogout} className="w-full bg-gray-600 hover:bg-red-700 transition text-white font-semibold py-2 rounded-lg shadow">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
