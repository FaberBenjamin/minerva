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
    <div className="min-h-screen bg-minerva-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-3xl font-bold text-minerva-gray-900">Minerva</h1>
          <p className="text-minerva-gray-600 mt-2">Önkéntes Toborzó Rendszer</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-minerva-gray-700 mb-2">
              Email cím
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-minerva-gray-300 rounded-md focus:ring-2 focus:ring-minerva-gray-600 focus:border-transparent outline-none"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-minerva-gray-700 mb-2">
              Jelszó
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-minerva-gray-300 rounded-md focus:ring-2 focus:ring-minerva-gray-600 focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-minerva-gray-900 text-white py-2 px-4 rounded-md hover:bg-minerva-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-minerva-gray-600">
          Csak meghívott adminisztrátorok jelentkezhetnek be
        </p>
      </div>
    </div>
  );
}

export default Login;
