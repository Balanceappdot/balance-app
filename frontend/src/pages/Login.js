import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react';
import Footer from '../components/Footer';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('email'); // 'email' or 'google'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.has_profile) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/onboarding', { replace: true });
          }
        }
      } catch (error) {
        // Not authenticated, stay on login
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore durante il login');
      }

      const data = await response.json();
      toast.success('Accesso effettuato!');
      
      if (data.has_profile) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + '/dashboard';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  if (checking) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BALANCE
          </h1>
          <p className="text-lg text-gray-400">Decisioni chiare, ogni giorno</p>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Accedi</h2>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'email'
                  ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                  : 'bg-gray-800/50 text-gray-400 border-2 border-gray-700 hover:border-gray-600'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setActiveTab('google')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'google'
                  ? 'bg-green-500/20 text-green-400 border-2 border-green-500'
                  : 'bg-gray-800/50 text-gray-400 border-2 border-gray-700 hover:border-gray-600'
              }`}
            >
              Google
            </button>
          </div>

          {activeTab === 'email' ? (
            <form onSubmit={handleEmailLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    data-testid="login-email"
                    className="input pl-12"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tua@email.it"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="password"
                    data-testid="login-password"
                    className="input pl-12"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="La tua password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                data-testid="login-email-btn"
                disabled={loading}
                className="w-full btn-primary py-4"
              >
                {loading ? 'Accesso in corso...' : 'Accedi con Email'}
              </button>

              <p className="text-center text-sm text-gray-400 mt-4">
                Non hai un account?{' '}
                <Link to="/register" className="text-green-400 hover:text-green-300 font-medium">
                  Registrati
                </Link>
              </p>
            </form>
          ) : (
            <div>
              <button
                data-testid="google-login-btn"
                onClick={handleGoogleLogin}
                className="w-full btn-primary flex items-center justify-center gap-3 py-4"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continua con Google
              </button>
              <p className="text-center text-gray-400 text-sm mt-4">
                Accesso rapido e sicuro con il tuo account Google
              </p>
            </div>
          )}

          <div className="disclaimer text-center mt-6">
            BALANCE è uno strumento di supporto decisionale basato su stime inserite dall'utente. Non è un sistema contabile né fiscale.
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Login;
