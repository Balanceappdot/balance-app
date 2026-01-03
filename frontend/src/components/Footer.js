import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <div className="footer">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
        <button
          onClick={() => navigate('/privacy')}
          className="text-gray-400 hover:text-green-400 transition-colors text-sm underline"
        >
          Privacy e Sicurezza
        </button>
        <span className="hidden sm:inline text-gray-600">•</span>
        <p className="text-gray-600 text-sm">
          Creatore / Fondatore – Gabriel S. Cardinale
        </p>
      </div>
    </div>
  );
};

export default Footer;
