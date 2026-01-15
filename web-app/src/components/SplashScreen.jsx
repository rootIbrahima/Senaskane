import { useEffect, useState } from 'react';

export const SplashScreen = ({ onComplete }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        onComplete();
      }, 300);
    }, 1500); // Réduit à 1.5 secondes pour performance

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 transition-opacity duration-500 ${!show ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center px-8 max-w-md">
        {/* Logo animé */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-500/20 rounded-full animate-pulse"></div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <img
                src="/splash.jpg"
                alt="Baïla Généa"
                className="w-32 h-32 object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Nom de l'application */}
        <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
          Baïla Généa
        </h1>
        <p className="text-xl text-blue-200 mb-8 animate-fade-in-delay">
          Votre patrimoine familial
        </p>

        {/* Message officiel */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 animate-fade-in-delay-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            <span className="text-white font-semibold text-sm uppercase tracking-wide">
              Initiative Officielle
            </span>
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          </div>
          <p className="text-white/90 text-sm leading-relaxed">
            Plateforme offerte par le<br />
            <span className="font-bold text-lg text-white">
              Ministère de la Famille<br />
              et des Solidarités
            </span>
          </p>
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-blue-200 text-xs italic">
              "Préserver notre histoire, construire notre avenir"
            </p>
          </div>
        </div>

        {/* Loader */}
        <div className="mt-8">
          <div className="w-48 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-loading"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loading {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-delay {
          opacity: 0;
          animation: fade-in 0.6s ease-out 0.3s forwards;
        }

        .animate-fade-in-delay-2 {
          opacity: 0;
          animation: fade-in 0.6s ease-out 0.6s forwards;
        }

        .animate-loading {
          animation: loading 1.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};
