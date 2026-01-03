import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Menu, X, LogOut, User, Building2, Briefcase, Crown, Bell, BellOff, Shield } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Profilo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/profile`, {
        credentials: 'include'
      });

      if (!response.ok) {
        navigate('/login');
        return;
      }

      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      toast.error('Errore nel caricamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    if (!profileData) return;

    const newPrefs = {
      ...profileData.notification_preferences,
      [key]: !profileData.notification_preferences[key]
    };

    setSaving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/profile/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newPrefs)
      });

      if (!response.ok) throw new Error('Errore durante il salvataggio');

      setProfileData({
        ...profileData,
        notification_preferences: newPrefs
      });
      toast.success('Preferenze aggiornate');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/subscription/upgrade`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) throw new Error(`Errore durante l'upgrade`);

      toast.success('Upgrade a PRO completato!');
      loadProfile();
    } catch (error) {
      toast.error(error.message);
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  const isPro = profileData.user.subscription_tier === 'pro';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      <header className="border-b border-white/10 backdrop-blur-lg bg-black/30 sticky top-0 z-50">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BALANCE
          </h1>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors md:hidden"
            >
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>

            <nav className="hidden md:flex items-center gap-2">
              <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">Dashboard</button>
              <button onClick={() => navigate('/costi')} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">Costi</button>
              <button onClick={() => navigate('/magazzino')} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">Magazzino</button>
              <button onClick={() => navigate('/profilo')} className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-medium">Profilo</button>
              <button onClick={handleLogout} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2">
                <LogOut size={18} />Esci
              </button>
            </nav>
          </div>
        </div>

        {showMenu && (
          <div className="md:hidden border-t border-white/10 p-4">
            <nav className="flex flex-col gap-2">
              <button onClick={() => { navigate('/dashboard'); setShowMenu(false); }} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">Dashboard</button>
              <button onClick={() => { navigate('/costi'); setShowMenu(false); }} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">Costi</button>
              <button onClick={() => { navigate('/magazzino'); setShowMenu(false); }} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">Magazzino</button>
              <button onClick={() => { navigate('/profilo'); setShowMenu(false); }} className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-medium text-left">Profilo</button>
              <button onClick={handleLogout} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"><LogOut size={18} />Esci</button>
            </nav>
          </div>
        )}
      </header>

      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Il Mio Profilo</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <User size={28} />
                Informazioni Personali
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Nome</label>
                  <p className="text-xl font-semibold">{profileData.user.name}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-xl font-semibold">{profileData.user.email}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Briefcase size={28} />
                Informazioni Attività
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Tipo Attività</label>
                  <p className="text-xl font-semibold">{profileData.profile.tipo_attivita}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Settore</label>
                  <p className="text-xl font-semibold">{profileData.profile.settore}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Obiettivi</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileData.profile.obiettivi.map((ob, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                        {ob}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Bell size={28} />
                Notifiche
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-semibold">Notifiche Push</p>
                    <p className="text-sm text-gray-400">Ricevi notifiche sul dispositivo</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={profileData.notification_preferences.notifiche_push_enabled}
                      onChange={() => handleNotificationToggle('notifiche_push_enabled')}
                      disabled={saving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-semibold">Magazzino Critico</p>
                    <p className="text-sm text-gray-400">Avvisi quando i materiali sono in esaurimento</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={profileData.notification_preferences.notifiche_magazzino}
                      onChange={() => handleNotificationToggle('notifiche_magazzino')}
                      disabled={saving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-semibold">Stato Operativo</p>
                    <p className="text-sm text-gray-400">Notifiche su stato Attenzione/Critico</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={profileData.notification_preferences.notifiche_stato}
                      onChange={() => handleNotificationToggle('notifiche_stato')}
                      disabled={saving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-semibold">Giornata Positiva</p>
                    <p className="text-sm text-gray-400">Celebra i tuoi successi</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={profileData.notification_preferences.notifiche_giornata_positiva}
                      onChange={() => handleNotificationToggle('notifiche_giornata_positiva')}
                      disabled={saving}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="card p-6 mt-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <Shield size={28} />
                Privacy e Sicurezza
              </h2>
              <p className="text-gray-300 mb-4 leading-relaxed">
                I tuoi dati sono privati e protetti. Le password sono crittografate e BALANCE non condivide mai i dati con terze parti.
              </p>
              <button
                onClick={() => navigate('/privacy')}
                className="btn-secondary w-full"
              >
                Scopri come proteggiamo i tuoi dati
              </button>
            </div>
          </div>

          <div>
            <div className={`card p-6 ${isPro ? 'stato-verde' : ''}`}>
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Crown size={48} className={isPro ? 'text-yellow-400' : 'text-gray-400'} />
                </div>

                <h2 className="text-2xl font-bold mb-2">
                  {isPro ? (
                    <span className="badge-pro">PRO</span>
                  ) : (
                    <span className="badge-free">FREE</span>
                  )}
                </h2>

                <p className="text-gray-400 mb-6">
                  {isPro ? 'Hai accesso completo a tutte le funzionalità' : 'Passa a PRO per funzionalità avanzate'}
                </p>

                {!isPro && (
                  <>
                    <div className="text-left mb-6 space-y-3">
                      <h3 className="font-semibold mb-3">Con PRO ottieni:</h3>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-sm">3 Insight AI completi giornalieri</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-sm">Analisi predittive 7 giorni</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-sm">Notifiche push avanzate</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-sm">Impatto economico materiali</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span className="text-sm">Comparazioni temporali</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-3xl font-bold mb-1">€39<span className="text-lg text-gray-400">/mese</span></p>
                      <p className="text-sm text-gray-400">o €390/anno (risparmi 2 mesi)</p>
                    </div>

                    <button
                      onClick={handleUpgrade}
                      className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                    >
                      <Crown size={20} />
                      Passa a PRO
                    </button>
                  </>
                )}

                {isPro && (
                  <p className="text-green-400 font-medium">
                    Grazie per il tuo supporto!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>Creatore / Fondatore – Gabriel S. Cardinale</p>
      </div>
    </div>
  );
};

export default Profilo;
