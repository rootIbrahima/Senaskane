import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components';

export const Login = () => {
  const [mode, setMode] = useState('code'); // 'code' ou 'admin'
  const [code, setCode] = useState('');
  const [login, setLogin] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithCode, loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (mode === 'code') {
        result = await loginWithCode(code);
      } else {
        result = await loginAdmin(login, motDePasse);
      }

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche - Info et branding (visible sur desktop uniquement) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 p-12 flex-col justify-between text-white relative overflow-hidden">
        {/* Éléments décoratifs en arrière-plan */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Logo et nom */}
          <div className="mb-12">
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="Baïla Généa"
                className="w-20 h-20 object-contain"
              />
            </div>
            <h1 className="text-5xl font-bold mb-2">Baïla Généa</h1>
            <p className="text-blue-200 text-lg">Votre patrimoine familial</p>
          </div>

          {/* Message officiel */}
          <div className="bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-white font-bold text-lg uppercase tracking-wide">
                Initiative Officielle
              </span>
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
            </div>
            <p className="text-white/90 text-center leading-relaxed mb-2">
              Plateforme offerte par le
            </p>
            <p className="text-white font-bold text-2xl text-center leading-tight">
              Ministère de la Famille<br />
              et des Solidarités
            </p>
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-blue-200 text-center italic">
                "Préserver notre histoire, construire notre avenir"
              </p>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 rounded-lg mt-1 w-10 h-10 flex items-center justify-center flex-shrink-0">
                <div className="w-1 h-6 bg-blue-300 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Arbre Généalogique Interactif</h3>
                <p className="text-blue-200 text-sm">Visualisez et explorez votre lignée familiale</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 rounded-lg mt-1 w-10 h-10 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 border-2 border-blue-300 rounded"></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Gestion des Membres</h3>
                <p className="text-blue-200 text-sm">Ajoutez et gérez les informations de votre famille</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 rounded-lg mt-1 w-10 h-10 flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-5 border-2 border-blue-300 rounded-t-lg border-b-0"></div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Sécurisé et Privé</h3>
                <p className="text-blue-200 text-sm">Vos données familiales sont protégées</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-blue-200 text-sm">
          <p>&copy; 2024 Ministère de la Famille et des Solidarités</p>
          <p className="mt-1">République du Sénégal</p>
        </div>
      </div>

      {/* Panneau droit - Formulaire de connexion */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Badge ministère (mobile uniquement) */}
          <div className="lg:hidden mb-8 text-center">
            <div className="mb-4">
              <img
                src="/logo.png"
                alt="Baïla Généa"
                className="w-16 h-16 object-contain mx-auto"
              />
            </div>
            <div className="inline-flex items-center gap-2 bg-blue-900 text-white px-5 py-2 rounded-full text-sm mb-4">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
              <span className="font-semibold">Initiative Officielle</span>
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
            </div>
            <h1 className="text-3xl font-bold text-blue-900 mb-1">Baïla Généa</h1>
            <p className="text-slate-600 text-sm">
              Plateforme du Ministère de la Famille
            </p>
          </div>

          {/* Carte de connexion */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Bienvenue
              </h2>
              <p className="text-slate-600">
                Connectez-vous pour accéder à votre espace
              </p>
            </div>

            {/* Toggle mode */}
            <div className="flex mb-6 bg-slate-100 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => setMode('code')}
                className={`flex-1 py-3 rounded-lg transition-all duration-200 font-medium ${
                  mode === 'code'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Code Famille
              </button>
              <button
                type="button"
                onClick={() => setMode('admin')}
                className={`flex-1 py-3 rounded-lg transition-all duration-200 font-medium ${
                  mode === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'code' ? (
                <Input
                  label="Code d'accès famille"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC123"
                  required
                />
              ) : (
                <>
                  <Input
                    label="Identifiant"
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="Votre identifiant"
                    required
                  />
                  <Input
                    label="Mot de passe"
                    type="password"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 bg-red-200 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-red-700 text-xs font-bold">!</span>
                  </div>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
                    <span className="text-lg">→</span>
                  </>
                )}
              </Button>
            </form>

            {/* Liens additionnels */}
            <div className="mt-6 space-y-3">
              {mode === 'code' && (
                <div className="text-center text-sm">
                  <Link
                    to="/login-code"
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Interface détaillée avec code d'accès
                  </Link>
                </div>
              )}

              <div className="text-center text-sm text-slate-600">
                Vous n'avez pas encore de compte ?{' '}
                <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Créer un compte
                </Link>
              </div>
            </div>
          </div>

          {/* Badge sécurité */}
          <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <div className="w-3 h-4 border-2 border-slate-400 rounded-t-md border-b-0"></div>
            <span>Connexion sécurisée et cryptée</span>
          </div>
        </div>
      </div>
    </div>
  );
};
