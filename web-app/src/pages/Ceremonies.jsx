import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ceremoniesAPI } from '../services/api';
import { Card, Loading, Button, Input } from '../components';
import { useAuth } from '../contexts/AuthContext';

export const Ceremonies = () => {
  const [ceremonies, setCeremonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    date: '',
    lieu: '',
    budget_prevu: ''
  });
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadCeremonies();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ceremoniesAPI.create(formData);
      setShowModal(false);
      setFormData({
        nom: '',
        description: '',
        date: '',
        lieu: '',
        budget_prevu: ''
      });
      loadCeremonies();
    } catch (error) {
      console.error('Erreur création cérémonie:', error);
      alert('Erreur lors de la création de la cérémonie');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <Loading text="Chargement des cérémonies..." />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="text-2xl hover:text-blue-200">
                ←
              </button>
              <h1 className="text-3xl font-bold">Cérémonies Familiales</h1>
            </div>
            {isAdmin && (
              <Button
                onClick={() => setShowModal(true)}
                className="bg-white text-blue-700 hover:bg-slate-100"
              >
                + Créer une cérémonie
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {ceremonies.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Aucune cérémonie enregistrée
          </div>
        ) : (
          <div className="space-y-4">
            {ceremonies.map((ceremonie) => (
              <Card key={ceremonie.id}>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
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
                    {ceremonie.necessite_cotisation && (
                      <div className="mt-3">
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Cotisations activées - {ceremonie.montant_cotisation} FCFA
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => navigate(`/cotisations/${ceremonie.id}`)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Cotisations
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
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
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <Input
                  label="Nom de la cérémonie"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Ex: Mariage, Baptême, Anniversaire..."
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
              </div>

              <div className="flex gap-4 mt-6">
                <Button type="submit" className="flex-1">
                  Créer la cérémonie
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
    </div>
  );
};
