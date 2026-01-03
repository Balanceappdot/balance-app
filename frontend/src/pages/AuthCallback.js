import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error('Autenticazione fallita');
          navigate('/login', { replace: true });
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ session_id: sessionId })
        });

        if (!response.ok) {
          toast.error('Autenticazione fallita');
          navigate('/login', { replace: true });
          return;
        }

        const data = await response.json();
        
        if (data.has_profile) {
          navigate('/dashboard', { replace: true, state: { user: data.user } });
        } else {
          navigate('/onboarding', { replace: true, state: { user: data.user } });
        }
      } catch (error) {
        toast.error('Errore durante l\'autenticazione');
        navigate('/login', { replace: true });
      }
    };

    processSession();
  }, [navigate, location]);

  return (
    <div className="loading">
      <div className="spinner"></div>
    </div>
  );
};

export default AuthCallback;
