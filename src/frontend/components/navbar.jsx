import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../backend/auth'; 

function Navbar({ onLoginClick }) {
  const navigate = useNavigate();
  const { user } = useAuth(); 

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <nav className="w-full bg-gray-900 shadow-md py-4 px-8 flex justify-between items-center">
      <Link to="/home">
        <h1 className="text-3xl font-bold text-white">CampFlyer.</h1>
      </Link>
      <ul className="flex space-x-6 items-center">
        {user ? (
          <li>
            <button
              onClick={handleProfile}
              className="hover:text-blue-600 text-xl text-white px-5"
            >
              Profile
            </button>
          </li>
        ) : (
          <li>
            <button onClick={onLoginClick} className="hover:text-blue-500 text-amber-50">
              Login
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
