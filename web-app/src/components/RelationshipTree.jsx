import { useMemo } from 'react';
import { User, Target } from 'lucide-react';

/**
 * RelationshipTree - Composant pour afficher visuellement le lien de parenté entre deux membres
 * Affiche un organigramme avec l'ancêtre commun en haut et deux branches descendantes
 */
export const RelationshipTree = ({ relationshipData }) => {
  // Vérifier que nous avons les données nécessaires
  if (!relationshipData || !relationshipData.lienTrouve) {
    return null;
  }

  const { cheminMembre1, cheminMembre2, ancetreCommun } = relationshipData;

  // Inverser les chemins pour afficher de l'ancêtre vers les descendants
  const chemin1Reverse = useMemo(() => {
    return cheminMembre1?.parcours ? [...cheminMembre1.parcours].reverse() : [];
  }, [cheminMembre1]);

  const chemin2Reverse = useMemo(() => {
    return cheminMembre2?.parcours ? [...cheminMembre2.parcours].reverse() : [];
  }, [cheminMembre2]);

  // Composant pour afficher un membre
  const PersonNode = ({ membre, isAncetre = false }) => {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-white rounded-xl p-4 border-4 border-slate-300 shadow-lg transition-all hover:shadow-2xl hover:scale-105 ${
          isAncetre ? 'bg-gradient-to-br from-green-50 to-green-100 ring-4 ring-green-400 ring-offset-2' : ''
        }`}
        style={{
          minWidth: '160px',
          maxWidth: '160px'
        }}
      >
        {/* Icône sexe */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white mb-2 bg-gradient-to-br from-slate-600 to-slate-800">
          <User size={20} />
        </div>

        {/* Nom */}
        <div className="text-center">
          <p className="font-bold text-slate-800 text-sm leading-tight">
            {membre.prenom} {membre.nom}
          </p>
          <p className="text-xs text-slate-500 mt-1">{membre.numero_identification}</p>
        </div>

        {/* Badge ancêtre */}
        {isAncetre && (
          <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Target size={12} />
            Ancêtre
          </div>
        )}
      </div>
    );
  };

  // Ligne verticale
  const VerticalLine = ({ height = 40 }) => (
    <div
      className="bg-gradient-to-b from-primary to-primary-dark"
      style={{ width: '4px', height: `${height}px` }}
    />
  );

  // Ligne horizontale
  const HorizontalLine = ({ width = 100 }) => (
    <div
      className="bg-gradient-to-r from-primary to-primary-dark"
      style={{ height: '4px', width: `${width}px` }}
    />
  );

  return (
    <div className="overflow-x-auto py-8">
      <div className="min-w-max flex flex-col items-center px-8">
        {/* Ancêtre commun en haut */}
        <div className="flex flex-col items-center">
          <PersonNode membre={chemin1Reverse[0]} isAncetre={true} />
        </div>

        {/* Si les chemins ont plus d'un membre (il y a des descendants) */}
        {(chemin1Reverse.length > 1 || chemin2Reverse.length > 1) && (
          <>
            {/* Ligne depuis l'ancêtre */}
            <div className="flex flex-col items-center">
              <VerticalLine height={40} />
            </div>

            {/* Point de division - ligne horizontale */}
            <div className="flex items-center justify-center">
              <HorizontalLine width={300} />
            </div>

            {/* Deux branches */}
            <div className="flex justify-between items-start gap-16 w-full" style={{ minWidth: '600px' }}>
              {/* Branche 1 (gauche) */}
              <div className="flex-1 flex flex-col items-center">
                {chemin1Reverse.slice(1).map((membre, index) => (
                  <div key={`chemin1-${membre.id}-${index}`} className="flex flex-col items-center">
                    <VerticalLine height={40} />
                    <PersonNode membre={membre} />
                  </div>
                ))}
              </div>

              {/* Branche 2 (droite) */}
              <div className="flex-1 flex flex-col items-center">
                {chemin2Reverse.slice(1).map((membre, index) => (
                  <div key={`chemin2-${membre.id}-${index}`} className="flex flex-col items-center">
                    <VerticalLine height={40} />
                    <PersonNode membre={membre} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RelationshipTree;
