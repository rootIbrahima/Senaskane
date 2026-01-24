import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Sponsor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-slate-800 p-6 sm:p-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-xl mb-4">
              <span className="text-3xl sm:text-4xl font-bold">{id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Sponsor {id}</h1>
            <p className="text-slate-300">Partenaire de Baïla Généa</p>
          </div>

          {/* Corps */}
          <div className="p-6 sm:p-8 text-center">
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed mb-6">
              Espace réservé au Sponsor {id}. Contactez-nous pour devenir partenaire privilégié de Baïla Généa.
            </p>

            <div className="border-t border-slate-200 pt-6 mt-6">
              <p className="text-sm text-slate-500 mb-4">
                Intéressé par cet espace publicitaire ?
              </p>
              <a
                href="mailto:contact@bailagenea.com"
                className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
