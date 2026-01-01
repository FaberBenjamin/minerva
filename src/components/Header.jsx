import { Link, useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Firebase Auth kijelentkezés (Fázis 2)
    console.log('Logout');
    navigate('/login');
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
            </nav>
          </div>

          <div className="flex items-center space-x-4">
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
