import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { rechercheAPI, UPLOADS_URL } from '../services/api';
import { Search, X, User, Cake, Briefcase, Loader2, CheckCircle } from 'lucide-react';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recherche avec debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        setLoading(true);
        const response = await rechercheAPI.parNom({ recherche: query });
        setResults(response.data.data.membres || []);
        setShowResults(true);
      } catch (error) {
        console.error('Erreur recherche:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleSelectMembre = (membreId) => {
    navigate(`/membres/${membreId}`);
    setQuery('');
    setShowResults(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const formatAge = (dateNaissance) => {
    if (!dateNaissance) return '';
    const age = new Date().getFullYear() - new Date(dateNaissance).getFullYear();
    return `${age} ans`;
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
          <Search className="w-5 h-5" strokeWidth={2} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un membre..."
          className="w-full pl-11 pr-11 py-2.5 bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-white text-slate-800 placeholder-slate-400 shadow-lg transition-all duration-300"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 hover:scale-110 transition-all duration-200"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-white border-2 border-slate-100 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-50 backdrop-blur-lg">
          {loading ? (
            <div className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" strokeWidth={2} />
              </div>
              <div className="text-slate-600 font-medium">Recherche en cours...</div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <Search className="w-10 h-10 text-slate-400" strokeWidth={2} />
              </div>
              <div className="text-slate-600">
                Aucun membre trouvé pour <span className="font-semibold">"{query}"</span>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <div className="px-4 py-2 text-xs text-slate-600 font-semibold bg-slate-50 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" strokeWidth={2} />
                <span>{results.length} résultat{results.length > 1 ? 's' : ''}</span>
              </div>
              {results.map((membre) => (
                <button
                  key={membre.id}
                  onClick={() => handleSelectMembre(membre.id)}
                  className="w-full px-4 py-3.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 flex items-center gap-3 transition-all duration-200 border-b border-slate-100 last:border-0 group"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200 bg-gradient-to-br from-slate-600 to-slate-800">
                    {membre.photo ? (
                      <img
                        src={`${UPLOADS_URL}/uploads/photos/${membre.photo}`}
                        alt={`${membre.prenom} ${membre.nom}`}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white" strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {membre.prenom} {membre.nom}
                    </div>
                    <div className="text-xs text-slate-600 flex gap-2 items-center mt-1 flex-wrap">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-full font-medium">{membre.numero_identification}</span>
                      {membre.date_naissance && (
                        <span className="flex items-center gap-1">
                          <Cake className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>{formatAge(membre.date_naissance)}</span>
                        </span>
                      )}
                      {membre.profession && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" strokeWidth={2} />
                          <span className="truncate max-w-[100px]">{membre.profession}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
