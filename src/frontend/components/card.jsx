
import { registerUser } from '../../backend/supabase';
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../backend/auth';
import { supabase } from '../../backend/supabase';

function LoginCard({ onClose = () => {} }) {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.includes("@") || !form.email.includes(".")) {
    toast.error("Email tidak valid");
    return;
    }

    try {
      await registerUser(form.name, form.email.trim(), form.password);
      toast.success("Pendaftaran berhasil!");
      setForm({ name: '', email: '', password: '' });
      setTimeout(() => {
        navigate('/home');
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };
















  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    

    try {
      const { data: sessionData, error: loginError } = await supabase.auth.signInWithPassword({
    email: loginForm.email.trim(),
    password: loginForm.password.trim()
    });


      if (loginError) throw loginError;

      const user = sessionData.user;
      setUser(user);

      const { data: userDataRes, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (queryError) {
        toast.error("Data user tidak ditemukan.");
        return;
      }

     const userData = userDataRes;
      const role = String(userData.role).toLowerCase().trim();

      if (role !== 'user' && role !== 'partner') {
        await supabase.auth.signOut();
        toast.error("Akses ditolak. Hanya akun 'user' atau 'partner' yang diperbolehkan.");
        return;
      }

      toast.success("Login berhasil!");

      setTimeout(() => {
        onClose();
        if (role === "partner") {
          navigate('/homepartner');
        } else {
          navigate('/home');
        }
      }, 1000);


      setLoginForm({ email: '', password: '' });

    } catch (err) {
      console.error(err);
      if (err.code === 429) {
        toast.error("Terlalu banyak percobaan login. Coba lagi sebentar.");
      } else {
        toast.error(err.message || "Terjadi kesalahan saat login.");
      }
    }
  };













  

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40 flex justify-center items-center">

      <ToastContainer position="top-right" autoClose={3000} />
      <div className="relative w-full max-w-md h-[460px]" style={{ perspective: "1000px" }}>
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl z-50"
        >
          ×
        </button>

        <motion.div
          animate={{ rotateY: isLogin ? 180 : 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full h-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* regist */}
          <div
            className="absolute w-full h-full bg-white shadow-xl rounded-xl p-8"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(0deg)" }}
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full p-2 border rounded mb-3" />
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full p-2 border rounded mb-3" />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full p-2 border rounded pr-10" />
              <div className="absolute right-3 top-2.5 text-gray-500 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
            <button onClick={handleSubmit} className="w-full mt-4 bg-black hover:bg-zinc-800 text-white py-2 rounded">
              Daftar Sekarang
            </button>
            <p className="text-sm text-center mt-4">
              Sudah punya akun?{" "}
              <span className="text-blue-500 cursor-pointer" onClick={() => setIsLogin(true)}>
                Login di sini
              </span>
            </p>
          </div>

          {/* login */}
          <div
            className="absolute w-full h-full bg-white shadow-xl rounded-xl p-8"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
            <input type="email" name="email" value={loginForm.email} onChange={handleLoginChange} placeholder="Email" className="w-full p-2 border rounded mb-3" />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} name="password" value={loginForm.password} onChange={handleLoginChange} placeholder="Password" className="w-full p-2 border rounded pr-10" />
              <div className="absolute right-3 top-2.5 text-gray-500 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
            <button onClick={handleLoginSubmit} className="w-full mt-4 bg-black hover:bg-blue-950 text-white py-2 rounded">
              Masuk
            </button>
            <p className="text-sm text-center mt-4">
              Belum punya akun?{" "}
              <span className="text-blue-500 cursor-pointer" onClick={() => setIsLogin(false)}>
                Daftar di sini
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginCard;