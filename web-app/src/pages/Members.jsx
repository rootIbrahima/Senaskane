import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { membresAPI } from '../services/api';
import { Card, Loading, Input, Button, AdBanner } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { Filter, SortAsc, SortDesc, Users as UsersIcon, User, Grid3x3, List } from 'lucide-react';
import { getAdsForPage } from '../config/ads';

export const Members = () => {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [sexeFilter, setSexeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('nom');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    sexe: 'M',
    date_naissance: '',
    lieu_naissance: '',
    lieu_residence: '',
    profession: '',
    telephone: '',
    email: ''
  });
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  // Récupérer les publicités pour la page membres - mémoïsé
  const adsConfig = useMemo(() => getAdsForPage('members'), []);
  const { mainBanner, autoPlayInterval } = adsConfig;

  useEffect(() => {
    loadMembres();
  }, []);

  const loadMembres = async () => {
    try {
      const response = await membresAPI.getAll();
      setMembres(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      setMembres([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await membresAPI.create(formData);

      setShowModal(false);
      setFormData({
        prenom: '',
        nom: '',
        sexe: 'M',
        date_naissance: '',
        lieu_naissance: '',
        lieu_residence: '',
        profession: '',
        telephone: '',
        email: ''
      });

      await loadMembres();
    } catch (error) {
      console.error('Erreur création membre:', error);
      alert('Erreur lors de la création du membre');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Filtrage et tri - mémoïsé pour éviter les recalculs inutiles
  const filteredMembres = useMemo(() => {
    return (Array.isArray(membres) ? membres : [])
      .filter(m => {
        const matchSearch = `${m.prenom} ${m.nom} ${m.numero_identification || ''}`.toLowerCase().includes(search.toLowerCase());
        const matchSexe = sexeFilter === 'all' || m.sexe === sexeFilter;
        return matchSearch && matchSexe;
      })
      .sort((a, b) => {
        let compareValue = 0;

        switch(sortBy) {
          case 'nom':
            compareValue = (a.nom || '').localeCompare(b.nom || '');
            break;
          case 'prenom':
            compareValue = (a.prenom || '').localeCompare(b.prenom || '');
            break;
          case 'date_naissance':
            compareValue = new Date(a.date_naissance || 0) - new Date(b.date_naissance || 0);
            break;
          default:
            compareValue = 0;
        }

        return sortOrder === 'asc' ? compareValue : -compareValue;
      });
  }, [membres, search, sexeFilter, sortBy, sortOrder]);

  // Ajuster le nombre d'éléments par page selon le mode de vue
  const effectiveItemsPerPage = viewMode === 'grid' ? 12 : 20;

  // Pagination
  const totalPages = Math.ceil(filteredMembres.length / effectiveItemsPerPage);
  const startIndex = (currentPage - 1) * effectiveItemsPerPage;
  const currentMembres = filteredMembres.slice(startIndex, startIndex + effectiveItemsPerPage);

  // Statistiques - mémoïsées pour éviter les recalculs
  const stats = useMemo(() => ({
    total: membres.length,
    hommes: membres.filter(m => m.sexe === 'M').length,
    femmes: membres.filter(m => m.sexe === 'F').length,
    filtered: filteredMembres.length
  }), [membres, filteredMembres.length]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <Loading text="Chargement des membres..." />;

  return (
    <>
      {/* Header avec titre et boutons */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Membres de la famille</h2>
          <p className="text-slate-600 text-sm">Gérez et consultez tous les membres de votre famille</p>
        </div>
        <div className="flex gap-3">
          {/* Basculement Vue Grille/Liste */}
          <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => {
                setViewMode('grid');
                setCurrentPage(1);
              }}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
              }`}
              title="Vue grille"
            >
              <Grid3x3 className="w-5 h-5" strokeWidth={2} />
            </button>
            <button
              onClick={() => {
                setViewMode('list');
                setCurrentPage(1);
              }}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
              }`}
              title="Vue liste"
            >
              <List className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowModal(true)} className="whitespace-nowrap">
              + Ajouter un membre
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-lg p-3">
              <UsersIcon className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase">Total</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-600 rounded-lg p-3">
              <User className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-semibold uppercase">Hommes</p>
              <p className="text-2xl font-bold text-slate-800">{stats.hommes}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-600 rounded-lg p-3">
              <User className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Femmes</p>
              <p className="text-2xl font-bold text-slate-800">{stats.femmes}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 rounded-lg p-3">
              <Filter className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs text-emerald-600 font-semibold uppercase">Filtrés</p>
              <p className="text-2xl font-bold text-slate-800">{stats.filtered}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bannière Publicitaire */}
      {mainBanner && mainBanner.length > 0 && (
        <div className="mb-6">
          <AdBanner ads={mainBanner} autoPlayInterval={autoPlayInterval} />
        </div>
      )}

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Recherche */}
          <div className="flex-1">
            <Input
              placeholder="Rechercher par nom, prénom ou numéro..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="mb-0"
            />
          </div>

          {/* Filtre par sexe */}
          <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => {
                setSexeFilter('all');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md transition-colors font-semibold text-sm ${
                sexeFilter === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => {
                setSexeFilter('M');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md transition-colors font-semibold text-sm ${
                sexeFilter === 'M' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Hommes
            </button>
            <button
              onClick={() => {
                setSexeFilter('F');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md transition-colors font-semibold text-sm ${
                sexeFilter === 'F' ? 'bg-gray-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Femmes
            </button>
          </div>

          {/* Tri */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent font-semibold text-sm"
            >
              <option value="nom">Trier par Nom</option>
              <option value="prenom">Trier par Prénom</option>
              <option value="date_naissance">Trier par Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
              title={sortOrder === 'asc' ? 'Ordre croissant' : 'Ordre décroissant'}
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-5 h-5 text-slate-700" strokeWidth={2} />
              ) : (
                <SortDesc className="w-5 h-5 text-slate-700" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Affichage des membres */}
      {currentMembres.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-lg text-slate-500 font-semibold">Aucun membre trouvé</p>
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setSexeFilter('all');
                setCurrentPage(1);
              }}
              className="mt-4 text-blue-600 hover:underline font-semibold"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            /* Vue Grille */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {currentMembres.map((membre) => (
                <Card
                  key={membre.id}
                  onClick={() => navigate(`/membres/${membre.id}`)}
                  className="hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl text-white mb-3 shadow-lg bg-gradient-to-br from-slate-600 to-slate-800">
                      {membre.sexe === 'M' ? '♂' : '♀'}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      {membre.prenom} {membre.nom}
                    </h3>
                    {membre.date_naissance && (
                      <p className="text-sm text-slate-600 mb-2">
                        Né(e) en {new Date(membre.date_naissance).getFullYear()}
                      </p>
                    )}
                    <p className="text-xs text-blue-700 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                      {membre.numero_identification}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Vue Liste - Plus compacte */
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Membre
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider hidden md:table-cell">
                        Numéro
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider hidden lg:table-cell">
                        Naissance
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider hidden xl:table-cell">
                        Profession
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentMembres.map((membre) => (
                      <tr
                        key={membre.id}
                        onClick={() => navigate(`/membres/${membre.id}`)}
                        className="hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl text-white shadow-md bg-gradient-to-br from-slate-600 to-slate-800">
                              {membre.sexe === 'M' ? '♂' : '♀'}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">
                                {membre.prenom} {membre.nom}
                              </div>
                              <div className="text-xs text-slate-500 md:hidden">
                                {membre.numero_identification}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                            {membre.numero_identification}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          {membre.date_naissance ? (
                            <span className="text-sm text-slate-700">
                              {new Date(membre.date_naissance).toLocaleDateString('fr-FR')}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400 italic">Non renseigné</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                          {membre.profession ? (
                            <span className="text-sm text-slate-700">{membre.profession}</span>
                          ) : (
                            <span className="text-sm text-slate-400 italic">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/membres/${membre.id}`);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            Voir détails →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  currentPage === 1
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-blue-700 border-2 border-blue-600 hover:bg-blue-600 hover:text-white shadow-md'
                }`}
              >
                ← Précédent
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;

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
                            ? 'bg-blue-600 text-white shadow-lg'
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
                    : 'bg-white text-blue-700 border-2 border-blue-600 hover:bg-blue-600 hover:text-white shadow-md'
                }`}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Ajouter Membre */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Ajouter un membre</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    Sexe <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sexe"
                    value={formData.sexe}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <Input
                  label="Date de naissance"
                  name="date_naissance"
                  type="date"
                  value={formData.date_naissance}
                  onChange={handleChange}
                />
                <Input
                  label="Lieu de naissance"
                  name="lieu_naissance"
                  value={formData.lieu_naissance}
                  onChange={handleChange}
                />
                <Input
                  label="Lieu de résidence"
                  name="lieu_residence"
                  value={formData.lieu_residence}
                  onChange={handleChange}
                  placeholder="Ville, Pays"
                />
                <Input
                  label="Profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                />
                <Input
                  label="Téléphone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleChange}
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-4 mt-6">
                <Button type="submit" className="flex-1">
                  Créer le membre
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
