import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { museeAPI, membresAPI, UPLOADS_URL } from '../services/api';
import { Loading } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Upload, ImageIcon, Trash2, X, User, Users } from 'lucide-react';

export const Museum = () => {
  const navigate = useNavigate();
  const [objets, setObjets] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    proprietaire_id: '',
    est_commun: false,
    image: null
  });
  const { isAdmin, famille } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [objetsResponse, membresResponse] = await Promise.all([
        museeAPI.getAll(),
        membresAPI.getAll()
      ]);
      setObjets(objetsResponse.data.data || []);
      setMembres(membresResponse.data.data || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setObjets([]);
      setMembres([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 10MB');
        return;
      }

      // Vérifier le type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format non supporté. Utilisez JPG, PNG ou PDF');
        return;
      }

      setFormData({ ...formData, image: file });

      // Prévisualisation (sauf pour PDF)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('nom', formData.nom);
      submitData.append('description', formData.description);
      submitData.append('est_commun', formData.est_commun);

      if (formData.proprietaire_id) {
        submitData.append('proprietaire_id', formData.proprietaire_id);
      }

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      await museeAPI.create(submitData);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erreur création objet:', error);
      alert('Erreur lors de la création de l\'objet');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet objet ?')) {
      try {
        await museeAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Erreur suppression objet:', error);
        alert('Erreur lors de la suppression de l\'objet');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      description: '',
      proprietaire_id: '',
      est_commun: false,
      image: null
    });
    setImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  if (loading) return <Loading text="Chargement du musée..." />;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="bg-white/20 backdrop-blur-md p-3 sm:p-4 rounded-xl sm:rounded-2xl">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">Musée Familial</h1>
              <p className="text-slate-200 flex items-center gap-2 text-sm sm:text-base">
                <Users className="w-4 h-4" />
                Collection de la famille {famille?.nom}
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-slate-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 w-full sm:w-auto justify-center text-sm sm:text-base"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              Ajouter un objet
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1 uppercase">Total d'objets</p>
              <p className="text-3xl font-bold text-slate-800">{objets.length}</p>
            </div>
            <div className="bg-slate-600 rounded-lg p-3">
              <Building2 className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1 uppercase">Biens communs</p>
              <p className="text-3xl font-bold text-slate-800">{objets.filter(o => o.est_commun).length}</p>
            </div>
            <div className="bg-gray-600 rounded-lg p-3">
              <Users className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-stone-50 to-stone-100 border-2 border-stone-200 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-stone-600 text-sm font-medium mb-1 uppercase">Biens personnels</p>
              <p className="text-3xl font-bold text-slate-800">{objets.filter(o => !o.est_commun).length}</p>
            </div>
            <div className="bg-stone-600 rounded-lg p-3">
              <User className="w-8 h-8 text-white" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {objets.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center">
          <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-slate-500 text-base sm:text-lg">Aucun objet dans le musée pour le moment</p>
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-slate-600 hover:text-slate-700 font-semibold text-sm sm:text-base"
            >
              Ajouter le premier objet →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {objets.map((objet) => (
            <div
              key={objet.id}
              onClick={() => navigate(`/musee/${objet.id}`)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                {objet.image_url ? (
                  <img
                    src={`${UPLOADS_URL}/uploads/musee/${objet.image_url}`}
                    alt={objet.nom_objet || objet.nom}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`absolute inset-0 ${objet.image_url ? 'hidden' : 'flex'} items-center justify-center`}>
                  <ImageIcon className="w-16 h-16 text-slate-400" strokeWidth={1.5} />
                </div>

                {/* Badge */}
                {objet.est_commun ? (
                  <div className="absolute top-3 right-3 bg-gray-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Bien commun
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 bg-stone-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Personnel
                  </div>
                )}

                {/* Delete button */}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(objet.id);
                    }}
                    className="absolute top-3 left-3 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700 shadow-lg"
                    title="Supprimer cet objet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{objet.nom}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{objet.description}</p>

                {objet.proprietaire_nom && !objet.est_commun && (
                  <div className="flex items-center gap-2 text-sm text-stone-700 bg-stone-50 px-3 py-2 rounded-lg border border-stone-200">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{objet.proprietaire_nom}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ajouter Objet */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-br from-slate-700 to-slate-800 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Upload className="w-7 h-7" />
                Ajouter un objet au musée
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Photo de l'objet
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-slate-400 transition-colors duration-200">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Prévisualisation"
                        className="max-h-48 rounded-lg shadow-md"
                      />
                    ) : (
                      <>
                        <div className="bg-slate-100 p-4 rounded-full">
                          <ImageIcon className="w-8 h-8 text-slate-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-slate-700 font-medium">Cliquez pour télécharger une image</p>
                          <p className="text-sm text-slate-500 mt-1">JPG, PNG ou PDF (max 10MB)</p>
                        </div>
                      </>
                    )}
                  </label>
                  {formData.image && (
                    <div className="mt-3 text-center">
                      <p className="text-sm text-slate-600 font-medium">{formData.image.name}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: null });
                          setImagePreview(null);
                        }}
                        className="text-red-600 hover:text-red-700 text-sm mt-2"
                      >
                        Supprimer l'image
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Nom */}
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Nom de l'objet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                  required
                  placeholder="Ex: Tableau ancestral, Bijou familial..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-semibold mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 min-h-[120px]"
                  required
                  placeholder="Décrivez l'objet, son histoire, sa signification..."
                />
              </div>

              {/* Bien commun ou personnel */}
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl">
                <input
                  type="checkbox"
                  name="est_commun"
                  id="est_commun"
                  checked={formData.est_commun}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 text-slate-600 rounded focus:ring-2 focus:ring-slate-500"
                />
                <label htmlFor="est_commun" className="flex-1 cursor-pointer">
                  <span className="text-slate-700 font-semibold block mb-1">
                    Bien commun de la famille
                  </span>
                  <span className="text-sm text-slate-600">
                    Cochez cette case si cet objet appartient à toute la famille et non à un membre en particulier
                  </span>
                </label>
              </div>

              {/* Propriétaire (si non commun) */}
              {!formData.est_commun && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">
                    Propriétaire
                  </label>
                  <select
                    name="proprietaire_id"
                    value={formData.proprietaire_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Sélectionner un membre</option>
                    {membres.map((membre) => (
                      <option key={membre.id} value={membre.id}>
                        {membre.prenom} {membre.nom}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-slate-700 hover:to-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Ajouter l'objet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300"
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
