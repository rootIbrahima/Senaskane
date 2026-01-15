import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Key, ArrowLeft, Info } from 'lucide-react';

export const LoginWithCode = () => {
  const [codeAcces, setCodeAcces] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginWithCode } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!codeAcces.trim()) {
      setError('Veuillez entrer le code d\'accès');
      return;
    }

    if (codeAcces.trim().length !== 8) {
      setError('Le code d\'accès doit contenir 8 caractères');
      return;
    }

    setLoading(true);

    try {
      const result = await loginWithCode(codeAcces.trim().toUpperCase());

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Code d\'accès invalide. Veuillez vérifier et réessayer.');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 8) {
      setCodeAcces(value);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full mb-4 shadow-lg">
              <Key className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Accès Famille</h1>
            <p className="text-slate-600">
              Entrez le code d'accès de votre famille pour vous connecter
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm font-semibold">{error}</p>
              </div>
            )}

            {/* Code Input */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2">
                Code d'accès
              </label>
              <input
                type="text"
                value={codeAcces}
                onChange={handleCodeChange}
                placeholder="ABCD1234"
                className="w-full px-4 py-4 text-2xl font-bold tracking-widest text-center border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 uppercase"
                maxLength={8}
                autoFocus
              />
              <p className="text-sm text-slate-500 text-center mt-2">
                8 caractères (lettres et chiffres)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || codeAcces.length !== 8}
              className="w-full bg-gradient-to-r from-slate-600 to-slate-700 text-white py-4 rounded-xl font-bold text-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600">
              <p className="font-semibold mb-1">Où trouver mon code ?</p>
              <p>
                Le code d'accès vous a été partagé par un membre de votre famille.
                Si vous ne l'avez pas, contactez l'administrateur de votre famille.
              </p>
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Vous n'avez pas de famille ?{' '}
              <Link to="/register" className="text-slate-700 font-bold hover:text-slate-900 hover:underline">
                Créer une famille
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-slate-600">
          <p>
            Avec le code d'accès, vous pouvez consulter toutes les informations
            de votre famille sans créer de compte personnel.
          </p>
        </div>
      </div>
    </div>
  );
};
