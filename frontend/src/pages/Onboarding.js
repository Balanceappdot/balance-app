import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    tipo_attivita: '',
    settore: '',
    obiettivi: []
  });

  const tipiAttivita = [
    'Negozio',
    'Artigiano / Ditta',
    'Impresa edile / industriale',
    'Libero professionista'
  ];

  const settori = [
    'Alimentare',
    'Abbigliamento',
    'Edilizia',
    'Metalmeccanica',
    'Servizi',
    'Elettronica',
    'Arredamento',
    'Automotive',
    'Bellezza e benessere',
    'Consulenza',
    'Altro'
  ];

  const obiettiviOptions = [
    'Controllo entrate',
    'Controllo costi',
    'Magazzino / materiali',
    'Avvisi intelligenti'
  ];

  const handleNext = () => {
    if (currentStep === 1 && !formData.tipo_attivita) {
      toast.error('Seleziona un tipo di attività');
      return;
    }
    if (currentStep === 2 && !formData.settore) {
      toast.error('Seleziona un settore');
      return;
    }
    if (currentStep === 3 && formData.obiettivi.length === 0) {
      toast.error('Seleziona almeno un obiettivo');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleObiettivo = (obiettivo) => {
    if (formData.obiettivi.includes(obiettivo)) {
      setFormData({
        ...formData,
        obiettivi: formData.obiettivi.filter(o => o !== obiettivo)
      });
    } else {
      setFormData({
        ...formData,
        obiettivi: [...formData.obiettivi, obiettivo]
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Errore durante il salvataggio');
      }

      toast.success('Profilo completato!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error('Errore: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BALANCE
          </h1>
          <p className="text-gray-400">Configura il tuo profilo</p>
        </div>

        <div className="card p-8">
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    step === currentStep
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white'
                      : step < currentStep
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-700'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <h2 className="text-2xl font-semibold mb-6">Tipo di attività</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tipiAttivita.map(tipo => (
                <button
                  key={tipo}
                  data-testid={`tipo-${tipo.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setFormData({ ...formData, tipo_attivita: tipo })}
                  className={`p-4 rounded-xl text-left font-medium transition-all ${
                    formData.tipo_attivita === tipo
                      ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                      : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <h2 className="text-2xl font-semibold mb-6">Settore</h2>
            <select
              data-testid="settore-select"
              value={formData.settore}
              onChange={(e) => setFormData({ ...formData, settore: e.target.value })}
              className="input"
            >
              <option value="">Seleziona un settore</option>
              {settori.map(settore => (
                <option key={settore} value={settore}>{settore}</option>
              ))}
            </select>
          </div>

          <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
            <h2 className="text-2xl font-semibold mb-6">Obiettivi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {obiettiviOptions.map(obiettivo => (
                <button
                  key={obiettivo}
                  data-testid={`obiettivo-${obiettivo.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => toggleObiettivo(obiettivo)}
                  className={`p-4 rounded-xl text-left font-medium transition-all ${
                    formData.obiettivi.includes(obiettivo)
                      ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                      : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {obiettivo}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-8 gap-4">
            <button
              data-testid="back-btn"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="btn-secondary flex-1"
              style={{ opacity: currentStep === 1 ? 0.5 : 1, cursor: currentStep === 1 ? 'not-allowed' : 'pointer' }}
            >
              Indietro
            </button>
            <button
              data-testid="next-btn"
              onClick={handleNext}
              className="btn-primary flex-1"
            >
              {currentStep === 3 ? 'Completa' : 'Avanti'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
