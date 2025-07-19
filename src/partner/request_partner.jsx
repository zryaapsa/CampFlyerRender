import { useNavigate } from "react-router-dom";
import { supabase } from "../backend/supabase";
import { useAuth } from "../backend/auth";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function RequestPartnerPage() {
    const { user, userData } = useAuth();
    const navigate = useNavigate();

    const handleSubmitRequest = async () => {
        if (!user || !userData) {
            toast.error("Anda harus login untuk mengajukan permintaan.");
            return;
        }

        // Cek jika pengguna sudah mengajukan sebelumnya
        if (userData.role === 'req-partner') {
            toast.info("Anda sudah pernah mengajukan permintaan. Mohon tunggu verifikasi dari admin.");
            return;
        }

        try {
            // Update role di tabel 'users' menjadi 'req-partner'
            const { error } = await supabase
                .from('users')
                .update({ role: 'req-partner' })
                .eq('user_id', user.id);

            if (error) throw error;

            toast.success("Permintaan berhasil dikirim! Anda akan diarahkan ke Halaman Utama.");
            setTimeout(() => {
                navigate('/home');
            }, 2000);

        } catch (err) {
            toast.error("Gagal mengirim permintaan: " + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center px-4">
            <ToastContainer position="top-center" theme="dark" />
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl text-center">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    Konfirmasi Pengajuan
                </h2>
                <p className="text-gray-300 mt-4 mb-6">
                    Anda akan mengajukan permintaan untuk menjadi Partner dengan akun <strong className="text-white">{user?.email}</strong>. Setelah disetujui, Anda akan mendapatkan akses ke Dashboard Partner.
                </p>
                <button
                    onClick={handleSubmitRequest}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition"
                >
                    Ya, Ajukan Permintaan
                </button>
                <button onClick={() => navigate('/home')} className="w-full mt-3 text-gray-400 hover:text-white text-sm py-2 rounded-lg transition">
                    Batal
                </button>
            </div>
        </div>
    );
}

export default RequestPartnerPage;