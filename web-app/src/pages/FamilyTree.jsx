import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { arbreAPI } from '../services/api';
import { Loading, Button } from '../components';
import { useAuth } from '../contexts/AuthContext';

// Composant pour une carte de membre dans l'arbre
const MemberCard = ({ membre, onClick, color = 'slate' }) => {
  const colorClasses = {
    slate: 'border-slate-300 from-slate-600 to-slate-800',
    blue: 'border-blue-400 from-blue-500 to-blue-700',
    emerald: 'border-emerald-400 from-emerald-500 to-emerald-700',
    purple: 'border-purple-400 from-purple-500 to-purple-700',
    amber: 'border-amber-400 from-amber-500 to-amber-700',
    rose: 'border-rose-400 from-rose-500 to-rose-700',
  };
  const classes = colorClasses[color] || colorClasses.slate;
  const [borderColor, gradientClasses] = [classes.split(' ')[0], classes.split(' ').slice(1).join(' ')];

  return (
    <div className="relative flex flex-col items-center flex-shrink-0">
      <div
        onClick={() => onClick(membre.id)}
        className={`bg-white rounded-lg shadow-md p-2 sm:p-3 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 ${borderColor} min-w-[90px] sm:min-w-[110px] max-w-[130px] relative z-10`}
      >
        <div className="flex flex-col items-center text-center">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-lg text-white mb-1 sm:mb-1.5 shadow-sm bg-gradient-to-br ${gradientClasses}`}>
            {membre.sexe === 'M' ? '♂' : '♀'}
          </div>
          <h3 className="font-bold text-slate-900 text-[10px] sm:text-xs mb-0.5 break-words text-center leading-tight">
            {membre.prenom}
          </h3>
          <p className="text-[9px] sm:text-[10px] text-slate-600 break-words text-center leading-tight">
            {membre.nom}
          </p>
          {membre.date_naissance && (
            <p className="text-[9px] sm:text-[10px] text-blue-700 font-semibold mt-0.5">
              {new Date(membre.date_naissance).getFullYear()}
              {membre.date_deces && `-${new Date(membre.date_deces).getFullYear()}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Couleurs pour différencier les branches familiales
const branchColors = ['blue', 'emerald', 'purple', 'amber', 'rose', 'slate'];

// Composant pour afficher un nœud d'arbre avec ses enfants
const TreeNode = ({ membre, childrenMap, navigate, level = 0, maxDepth = 10, expandedNodes, toggleNode, branchIndex = 0 }) => {
  if (!membre || !membre.id) return null;

  const enfants = (childrenMap && childrenMap[membre.id]) || [];
  const hasChildren = enfants.length > 0;
  const isExpanded = expandedNodes.has(membre.id);

  // Couleur basée sur l'index de branche
  const color = branchColors[branchIndex % branchColors.length];

  // Limiter la profondeur pour éviter les problèmes de performance
  if (level >= maxDepth) {
    return (
      <div className="flex flex-col items-center">
        <MemberCard membre={membre} onClick={navigate} color={color} />
        <div className="mt-1 text-[10px] text-slate-500 italic">
          Max
        </div>
      </div>
    );
  }

  // Calculer le texte du bouton
  const buttonIcon = isExpanded ? '▼' : '▶';
  const buttonText = `${buttonIcon} ${enfants.length}`;

  return (
    <div className="flex flex-col items-center">
      {/* Carte du membre */}
      <MemberCard membre={membre} onClick={navigate} color={color} />

      {/* Bouton d'expansion si enfants */}
      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleNode(membre.id);
          }}
          className="mt-1 px-2 py-0.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 rounded-full text-[10px] font-semibold transition-colors"
        >
          {buttonText}
        </button>
      )}

      {/* Lignes et enfants */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center mt-3 sm:mt-4 overflow-visible">
          {/* Ligne verticale descendante */}
          <div className="w-0.5 h-4 sm:h-6 bg-slate-400 flex-shrink-0"></div>

          {/* Conteneur pour enfants */}
          <div className="relative inline-flex gap-2 sm:gap-4 flex-nowrap justify-center overflow-visible">
            {/* Ligne horizontale qui relie le premier au dernier enfant */}
            {enfants.length > 1 && (
              <div
                className="absolute top-0 h-0.5 bg-slate-400 z-0 pointer-events-none"
                style={{
                  left: 'calc(50% / ' + enfants.length + ')',
                  right: 'calc(50% / ' + enfants.length + ')',
                }}
              ></div>
            )}

            {enfants.filter(e => e && e.id).map((enfant, idx, arr) => (
              <div key={enfant.id} className="relative flex flex-col items-center pt-4 sm:pt-6 flex-shrink-0">
                {/* Ligne verticale vers la ligne horizontale */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-4 sm:h-6 bg-slate-400 z-0"></div>

                {/* Demi-ligne horizontale gauche (sauf premier enfant) */}
                {enfants.length > 1 && idx > 0 && (
                  <div
                    className="absolute top-0 right-1/2 h-0.5 bg-slate-400 z-0"
                    style={{ width: 'calc(50% + 4px)', minWidth: '50px' }}
                  ></div>
                )}

                {/* Demi-ligne horizontale droite (sauf dernier enfant) */}
                {enfants.length > 1 && idx < arr.length - 1 && (
                  <div
                    className="absolute top-0 left-1/2 h-0.5 bg-slate-400 z-0"
                    style={{ width: 'calc(50% + 4px)', minWidth: '50px' }}
                  ></div>
                )}

                {/* Indicateur de branche coloré */}
                {level === 0 && enfants.length > 1 && (
                  <div
                    className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full z-10"
                    style={{
                      backgroundColor: idx === 0 ? '#3b82f6' : idx === 1 ? '#10b981' : idx === 2 ? '#a855f7' : idx === 3 ? '#f59e0b' : '#f43f5e'
                    }}
                  ></div>
                )}

                {/* Récursion pour afficher les descendants */}
                <TreeNode
                  membre={enfant}
                  childrenMap={childrenMap}
                  navigate={navigate}
                  level={level + 1}
                  maxDepth={maxDepth}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  branchIndex={level === 0 ? idx : branchIndex}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const FamilyTree = () => {
  const [arbre, setArbre] = useState({ membres: [], liens: [], mariages: [] });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [showModal, setShowModal] = useState(false);
  const [selectedEnfant, setSelectedEnfant] = useState(null);
  const [selectedParent, setSelectedParent] = useState('');
  const [typeLien, setTypeLien] = useState('pere');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [downloading, setDownloading] = useState(false);
  const membresPerPage = 20;
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const treeRef = useRef(null);

  const toggleNode = (membreId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(membreId)) {
        newSet.delete(membreId);
      } else {
        newSet.add(membreId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    loadArbre();
  }, []);

  const loadArbre = async () => {
    try {
      const response = await arbreAPI.getArbre();
      setArbre(response.data.data || { membres: [], liens: [], mariages: [] });
    } catch (error) {
      console.error('Erreur chargement arbre:', error);
      setArbre({ membres: [], liens: [], mariages: [] });
    } finally {
      setLoading(false);
    }
  };

  const getParent = (membreId, typeLien) => {
    const lien = arbre.liens.find(
      l => l.enfant_id === membreId && l.type_lien === typeLien
    );
    if (!lien) return null;
    return arbre.membres.find(m => m.id === lien.parent_id);
  };

  const getEnfants = (membreId) => {
    const liensEnfants = arbre.liens.filter(l => l.parent_id === membreId);
    return liensEnfants
      .map(lien => arbre.membres.find(m => m.id === lien.enfant_id))
      .filter(Boolean);
  };

  const openAddLienModal = (membre) => {
    setSelectedEnfant(membre);
    setSelectedParent('');
    setTypeLien('pere');
    setShowModal(true);
  };

  const handleAddLien = async (e) => {
    e.preventDefault();
    if (!selectedParent) {
      alert('Veuillez sélectionner un parent');
      return;
    }

    try {
      await arbreAPI.addLien({
        enfantId: selectedEnfant.id,
        parentId: parseInt(selectedParent),
        typeLien: typeLien,
      });
      alert('Lien parental ajouté avec succès');
      setShowModal(false);
      loadArbre();
    } catch (error) {
      console.error('Erreur ajout lien:', error);
      alert(error.response?.data?.error || 'Erreur lors de l\'ajout du lien');
    }
  };

  const handleDeleteLien = async (lienId, typeParent) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer ce lien parental (${typeParent}) ?`)) {
      return;
    }

    try {
      await arbreAPI.deleteLien(lienId);
      alert('Lien parental supprimé');
      loadArbre();
    } catch (error) {
      console.error('Erreur suppression lien:', error);
      alert(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  // Créer une map optimisée des enfants pour éviter les filtres répétitifs
  const childrenMap = useMemo(() => {
    if (!arbre.membres || !arbre.liens) return {};

    const map = {};
    arbre.liens.forEach(lien => {
      if (!lien || !lien.parent_id || !lien.enfant_id) return;

      if (!map[lien.parent_id]) {
        map[lien.parent_id] = [];
      }
      const enfant = arbre.membres.find(m => m && m.id === lien.enfant_id);
      if (enfant && !map[lien.parent_id].find(e => e && e.id === enfant.id)) {
        map[lien.parent_id].push(enfant);
      }
    });
    return map;
  }, [arbre.membres, arbre.liens]);

  // Filtrage et pagination pour la vue liste
  const membresFiltres = useMemo(() => {
    if (!searchTerm) return arbre.membres;

    const term = searchTerm.toLowerCase();
    return arbre.membres.filter(m =>
      m.nom?.toLowerCase().includes(term) ||
      m.prenom?.toLowerCase().includes(term) ||
      m.numero_identification?.toLowerCase().includes(term)
    );
  }, [arbre.membres, searchTerm]);

  const totalPages = Math.ceil(membresFiltres.length / membresPerPage);
  const indexOfLastMembre = currentPage * membresPerPage;
  const indexOfFirstMembre = indexOfLastMembre - membresPerPage;
  const currentMembres = membresFiltres.slice(indexOfFirstMembre, indexOfLastMembre);

  const membresDisponibles = arbre.membres.filter(m => {
    if (!selectedEnfant) return true;
    return m.id !== selectedEnfant.id;
  });

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction pour obtenir tous les IDs des membres avec enfants
  const getAllParentIds = () => {
    const parentIds = new Set();
    arbre.liens.forEach(lien => {
      if (lien && lien.parent_id) {
        parentIds.add(lien.parent_id);
      }
    });
    return parentIds;
  };

  // Fonction pour développer tous les nœuds
  const expandAllNodes = () => {
    const allParentIds = getAllParentIds();
    setExpandedNodes(allParentIds);
  };

  const downloadTree = async () => {
    if (!treeRef.current) return;

    setDownloading(true);

    // Sauvegarder l'état actuel des nœuds développés
    const previousExpandedNodes = new Set(expandedNodes);

    // Développer tous les nœuds pour la capture
    const allParentIds = getAllParentIds();
    setExpandedNodes(allParentIds);

    // Attendre que le DOM se mette à jour complètement
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const element = treeRef.current;

      // Calculer les dimensions réelles de l'élément
      const rect = element.getBoundingClientRect();
      const scrollWidth = element.scrollWidth;
      const scrollHeight = element.scrollHeight;

      // Utiliser les dimensions les plus grandes
      const captureWidth = Math.max(rect.width, scrollWidth, 1200);
      const captureHeight = Math.max(rect.height, scrollHeight, 800);

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 1.5,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: captureWidth,
        height: captureHeight,
        windowWidth: captureWidth + 200,
        windowHeight: captureHeight + 200,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        foreignObjectRendering: false,
        removeContainer: true,
        onclone: (clonedDoc, clonedElement) => {
          // S'assurer que le clone est visible entièrement
          clonedElement.style.overflow = 'visible';
          clonedElement.style.position = 'relative';
          clonedElement.style.width = captureWidth + 'px';
          clonedElement.style.height = 'auto';
          clonedElement.style.minHeight = captureHeight + 'px';

          // Rendre tous les parents visibles aussi
          let parent = clonedElement.parentElement;
          while (parent) {
            parent.style.overflow = 'visible';
            parent = parent.parentElement;
          }
        }
      });

      const link = document.createElement('a');
      link.download = `arbre-genealogique-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();

      // Restaurer l'état précédent des nœuds
      setExpandedNodes(previousExpandedNodes);
    } catch (error) {
      console.error('Erreur téléchargement arbre:', error);
      alert('Erreur lors du téléchargement de l\'arbre. Essayez de réduire le nombre de nœuds développés.');
      // Restaurer l'état précédent
      setExpandedNodes(previousExpandedNodes);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <Loading text="Chargement de l'arbre..." />;

  return (
    <>
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Arbre Généalogique</h2>
            <p className="text-slate-600 text-sm mt-1">
              {arbre.membres.length} membres • {arbre.liens.length} liens parentaux
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <div className="flex gap-1 sm:gap-2 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base ${
                  view === 'list' ? 'bg-white text-blue-700 font-semibold shadow-sm' : 'text-slate-600'
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setView('tree')}
                className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-sm sm:text-base ${
                  view === 'tree' ? 'bg-white text-blue-700 font-semibold shadow-sm' : 'text-slate-600'
                }`}
              >
                Arbre
              </button>
            </div>

            {view === 'tree' && (
              <div className="flex gap-2">
                <button
                  onClick={expandAllNodes}
                  className="px-3 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all shadow-sm flex items-center gap-2 font-semibold text-sm sm:text-base"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                  <span className="hidden sm:inline">Tout développer</span>
                </button>
                <button
                  onClick={downloadTree}
                  disabled={downloading}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold text-sm sm:text-base"
                >
                  {downloading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="hidden sm:inline">Téléchargement...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      <span className="hidden sm:inline">Télécharger</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
        {view === 'list' ? (
          <div className="space-y-6">
            {/* Barre de recherche et stats */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Rechercher par nom, prénom ou numéro..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-slate-600 whitespace-nowrap">
                  {membresFiltres.length} membre{membresFiltres.length > 1 ? 's' : ''}
                  {searchTerm && ` (${arbre.membres.length} au total)`}
                </div>
              </div>
            </div>

            {/* Liste des membres */}
            {currentMembres.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-lg">Aucun membre trouvé</p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-blue-600 hover:underline"
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {currentMembres.map((membre) => {
              const pere = getParent(membre.id, 'pere');
              const mere = getParent(membre.id, 'mere');
              const enfants = getEnfants(membre.id);
              const pereLink = arbre.liens.find(l => l.enfant_id === membre.id && l.type_lien === 'pere');
              const mereLink = arbre.liens.find(l => l.enfant_id === membre.id && l.type_lien === 'mere');

              return (
                <div
                  key={membre.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-l-slate-400"
                >
                  {/* En-tête avec dégradé */}
                  <div
                    className="p-6 cursor-pointer bg-gradient-to-br from-slate-50 to-white"
                    onClick={() => navigate(`/membres/${membre.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white shadow-lg bg-gradient-to-br from-slate-600 to-slate-800">
                        {membre.sexe === 'M' ? '♂' : '♀'}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                          {membre.prenom} {membre.nom}
                        </h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-blue-700 font-semibold">{membre.numero_identification}</span>
                          {membre.date_naissance && (
                            <span className="text-slate-600">
                              Né(e) en {new Date(membre.date_naissance).getFullYear()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Corps de la carte */}
                  <div className="p-6 space-y-6">
                    {/* Section Parents */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Parents</h4>
                        {isAdmin && (
                          <button
                            onClick={() => openAddLienModal(membre)}
                            className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-semibold"
                          >
                            + Ajouter
                          </button>
                        )}
                      </div>

                      {(pere || mere) ? (
                        <div className="space-y-2">
                          {pere && (
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm">
                                  ♂
                                </div>
                                <div>
                                  <p className="text-xs text-slate-600 font-semibold">Père</p>
                                  <p className="text-sm font-bold text-slate-900">{pere.prenom} {pere.nom}</p>
                                </div>
                              </div>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteLien(pereLink.id, 'père')}
                                  className="text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-1 hover:bg-red-50 rounded transition-colors"
                                >
                                  Retirer
                                </button>
                              )}
                            </div>
                          )}
                          {mere && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
                                  ♀
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold">Mère</p>
                                  <p className="text-sm font-bold text-slate-900">{mere.prenom} {mere.nom}</p>
                                </div>
                              </div>
                              {isAdmin && (
                                <button
                                  onClick={() => handleDeleteLien(mereLink.id, 'mère')}
                                  className="text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-1 hover:bg-red-50 rounded transition-colors"
                                >
                                  Retirer
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic py-2">Aucun parent enregistré</p>
                      )}
                    </div>

                    {/* Section Enfants */}
                    {enfants.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
                          Enfants ({enfants.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {enfants.map(enfant => (
                            <div
                              key={enfant.id}
                              onClick={() => navigate(`/membres/${enfant.id}`)}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors border border-slate-200"
                            >
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs bg-slate-600">
                                {enfant.sexe === 'M' ? '♂' : '♀'}
                              </div>
                              <span className="text-sm font-medium text-slate-800">
                                {enfant.prenom} {enfant.nom}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    currentPage === 1
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-blue-700 border border-blue-600 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  ← Précédent
                </button>

                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Afficher seulement quelques pages autour de la page actuelle
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-4 py-2 rounded-lg font-semibold ${
                            currentPage === pageNumber
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="px-2 py-2 text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    currentPage === totalPages
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white text-blue-700 border border-blue-600 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  Suivant →
                </button>
              </div>
            )}
          </div>
        ) : (
          // Vue Arbre généalogique - Structure hiérarchique
          <div id="tree-scroll-container" className="overflow-x-auto overflow-y-visible pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="inline-block px-2 sm:px-8" style={{ minWidth: 'max-content' }}>
              {(() => {
                // Trouver les racines de l'arbre (membres sans parents)
                const racines = arbre.membres.filter(m => {
                  if (!m || !m.id) return false;
                  const hasParents = arbre.liens.some(l => l && l.enfant_id === m.id);
                  return !hasParents;
                });

                if (racines.length === 0 && arbre.membres.length > 0) {
                  return (
                    <div className="text-center py-12">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 inline-block">
                        <p className="text-yellow-800 font-semibold mb-2">Structure d'arbre incomplète</p>
                        <p className="text-yellow-700 text-sm">
                          Il y a {arbre.membres.length} membre(s) mais aucune racine claire.
                          <br />
                          Créez des liens parentaux pour organiser l'arbre généalogique.
                        </p>
                      </div>
                    </div>
                  );
                }

                if (racines.length === 0) {
                  return (
                    <div className="text-center py-12 text-slate-500">
                      <div className="bg-slate-100 rounded-lg p-8 inline-block">
                        <p className="text-lg font-semibold mb-2">Aucun membre dans l'arbre généalogique</p>
                        <p className="text-sm">Ajoutez des membres et créez des liens parentaux pour construire votre arbre</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div ref={treeRef} data-tree-export="true" className="py-4 sm:py-8 px-2 sm:px-6 bg-white rounded-xl shadow-sm" style={{ minWidth: 'fit-content', overflow: 'visible' }}>
                    <div className="text-center mb-4 sm:mb-8">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-1 sm:mb-2">Arbre Généalogique</h3>
                      <p className="text-xs sm:text-sm text-slate-600">
                        {racines.length} racine{racines.length > 1 ? 's' : ''} • {arbre.membres.length} membre{arbre.membres.length > 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Afficher chaque arbre à partir de chaque racine */}
                    <div className="flex gap-4 sm:gap-8 justify-center flex-nowrap overflow-visible">
                      {racines.map((racine, idx) => (
                        <div key={racine.id} className="mb-4 sm:mb-8 flex-shrink-0">
                          <TreeNode
                            membre={racine}
                            childrenMap={childrenMap}
                            navigate={(id) => navigate(`/membres/${id}`)}
                            level={0}
                            maxDepth={10}
                            expandedNodes={expandedNodes}
                            toggleNode={toggleNode}
                            branchIndex={idx}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

      {/* Modal Ajouter Lien */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold text-slate-800">Ajouter un parent</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddLien} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-4">
                  Ajouter un parent pour: <span className="font-bold">{selectedEnfant?.prenom} {selectedEnfant?.nom}</span>
                </p>

                <label className="block text-slate-700 font-semibold mb-2">
                  Type de lien <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setTypeLien('pere')}
                    className={`py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                      typeLien === 'pere'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-blue-300'
                    }`}
                  >
                    Père
                  </button>
                  <button
                    type="button"
                    onClick={() => setTypeLien('mere')}
                    className={`py-3 px-4 rounded-lg border-2 font-semibold transition-colors ${
                      typeLien === 'mere'
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-white text-slate-700 border-slate-300 hover:border-pink-300'
                    }`}
                  >
                    Mère
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-slate-700 font-semibold mb-2">
                  Sélectionner le parent
                </label>
                <select
                  value={selectedParent}
                  onChange={(e) => setSelectedParent(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                >
                  <option value="">-- Choisir un membre --</option>
                  {membresDisponibles.map(membre => (
                    <option key={membre.id} value={membre.id}>
                      {membre.prenom} {membre.nom} ({membre.numero_identification})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Ajouter
                </Button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
