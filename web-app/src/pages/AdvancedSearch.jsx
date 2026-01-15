import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rechercheAPI, membresAPI } from '../services/api';
import { Card, Loading, Button, Input, RelationshipTree } from '../components';
import { Link2, Target, MapPin, Lightbulb, BarChart3 } from 'lucide-react';

export const AdvancedSearch = () => {
  const [activeTab, setActiveTab] = useState('advanced');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [membres, setMembres] = useState([]);
  const [loadingMembres, setLoadingMembres] = useState(true);
  const navigate = useNavigate();

  // Advanced search form
  const [advancedForm, setAdvancedForm] = useState({
    nom: '',
    prenom: '',
    sexe: '',
    profession: '',
    lieuNaissance: '',
    lieuResidence: '',
    anneeNaissanceMin: '',
    anneeNaissanceMax: ''
  });

  // Simple search forms
  const [simpleSearches, setSimpleSearches] = useState({
    nom: '',
    lieu: '',
    metier: '',
    numero: ''
  });

  // Relationship search
  const [relationForm, setRelationForm] = useState({
    membre1: '',
    membre2: ''
  });

  // Descendants/Ascendants search
  const [genealogyForm, setGenealogyForm] = useState({
    membreId: '',
    type: 'descendants' // or 'ascendants'
  });

  // Charger la liste des membres au démarrage
  useEffect(() => {
    loadMembres();
  }, []);

  const loadMembres = async () => {
    try {
      setLoadingMembres(true);
      const response = await membresAPI.getAll();
      setMembres(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      setMembres([]);
    } finally {
      setLoadingMembres(false);
    }
  };

  const handleAdvancedSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await rechercheAPI.avancee(advancedForm);
      setResults({
        type: 'membres',
        data: response.data.data.membres,
        total: response.data.data.total,
        title: `${response.data.data.total} résultat(s) trouvé(s)`
      });
    } catch (error) {
      console.error('Erreur recherche:', error);
      setResults({ type: 'error', message: 'Erreur lors de la recherche' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByName = async () => {
    if (!simpleSearches.nom) return;
    setLoading(true);
    try {
      const response = await rechercheAPI.parNom({ recherche: simpleSearches.nom });
      setResults({
        type: 'membres',
        data: response.data.data.membres,
        total: response.data.data.total,
        title: `${response.data.data.total} résultat(s) pour "${simpleSearches.nom}"`
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByLieu = async () => {
    if (!simpleSearches.lieu) return;
    setLoading(true);
    try {
      const response = await rechercheAPI.parLieu({ lieu: simpleSearches.lieu });
      setResults({
        type: 'membres',
        data: response.data.data.membres,
        total: response.data.data.total,
        title: `${response.data.data.total} résultat(s) pour le lieu "${simpleSearches.lieu}"`
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByMetier = async () => {
    if (!simpleSearches.metier) return;
    setLoading(true);
    try {
      const response = await rechercheAPI.parMetier({ metier: simpleSearches.metier });
      setResults({
        type: 'membres',
        data: response.data.data.membres,
        total: response.data.data.total,
        title: `${response.data.data.total} résultat(s) pour le métier "${simpleSearches.metier}"`
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByNumero = async () => {
    if (!simpleSearches.numero) return;
    setLoading(true);
    try {
      const response = await rechercheAPI.parNumero(simpleSearches.numero);
      setResults({
        type: 'membres',
        data: [response.data.data],
        total: 1,
        title: `Résultat pour le numéro ${simpleSearches.numero}`
      });
    } catch (error) {
      console.error('Erreur:', error);
      setResults({ type: 'error', message: 'Membre non trouvé' });
    } finally {
      setLoading(false);
    }
  };

  const handleRelationshipSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await rechercheAPI.lienParente(relationForm.membre1, relationForm.membre2);
      setResults({
        type: 'relationship',
        data: response.data.data,
        title: 'Lien de parenté'
      });
    } catch (error) {
      console.error('Erreur:', error);
      setResults({ type: 'error', message: 'Erreur lors de la recherche du lien' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenealogySearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = genealogyForm.type === 'descendants'
        ? await rechercheAPI.descendants(genealogyForm.membreId)
        : await rechercheAPI.ascendants(genealogyForm.membreId);

      setResults({
        type: 'genealogy',
        data: response.data.data,
        genealogyType: genealogyForm.type,
        title: `${genealogyForm.type === 'descendants' ? 'Descendants' : 'Ascendants'} de ${response.data.data.membre?.prenom} ${response.data.data.membre?.nom}`
      });
    } catch (error) {
      console.error('Erreur:', error);
      setResults({ type: 'error', message: 'Membre non trouvé' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-2xl hover:text-blue-200">
              ←
            </button>
            <h1 className="text-3xl font-bold">Recherche Avancée</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search Forms */}
          <div className="lg:col-span-1">
            <Card>
              <div className="flex flex-col gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`px-4 py-2 rounded ${activeTab === 'advanced' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
                >
                  Recherche Avancée
                </button>
                <button
                  onClick={() => setActiveTab('simple')}
                  className={`px-4 py-2 rounded ${activeTab === 'simple' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
                >
                  Recherche Simple
                </button>
                <button
                  onClick={() => setActiveTab('relationship')}
                  className={`px-4 py-2 rounded ${activeTab === 'relationship' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
                >
                  Lien de Parenté
                </button>
                <button
                  onClick={() => setActiveTab('genealogy')}
                  className={`px-4 py-2 rounded ${activeTab === 'genealogy' ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}
                >
                  Généalogie
                </button>
              </div>

              {/* Advanced Search Form */}
              {activeTab === 'advanced' && (
                <form onSubmit={handleAdvancedSearch} className="space-y-4">
                  <Input
                    label="Nom"
                    value={advancedForm.nom}
                    onChange={(e) => setAdvancedForm({ ...advancedForm, nom: e.target.value })}
                  />
                  <Input
                    label="Prénom"
                    value={advancedForm.prenom}
                    onChange={(e) => setAdvancedForm({ ...advancedForm, prenom: e.target.value })}
                  />
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">Sexe</label>
                    <select
                      value={advancedForm.sexe}
                      onChange={(e) => setAdvancedForm({ ...advancedForm, sexe: e.target.value })}
                      className="input"
                    >
                      <option value="">Tous</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <Input
                    label="Profession"
                    value={advancedForm.profession}
                    onChange={(e) => setAdvancedForm({ ...advancedForm, profession: e.target.value })}
                  />
                  <Input
                    label="Lieu de naissance"
                    value={advancedForm.lieuNaissance}
                    onChange={(e) => setAdvancedForm({ ...advancedForm, lieuNaissance: e.target.value })}
                  />
                  <Input
                    label="Lieu de résidence"
                    value={advancedForm.lieuResidence}
                    onChange={(e) => setAdvancedForm({ ...advancedForm, lieuResidence: e.target.value })}
                  />
                  <Input
                    label="Année de naissance min"
                    type="number"
                    value={advancedForm.anneeNaissanceMin}
                    onChange={(e) => setAdvancedForm({ ...advancedForm, anneeNaissanceMin: e.target.value })}
                  />
                  <Input
                    label="Année de naissance max"
                    type="number"
                    value={advancedForm.anneeNaissanceMax}
                    onChange={(e) => setAdvancedForm({ ...advancedForm, anneeNaissanceMax: e.target.value })}
                  />
                  <Button type="submit" className="w-full">Rechercher</Button>
                </form>
              )}

              {/* Simple Search */}
              {activeTab === 'simple' && (
                <div className="space-y-6">
                  <div>
                    <Input
                      label="Rechercher par nom"
                      value={simpleSearches.nom}
                      onChange={(e) => setSimpleSearches({ ...simpleSearches, nom: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchByName()}
                    />
                    <Button onClick={handleSearchByName} className="w-full mt-2">Rechercher</Button>
                  </div>
                  <div>
                    <Input
                      label="Rechercher par lieu"
                      value={simpleSearches.lieu}
                      onChange={(e) => setSimpleSearches({ ...simpleSearches, lieu: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchByLieu()}
                    />
                    <Button onClick={handleSearchByLieu} className="w-full mt-2">Rechercher</Button>
                  </div>
                  <div>
                    <Input
                      label="Rechercher par métier"
                      value={simpleSearches.metier}
                      onChange={(e) => setSimpleSearches({ ...simpleSearches, metier: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchByMetier()}
                    />
                    <Button onClick={handleSearchByMetier} className="w-full mt-2">Rechercher</Button>
                  </div>
                  <div>
                    <Input
                      label="Rechercher par numéro"
                      value={simpleSearches.numero}
                      onChange={(e) => setSimpleSearches({ ...simpleSearches, numero: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchByNumero()}
                    />
                    <Button onClick={handleSearchByNumero} className="w-full mt-2">Rechercher</Button>
                  </div>
                </div>
              )}

              {/* Relationship Search */}
              {activeTab === 'relationship' && (
                <form onSubmit={handleRelationshipSearch} className="space-y-4">
                  {loadingMembres ? (
                    <p className="text-sm text-slate-500">Chargement des membres...</p>
                  ) : (
                    <>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-2">
                          Premier membre <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={relationForm.membre1}
                          onChange={(e) => setRelationForm({ ...relationForm, membre1: e.target.value })}
                          className="input"
                          required
                        >
                          <option value="">Sélectionner un membre</option>
                          {membres.map((membre) => (
                            <option key={membre.id} value={membre.id}>
                              {membre.prenom} {membre.nom} ({membre.numero_identification})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-2">
                          Deuxième membre <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={relationForm.membre2}
                          onChange={(e) => setRelationForm({ ...relationForm, membre2: e.target.value })}
                          className="input"
                          required
                        >
                          <option value="">Sélectionner un membre</option>
                          {membres
                            .filter((m) => m.id.toString() !== relationForm.membre1)
                            .map((membre) => (
                              <option key={membre.id} value={membre.id}>
                                {membre.prenom} {membre.nom} ({membre.numero_identification})
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800 flex items-center gap-2">
                          <Lightbulb size={14} className="text-blue-600" />
                          Sélectionnez deux membres différents pour découvrir leur lien de parenté
                        </p>
                      </div>
                    </>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loadingMembres || !relationForm.membre1 || !relationForm.membre2}
                  >
                    Trouver le lien de parenté
                  </Button>
                </form>
              )}

              {/* Genealogy Search */}
              {activeTab === 'genealogy' && (
                <form onSubmit={handleGenealogySearch} className="space-y-4">
                  {loadingMembres ? (
                    <p className="text-sm text-slate-500">Chargement des membres...</p>
                  ) : (
                    <>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-2">
                          Membre <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={genealogyForm.membreId}
                          onChange={(e) => setGenealogyForm({ ...genealogyForm, membreId: e.target.value })}
                          className="input"
                          required
                        >
                          <option value="">Sélectionner un membre</option>
                          {membres.map((membre) => (
                            <option key={membre.id} value={membre.id}>
                              {membre.prenom} {membre.nom} ({membre.numero_identification})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-2">Type de recherche</label>
                        <select
                          value={genealogyForm.type}
                          onChange={(e) => setGenealogyForm({ ...genealogyForm, type: e.target.value })}
                          className="input"
                        >
                          <option value="descendants">Descendants (enfants, petits-enfants...)</option>
                          <option value="ascendants">Ascendants (parents, grands-parents...)</option>
                        </select>
                      </div>

                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-800 flex items-center gap-2">
                          <Lightbulb size={14} className="text-purple-600" />
                          {genealogyForm.type === 'descendants'
                            ? 'Trouvez tous les descendants (enfants, petits-enfants...) de ce membre'
                            : 'Trouvez tous les ascendants (parents, grands-parents...) de ce membre'}
                        </p>
                      </div>
                    </>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loadingMembres || !genealogyForm.membreId}
                  >
                    Rechercher
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {loading ? (
              <Loading text="Recherche en cours..." />
            ) : results ? (
              <Card>
                <h2 className="text-2xl font-bold mb-4">{results.title}</h2>

                {results.type === 'error' && (
                  <p className="text-red-600">{results.message}</p>
                )}

                {results.type === 'membres' && (
                  <div className="space-y-4">
                    {results.data.map((membre) => (
                      <Card key={membre.id} className="cursor-pointer hover:shadow-lg" onClick={() => navigate(`/membres/${membre.id}`)}>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-slate-600 to-slate-800">
                            {membre.sexe === 'M' ? '♂' : '♀'}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{membre.prenom} {membre.nom}</h3>
                            <p className="text-sm text-slate-600">{membre.numero_identification}</p>
                            {membre.profession && <p className="text-sm text-slate-600">Profession: {membre.profession}</p>}
                            {membre.lieu_residence && <p className="text-sm text-slate-600">Lieu: {membre.lieu_residence}</p>}
                            {membre.date_naissance && <p className="text-sm text-slate-600">Né(e) le {new Date(membre.date_naissance).toLocaleDateString('fr-FR')}</p>}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {results.type === 'relationship' && results.data.lienTrouve && (
                  <div className="space-y-6">
                    {/* Résumé du lien */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 shadow-md">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <Link2 size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-green-800 text-xl">Lien trouvé: {results.data.typeLien}</p>
                          <p className="text-sm text-green-700">Distance totale: {results.data.distanceTotale} génération(s)</p>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Target size={16} className="text-green-600" />
                          Point de rencontre (Ancêtre commun):
                        </p>
                        <p className="font-bold text-lg text-slate-900">
                          {results.data.ancetreCommun.prenom} {results.data.ancetreCommun.nom}
                        </p>
                        <p className="text-sm text-slate-600">{results.data.ancetreCommun.numeroIdentification}</p>
                      </div>
                    </div>

                    {/* Organigramme visuel */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-px bg-slate-300 flex-1"></div>
                        <h3 className="font-bold text-lg text-blue-700 px-4 flex items-center gap-2">
                          <BarChart3 size={20} />
                          Organigramme du lien de parenté
                        </h3>
                        <div className="h-px bg-slate-300 flex-1"></div>
                      </div>

                      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border-2 border-slate-200 shadow-lg">
                        <RelationshipTree relationshipData={results.data} />
                      </div>
                    </div>

                    {/* Détails des chemins */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                          <MapPin size={16} />
                          Membre 1
                        </h4>
                        <p className="text-sm text-slate-700">
                          {results.data.membre1?.prenom} {results.data.membre1?.nom}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Distance: {results.data.cheminMembre1?.distance} génération(s)
                        </p>
                      </div>
                      <div className="bg-pink-50 p-4 rounded-lg border-2 border-pink-200">
                        <h4 className="font-bold text-pink-800 mb-2 flex items-center gap-2">
                          <MapPin size={16} />
                          Membre 2
                        </h4>
                        <p className="text-sm text-slate-700">
                          {results.data.membre2?.prenom} {results.data.membre2?.nom}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          Distance: {results.data.cheminMembre2?.distance} génération(s)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {results.type === 'genealogy' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded">
                      <p className="font-bold">Total {results.genealogyType}: {results.data[`total${results.genealogyType === 'descendants' ? 'Descendants' : 'Ascendants'}`]}</p>
                    </div>
                    <div className="space-y-2">
                      {results.data[results.genealogyType]?.map((membre) => (
                        <div key={membre.id} className="p-3 bg-slate-50 rounded" style={{ marginLeft: `${membre.generation * 20}px` }}>
                          <p className="font-semibold">{membre.prenom} {membre.nom}</p>
                          <p className="text-xs text-slate-500">Génération {membre.generation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ) : (
              <div className="text-center text-slate-500 py-12">
                <p>Aucune recherche effectuée</p>
                <p className="text-sm">Utilisez les formulaires de recherche pour commencer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
