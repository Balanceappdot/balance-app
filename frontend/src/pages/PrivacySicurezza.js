import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, Database, FileText, AlertCircle, Mail } from 'lucide-react';

const PrivacySicurezza = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      <header className="border-b border-white/10 backdrop-blur-lg bg-black/30">
        <div className="container flex items-center justify-between py-4">
          <h1 
            className="text-2xl font-bold cursor-pointer" 
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            onClick={() => navigate('/dashboard')}
          >
            BALANCE
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            Torna Indietro
          </button>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 rounded-xl bg-green-500/20">
            <Shield size={48} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">Privacy e Sicurezza</h1>
            <p className="text-gray-400 text-lg">Come proteggiamo i tuoi dati</p>
          </div>
        </div>

        {/* Messaggio principale */}
        <div className="card p-6 mb-8 stato-verde">
          <div className="flex items-start gap-4">
            <Lock size={32} className="text-green-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-3">I tuoi dati sono al sicuro</h2>
              <p className="text-lg text-gray-200 leading-relaxed">
                🔒 I tuoi dati sono privati e li usiamo solo per far funzionare l'app.
                Le password sono protette e non possiamo leggerle.
                Non vendiamo e non condividiamo mai i tuoi dati con nessuno.
              </p>
            </div>
          </div>
        </div>

        {/* Sicurezza Password */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Lock size={28} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Come proteggiamo la tua password</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                La tua password è protetta in modo sicuro:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Viene trasformata in un codice impossibile da decifrare</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Non viene mai salvata come l'hai scritta tu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Nessuno può leggerla, nemmeno noi</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sessioni e Accesso */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Eye size={28} className="text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Chi può vedere i tuoi dati</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Solo tu puoi vedere le tue informazioni:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Vedi solo i tuoi dati, non quelli di altri</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>L'accesso è protetto quando fai login</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Altri utenti non possono vedere le tue cose</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Dati e Privacy */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-xl bg-green-500/20">
              <Database size={28} className="text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Cosa facciamo con i tuoi dati</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                I dati che inserisci (entrate, costi, magazzino):
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Sono privati e rimangono tuoi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Li vedi solo tu quando entri nell'app</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Li usiamo solo per farti vedere il tuo utile e i tuoi insight</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Intelligenza Artificiale */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-xl bg-yellow-500/20">
              <FileText size={28} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">L'Intelligenza Artificiale e i tuoi dati</h3>
              <p className="text-gray-300 leading-relaxed mb-3">
                Gli insight che ti diamo con l'AI:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Guardano solo i tuoi numeri</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Non li mostriamo a nessun altro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Non li usiamo per aiutare altri utenti</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span>Ti danno solo consigli operativi, non consulenza fiscale</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Garanzie */}
        <div className="card p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Le Nostre Garanzie</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl flex-shrink-0">✗</span>
              <span className="font-semibold">Nessuna vendita di dati</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl flex-shrink-0">✗</span>
              <span className="font-semibold">Nessuna condivisione con terze parti</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl flex-shrink-0">✗</span>
              <span className="font-semibold">Nessun utilizzo per advertising</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl flex-shrink-0">✗</span>
              <span className="font-semibold">Nessun accesso non autorizzato</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Legale */}
        <div className="card p-6 bg-yellow-500/10 border-yellow-500/30">
          <div className="flex items-start gap-4">
            <AlertCircle size={28} className="text-yellow-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-2 text-yellow-400">Cosa NON è BALANCE</h3>
              <p className="text-gray-200 leading-relaxed">
                BALANCE ti aiuta a prendere decisioni guardando i tuoi numeri ogni giorno.
                Non è un programma di contabilità e non sostituisce il commercialista.
                Gli insight dell'AI sono suggerimenti pratici, non consulenza fiscale o legale.
                Per tasse e contabilità, rivolgiti sempre al tuo commercialista.
              </p>
            </div>
          </div>
        </div>

        {/* Contatti */}
        <div className="card p-6 text-center mt-8">
          <p className="text-gray-300 text-lg mb-4 leading-relaxed">
            Se hai dubbi o non ti è chiaro qualcosa sulla privacy o sui dati, puoi scriverci direttamente via email.
          </p>
          <a
            href="mailto:cardinalegabrielsanto@gmail.com?subject=Domanda%20su%20privacy%20o%20dati%20%E2%80%93%20BALANCE"
            className="btn-primary inline-flex items-center justify-center gap-2 py-3 px-6"
          >
            <Mail size={20} />
            Scrivici via email
          </a>
        </div>
      </div>

      <div className="footer">
        <p>Creatore / Fondatore – Gabriel S. Cardinale</p>
      </div>
    </div>
  );
};

export default PrivacySicurezza;
