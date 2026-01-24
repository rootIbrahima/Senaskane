import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Award, Gift, Sparkles } from 'lucide-react';

export const Sponsor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Configuration des sponsors (à personnaliser plus tard)
  const sponsorConfig = {
    1: {
      title: 'Sponsor Or',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-300',
      icon: Star,
      message: 'Espace réservé au Sponsor Or. Contactez-nous pour devenir partenaire privilégié de Baïla Généa.',
    },
    2: {
      title: 'Sponsor Émeraude',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-300',
      icon: Award,
      message: 'Espace réservé au Sponsor Émeraude. Contactez-nous pour devenir partenaire privilégié de Baïla Généa.',
    },
    3: {
      title: 'Sponsor Saphir',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-300',
      icon: Gift,
      message: 'Espace réservé au Sponsor Saphir. Contactez-nous pour devenir partenaire privilégié de Baïla Généa.',
    },
    4: {
      title: 'Sponsor Améthyste',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-300',
      icon: Sparkles,
      message: 'Espace réservé au Sponsor Améthyste. Contactez-nous pour devenir partenaire privilégié de Baïla Généa.',
    },
  };

  const sponsor = sponsorConfig[id] || sponsorConfig[1];
  const IconComponent = sponsor.icon;

  return (
    <div className="min-h-[70vh] flex flex-col">
      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Retour
      </button>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center">
        <div className={`max-w-2xl w-full bg-gradient-to-br ${sponsor.bgColor} rounded-3xl shadow-2xl overflow-hidden border-2 ${sponsor.borderColor}`}>
          {/* Header */}
          <div className={`bg-gradient-to-r ${sponsor.color} p-8 text-white text-center`}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl mb-4">
              <IconComponent className="w-10 h-10" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold mb-2">{sponsor.title}</h1>
            <p className="text-white/80">Partenaire de Baïla Généa</p>
          </div>

          {/* Corps */}
          <div className="p-8 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                {sponsor.message}
              </p>

              <div className="border-t border-slate-200 pt-6 mt-6">
                <p className="text-sm text-slate-500 mb-4">
                  Intéressé par cet espace publicitaire ?
                </p>
                <a
                  href="mailto:contact@bailagenea.com"
                  className={`inline-flex items-center gap-2 bg-gradient-to-r ${sponsor.color} text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                >
                  Nous contacter
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
