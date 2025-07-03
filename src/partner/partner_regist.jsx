import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { supabase } from '../backend/supabase'; 

function PartnerRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      toast.error("Semua field harus diisi!");
      return;
    }

    if (!form.email.includes("@") || !form.email.includes(".")) {
      toast.error("Email tidak valid!");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password minimal 8 karakter!");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password.trim()
      });

      if (error) throw error;

      const user = data.user;
      if (!user) {
        toast.error("Registrasi gagal. Coba lagi.");
        return;
      }


      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          user_id: user.id,
          name: form.name,
          email: form.email,
          role: 'req-partner',
        }]);

      if (insertError) throw insertError;

      toast.success("Pendaftaran berhasil!");

      setForm({ name: '', email: '', password: '' });

      setTimeout(() => {
        navigate('/');
      }, 1000);

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan saat mendaftar.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-10">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="relative w-full max-w-md h-[420px]" style={{ perspective: "1000px" }}>
        <div className="absolute w-full h-full bg-white shadow-xl rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-2 text-center">Halo FlyPartner!</h2>
          <h3 className="text-center text-sm mb-4 text-gray-500">
            Gabung bersama kami dan jangkau audien di seluruh Indonesia!
          </h3>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nama Lengkap"
            className="w-full p-2 border rounded mb-3"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 border rounded mb-3"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password (min. 8 karakter)"
              className="w-full p-2 border rounded pr-10"
            />
            <div
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>
          <div className="py-4">
            <button
              onClick={handleSubmit}
              className="w-full bg-black hover:bg-zinc-800 text-white py-2 rounded"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartnerRegister;
