import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

function Header() {
  const navigate = useNavigate();
  const { logout, userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <div className="flex items-center gap-2">
              <Link to="/" className="text-xl font-bold text-minerva-gray-900">
                Minerva
              </Link>
              <span className="text-xs text-minerva-gray-500">v1.0</span>
            </div>
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
              <span className="hidden md:inline text-sm text-minerva-gray-600">
                {userProfile.name || userProfile.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="hidden md:block px-4 py-2 text-sm text-minerva-gray-700 hover:text-minerva-gray-900 transition-colors"
            >
              Kijelentkezés
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-minerva-gray-700 hover:text-minerva-gray-900"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-minerva-gray-200 pt-4">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-minerva-gray-700 hover:text-minerva-gray-900 transition-colors py-2"
              >
                Szavazókörök
              </Link>
              <Link
                to="/unknown"
                onClick={() => setMobileMenuOpen(false)}
                className="text-minerva-gray-700 hover:text-minerva-gray-900 transition-colors py-2"
              >
                Ismeretlen Körzetek
              </Link>
              <Link
                to="/invite-admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-minerva-gray-700 hover:text-minerva-gray-900 transition-colors py-2"
              >
                Admin meghívása
              </Link>
              {userProfile && (
                <div className="text-sm text-minerva-gray-600 py-2 border-t border-minerva-gray-200">
                  {userProfile.name || userProfile.email}
                </div>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-left text-minerva-gray-700 hover:text-minerva-gray-900 transition-colors py-2 border-t border-minerva-gray-200"
              >
                Kijelentkezés
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
