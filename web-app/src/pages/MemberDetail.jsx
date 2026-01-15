import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { membresAPI } from '../services/api';
import { Card, Loading, Button, Input } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

export const MemberDetail = () => {
  const { id } = useParams();
  const [membre, setMembre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [editForm, setEditForm] = useState({
    nom: '',
    prenom: '',
    sexe: 'M',
    date_naissance: '',
    lieu_naissance: '',
    profession: '',
    lieu_residence: '',
    nom_conjoint: '',
    date_deces: '',
    lieu_deces: '',
    informations_supplementaires: ''
  });

  useEffect(() => {
    loadMembre();
  }, [id]);

  const loadMembre = async () => {
    try {
      const response = await membresAPI.getById(id);
      const data = response.data.data || response.data;
      setMembre(data);

      // Populate edit form
      setEditForm({
        nom: data.nom || '',
        prenom: data.prenom || '',
        sexe: data.sexe || 'M',
        date_naissance: data.date_naissance ? data.date_naissance.split('T')[0] : '',
        lieu_naissance: data.lieu_naissance || '',
        profession: data.profession || '',
        lieu_residence: data.lieu_residence || '',
        nom_conjoint: data.nom_conjoint || '',
        date_deces: data.date_deces ? data.date_deces.split('T')[0] : '',
        lieu_deces: data.lieu_deces || '',
        informations_supplementaires: data.informations_supplementaires || ''
      });
    } catch (error) {
      console.error('Erreur chargement membre:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Voulez-vous vraiment supprimer ${membre.prenom} ${membre.nom} ?`)) {
      return;
    }

    try {
      await membresAPI.delete(id);
      alert('Membre supprimé avec succès');
      navigate('/membres');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression du membre');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await membresAPI.update(id, editForm);
      alert('Membre modifié avec succès');
      setShowEditModal(false);
      loadMembre();
    } catch (error) {
      console.error('Erreur modification:', error);
      alert('Erreur lors de la modification du membre');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      await membresAPI.uploadPhoto(id, formData);
      alert('Photo mise à jour avec succès');
      setShowPhotoModal(false);
      loadMembre();
    } catch (error) {
      console.error('Erreur upload photo:', error);
      alert('Erreur lors de l\'upload de la photo');
    }
  };

  if (loading) return <Loading text="Chargement..." />;
  if (!membre) return <div className="text-center py-12">Membre non trouvé</div>;

  const photoUrl = membre.photo ? `http://localhost:3000/uploads/photos/${membre.photo}` : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/membres')} className="text-2xl hover:text-blue-200">
                ←
              </button>
              <h1 className="text-3xl font-bold">Détails du membre</h1>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <Button onClick={() => setShowEditModal(true)} className="bg-white text-blue-700 hover:bg-slate-100">
                  Modifier
                </Button>
                <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Photo */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={`${membre.prenom} ${membre.nom}`}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full flex items-center justify-center text-6xl text-white bg-gradient-to-br from-slate-600 to-slate-800">
                    {membre.sexe === 'M' ? '♂' : '♀'}
                  </div>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm"
                  >
                    Modifier photo
                  </button>
                )}
              </div>
              <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {membre.numero_identification}
              </div>
            </div>

            {/* Informations */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-slate-800 mb-6">
                {membre.prenom} {membre.nom}
              </h2>

              {/* Informations personnelles */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-3 border-b pb-2">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Sexe" value={membre.sexe === 'M' ? 'Masculin' : 'Féminin'} />
                  <InfoItem label="Date de naissance" value={membre.date_naissance ? new Date(membre.date_naissance).toLocaleDateString('fr-FR') : 'Non renseignée'} />
                  <InfoItem label="Lieu de naissance" value={membre.lieu_naissance || 'Non renseigné'} />
                  <InfoItem label="Profession" value={membre.profession || 'Non renseignée'} />
                  <InfoItem label="Lieu de résidence" value={membre.lieu_residence || 'Non renseigné'} />
                </div>
              </div>

              {/* Statut matrimonial */}
              {membre.nom_conjoint && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b pb-2">Statut matrimonial</h3>
                  <InfoItem label="Nom du conjoint" value={membre.nom_conjoint} />
                </div>
              )}

              {/* Informations de décès */}
              {membre.date_deces && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b pb-2">Informations de décès</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem label="Date de décès" value={new Date(membre.date_deces).toLocaleDateString('fr-FR')} />
                    <InfoItem label="Lieu de décès" value={membre.lieu_deces || 'Non renseigné'} />
                  </div>
                </div>
              )}

              {/* Informations supplémentaires */}
              {membre.informations_supplementaires && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 border-b pb-2">Informations supplémentaires</h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{membre.informations_supplementaires}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Modal Modifier */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl flex-shrink-0">
              <h2 className="text-2xl font-bold">Modifier le membre</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:text-slate-200 transition-colors"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form id="edit-form" onSubmit={handleEdit} className="flex-1 overflow-y-auto p-6">
              {/* Informations essentielles */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">Informations essentielles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nom *"
                    value={editForm.nom}
                    onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                    required
                  />
                  <Input
                    label="Prénom *"
                    value={editForm.prenom}
                    onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-slate-700 font-semibold mb-2">Sexe *</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, sexe: 'M' })}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 font-semibold ${
                          editForm.sexe === 'M' ? 'bg-slate-600 text-white border-slate-600' : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Masculin
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, sexe: 'F' })}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 font-semibold ${
                          editForm.sexe === 'F' ? 'bg-gray-600 text-white border-gray-600' : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Féminin
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations personnelles */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Date de naissance"
                    type="date"
                    value={editForm.date_naissance}
                    onChange={(e) => setEditForm({ ...editForm, date_naissance: e.target.value })}
                  />
                  <Input
                    label="Lieu de naissance"
                    value={editForm.lieu_naissance}
                    onChange={(e) => setEditForm({ ...editForm, lieu_naissance: e.target.value })}
                  />
                  <Input
                    label="Profession"
                    value={editForm.profession}
                    onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
                  />
                  <Input
                    label="Lieu de résidence"
                    value={editForm.lieu_residence}
                    onChange={(e) => setEditForm({ ...editForm, lieu_residence: e.target.value })}
                  />
                  <Input
                    label="Nom du conjoint"
                    value={editForm.nom_conjoint}
                    onChange={(e) => setEditForm({ ...editForm, nom_conjoint: e.target.value })}
                  />
                </div>
              </div>

              {/* Informations de décès */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">Informations de décès (si applicable)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Date de décès"
                    type="date"
                    value={editForm.date_deces}
                    onChange={(e) => setEditForm({ ...editForm, date_deces: e.target.value })}
                  />
                  <Input
                    label="Lieu de décès"
                    value={editForm.lieu_deces}
                    onChange={(e) => setEditForm({ ...editForm, lieu_deces: e.target.value })}
                  />
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">Informations supplémentaires</h3>
                <label className="block text-slate-700 font-semibold mb-2">
                  Histoire familiale, anecdotes, etc.
                </label>
                <textarea
                  value={editForm.informations_supplementaires}
                  onChange={(e) => setEditForm({ ...editForm, informations_supplementaires: e.target.value })}
                  className="input min-h-[120px]"
                  placeholder="Ajoutez des informations supplémentaires sur ce membre..."
                />
              </div>

            </form>

            <div className="border-t bg-slate-50 px-6 py-4 flex gap-3 flex-shrink-0 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors font-semibold"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="edit-form"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg"
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Photo */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold">Modifier la photo</h2>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="text-white hover:text-slate-200 transition-colors"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handlePhotoUpload}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-xl file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gradient-to-r file:from-blue-600 file:to-blue-700
                  file:text-white
                  hover:file:from-blue-700 hover:file:to-blue-800
                  file:shadow-lg
                  cursor-pointer"
              />
              <p className="text-xs text-slate-500 mt-3">Format: JPG, PNG - Taille max: 5MB</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-slate-600 mb-1">{label}</p>
    <p className="font-semibold text-slate-800">{value}</p>
  </div>
);
