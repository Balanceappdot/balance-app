import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Menu, X, LogOut, Plus, Trash2, TrendingDown } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Costi = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [costiFissi, setCostiFissi] = useState([]);
  const [costiVariabili, setCostiVariabili] = useState([]);
  const [entrate, setEntrate] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showModalFisso, setShowModalFisso] = useState(false);
  const [showModalVariabile, setShowModalVariabile] = useState(false);
  const [showModalEntrata, setShowModalEntrata] = useState(false);
  const [dataSelezionata, setDataSelezionata] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [formFisso, setFormFisso] = useState({
    descrizione: '',
    importo_mensile: ''
  });

  const [formVariabile, setFormVariabile] = useState({
    descrizione: '',
    importo: '',
    data: new Date().toISOString().split('T')[0]
  });

  const [formEntrata, setFormEntrata] = useState({
    descrizione: '',
    importo: '',
    data: new Date().toISOString().split('T')[0],
    tipo: 'registrata'
  });

  useEffect(() => {
    loadData();
  }, [dataSelezionata]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [fissiRes, variabiliRes, entrateRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/costi/fissi`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/costi/variabili?data=${dataSelezionata}`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/entrate?data=${dataSelezionata}`, { credentials: 'include' })
      ]);

      if (fissiRes.ok) setCostiFissi(await fissiRes.json());
      if (variabiliRes.ok) setCostiVariabili(await variabiliRes.json());
      if (entrateRes.ok) setEntrate(await entrateRes.json());
    } catch (error) {
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCostoFisso = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/costi/fissi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          descrizione: formFisso.descrizione,
          importo_mensile: parseFloat(formFisso.importo_mensile)
        })
      });

      if (!response.ok) throw new Error('Errore durante il salvataggio');

      toast.success('Costo fisso aggiunto');
      setShowModalFisso(false);
      setFormFisso({ descrizione: '', importo_mensile: '' });
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddCostoVariabile = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/costi/variabili`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          descrizione: formVariabile.descrizione,
          importo: parseFloat(formVariabile.importo),
          data: formVariabile.data
        })
      });

      if (!response.ok) throw new Error('Errore durante il salvataggio');

      toast.success('Costo variabile aggiunto');
      setShowModalVariabile(false);
      setFormVariabile({ descrizione: '', importo: '', data: dataSelezionata });
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddEntrata = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/entrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          descrizione: formEntrata.descrizione,
          importo: parseFloat(formEntrata.importo),
          data: formEntrata.data,
          tipo: formEntrata.tipo
        })
      });

      if (!response.ok) throw new Error('Errore durante il salvataggio');

      toast.success('Entrata aggiunta');
      setShowModalEntrata(false);
      setFormEntrata({ descrizione: '', importo: '', data: dataSelezionata, tipo: 'registrata' });
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteCostoFisso = async (id) => {
    if (!confirm('Eliminare questo costo fisso?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/costi/fissi/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Errore durante l\'eliminazione');

      toast.success('Costo eliminato');
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteCostoVariabile = async (id) => {
    if (!confirm('Eliminare questo costo?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/costi/variabili/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Errore durante l\'eliminazione');

      toast.success('Costo eliminato');
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteEntrata = async (id) => {
    if (!confirm('Eliminare questa entrata?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/entrate/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Errore durante l\'eliminazione');

      toast.success('Entrata eliminata');
      loadData();
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
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors md:hidden"
            >
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>

            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => navigate('/costi')}
                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-medium"
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
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                Esci
              </button>
            </nav>
          </div>
        </div>

        {showMenu && (
          <div className="md:hidden border-t border-white/10 p-4">
            <nav className="flex flex-col gap-2">
              <button onClick={() => { navigate('/dashboard'); setShowMenu(false); }} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">Dashboard</button>
              <button onClick={() => { navigate('/costi'); setShowMenu(false); }} className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-medium text-left">Costi</button>
              <button onClick={() => { navigate('/magazzino'); setShowMenu(false); }} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">Magazzino</button>
              <button onClick={handleLogout} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"><LogOut size={18} />Esci</button>
            </nav>
          </div>
        )}
      </header>

      <div className="container py-8">
        <h1 className="text-4xl font-bold mb-8">Gestione Costi ed Entrate</h1>

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

        {/* Entrate */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Entrate del {new Date(dataSelezionata).toLocaleDateString('it-IT')}</h2>
            <button
              data-testid="add-entrata-btn"
              onClick={() => setShowModalEntrata(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Aggiungi Entrata
            </button>
          </div>

          {entrate.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {entrate.map((entrata) => (
                <div key={entrata.entrata_id} className="card p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{entrata.descrizione}</h3>
                    <p className="text-sm text-gray-400">{entrata.tipo === 'registrata' ? 'Registrata' : 'Stimata'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-bold text-green-400">€{entrata.importo.toFixed(2)}</p>
                    <button
                      onClick={() => handleDeleteEntrata(entrata.entrata_id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-gray-400">Nessuna entrata registrata per questa data.</p>
            </div>
          )}
        </div>

        {/* Costi Variabili */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Costi Variabili del {new Date(dataSelezionata).toLocaleDateString('it-IT')}</h2>
            <button
              data-testid="add-costo-variabile-btn"
              onClick={() => setShowModalVariabile(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Aggiungi Costo
            </button>
          </div>

          {costiVariabili.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {costiVariabili.map((costo) => (
                <div key={costo.costo_id} className="card p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{costo.descrizione}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-bold text-orange-400">€{costo.importo.toFixed(2)}</p>
                    <button
                      onClick={() => handleDeleteCostoVariabile(costo.costo_id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-gray-400">Nessun costo variabile per questa data.</p>
            </div>
          )}
        </div>

        {/* Costi Fissi */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Costi Fissi Mensili</h2>
            <button
              data-testid="add-costo-fisso-btn"
              onClick={() => setShowModalFisso(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Aggiungi Costo Fisso
            </button>
          </div>

          {costiFissi.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {costiFissi.map((costo) => (
                <div key={costo.costo_id} className="card p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{costo.descrizione}</h3>
                    <p className="text-sm text-gray-400">Quota giornaliera: €{costo.quota_giornaliera.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-bold text-red-400">€{costo.importo_mensile.toFixed(2)}/mese</p>
                    <button
                      onClick={() => handleDeleteCostoFisso(costo.costo_id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-gray-400">Nessun costo fisso configurato.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Costo Fisso */}
      {showModalFisso && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Aggiungi Costo Fisso</h3>
            <form onSubmit={handleAddCostoFisso}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Descrizione</label>
                <input
                  type="text"
                  data-testid="fisso-descrizione"
                  className="input"
                  value={formFisso.descrizione}
                  onChange={(e) => setFormFisso({ ...formFisso, descrizione: e.target.value })}
                  placeholder="Es: Affitto locale"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Importo Mensile (€)</label>
                <input
                  type="number"
                  data-testid="fisso-importo"
                  className="input"
                  value={formFisso.importo_mensile}
                  onChange={(e) => setFormFisso({ ...formFisso, importo_mensile: e.target.value })}
                  placeholder="1000"
                  step="0.01"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModalFisso(false)} className="btn-secondary flex-1">Annulla</button>
                <button type="submit" data-testid="fisso-submit" className="btn-primary flex-1">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Costo Variabile */}
      {showModalVariabile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Aggiungi Costo Variabile</h3>
            <form onSubmit={handleAddCostoVariabile}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Descrizione</label>
                <input
                  type="text"
                  data-testid="variabile-descrizione"
                  className="input"
                  value={formVariabile.descrizione}
                  onChange={(e) => setFormVariabile({ ...formVariabile, descrizione: e.target.value })}
                  placeholder="Es: Materiali cantiere"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Importo (€)</label>
                <input
                  type="number"
                  data-testid="variabile-importo"
                  className="input"
                  value={formVariabile.importo}
                  onChange={(e) => setFormVariabile({ ...formVariabile, importo: e.target.value })}
                  placeholder="150"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Data</label>
                <input
                  type="date"
                  data-testid="variabile-data"
                  className="input"
                  value={formVariabile.data}
                  onChange={(e) => setFormVariabile({ ...formVariabile, data: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModalVariabile(false)} className="btn-secondary flex-1">Annulla</button>
                <button type="submit" data-testid="variabile-submit" className="btn-primary flex-1">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Entrata */}
      {showModalEntrata && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Aggiungi Entrata</h3>
            <form onSubmit={handleAddEntrata}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Descrizione</label>
                <input
                  type="text"
                  data-testid="entrata-descrizione"
                  className="input"
                  value={formEntrata.descrizione}
                  onChange={(e) => setFormEntrata({ ...formEntrata, descrizione: e.target.value })}
                  placeholder="Es: Vendita prodotto"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Importo (€)</label>
                <input
                  type="number"
                  data-testid="entrata-importo"
                  className="input"
                  value={formEntrata.importo}
                  onChange={(e) => setFormEntrata({ ...formEntrata, importo: e.target.value })}
                  placeholder="500"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Data</label>
                <input
                  type="date"
                  data-testid="entrata-data"
                  className="input"
                  value={formEntrata.data}
                  onChange={(e) => setFormEntrata({ ...formEntrata, data: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select
                  data-testid="entrata-tipo"
                  className="input"
                  value={formEntrata.tipo}
                  onChange={(e) => setFormEntrata({ ...formEntrata, tipo: e.target.value })}
                >
                  <option value="registrata">Registrata</option>
                  <option value="stimata">Stimata</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModalEntrata(false)} className="btn-secondary flex-1">Annulla</button>
                <button type="submit" data-testid="entrata-submit" className="btn-primary flex-1">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="footer">
        <p>Creatore / Fondatore – Gabriel S. Cardinale</p>
      </div>
    </div>
  );
};

export default Costi;
