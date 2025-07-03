import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../backend/auth'; 

function Footer() {
  const navigate = useNavigate();
  const { user, userData } = useAuth();

  const handlePartner = () => {
    navigate('/registpartner');
  };

  
if (userData?.role === 'partner') {
  return null;
}

  return (
   <footer className="bg-gray-900 text-white py-10 px-4">
  <div className="w-full px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
      <div>
        <h2 className="text-xl font-bold mb-3">CampFlyer.</h2>
        <p className="text-sm text-gray-400">
          Platform promosi pihak ketiga terpercaya. Kami bantu event atau produkmu dikenal lebih luas.
        </p>
      </div>

      {user && (
        <div className="px-2">
          <h2 className="text-lg font-semibold">Bisnis Partner</h2>
          <p className="text-sm text-gray-400 mb-3">Jadi bagian dari kami</p>

          <button
            onClick={handlePartner}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded text-sm"
          >
            Ajukan Pendaftaran
          </button>

          <p className="text-xs text-gray-400 mt-2">
            Permintaan akan dikirim ke admin untuk diverifikasi.
          </p>
        </div>
      )}
    </div>
  </div>

      {!user && (
        <div className="mt-10 border-t border-gray-700 pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} CampFlyer. All rights reserved.
        </div>
      )}
    </footer>
  );
}

export default Footer;
