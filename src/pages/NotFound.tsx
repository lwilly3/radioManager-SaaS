
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Home, Search } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <Radio className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Page introuvable</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Oups ! La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary flex items-center justify-center gap-2"
          >
            <Home className="h-5 w-5" />
            Retour à l'accueil
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary flex items-center justify-center gap-2"
          >
            <Search className="h-5 w-5" />
            Page précédente
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
