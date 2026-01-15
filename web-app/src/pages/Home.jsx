import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, AdBanner } from '../components';
import { Users, GitBranch, Calendar, UserCheck, BarChart3, Search, Building2, Sparkles, Zap, Home as HomeIcon, ArrowRight } from 'lucide-react';
import { getAdsForPage } from '../config/ads';

export const Home = () => {
  const navigate = useNavigate();
  const { famille } = useAuth();

  // Récupérer les publicités pour la page d'accueil
  const { mainBanner, autoPlayInterval } = getAdsForPage('home');

  const quickActions = [
    {
      title: 'Membres',
      description: 'Parcourir tous les membres de la famille',
      icon: Users,
      path: '/membres',
      gradient: 'from-blue-600 to-blue-700',
      hoverGradient: 'from-blue-700 to-blue-800',
    },
    {
      title: 'Arbre Généalogique',
      description: 'Visualiser votre arbre familial',
      icon: GitBranch,
      path: '/arbre',
      gradient: 'from-emerald-600 to-emerald-700',
      hoverGradient: 'from-emerald-700 to-emerald-800',
    },
    {
      title: 'Cérémonies',
      description: 'Gérer les événements familiaux',
      icon: Calendar,
      path: '/ceremonies',
      gradient: 'from-rose-600 to-rose-700',
      hoverGradient: 'from-rose-700 to-rose-800',
    },
  ];

  const features = [
    { icon: UserCheck, title: 'Gestion familiale', desc: 'Gérez tous les membres de votre famille' },
    { icon: BarChart3, title: 'Statistiques', desc: 'Visualisez les données de votre famille' },
    { icon: Search, title: 'Recherche avancée', desc: 'Trouvez rapidement n\'importe quel membre' },
    { icon: Building2, title: 'Musée familial', desc: 'Conservez les objets historiques' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="mb-6">
            <HomeIcon className="w-16 h-16 text-blue-400" strokeWidth={2} />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Bienvenue dans Baïla Généa !
          </h1>
          <p className="text-xl text-slate-200 mb-6 flex items-center gap-2">
            {famille ? (
              <>
                <Users className="w-6 h-6" />
                <span>Famille {famille.nom}</span>
              </>
            ) : (
              'Explorez votre histoire familiale et découvrez votre patrimoine'
            )}
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/membres')}
              className="bg-white text-slate-800 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <span>Explorer</span>
              <ArrowRight className="w-5 h-5" strokeWidth={2} />
            </button>
            <button
              onClick={() => navigate('/arbre')}
              className="bg-white/10 backdrop-blur-md text-white border-2 border-white/30 px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
            >
              <GitBranch className="w-5 h-5" strokeWidth={2} />
              <span>Voir l'arbre</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <Zap className="w-7 h-7 text-amber-500" strokeWidth={2} />
          <span>Actions rapides</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className={`bg-gradient-to-br ${action.gradient} text-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 text-left group transform hover:scale-105 relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="relative z-10">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-12 h-12" strokeWidth={2} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{action.title}</h3>
                  <p className="text-white/90">{action.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Découvrir</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bannière Publicitaire */}
      {mainBanner && mainBanner.length > 0 && (
        <div>
          <AdBanner ads={mainBanner} autoPlayInterval={autoPlayInterval} />
        </div>
      )}

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-indigo-500" strokeWidth={2} />
          <span>Fonctionnalités</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-slate-100 hover:border-blue-200 group"
              >
                <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-10 h-10 text-blue-600" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 via-blue-50/50 to-white border-2 border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <Sparkles className="w-36 h-36 text-blue-300" strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="mb-4">
              <Sparkles className="w-10 h-10 text-blue-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Guide de démarrage</h3>
            <p className="text-slate-600 mb-4">
              Utilisez le menu de navigation à gauche pour explorer toutes les fonctionnalités de l'application.
            </p>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-3 text-slate-700">
                <Users className="w-5 h-5 mt-0.5 text-blue-600" strokeWidth={2} />
                <span className="text-sm">Gérer les membres de votre famille</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <GitBranch className="w-5 h-5 mt-0.5 text-emerald-600" strokeWidth={2} />
                <span className="text-sm">Construire votre arbre généalogique</span>
              </li>
              <li className="flex items-start gap-3 text-slate-700">
                <Calendar className="w-5 h-5 mt-0.5 text-rose-600" strokeWidth={2} />
                <span className="text-sm">Organiser des cérémonies et événements</span>
              </li>
            </ul>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 via-emerald-50/50 to-white border-2 border-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5">
            <Search className="w-36 h-36 text-emerald-300" strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="mb-4">
              <Search className="w-10 h-10 text-emerald-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Recherche rapide</h3>
            <p className="text-slate-600 mb-4">
              Utilisez la barre de recherche en haut pour trouver rapidement un membre de la famille.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-slate-700 bg-white rounded-lg p-3 border border-slate-200">
                <UserCheck className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                <span>Par nom ou prénom</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 bg-white rounded-lg p-3 border border-slate-200">
                <BarChart3 className="w-5 h-5 text-emerald-600" strokeWidth={2} />
                <span>Par numéro d'identification</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
