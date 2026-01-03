import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Menu, X, LogOut, Bell, TrendingUp, DollarSign, AlertTriangle, Crown } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [notifiche, setNotifiche] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [dataSelezionata, setDataSelezionata] = useState(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    loadData();
  }, [dataSelezionata]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [userRes, dashRes, insightsRes, notificheRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/auth/me`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/dashboard?data=${dataSelezionata}`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/insights?data=${dataSelezionata}`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/notifiche`, { credentials: 'include' })
      ]);

      if (!userRes.ok) {
        navigate('/login');
        return;
      }

      const userData = await userRes.json();
      setUser(userData.user);

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setDashboardData(dashData);
      }

      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        setInsights(insightsData);
      }

      if (notificheRes.ok) {
        const notificheData = await notificheRes.json();
        setNotifiche(notificheData.filter(n => !n.letta));
      }
    } catch (error) {
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/login');
    } catch (error) {
      toast.error('Errore durante il logout');
    }
  };

  const getStatoColor = (stato) => {
    if (stato === 'positivo') return 'text-success';
    if (stato === 'attenzione') return 'text-warning';
    return 'text-danger';
  };

  const getStatoBackground = (stato) => {
    if (stato === 'positivo') return 'bg-success';
    if (stato === 'attenzione') return 'bg-warning';
    return 'bg-danger';
  };

  const getStatoText = (stato) => {
    if (stato === 'positivo') return 'Positivo';
    if (stato === 'attenzione') return 'Attenzione';
    return 'Critico';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-lg bg-black/30 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BALANCE
          </h1>
          
          <div className="flex items-center gap-4">
            <button
              data-testid="notifications-btn"
              className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => navigate('/notifiche')}
            >
              <Bell size={20} />
              {notifiche.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifiche.length}
                </span>
              )}
            </button>
            
            <button
              data-testid="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors md:hidden"
            >
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>

            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/costi')}
                className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                Costi
              </button>
              <button
                onClick={() => navigate('/magazzino')}
                className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                Magazzino
              </button>
              <button
                onClick={() => navigate('/profilo')}
                className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                Profilo
              </button>
              <button
                data-testid="logout-btn"
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                Esci
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile menu */}
        {showMenu && (
          <div className="md:hidden border-t border-white/10 p-4">
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => { navigate('/dashboard'); setShowMenu(false); }}
                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-medium text-left"
              >
                Dashboard
              </button>
              <button
                onClick={() => { navigate('/costi'); setShowMenu(false); }}
                className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                Costi
              </button>
              <button
                onClick={() => { navigate('/magazzino'); setShowMenu(false); }}
                className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                Magazzino
              </button>
              <button
                onClick={() => { navigate('/profilo'); setShowMenu(false); }}
                className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                Profilo
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                Esci
              </button>
            </nav>
          </div>
        )}
      </header>

      <div className="container py-8">
        {/* Disclaimer */}
        <div className="disclaimer mb-6">
          BALANCE è uno strumento di supporto decisionale basato su stime inserite dall'utente. Non è un sistema contabile né fiscale.
        </div>

        {/* Date selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Data selezionata</label>
          <input
            type="date"
            data-testid="date-selector"
            value={dataSelezionata}
            onChange={(e) => setDataSelezionata(e.target.value)}
            className="input max-w-xs"
          />
        </div>

        {/* Main stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Utile */}
            <div className={`card ${getStatoBackground(dashboardData.stato)} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Utile Oggi</h3>
                <TrendingUp size={24} className={getStatoColor(dashboardData.stato)} />
              </div>
              <p className={`text-4xl font-bold ${getStatoColor(dashboardData.stato)}`} data-testid="utile-value">
                €{dashboardData.utile.toFixed(2)}
              </p>
              <p className={`text-sm mt-2 ${getStatoColor(dashboardData.stato)}`}>
                Stato: {getStatoText(dashboardData.stato)}
              </p>
            </div>

            {/* Entrate */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Entrate</h3>
                <DollarSign size={24} className="text-green-400" />
              </div>
              <p className="text-4xl font-bold text-green-400" data-testid="entrate-value">
                €{dashboardData.entrate.toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Registrate oggi
              </p>
            </div>

            {/* Costi */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Costi</h3>
                <AlertTriangle size={24} className="text-orange-400" />
              </div>
              <p className="text-4xl font-bold text-orange-400" data-testid="costi-value">
                €{dashboardData.costi.toFixed(2)}
              </p>
              <div className="text-sm text-gray-400 mt-2">
                <p>Variabili: €{dashboardData.costi_variabili.toFixed(2)}</p>
                <p>Quota fissi: €{dashboardData.quota_fissi.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Insights AI */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Insight AI</h2>
              <p className="text-gray-400">
                {user?.subscription_tier === 'free' 
                  ? '1 insight giornaliero - Passa a PRO per analisi complete' 
                  : 'Analisi complete e suggerimenti operativi'}
              </p>
            </div>
            {user?.subscription_tier === 'free' && (
              <button
                onClick={() => navigate('/profilo')}
                className="btn-primary py-3 px-6 flex items-center gap-2"
              >
                <Crown size={20} />
                Passa a PRO
              </button>
            )}
          </div>

          {insights.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {insights.map((insight) => {
                const getInsightIcon = (tipo) => {
                  if (tipo === 'positivo') return <TrendingUp size={28} className="text-green-400" />;
                  if (tipo === 'rischio') return <AlertTriangle size={28} className="text-yellow-400" />;
                  if (tipo === 'azione') return <DollarSign size={28} className="text-blue-400" />;
                  return <TrendingUp size={28} className="text-purple-400" />;
                };

                return (
                  <div 
                    key={insight.insight_id} 
                    className={`insight-card ${insight.tipo}`}
                    data-testid={`insight-${insight.tipo}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-white/5">
                        {getInsightIcon(insight.tipo)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold capitalize">
                            {insight.tipo === 'positivo' && '✨ Punto Positivo'}
                            {insight.tipo === 'rischio' && '⚠️ Attenzione'}
                            {insight.tipo === 'azione' && '💡 Suggerimento'}
                            {insight.tipo === 'generale' && '📊 Insight Generale'}
                          </h3>
                          {user?.subscription_tier === 'pro' && (
                            <span className="badge-pro text-xs">PRO</span>
                          )}
                        </div>
                        <p className="text-gray-200 leading-relaxed text-lg">{insight.contenuto}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <TrendingUp size={64} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg mb-4">
                Nessun insight disponibile per oggi.
              </p>
              <p className="text-gray-500 text-sm">
                Aggiungi entrate e costi per ricevere suggerimenti personalizzati dall'AI.
              </p>
            </div>
          )}

          {user?.subscription_tier === 'free' && insights.length > 0 && (
            <div className="card p-6 mt-4 stato-giallo">
              <div className="flex items-start gap-4">
                <Crown size={32} className="text-yellow-400" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Sblocca Insight AI Completi</h3>
                  <p className="text-gray-300 mb-4">
                    Con PRO ricevi 3 insight giornalieri: punto positivo, rischio da monitorare e azione concreta da intraprendere.
                  </p>
                  <button
                    onClick={() => navigate('/profilo')}
                    className="btn-primary py-2 px-6"
                  >
                    Scopri PRO
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="footer">
        <p>Creatore / Fondatore – Gabriel S. Cardinale</p>
      </div>
    </div>
  );
};

export default Dashboard;
