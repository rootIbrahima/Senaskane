import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ceremoniesAPI, membresAPI } from '../services/api';
import { Card, Loading, Button, Input } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Baby, Cross, Users, Calendar } from 'lucide-react';

// Types de cérémonies avec leurs icônes et couleurs
const TYPES_CEREMONIES = [
  { id: 'mariage', label: 'Mariage', icon: Heart, color: 'bg-pink-500', bgLight: 'bg-pink-50', textColor: 'text-pink-700', borderColor: 'border-pink-300' },
  { id: 'bapteme', label: 'Baptême', icon: Baby, color: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-300' },
  { id: 'deces', label: 'Décès', icon: Cross, color: 'bg-slate-500', bgLight: 'bg-slate-50', textColor: 'text-slate-700', borderColor: 'border-slate-300' },
  { id: 'tour_famille', label: 'Tour de Famille', icon: Users, color: 'bg-green-500', bgLight: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-300' },
  { id: 'autre', label: 'Autre', icon: Calendar, color: 'bg-orange-500', bgLight: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-300' },
];

export const Ceremonies = () => {
  const [ceremonies, setCeremonies] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    typeCeremonie: 'mariage',
    nom: '',
    description: '',
    date: '',
    lieu: '',
    budget_prevu: '',
    parrain: '',
    marraine: '',
    ndieuke: ''
  });
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadCeremonies();
    loadMembres();
  }, []);

  const loadCeremonies = async () => {
    try {
      const response = await ceremoniesAPI.getAll();
      setCeremonies(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement cérémonies:', error);
      setCeremonies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMembres = async () => {
    try {
      const response = await membresAPI.getAll();
      setMembres(response.data.data || []);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      setMembres([]);
    }
  };

  // Filtrer les membres par sexe
  const hommes = membres.filter(m => m.sexe === 'M');
  const femmes = membres.filter(m => m.sexe === 'F');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Préparer les données pour l'API
      const apiData = {
        typeCeremonie: formData.typeCeremonie,
        titre: formData.nom,
        description: formData.description,
        dateCeremonie: formData.date,
        lieu: formData.lieu,
        budgetPrevu: formData.budget_prevu ? parseFloat(formData.budget_prevu) : 0,
        parrains: []
      };

      // Ajouter les parrains/marraines selon le type
      if (formData.typeCeremonie === 'mariage' || formData.typeCeremonie === 'bapteme') {
        if (formData.parrain) {
          apiData.parrains.push({ membreId: parseInt(formData.parrain), role: 'parrain' });
        }
        if (formData.marraine) {
          apiData.parrains.push({ membreId: parseInt(formData.marraine), role: 'marraine' });
        }
      }

      // Ajouter ndieuké pour mariage
      if (formData.typeCeremonie === 'mariage' && formData.ndieuke) {
        apiData.parrains.push({ membreId: parseInt(formData.ndieuke), role: 'temoin' });
      }

      await ceremoniesAPI.createWithParrains(apiData);
      setShowModal(false);
      resetForm();
      loadCeremonies();
    } catch (error) {
      console.error('Erreur création cérémonie:', error);
      alert('Erreur lors de la création de la cérémonie');
    }
  };

  const resetForm = () => {
    setFormData({
      typeCeremonie: 'mariage',
      nom: '',
      description: '',
      date: '',
      lieu: '',
      budget_prevu: '',
      parrain: '',
      marraine: '',
      ndieuke: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      typeCeremonie: type,
      parrain: '',
      marraine: '',
      ndieuke: ''
    });
  };

  // Obtenir les infos du type de cérémonie
  const getTypeInfo = (typeId) => {
    return TYPES_CEREMONIES.find(t => t.id === typeId) || TYPES_CEREMONIES[4];
  };

  // Obtenir le nom d'un membre par son ID
  const getMembreName = (membreId) => {
    const membre = membres.find(m => m.id === parseInt(membreId));
    return membre ? `${membre.prenom} ${membre.nom}` : '';
  };

  if (loading) return <Loading text="Chargement des cérémonies..." />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button onClick={() => navigate('/')} className="text-xl sm:text-2xl hover:text-blue-200">
                ←
              </button>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Cérémonies Familiales</h1>
            </div>
            {isAdmin && (
              <Button
                onClick={() => setShowModal(true)}
                className="bg-white text-blue-700 hover:bg-slate-100 text-sm sm:text-base w-full sm:w-auto"
              >
                + Créer une cérémonie
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {ceremonies.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Aucune cérémonie enregistrée
          </div>
        ) : (
          <div className="space-y-4">
            {ceremonies.map((ceremonie) => {
              const typeInfo = getTypeInfo(ceremonie.type_ceremonie);
              const TypeIcon = typeInfo.icon;
              return (
                <Card key={ceremonie.id}>
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Badge du type */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bgLight} ${typeInfo.textColor} border ${typeInfo.borderColor}`}>
                          <TypeIcon className="w-4 h-4" />
                          {typeInfo.label}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {ceremonie.nom}
                      </h3>
                      {ceremonie.date && (
                        <p className="text-sm text-slate-600 mb-2">
                          Date: {new Date(ceremonie.date).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      {ceremonie.lieu && (
                        <p className="text-sm text-slate-600 mb-2">
                          Lieu: {ceremonie.lieu}
                        </p>
                      )}
                      {ceremonie.description && (
                        <p className="text-slate-700 mt-3">{ceremonie.description}</p>
                      )}

                      {/* Afficher parrain/marraine/ndieuké */}
                      {ceremonie.parrains && ceremonie.parrains.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {ceremonie.parrains.map((p, idx) => (
                            <span key={idx} className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                              {p.type_role === 'parrain' && '👔 Parrain: '}
                              {p.type_role === 'marraine' && '👗 Marraine: '}
                              {p.type_role === 'temoin' && '🤝 Ndieuké: '}
                              {p.prenom} {p.nom}
                            </span>
                          ))}
                        </div>
                      )}

                      {ceremonie.necessite_cotisation && (
                        <div className="mt-3">
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Cotisations activées - {ceremonie.montant_cotisation} FCFA
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                      <Button
                        onClick={() => navigate(`/cotisations/${ceremonie.id}`)}
                        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base"
                      >
                        Cotisations
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Créer Cérémonie */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Créer une cérémonie</h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Sélecteur de type de cérémonie */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-3">
                    Type de cérémonie
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TYPES_CEREMONIES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = formData.typeCeremonie === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleTypeChange(type.id)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? `${type.bgLight} ${type.borderColor} ${type.textColor} shadow-md`
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${isSelected ? type.color : 'bg-slate-100'}`}>
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                          </div>
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Nom de la cérémonie"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder={`Ex: ${getTypeInfo(formData.typeCeremonie).label} de...`}
                  required
                />

                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input min-h-[100px]"
                    placeholder="Détails de la cérémonie..."
                  />
                </div>

                <Input
                  label="Date de la cérémonie"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Lieu"
                  name="lieu"
                  value={formData.lieu}
                  onChange={handleChange}
                  placeholder="Adresse ou nom du lieu"
                  required
                />

                <Input
                  label="Budget prévu (FCFA)"
                  name="budget_prevu"
                  type="number"
                  value={formData.budget_prevu}
                  onChange={handleChange}
                  placeholder="0"
                />

                {/* Champs conditionnels pour parrain/marraine */}
                {(formData.typeCeremonie === 'mariage' || formData.typeCeremonie === 'bapteme') && (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Parrain & Marraine
                    </h3>

                    <div>
                      <label className="block text-slate-700 font-medium mb-2">
                        👔 Parrain (Homme)
                      </label>
                      <select
                        name="parrain"
                        value={formData.parrain}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="">-- Sélectionner un parrain --</option>
                        {hommes.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.prenom} {m.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-medium mb-2">
                        👗 Marraine (Femme)
                      </label>
                      <select
                        name="marraine"
                        value={formData.marraine}
                        onChange={handleChange}
                        className="input"
                      >
                        <option value="">-- Sélectionner une marraine --</option>
                        {femmes.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.prenom} {m.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ndieuké uniquement pour mariage */}
                    {formData.typeCeremonie === 'mariage' && (
                      <div>
                        <label className="block text-slate-700 font-medium mb-2">
                          🤝 Ndieuké / Belle-sœur (Femme)
                        </label>
                        <select
                          name="ndieuke"
                          value={formData.ndieuke}
                          onChange={handleChange}
                          className="input"
                        >
                          <option value="">-- Sélectionner la ndieuké --</option>
                          {femmes.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.prenom} {m.nom}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                          La ndieuké est traditionnellement la belle-sœur qui accompagne la mariée
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <Button type="submit" className="flex-1">
                  Créer la cérémonie
                </Button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
