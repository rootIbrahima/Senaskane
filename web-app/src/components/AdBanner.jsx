import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const AdBanner = ({ ads, autoPlayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoPlayInterval || isPaused || ads.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlayInterval, isPaused, ads.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleAdClick = (ad) => {
    if (ad.url) {
      window.open(ad.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!ads || ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  return (
    <div
      className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden shadow-lg border border-slate-200 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Badge Sponsorisé */}
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          SPONSORISÉ
        </span>
      </div>

      {/* Contenu de la publicité */}
      <div
        onClick={() => handleAdClick(currentAd)}
        className={`relative ${currentAd.url ? 'cursor-pointer' : ''}`}
      >
        {currentAd.image ? (
          <img
            src={currentAd.image}
            alt={currentAd.title}
            className="w-full h-48 md:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-48 md:h-64 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <div className="text-center p-8">
              <h3 className="text-2xl font-bold text-blue-900 mb-2">{currentAd.title}</h3>
              {currentAd.description && (
                <p className="text-blue-700">{currentAd.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Overlay avec texte si image présente */}
        {currentAd.image && (currentAd.title || currentAd.description) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
            <div className="p-6 text-white w-full">
              {currentAd.title && (
                <h3 className="text-xl md:text-2xl font-bold mb-2">{currentAd.title}</h3>
              )}
              {currentAd.description && (
                <p className="text-sm md:text-base opacity-90">{currentAd.description}</p>
              )}
              {currentAd.url && (
                <button className="mt-3 px-4 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors text-sm">
                  En savoir plus →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Boutons de navigation */}
      {ads.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Publicité précédente"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Publicité suivante"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicateurs de slides */}
      {ads.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Aller à la publicité ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Info "Pourquoi cette pub?" */}
      <button
        className="absolute top-4 right-4 text-xs text-slate-600 bg-white/90 hover:bg-white px-3 py-1 rounded-full font-semibold transition-colors shadow-sm z-10"
        onClick={(e) => {
          e.stopPropagation();
          alert('Ces publicités nous aident à maintenir la plateforme gratuite et à améliorer nos services.');
        }}
      >
        Pourquoi cette pub?
      </button>
    </div>
  );
};

// Composant pour bannière horizontale compacte
export const AdBannerCompact = ({ ad }) => {
  if (!ad) return null;

  const handleClick = () => {
    if (ad.url) {
      window.open(ad.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-all ${
        ad.url ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
          SPONSOR
        </span>
        <button
          className="ml-auto text-xs text-slate-500 hover:text-slate-700"
          onClick={(e) => {
            e.stopPropagation();
            alert('Ces publicités nous aident à maintenir la plateforme gratuite.');
          }}
        >
          Pourquoi?
        </button>
      </div>

      <div className="flex gap-4 items-center">
        {ad.logo && (
          <img
            src={ad.logo}
            alt={ad.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <h4 className="font-bold text-slate-800 mb-1">{ad.title}</h4>
          {ad.description && (
            <p className="text-sm text-slate-600 line-clamp-2">{ad.description}</p>
          )}
        </div>
        {ad.url && (
          <div className="text-blue-600 font-semibold hover:text-blue-700 text-sm whitespace-nowrap">
            Découvrir →
          </div>
        )}
      </div>
    </div>
  );
};
