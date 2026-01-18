import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cotisationAPI, ceremoniesAPI, membresAPI } from '../services/api';
import { Card, Loading, Button, Input } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Trash2, Download } from 'lucide-react';

export const Cotisations = () => {
  const { ceremonieId } = useParams();
  const [ceremonie, setCeremonie] = useState(null);
  const [cotisations, setCotisations] = useState([]);
  const [recettes, setRecettes] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [bilan, setBilan] = useState(null);
  const [resume, setResume] = useState(null);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembres, setLoadingMembres] = useState(false);
  const [activeTab, setActiveTab] = useState('bilan');
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showRecetteModal, setShowRecetteModal] = useState(false);
  const [showDepenseModal, setShowDepenseModal] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  const [activateForm, setActivateForm] = useState({
    montantCotisation: '',
    tresorierMembreId: ''
  });

  const [recordForm, setRecordForm] = useState({
    membreId: '',
    modePaiement: 'especes',
    referencePaiement: '',
    notes: ''
  });

  const [recetteForm, setRecetteForm] = useState({
    typeRecette: 'cotisation',
    montant: '',
    contributeurNom: '',
    description: '',
    dateRecette: new Date().toISOString().split('T')[0]
  });

  const [depenseForm, setDepenseForm] = useState({
    rubrique: 'repas',
    montant: '',
    beneficiaire: '',
    description: '',
    dateDepense: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (ceremonieId) {
      loadData();
      loadMembres();
    } else {
      navigate('/ceremonies');
    }
  }, [ceremonieId]);

  const loadMembres = async () => {
    try {
      setLoadingMembres(true);
      const response = await membresAPI.getAll();
      // Filtrer uniquement les membres vivants
      const membresVivants = (response.data.data || []).filter(m => !m.date_deces);
      setMembres(membresVivants);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      setMembres([]);
    } finally {
      setLoadingMembres(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Load ceremony details
      const ceremResponse = await ceremoniesAPI.getById(ceremonieId);
      setCeremonie(ceremResponse.data.data);

      // Load cotisations list
      try {
        const cotisResponse = await cotisationAPI.getListe(ceremonieId);
        setCotisations(cotisResponse.data.data.cotisations || []);
      } catch (err) {
        console.log('Pas de cotisations');
      }

      // Load recettes
      try {
        const recettesResponse = await ceremoniesAPI.getRecettes(ceremonieId);
        setRecettes(recettesResponse.data.data || []);
      } catch (err) {
        console.log('Pas de recettes');
      }

      // Load depenses
      try {
        const depensesResponse = await ceremoniesAPI.getDepenses(ceremonieId);
        setDepenses(depensesResponse.data.data || []);
      } catch (err) {
        console.log('Pas de dépenses');
      }

      // Load bilan
      try {
        const bilanResponse = await ceremoniesAPI.getBilan(ceremonieId);
        setBilan(bilanResponse.data.data);
      } catch (err) {
        console.log('Pas de bilan');
      }

      // Load resume
      try {
        const resumeResponse = await cotisationAPI.getResume(ceremonieId);
        setResume(resumeResponse.data.data);
      } catch (err) {
        console.log('Pas de résumé');
      }

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    try {
      const response = await cotisationAPI.activer({
        ceremonieId: parseInt(ceremonieId),
        ...activateForm
      });

      alert(`Cotisations activées!\nLogin trésorier: ${response.data.data.tresorier.login}\nMot de passe temporaire: ${response.data.data.tresorier.motDePasseTemporaire}\n\nNombre de membres: ${response.data.data.nombreMembres}`);

      setShowActivateModal(false);
      loadData();
    } catch (error) {
      console.error('Erreur activation:', error);
      alert('Erreur lors de l\'activation des cotisations');
    }
  };

  const handleRecordCotisation = async (e) => {
    e.preventDefault();
    try {
      await cotisationAPI.enregistrer({
        ceremonieId: parseInt(ceremonieId),
        membreId: parseInt(recordForm.membreId),
        modePaiement: recordForm.modePaiement,
        referencePaiement: recordForm.referencePaiement || undefined,
        notes: recordForm.notes || undefined
      });

      alert('Cotisation enregistrée avec succès!');
      setShowRecordModal(false);
      setRecordForm({ membreId: '', modePaiement: 'especes', referencePaiement: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Erreur enregistrement:', error);
      alert('Erreur lors de l\'enregistrement de la cotisation');
    }
  };

  const handleDeleteCotisation = async (membreId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette cotisation ?')) {
      return;
    }

    try {
      await cotisationAPI.annuler({
        ceremonieId: parseInt(ceremonieId),
        membreId: parseInt(membreId)
      });

      alert('Cotisation annulée avec succès!');
      loadData();
    } catch (error) {
      console.error('Erreur annulation cotisation:', error);
      alert('Erreur lors de l\'annulation de la cotisation');
    }
  };

  const handleAddRecette = async (e) => {
    e.preventDefault();
    try {
      await ceremoniesAPI.addRecette(ceremonieId, {
        typeRecette: recetteForm.typeRecette,
        montant: parseFloat(recetteForm.montant),
        contributeurNom: recetteForm.contributeurNom || undefined,
        description: recetteForm.description || undefined,
        dateRecette: recetteForm.dateRecette
      });

      alert('Recette ajoutée avec succès!');
      setShowRecetteModal(false);
      setRecetteForm({
        typeRecette: 'cotisation',
        montant: '',
        contributeurNom: '',
        description: '',
        dateRecette: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      console.error('Erreur ajout recette:', error);
      alert('Erreur lors de l\'ajout de la recette');
    }
  };

  const handleAddDepense = async (e) => {
    e.preventDefault();
    try {
      await ceremoniesAPI.addDepense(ceremonieId, {
        rubrique: depenseForm.rubrique,
        montant: parseFloat(depenseForm.montant),
        beneficiaire: depenseForm.beneficiaire || undefined,
        description: depenseForm.description || undefined,
        dateDepense: depenseForm.dateDepense
      });

      alert('Dépense ajoutée avec succès!');
      setShowDepenseModal(false);
      setDepenseForm({
        rubrique: 'repas',
        montant: '',
        beneficiaire: '',
        description: '',
        dateDepense: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      console.error('Erreur ajout dépense:', error);
      alert('Erreur lors de l\'ajout de la dépense');
    }
  };

  const handleDeleteRecette = async (recetteId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) return;

    try {
      await ceremoniesAPI.deleteRecette(ceremonieId, recetteId);
      alert('Recette supprimée avec succès!');
      loadData();
    } catch (error) {
      console.error('Erreur suppression recette:', error);
      alert('Erreur lors de la suppression de la recette');
    }
  };

  const handleDeleteDepense = async (depenseId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return;

    try {
      await ceremoniesAPI.deleteDepense(ceremonieId, depenseId);
      alert('Dépense supprimée avec succès!');
      loadData();
    } catch (error) {
      console.error('Erreur suppression dépense:', error);
      alert('Erreur lors de la suppression de la dépense');
    }
  };

  const handleExportCotisations = async () => {
    try {
      const response = await cotisationAPI.exportCotisations(ceremonieId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cotisations_${ceremonie?.titre}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const handleExportDepenses = async () => {
    try {
      const response = await cotisationAPI.exportDepenses(ceremonieId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `depenses_${ceremonie?.titre}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA';
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  const getRubriqueLabel = (rubrique) => {
    const labels = {
      bache: 'Bâche',
      chaises: 'Chaises',
      sonorisation: 'Sonorisation',
      repas: 'Repas',
      honoraires: 'Honoraires',
      transport: 'Transport',
      habillement: 'Habillement',
      autre: 'Autre'
    };
    return labels[rubrique] || rubrique;
  };

  const getTypeRecetteLabel = (type) => {
    const labels = {
      cotisation: 'Cotisation',
      don: 'Don',
      autre: 'Autre'
    };
    return labels[type] || type;
  };

  const estTresorierOuAdmin = user && (user.role === 'admin' || user.role === 'tresorier');

  if (loading) return <Loading text="Chargement des données financières..." />;

  // Calculer les totaux
  const totalRecettes = bilan?.totalRecettes || recettes.reduce((sum, r) => sum + parseFloat(r.montant || 0), 0);
  const totalDepenses = bilan?.totalDepenses || depenses.reduce((sum, d) => sum + parseFloat(d.montant || 0), 0);
  const solde = totalRecettes - totalDepenses;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <button onClick={() => navigate('/ceremonies')} className="text-xl sm:text-2xl hover:text-blue-200">
                ←
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Gestion Financière</h1>
                <p className="text-blue-200 text-sm sm:text-base">{ceremonie?.titre}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Actions rapides */}
        {estTresorierOuAdmin && (
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
            {isAdmin && !ceremonie?.necessite_cotisation && (
              <Button onClick={() => setShowActivateModal(true)} className="flex items-center gap-2 text-sm sm:text-base">
                <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden xs:inline">Activer les cotisations</span>
                <span className="xs:hidden">Activer</span>
              </Button>
            )}
            {ceremonie?.necessite_cotisation && (
              <>
                <Button onClick={() => setShowRecordModal(true)} className="flex items-center gap-1 sm:gap-2 bg-green-600 text-xs sm:text-sm">
                  <Plus size={14} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Enregistrer cotisation</span>
                  <span className="sm:hidden">Cotisation</span>
                </Button>
                <Button onClick={() => setShowRecetteModal(true)} className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-xs sm:text-sm">
                  <TrendingUp size={14} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Ajouter recette</span>
                  <span className="sm:hidden">Recette</span>
                </Button>
                <Button onClick={() => setShowDepenseModal(true)} className="flex items-center gap-1 sm:gap-2 bg-red-600 text-xs sm:text-sm">
                  <TrendingDown size={14} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Ajouter dépense</span>
                  <span className="sm:hidden">Dépense</span>
                </Button>
                <Button onClick={handleExportCotisations} className="flex items-center gap-1 sm:gap-2 bg-slate-600 text-xs sm:text-sm">
                  <Download size={14} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden md:inline">Export Cotisations</span>
                  <span className="md:hidden">Export</span>
                </Button>
                <Button onClick={handleExportDepenses} className="flex items-center gap-1 sm:gap-2 bg-slate-600 text-xs sm:text-sm">
                  <Download size={14} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden md:inline">Export Dépenses</span>
                  <span className="md:hidden">Dép.</span>
                </Button>
              </>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-6 border-b overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('bilan')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold whitespace-nowrap flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${activeTab === 'bilan' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-600'}`}
          >
            <Wallet size={16} className="sm:w-[18px] sm:h-[18px]" />
            Bilan
          </button>
          {ceremonie?.necessite_cotisation && (
            <button
              onClick={() => setActiveTab('cotisations')}
              className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold whitespace-nowrap flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${activeTab === 'cotisations' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-600'}`}
            >
              <DollarSign size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Cotisations</span> ({cotisations.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('recettes')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold whitespace-nowrap flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${activeTab === 'recettes' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-600'}`}
          >
            <TrendingUp size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Recettes</span> ({recettes.length})
          </button>
          <button
            onClick={() => setActiveTab('depenses')}
            className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold whitespace-nowrap flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${activeTab === 'depenses' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-600'}`}
          >
            <TrendingDown size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Dépenses</span> ({depenses.length})
          </button>
        </div>

        {/* Bilan Tab */}
        {activeTab === 'bilan' && (
          <div className="space-y-6">
            {/* Résumé financier */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Recettes</p>
                    <p className="text-3xl font-bold text-green-600">{formatMontant(totalRecettes)}</p>
                  </div>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <TrendingUp size={32} className="text-white" />
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Dépenses</p>
                    <p className="text-3xl font-bold text-red-600">{formatMontant(totalDepenses)}</p>
                  </div>
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                    <TrendingDown size={32} className="text-white" />
                  </div>
                </div>
              </Card>

              <Card className={`bg-gradient-to-br ${solde >= 0 ? 'from-blue-50 to-cyan-50 border-2 border-blue-200' : 'from-orange-50 to-yellow-50 border-2 border-orange-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Solde</p>
                    <p className={`text-3xl font-bold ${solde >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {formatMontant(solde)}
                    </p>
                  </div>
                  <div className={`w-16 h-16 ${solde >= 0 ? 'bg-blue-500' : 'bg-orange-500'} rounded-full flex items-center justify-center`}>
                    <Wallet size={32} className="text-white" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Détail recettes par type */}
            {bilan?.recettesParType && bilan.recettesParType.length > 0 && (
              <Card>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-600" />
                  Répartition des Recettes
                </h3>
                <div className="space-y-2">
                  {bilan.recettesParType.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-semibold text-slate-700">{getTypeRecetteLabel(item.type_recette)}</span>
                      <span className="font-bold text-green-600">{formatMontant(item.total)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Détail dépenses par rubrique */}
            {bilan?.depensesParRubrique && bilan.depensesParRubrique.length > 0 && (
              <Card>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingDown size={20} className="text-red-600" />
                  Répartition des Dépenses
                </h3>
                <div className="space-y-2">
                  {bilan.depensesParRubrique.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-semibold text-slate-700">{getRubriqueLabel(item.rubrique)}</span>
                      <span className="font-bold text-red-600">{formatMontant(item.total)}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Taux de collecte des cotisations */}
            {resume && (
              <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Taux de Collecte des Cotisations</h3>
                    <p className="text-sm text-slate-600">
                      {resume.nombreCotisees || 0} / {resume.totalMembres || 0} membres ont cotisé
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-bold text-purple-600">{resume.tauxCollecte || 0}%</p>
                  </div>
                </div>
                <div className="mt-4 bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
                    style={{ width: `${resume.tauxCollecte || 0}%` }}
                  />
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Cotisations List */}
        {activeTab === 'cotisations' && (
          <div className="grid grid-cols-1 gap-4">
            {cotisations.length === 0 ? (
              <Card className="py-12 text-center text-slate-500">
                Aucune cotisation enregistrée
              </Card>
            ) : (
              cotisations.map((cotis) => (
                <Card key={cotis.id} className="hover:shadow-lg transition-shadow relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold ${cotis.a_cotise ? 'bg-green-500' : 'bg-slate-400'}`}>
                        {cotis.a_cotise ? '✓' : '-'}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{cotis.prenom} {cotis.nom}</h3>
                        {cotis.a_cotise && (
                          <div className="text-sm text-slate-600 space-y-1">
                            <p>Mode: <span className="font-medium">{cotis.mode_paiement}</span></p>
                            {cotis.reference_paiement && <p className="text-xs text-slate-500">Réf: {cotis.reference_paiement}</p>}
                            {cotis.date_cotisation && <p className="text-xs text-slate-500">Le {formatDate(cotis.date_cotisation)}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatMontant(cotis.montant)}</p>
                        <span className={`text-xs px-3 py-1 rounded-full ${cotis.a_cotise ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {cotis.a_cotise ? 'Payé' : 'En attente'}
                        </span>
                      </div>
                      {cotis.a_cotise && estTresorierOuAdmin && (
                        <button
                          onClick={() => handleDeleteCotisation(cotis.membre_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Annuler cette cotisation"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Recettes List */}
        {activeTab === 'recettes' && (
          <div className="grid grid-cols-1 gap-4">
            {recettes.length === 0 ? (
              <Card className="py-12 text-center text-slate-500">
                Aucune recette enregistrée
              </Card>
            ) : (
              recettes.map((recette) => (
                <Card key={recette.id} className="hover:shadow-lg transition-shadow relative">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          {getTypeRecetteLabel(recette.type_recette)}
                        </span>
                        <span className="text-sm text-slate-500">{formatDate(recette.date_recette)}</span>
                      </div>
                      {recette.contributeur_nom && (
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          De: {recette.contributeur_nom}
                        </p>
                      )}
                      {recette.description && (
                        <p className="text-sm text-slate-600">{recette.description}</p>
                      )}
                    </div>
                    <div className="text-right flex items-start gap-3">
                      <p className="text-2xl font-bold text-green-600">+{formatMontant(recette.montant)}</p>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteRecette(recette.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Dépenses List */}
        {activeTab === 'depenses' && (
          <div className="grid grid-cols-1 gap-4">
            {depenses.length === 0 ? (
              <Card className="py-12 text-center text-slate-500">
                Aucune dépense enregistrée
              </Card>
            ) : (
              depenses.map((depense) => (
                <Card key={depense.id} className="hover:shadow-lg transition-shadow relative">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          {getRubriqueLabel(depense.rubrique)}
                        </span>
                        <span className="text-sm text-slate-500">{formatDate(depense.date_depense)}</span>
                      </div>
                      {depense.beneficiaire && (
                        <p className="text-sm font-medium text-slate-700 mb-1">
                          À: {depense.beneficiaire}
                        </p>
                      )}
                      {depense.description && (
                        <p className="text-sm text-slate-600">{depense.description}</p>
                      )}
                    </div>
                    <div className="text-right flex items-start gap-3">
                      <p className="text-2xl font-bold text-red-600">-{formatMontant(depense.montant)}</p>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteDepense(depense.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal Activer Cotisations */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Activer les Cotisations</h2>
              <button onClick={() => setShowActivateModal(false)} className="text-slate-500 hover:text-slate-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleActivate} className="p-6">
              <Input
                label="Montant de la cotisation (FCFA)"
                type="number"
                value={activateForm.montantCotisation}
                onChange={(e) => setActivateForm({ ...activateForm, montantCotisation: e.target.value })}
                required
              />
              <div className="mt-4">
                <label className="block text-slate-700 font-semibold mb-2">
                  Choisir le Trésorier <span className="text-red-500">*</span>
                </label>
                {loadingMembres ? (
                  <p className="text-sm text-slate-500">Chargement des membres...</p>
                ) : (
                  <select
                    value={activateForm.tresorierMembreId}
                    onChange={(e) => setActivateForm({ ...activateForm, tresorierMembreId: e.target.value })}
                    className="input w-full"
                    required
                  >
                    <option value="">Sélectionner un membre</option>
                    {membres.map((membre) => (
                      <option key={membre.id} value={membre.id}>
                        {membre.prenom} {membre.nom} ({membre.numero_identification})
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Le membre sélectionné recevra un compte trésorier avec un login et mot de passe temporaire
                </p>
              </div>
              <div className="flex gap-4 mt-6">
                <Button type="submit" className="flex-1" disabled={loadingMembres}>Activer</Button>
                <button type="button" onClick={() => setShowActivateModal(false)} className="flex-1 px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Enregistrer Cotisation */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold">Enregistrer une Cotisation</h2>
              <button onClick={() => setShowRecordModal(false)} className="text-slate-500 hover:text-slate-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleRecordCotisation} className="p-6">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">Membre</label>
                <select
                  value={recordForm.membreId}
                  onChange={(e) => setRecordForm({ ...recordForm, membreId: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Sélectionner un membre</option>
                  {cotisations.filter(c => !c.a_cotise).map((c) => (
                    <option key={c.membre_id} value={c.membre_id}>{c.prenom} {c.nom}</option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <label className="block text-slate-700 font-semibold mb-2">Mode de paiement</label>
                <select
                  value={recordForm.modePaiement}
                  onChange={(e) => setRecordForm({ ...recordForm, modePaiement: e.target.value })}
                  className="input"
                  required
                >
                  <option value="especes">Espèces</option>
                  <option value="virement">Virement</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="cheque">Chèque</option>
                </select>
              </div>
              <Input
                label="Référence de paiement (optionnel)"
                value={recordForm.referencePaiement}
                onChange={(e) => setRecordForm({ ...recordForm, referencePaiement: e.target.value })}
                className="mt-4"
              />
              <div className="mt-4">
                <label className="block text-slate-700 font-semibold mb-2">Notes (optionnel)</label>
                <textarea
                  value={recordForm.notes}
                  onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <Button type="submit" className="flex-1">Enregistrer</Button>
                <button type="button" onClick={() => setShowRecordModal(false)} className="flex-1 px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajouter Recette */}
      {showRecetteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold">Ajouter une Recette</h2>
              <button onClick={() => setShowRecetteModal(false)} className="text-slate-500 hover:text-slate-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleAddRecette} className="p-6">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">Type de recette</label>
                <select
                  value={recetteForm.typeRecette}
                  onChange={(e) => setRecetteForm({ ...recetteForm, typeRecette: e.target.value })}
                  className="input"
                  required
                >
                  <option value="cotisation">Cotisation</option>
                  <option value="don">Don</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <Input
                label="Montant (FCFA)"
                type="number"
                step="0.01"
                value={recetteForm.montant}
                onChange={(e) => setRecetteForm({ ...recetteForm, montant: e.target.value })}
                required
                className="mt-4"
              />
              <Input
                label="Contributeur (optionnel)"
                value={recetteForm.contributeurNom}
                onChange={(e) => setRecetteForm({ ...recetteForm, contributeurNom: e.target.value })}
                className="mt-4"
                placeholder="Nom du contributeur"
              />
              <div className="mt-4">
                <label className="block text-slate-700 font-semibold mb-2">Description (optionnel)</label>
                <textarea
                  value={recetteForm.description}
                  onChange={(e) => setRecetteForm({ ...recetteForm, description: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>
              <Input
                label="Date"
                type="date"
                value={recetteForm.dateRecette}
                onChange={(e) => setRecetteForm({ ...recetteForm, dateRecette: e.target.value })}
                required
                className="mt-4"
              />
              <div className="flex gap-4 mt-6">
                <Button type="submit" className="flex-1">Ajouter</Button>
                <button type="button" onClick={() => setShowRecetteModal(false)} className="flex-1 px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajouter Dépense */}
      {showDepenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0">
              <h2 className="text-2xl font-bold">Ajouter une Dépense</h2>
              <button onClick={() => setShowDepenseModal(false)} className="text-slate-500 hover:text-slate-700 text-2xl">×</button>
            </div>
            <form onSubmit={handleAddDepense} className="p-6">
              <div>
                <label className="block text-slate-700 font-semibold mb-2">Rubrique</label>
                <select
                  value={depenseForm.rubrique}
                  onChange={(e) => setDepenseForm({ ...depenseForm, rubrique: e.target.value })}
                  className="input"
                  required
                >
                  <option value="bache">Bâche</option>
                  <option value="chaises">Chaises</option>
                  <option value="sonorisation">Sonorisation</option>
                  <option value="repas">Repas</option>
                  <option value="honoraires">Honoraires</option>
                  <option value="transport">Transport</option>
                  <option value="habillement">Habillement</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <Input
                label="Montant (FCFA)"
                type="number"
                step="0.01"
                value={depenseForm.montant}
                onChange={(e) => setDepenseForm({ ...depenseForm, montant: e.target.value })}
                required
                className="mt-4"
              />
              <Input
                label="Bénéficiaire (optionnel)"
                value={depenseForm.beneficiaire}
                onChange={(e) => setDepenseForm({ ...depenseForm, beneficiaire: e.target.value })}
                className="mt-4"
                placeholder="Nom du bénéficiaire/fournisseur"
              />
              <div className="mt-4">
                <label className="block text-slate-700 font-semibold mb-2">Description (optionnel)</label>
                <textarea
                  value={depenseForm.description}
                  onChange={(e) => setDepenseForm({ ...depenseForm, description: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>
              <Input
                label="Date"
                type="date"
                value={depenseForm.dateDepense}
                onChange={(e) => setDepenseForm({ ...depenseForm, dateDepense: e.target.value })}
                required
                className="mt-4"
              />
              <div className="flex gap-4 mt-6">
                <Button type="submit" className="flex-1">Ajouter</Button>
                <button type="button" onClick={() => setShowDepenseModal(false)} className="flex-1 px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
