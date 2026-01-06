import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      console.error('Login error:', err);

      // Felhasználóbarát hibaüzenetek
      let errorMessage = 'Hiba történt a bejelentkezés során';

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        errorMessage = 'Hibás email cím vagy jelszó';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Túl sok sikertelen próbálkozás. Próbáld később.';
      } else if (err.message === 'Nincs jogosultságod az admin felülethez') {
        errorMessage = err.message;
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Hálózati hiba. Ellenőrizd az internetkapcsolatot.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--theme-bg-secondary)' }}>
      <div className="max-w-md w-full rounded-lg shadow-lg p-8" style={{ backgroundColor: 'var(--theme-card-bg)' }}>
        {/* DEMO WARNING BANNER */}
        <div className="mb-6 p-4 rounded-lg border-2" style={{
          backgroundColor: '#dc2626',
          borderColor: '#991b1b',
        }}>
          <p className="text-white text-center font-bold text-lg mb-1">
            DEMO OLDAL - CSAK ILLUSZTRATÍV CÉLOKRA
          </p>
          <p className="text-white text-center text-sm font-medium">
            NE adj meg valós személyes adatokat!
          </p>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>Minerva</h1>
          <p className="mt-2" style={{ color: 'var(--theme-text-tertiary)' }}>Önkéntes Toborzó Rendszer</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
              Email cím
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md outline-none transition-colors"
              style={{
                backgroundColor: 'var(--theme-input-bg)',
                borderColor: 'var(--theme-input-border)',
                color: 'var(--theme-input-text)'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--theme-input-focus)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--theme-input-border)'}
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
              Jelszó
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md outline-none transition-colors"
              style={{
                backgroundColor: 'var(--theme-input-bg)',
                borderColor: 'var(--theme-input-border)',
                color: 'var(--theme-input-text)'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--theme-input-focus)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--theme-input-border)'}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="border px-4 py-3 rounded-md text-sm" style={{
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              borderColor: 'var(--theme-error)',
              color: 'var(--theme-error)'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: loading ? 'var(--theme-btn-secondary-bg)' : 'var(--theme-btn-primary-bg)',
              color: loading ? 'var(--theme-btn-secondary-text)' : 'var(--theme-btn-primary-text)'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = 'var(--theme-btn-primary-hover)';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = 'var(--theme-btn-primary-bg)';
            }}
          >
            {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--theme-text-tertiary)' }}>
          Csak meghívott adminisztrátorok jelentkezhetnek be
        </p>
      </div>
    </div>
  );
}

export default Login;
