import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import Logo from './Logo';
import ThemeSwitcher from './ThemeSwitcher';

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
    <header className="shadow-sm border-b" style={{ backgroundColor: 'var(--theme-bg-primary)', borderColor: 'var(--theme-border-primary)' }}>
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center gap-3 group">
              <Logo size="sm" className="transition-transform group-hover:scale-110" />
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>Minerva</span>
                <span className="text-xs" style={{ color: 'var(--theme-text-tertiary)' }}>v2.0</span>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                to="/"
                className="transition-colors"
                style={{ color: 'var(--theme-link-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-link-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-link-text)'}
              >
                Szavazókörök
              </Link>
              <Link
                to="/unknown"
                className="transition-colors"
                style={{ color: 'var(--theme-link-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-link-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-link-text)'}
              >
                Ismeretlen Körzetek
              </Link>
              <Link
                to="/invite-admin"
                className="transition-colors"
                style={{ color: 'var(--theme-link-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-link-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-link-text)'}
              >
                Admin meghívása
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            {userProfile && (
              <span className="hidden md:inline text-sm" style={{ color: 'var(--theme-text-tertiary)' }}>
                {userProfile.name || userProfile.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="hidden md:block px-4 py-2 text-sm transition-colors"
              style={{ color: 'var(--theme-link-text)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-link-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-link-text)'}
            >
              Kijelentkezés
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 transition-colors"
              style={{ color: 'var(--theme-link-text)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-link-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-link-text)'}
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
          <div className="md:hidden mt-4 pb-4 border-t pt-4" style={{ borderColor: 'var(--theme-border-primary)' }}>
            <nav className="flex flex-col space-y-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="transition-colors py-2"
                style={{ color: 'var(--theme-link-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-link-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-link-text)'}
              >
                Szavazókörök
              </Link>
              <Link
                to="/unknown"
                onClick={() => setMobileMenuOpen(false)}
                className="transition-colors py-2"
                style={{ color: 'var(--theme-link-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-link-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-link-text)'}
              >
                Ismeretlen Körzetek
              </Link>
              <Link
                to="/invite-admin"
                onClick={() => setMobileMenuOpen(false)}
                className="transition-colors py-2"
                style={{ color: 'var(--theme-link-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-link-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-link-text)'}
              >
                Admin meghívása
              </Link>
              {userProfile && (
                <div className="text-sm py-2 border-t" style={{ color: 'var(--theme-text-tertiary)', borderColor: 'var(--theme-border-primary)' }}>
                  {userProfile.name || userProfile.email}
                </div>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-left transition-colors py-2 border-t"
                style={{ color: 'var(--theme-link-text)', borderColor: 'var(--theme-border-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-link-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--theme-link-text)'}
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
