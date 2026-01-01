import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { logout, userProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-minerva-gray-200">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-minerva-gray-900">
              Minerva
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/"
                className="text-minerva-gray-700 hover:text-minerva-gray-900 transition-colors"
              >
                Szavazókörök
              </Link>
              <Link
                to="/unknown"
                className="text-minerva-gray-700 hover:text-minerva-gray-900 transition-colors"
              >
                Ismeretlen Körzetek
              </Link>
              <Link
                to="/invite-admin"
                className="text-minerva-gray-700 hover:text-minerva-gray-900 transition-colors"
              >
                Admin meghívása
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {userProfile && (
              <span className="text-sm text-minerva-gray-600">
                {userProfile.name || userProfile.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-minerva-gray-700 hover:text-minerva-gray-900 transition-colors"
            >
              Kijelentkezés
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
