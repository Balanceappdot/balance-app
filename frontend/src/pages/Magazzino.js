import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Menu, X, LogOut, Plus, Trash2, Package, AlertTriangle, CheckCircle, Mail, Phone, Globe, Upload, FileSpreadsheet, Check, XCircle, Crown } from 'lucide-react';
import * as XLSX from 'xlsx';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Magazzino = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [materiali, setMateriali] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMateriale, setEditingMateriale] = useState(null);
  
  // Import Excel/CSV - Stati (funzione PRO)
  const [userTier, setUserTier] = useState('free');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState('upload'); // 'upload', 'preview', 'importing'
  const [importData, setImportData] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nome: '',
    quantita_disponibile: '',
    unita_misura: '',
    consumo_medio_giornaliero: '',
    giorni_consegna: '',
    costo_unitario: '',
    fornitore: '',
    fornitore_email: '',
    fornitore_telefono: '',
    fornitore_sito: ''
  });

  useEffect(() => {
    loadData();
    loadUserTier();
  }, []);

  const loadUserTier = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserTier(data.user?.subscription_tier || 'free');
      }
    } catch (error) {
      // Ignora errori - default a free
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${BACKEND_URL}/api/materiali`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setMateriali(data);
      }
    } catch (error) {
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/materiali`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          nome: formData.nome,
          quantita_disponibile: parseFloat(formData.quantita_disponibile),
          unita_misura: formData.unita_misura,
          consumo_medio_giornaliero: parseFloat(formData.consumo_medio_giornaliero) || 0,
          giorni_consegna: parseInt(formData.giorni_consegna) || 0,
          costo_unitario: parseFloat(formData.costo_unitario) || 0,
          fornitore: formData.fornitore || null,
          fornitore_email: formData.fornitore_email || null,
          fornitore_telefono: formData.fornitore_telefono || null,
          fornitore_sito: formData.fornitore_sito || null
        })
      });

      if (!response.ok) throw new Error('Errore durante il salvataggio');

      toast.success('Materiale aggiunto');
      setShowModal(false);
      setFormData({
        nome: '',
        quantita_disponibile: '',
        unita_misura: '',
        consumo_medio_giornaliero: '',
        giorni_consegna: '',
        costo_unitario: '',
        fornitore: '',
        fornitore_email: '',
        fornitore_telefono: '',
        fornitore_sito: ''
      });
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdateQuantita = async (materialeId, nuovaQuantita) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/materiali/${materialeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          quantita_disponibile: parseFloat(nuovaQuantita)
        })
      });

      if (!response.ok) throw new Error('Errore durante l\'aggiornamento');

      toast.success('Quantità aggiornata');
      loadData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questo materiale?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/materiali/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Errore durante l\'eliminazione');

      toast.success('Materiale eliminato');
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

  // ============== FUNZIONI IMPORTAZIONE EXCEL/CSV (PRO) ==============

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verifica estensione
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValid) {
      toast.error('Formato file non supportato. Usa .xlsx, .xls o .csv');
      return;
    }

    // Limite dimensione (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File troppo grande. Massimo 5MB.');
      return;
    }

    parseFile(file);
  };

  const parseFile = async (file) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Prendi il primo foglio
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Converti in JSON (prima riga = header)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      
      if (jsonData.length === 0) {
        toast.error('Il file è vuoto o non ha dati validi.');
        return;
      }

      // Valida e mappa i dati
      const { validRows, errors } = validateAndMapData(jsonData);
      
      setImportData(validRows);
      setImportErrors(errors);
      setImportStep('preview');
      
    } catch (error) {
      toast.error('Errore nella lettura del file. Verifica il formato.');
      console.error('Parse error:', error);
    }
  };

  const validateAndMapData = (rawData) => {
    const validRows = [];
    const errors = [];
    
    // Mapping colonne (case-insensitive, con varianti comuni)
    const columnMap = {
      nome: ['nome', 'name', 'descrizione', 'materiale', 'prodotto', 'articolo'],
      quantita_disponibile: ['quantita', 'quantità', 'qty', 'disponibile', 'quantita_disponibile'],
      unita_misura: ['unita', 'unità', 'um', 'unita_misura', 'unità_misura', 'unit'],
      consumo_medio_giornaliero: ['consumo', 'consumo_giornaliero', 'consumo_medio', 'consumo_medio_giornaliero'],
      giorni_consegna: ['giorni_consegna', 'consegna', 'lead_time', 'tempi_consegna'],
      costo_unitario: ['costo', 'prezzo', 'costo_unitario', 'prezzo_unitario'],
      fornitore: ['fornitore', 'supplier', 'vendor'],
      fornitore_email: ['email_fornitore', 'fornitore_email', 'email'],
      fornitore_telefono: ['telefono_fornitore', 'fornitore_telefono', 'telefono', 'tel'],
      fornitore_sito: ['sito_fornitore', 'fornitore_sito', 'sito', 'website', 'url']
    };

    // Trova la mappatura delle colonne
    const findColumn = (row, possibleNames) => {
      const keys = Object.keys(row).map(k => k.toLowerCase().trim());
      for (const name of possibleNames) {
        const idx = keys.findIndex(k => k === name || k.includes(name));
        if (idx !== -1) {
          return Object.keys(row)[idx];
        }
      }
      return null;
    };

    // Determina mappatura dalla prima riga
    const firstRow = rawData[0];
    const mapping = {};
    for (const [field, variants] of Object.entries(columnMap)) {
      mapping[field] = findColumn(firstRow, variants);
    }

    // Verifica campi obbligatori
    if (!mapping.nome) {
      errors.push({ row: 0, message: 'Colonna "Nome" non trovata. Puoi usare anche: Descrizione, Materiale o Prodotto.' });
      return { validRows, errors };
    }

    // Processa ogni riga
    rawData.forEach((row, index) => {
      const rowNum = index + 2; // +2 perché Excel parte da 1 e c'è l'header
      const rowErrors = [];
      
      // Estrai valori
      const nome = mapping.nome ? String(row[mapping.nome] || '').trim() : '';
      const quantitaRaw = mapping.quantita_disponibile ? row[mapping.quantita_disponibile] : '';
      const unita = mapping.unita_misura ? String(row[mapping.unita_misura] || 'pz').trim() : 'pz';
      const consumoRaw = mapping.consumo_medio_giornaliero ? row[mapping.consumo_medio_giornaliero] : 0;
      const giorniRaw = mapping.giorni_consegna ? row[mapping.giorni_consegna] : 0;
      const costoRaw = mapping.costo_unitario ? row[mapping.costo_unitario] : 0;
      const fornitore = mapping.fornitore ? String(row[mapping.fornitore] || '').trim() : '';
      const fornitoreEmail = mapping.fornitore_email ? String(row[mapping.fornitore_email] || '').trim() : '';
      const fornitoreTelefono = mapping.fornitore_telefono ? String(row[mapping.fornitore_telefono] || '').trim() : '';
      const fornitoreSito = mapping.fornitore_sito ? String(row[mapping.fornitore_sito] || '').trim() : '';

      // Validazioni
      if (!nome) {
        rowErrors.push('Nome mancante');
      }

      const quantita = parseFloat(quantitaRaw);
      if (isNaN(quantita) || quantita < 0) {
        rowErrors.push('Quantità non valida');
      }

      const consumo = parseFloat(consumoRaw) || 0;
      const giorni = parseInt(giorniRaw) || 0;
      const costo = parseFloat(costoRaw) || 0;

      // Se ci sono errori, segnala ma non bloccare
      if (rowErrors.length > 0) {
        errors.push({ row: rowNum, message: rowErrors.join(', ') });
      } else {
        // Riga valida
        validRows.push({
          nome,
          quantita_disponibile: quantita,
          unita_misura: unita || 'pz',
          consumo_medio_giornaliero: consumo >= 0 ? consumo : 0,
          giorni_consegna: giorni >= 0 ? giorni : 0,
          costo_unitario: costo >= 0 ? costo : 0,
          fornitore: fornitore || null,
          fornitore_email: fornitoreEmail || null,
          fornitore_telefono: fornitoreTelefono || null,
          fornitore_sito: fornitoreSito || null,
          _rowNum: rowNum // Per riferimento
        });
      }
    });

    return { validRows, errors };
  };

  const handleImportConfirm = async () => {
    if (importData.length === 0) {
      toast.error('Nessun dato valido da importare');
      return;
    }

    setImportStep('importing');
    setImportProgress(0);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < importData.length; i++) {
      const item = importData[i];
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/materiali`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            nome: item.nome,
            quantita_disponibile: item.quantita_disponibile,
            unita_misura: item.unita_misura,
            consumo_medio_giornaliero: item.consumo_medio_giornaliero,
            giorni_consegna: item.giorni_consegna,
            costo_unitario: item.costo_unitario,
            fornitore: item.fornitore,
            fornitore_email: item.fornitore_email,
            fornitore_telefono: item.fornitore_telefono,
            fornitore_sito: item.fornitore_sito
          })
        });

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }

      // Aggiorna progress
      setImportProgress(Math.round(((i + 1) / importData.length) * 100));
    }

    // Chiudi modal e ricarica
    setShowImportModal(false);
    resetImportState();
    
    if (successCount > 0) {
      toast.success(`Importati ${successCount} materiali con successo!`);
      loadData();
    }
    
    if (failCount > 0) {
      toast.error(`${failCount} materiali non importati (errori)`);
    }
  };

  const resetImportState = () => {
    setImportStep('upload');
    setImportData([]);
    setImportErrors([]);
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    resetImportState();
  };

  const getStatoInfo = (stato) => {
    if (stato === 'ok') {
      return {
        color: 'verde',
        icon: <CheckCircle size={24} className="text-green-400" />,
        title: 'Scorte Sufficienti',
        message: 'Tutto sotto controllo',
        class: 'stato-verde'
      };
    }
    if (stato === 'attenzione') {
      return {
        color: 'giallo',
        icon: <AlertTriangle size={24} className="text-yellow-400" />,
        title: 'In Esaurimento',
        message: 'Valuta un riordino presto',
        class: 'stato-giallo'
      };
    }
    return {
      color: 'rosso',
      icon: <AlertTriangle size={24} className="text-red-400" />,
      title: 'Rischio Fermo Operativo',
      message: 'Ordina ora per evitare interruzioni',
      class: 'stato-rosso'
    };
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
                className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                Costi
              </button>
              <button
                onClick={() => navigate('/magazzino')}
                className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-medium"
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
              <button onClick={() => { navigate('/costi'); setShowMenu(false); }} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">Costi</button>
              <button onClick={() => { navigate('/magazzino'); setShowMenu(false); }} className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 font-medium text-left">Magazzino</button>
              <button onClick={handleLogout} className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-2"><LogOut size={18} />Esci</button>
            </nav>
          </div>
        )}
      </header>

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Magazzino / Materiali</h1>
          <div className="flex items-center gap-3">
            {/* Pulsante Importa - Solo PRO */}
            {userTier === 'pro' ? (
              <button
                data-testid="import-materiali-btn"
                onClick={() => setShowImportModal(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Upload size={20} />
                Importa
              </button>
            ) : (
              <button
                data-testid="import-materiali-btn-locked"
                onClick={() => toast.info('Funzione disponibile solo per utenti PRO. Vai al profilo per effettuare l\'upgrade.')}
                className="btn-secondary flex items-center gap-2 opacity-60"
                title="Funzione PRO"
              >
                <Crown size={18} className="text-yellow-400" />
                <Upload size={20} />
                Importa
              </button>
            )}
            <button
              data-testid="add-materiale-btn"
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Aggiungi Materiale
            </button>
          </div>
        </div>

        {materiali.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {materiali.map((materiale) => {
              const statoInfo = getStatoInfo(materiale.stato);
              return (
                <div key={materiale.materiale_id} className={`card p-6 ${statoInfo.class}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-white/10">
                        <Package size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{materiale.nome}</h3>
                        <p className="text-sm text-gray-400">{materiale.unita_misura}</p>
                      </div>
                    </div>
                    {statoInfo.icon}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Disponibile:</span>
                      <span className="font-semibold text-lg">{materiale.quantita_disponibile} {materiale.unita_misura}</span>
                    </div>

                    {materiale.consumo_medio_giornaliero > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Consumo medio/giorno:</span>
                          <span className="font-medium">{materiale.consumo_medio_giornaliero} {materiale.unita_misura}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Giorni rimasti:</span>
                          <span className="font-semibold">{materiale.giorni_rimasti || 'N/A'}</span>
                        </div>
                      </>
                    )}

                    {materiale.giorni_consegna > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Giorni consegna:</span>
                        <span className="font-medium">{materiale.giorni_consegna} giorni</span>
                      </div>
                    )}

                    {materiale.costo_unitario > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Costo unitario:</span>
                        <span className="font-medium">€{materiale.costo_unitario.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Dati Fornitore (se presenti) */}
                  {materiale.fornitore && (
                    <div className="border-t border-gray-700 pt-3 mt-3 space-y-2">
                      <p className="text-sm text-gray-400 font-semibold">Fornitore</p>
                      <p className="font-medium">{materiale.fornitore}</p>
                      
                      {materiale.fornitore_email && (
                        <a
                          href={`mailto:${materiale.fornitore_email}`}
                          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Mail size={14} />
                          {materiale.fornitore_email}
                        </a>
                      )}
                      
                      {materiale.fornitore_telefono && (
                        <a
                          href={`tel:${materiale.fornitore_telefono}`}
                          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Phone size={14} />
                          {materiale.fornitore_telefono}
                        </a>
                      )}
                      
                      {materiale.fornitore_sito && (
                        <a
                          href={materiale.fornitore_sito}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Globe size={14} />
                          Sito web
                        </a>
                      )}
                    </div>
                  )}

                  {/* Semaforo Badge */}
                  <div className={`semaforo-badge ${statoInfo.color} mb-4`}>
                    <span className={`semaforo-icon ${statoInfo.color}`}></span>
                    <div className="flex-1">
                      <p className="font-bold">{statoInfo.title}</p>
                      <p className="text-xs opacity-80">{statoInfo.message}</p>
                    </div>
                  </div>

                  {/* Quantità Consigliata da Ordinare - Solo per GIALLO e ROSSO */}
                  {(materiale.stato === 'attenzione' || materiale.stato === 'ordina_ora') && 
                   materiale.consumo_medio_giornaliero > 0 && 
                   materiale.giorni_consegna > 0 && (() => {
                    // Calcolo inline: (consumo × (giorni_consegna + buffer_sicurezza)) - disponibile
                    const bufferSicurezza = 3;
                    const quantitaConsigliata = Math.ceil(
                      (materiale.consumo_medio_giornaliero * (materiale.giorni_consegna + bufferSicurezza)) - 
                      materiale.quantita_disponibile
                    );
                    
                    // Mostra solo se > 0
                    if (quantitaConsigliata > 0) {
                      return (
                        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-4">
                          <p className="text-sm text-blue-200">
                            <span className="font-semibold">📦 Quantità consigliata da ordinare: </span>
                            {quantitaConsigliata} {materiale.unita_misura}
                          </p>
                          {materiale.stato === 'ordina_ora' && materiale.fornitore && (
                            <p className="text-sm text-blue-200 mt-2">
                              Contatta il fornitore <span className="font-bold">{materiale.fornitore}</span> e ordina almeno {quantitaConsigliata} {materiale.unita_misura}.
                            </p>
                          )}
                          <p className="text-xs text-blue-300/70 mt-1">
                            Calcolo: fabbisogno per {materiale.giorni_consegna + bufferSicurezza} giorni (consegna + 3 giorni buffer)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {materiale.stato === 'ordina_ora' && materiale.costo_unitario > 0 && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                      <p className="text-sm">
                        <span className="font-semibold">Impatto stimato fermo: </span>
                        €{(materiale.consumo_medio_giornaliero * materiale.giorni_consegna * materiale.costo_unitario).toFixed(2)}
                      </p>
                    </div>
                  )}

                  {/* Bottone Contatta Fornitore - Solo ROSSO con contatti */}
                  {materiale.stato === 'ordina_ora' && materiale.fornitore && 
                   (materiale.fornitore_email || materiale.fornitore_telefono || materiale.fornitore_sito) && (
                    <button
                      onClick={() => {
                        // Priorità: email > telefono > sito
                        if (materiale.fornitore_email) {
                          window.location.href = `mailto:${materiale.fornitore_email}?subject=Ordine ${materiale.nome}`;
                        } else if (materiale.fornitore_telefono) {
                          window.location.href = `tel:${materiale.fornitore_telefono}`;
                        } else if (materiale.fornitore_sito) {
                          window.open(materiale.fornitore_sito, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="btn-primary w-full mb-3 flex items-center justify-center gap-2"
                    >
                      <Phone size={18} />
                      Contatta {materiale.fornitore}
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const nuovaQuantita = prompt('Inserisci nuova quantità:', materiale.quantita_disponibile);
                        if (nuovaQuantita !== null) {
                          handleUpdateQuantita(materiale.materiale_id, nuovaQuantita);
                        }
                      }}
                      className="btn-secondary flex-1"
                    >
                      Aggiorna Quantità
                    </button>
                    <button
                      onClick={() => handleDelete(materiale.materiale_id)}
                      className="p-3 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Package size={64} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">Nessun materiale in magazzino.</p>
            <p className="text-gray-500 text-sm mt-2">Aggiungi il tuo primo materiale per iniziare il monitoraggio.</p>
          </div>
        )}
      </div>

      {/* Modal Aggiungi Materiale */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Aggiungi Materiale</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nome Materiale</label>
                <input
                  type="text"
                  data-testid="materiale-nome"
                  className="input"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Es: Cemento, Vernice, ecc."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Quantità Disponibile</label>
                <input
                  type="number"
                  data-testid="materiale-quantita"
                  className="input"
                  value={formData.quantita_disponibile}
                  onChange={(e) => setFormData({ ...formData, quantita_disponibile: e.target.value })}
                  placeholder="100"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Unità di Misura</label>
                <input
                  type="text"
                  data-testid="materiale-unita"
                  className="input"
                  value={formData.unita_misura}
                  onChange={(e) => setFormData({ ...formData, unita_misura: e.target.value })}
                  placeholder="kg, litri, pezzi, ecc."
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Consumo Medio Giornaliero (opzionale)</label>
                <input
                  type="number"
                  data-testid="materiale-consumo"
                  className="input"
                  value={formData.consumo_medio_giornaliero}
                  onChange={(e) => setFormData({ ...formData, consumo_medio_giornaliero: e.target.value })}
                  placeholder="10"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Giorni Consegna (opzionale)</label>
                <input
                  type="number"
                  data-testid="materiale-giorni-consegna"
                  className="input"
                  value={formData.giorni_consegna}
                  onChange={(e) => setFormData({ ...formData, giorni_consegna: e.target.value })}
                  placeholder="7"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Costo Unitario € (opzionale)</label>
                <input
                  type="number"
                  data-testid="materiale-costo"
                  className="input"
                  value={formData.costo_unitario}
                  onChange={(e) => setFormData({ ...formData, costo_unitario: e.target.value })}
                  placeholder="5.50"
                  step="0.01"
                />
              </div>

              {/* Separatore Fornitore */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                <h4 className="text-lg font-semibold mb-3">Dati Fornitore (opzionale)</h4>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Nome Fornitore (opzionale)</label>
                <input
                  type="text"
                  data-testid="materiale-fornitore"
                  className="input"
                  value={formData.fornitore}
                  onChange={(e) => setFormData({ ...formData, fornitore: e.target.value })}
                  placeholder="Es: Ferramenta Rossi"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email Fornitore (opzionale)</label>
                <input
                  type="email"
                  data-testid="materiale-fornitore-email"
                  className="input"
                  value={formData.fornitore_email}
                  onChange={(e) => setFormData({ ...formData, fornitore_email: e.target.value })}
                  placeholder="ordini@fornitore.it"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Telefono Fornitore (opzionale)</label>
                <input
                  type="tel"
                  data-testid="materiale-fornitore-telefono"
                  className="input"
                  value={formData.fornitore_telefono}
                  onChange={(e) => setFormData({ ...formData, fornitore_telefono: e.target.value })}
                  placeholder="+39 123 456789"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Sito Fornitore (opzionale)</label>
                <input
                  type="url"
                  data-testid="materiale-fornitore-sito"
                  className="input"
                  value={formData.fornitore_sito}
                  onChange={(e) => setFormData({ ...formData, fornitore_sito: e.target.value })}
                  placeholder="https://www.fornitore.it"
                />
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annulla</button>
                <button type="submit" data-testid="materiale-submit" className="btn-primary flex-1">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Importa Excel/CSV (PRO) */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <FileSpreadsheet size={24} className="text-green-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Importa Magazzino</h3>
                  <p className="text-sm text-gray-400">Da file Excel o CSV</p>
                </div>
              </div>
              <button
                onClick={handleCloseImportModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Step: Upload */}
            {importStep === 'upload' && (
              <div>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-green-500/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    data-testid="import-file-input"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload size={48} className="mx-auto mb-4 text-gray-500" />
                    <p className="text-lg font-medium mb-2">Clicca per selezionare un file</p>
                    <p className="text-sm text-gray-400">Formati supportati: .xlsx, .xls, .csv (max 5MB)</p>
                  </label>
                </div>

                {/* Istruzioni formato */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="font-semibold text-blue-200 mb-2">📋 Formato file consigliato:</p>
                  <p className="text-sm text-blue-200/80 mb-2">
                    La prima riga deve contenere i nomi delle colonne. Colonne riconosciute:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-200/70">
                    <div><strong>Nome</strong> (obbligatorio)</div>
                    <div><strong>Quantità</strong> (obbligatorio)</div>
                    <div>Unità (es: kg, pz)</div>
                    <div>Consumo giornaliero</div>
                    <div>Giorni consegna</div>
                    <div>Costo unitario</div>
                    <div>Fornitore</div>
                    <div>Email fornitore</div>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Preview */}
            {importStep === 'preview' && (
              <div>
                {/* Riepilogo */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Check size={20} className="text-green-400" />
                      <span className="font-semibold text-green-200">Righe valide</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{importData.length}</p>
                  </div>
                  {importErrors.length > 0 && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle size={20} className="text-red-400" />
                        <span className="font-semibold text-red-200">Errori</span>
                      </div>
                      <p className="text-2xl font-bold text-red-400">{importErrors.length}</p>
                    </div>
                  )}
                </div>

                {/* Errori dettagliati */}
                {importErrors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg max-h-32 overflow-y-auto">
                    <p className="font-semibold text-red-200 mb-2">Righe con errori (non verranno importate):</p>
                    {importErrors.slice(0, 10).map((err, idx) => (
                      <p key={idx} className="text-sm text-red-200/80">
                        Riga {err.row}: {err.message}
                      </p>
                    ))}
                    {importErrors.length > 10 && (
                      <p className="text-sm text-red-200/60 mt-1">...e altri {importErrors.length - 10} errori</p>
                    )}
                  </div>
                )}

                {/* Anteprima dati */}
                {importData.length > 0 && (
                  <div className="mb-6">
                    <p className="font-semibold mb-3">Anteprima (prime 5 righe):</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-2 px-2">Nome</th>
                            <th className="text-left py-2 px-2">Qtà</th>
                            <th className="text-left py-2 px-2">Unità</th>
                            <th className="text-left py-2 px-2">Consumo/g</th>
                            <th className="text-left py-2 px-2">Fornitore</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importData.slice(0, 5).map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-800">
                              <td className="py-2 px-2 font-medium">{item.nome}</td>
                              <td className="py-2 px-2">{item.quantita_disponibile}</td>
                              <td className="py-2 px-2">{item.unita_misura}</td>
                              <td className="py-2 px-2">{item.consumo_medio_giornaliero || '-'}</td>
                              <td className="py-2 px-2 text-gray-400">{item.fornitore || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {importData.length > 5 && (
                      <p className="text-sm text-gray-400 mt-2">...e altri {importData.length - 5} materiali</p>
                    )}
                  </div>
                )}

                {/* Azioni */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      resetImportState();
                    }}
                    className="btn-secondary flex-1"
                  >
                    Indietro
                  </button>
                  <button
                    onClick={handleImportConfirm}
                    disabled={importData.length === 0}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    data-testid="import-confirm-btn"
                  >
                    Importa {importData.length} materiali
                  </button>
                </div>
              </div>
            )}

            {/* Step: Importing */}
            {importStep === 'importing' && (
              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-lg font-medium">{importProgress}%</p>
                </div>
                <p className="text-gray-400">Importazione in corso... Non chiudere questa finestra.</p>
              </div>
            )}

          </div>
        </div>
      )}

      <div className="footer">
        <p>Creatore / Fondatore – Gabriel S. Cardinale</p>
      </div>
    </div>
  );
};

export default Magazzino;
