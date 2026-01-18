import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { museeAPI, membresAPI, UPLOADS_URL } from '../services/api';
import { Loading } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Edit2, Trash2, User, Users, Calendar, ImageIcon, X } from 'lucide-react';

export const MuseumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [objet, setObjet] = useState(null);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [editForm, setEditForm] = useState({
    nom: '',
    description: '',
    proprietaire_id: '',
    est_commun: false,
    image: null
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [objetResponse, membresResponse] = await Promise.all([
        museeAPI.getById(id),
        membresAPI.getAll()
      ]);
      const objetData = objetResponse.data.data || objetResponse.data;
      setObjet(objetData);
      setMembres(membresResponse.data.data || []);

      setEditForm({
        nom: objetData.nom_objet || '',
        description: objetData.description || '',
        proprietaire_id: objetData.proprietaire_id || '',
        est_commun: objetData.est_commun || false,
        image: null
      });
    } catch (error) {
      console.error('Erreur chargement objet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet objet ?')) {
      return;
    }

    try {
      await museeAPI.delete(id);
      alert('Objet supprimé avec succès');
      navigate('/musee');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression de l\'objet');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format non supporté. Utilisez JPG, PNG ou PDF');
        return;
      }

      setEditForm({ ...editForm, image: file });

      if (file.type !== 'application/pdf') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('nomObjet', editForm.nom);
      submitData.append('description', editForm.description);

      if (editForm.image) {
        submitData.append('image', editForm.image);
      }

      await museeAPI.update(id, submitData);
      setShowEditModal(false);
      setImagePreview(null);
      loadData();
      alert('Objet modifié avec succès');
    } catch (error) {
      console.error('Erreur modification:', error);
      alert('Erreur lors de la modification de l\'objet');
    }
  };

  if (loading) {
    return <Loading text="Chargement de l'objet..." />;
  }

  if (!objet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700 mb-4">Objet non trouvé</h2>
          <button
            onClick={() => navigate('/musee')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Retour au musée
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-slate-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => navigate('/musee')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-semibold transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Retour au musée
          </button>

          {isAdmin && (
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm sm:text-base"
              >
                <Edit2 className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md text-sm sm:text-base"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 aspect-square lg:aspect-auto">
              {objet.image_url ? (
                <img
                  src={`${UPLOADS_URL}/uploads/musee/${objet.image_url}`}
                  alt={objet.nom_objet}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-24 h-24 text-slate-400" strokeWidth={1.5} />
                </div>
              )}

              {/* Badge */}
              <div className="absolute top-4 right-4">
                {objet.est_commun ? (
                  <div className="bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Bien commun
                  </div>
                ) : (
                  <div className="bg-stone-600 text-white px-4 py-2 rounded-xl font-semibold shadow-lg flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personnel
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="p-8 lg:p-12">
              <h1 className="text-4xl font-bold text-slate-800 mb-6">{objet.nom_objet}</h1>

              <div className="space-y-6">
                {/* Description */}
                {objet.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</h3>
                    <p className="text-slate-700 text-lg leading-relaxed">{objet.description}</p>
                  </div>
                )}

                {/* Propriétaire */}
                {objet.proprietaire_nom && !objet.est_commun && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Propriétaire</h3>
                    <div className="flex items-center gap-3 text-stone-700 bg-stone-50 px-4 py-3 rounded-xl border border-stone-200">
                      <User className="w-5 h-5" />
                      <span className="font-semibold text-lg">
                        {objet.proprietaire_prenom} {objet.proprietaire_nom}
                      </span>
                    </div>
                  </div>
                )}

                {/* Date d'ajout */}
                {objet.date_ajout && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Date d'ajout</h3>
                    <div className="flex items-center gap-3 text-slate-700">
                      <Calendar className="w-5 h-5" />
                      <span className="text-lg">
                        {new Date(objet.date_ajout).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-br from-slate-700 to-slate-800 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Edit2 className="w-7 h-7" />
                Modifier l'objet
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setImagePreview(null);
                }}
                className="text-white hover:text-slate-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nom de l'objet *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.nom}
                  onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Ex: Vieux livre de famille"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Décrivez cet objet..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nouvelle image (optionnel)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Aperçu" className="max-h-48 rounded-lg" />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setImagePreview(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
