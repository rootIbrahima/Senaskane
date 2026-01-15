import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { familleAPI, authAPI } from '../services/api';
import { Card, Loading, Button, Input } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { Copy, Check, Key, Share2 } from 'lucide-react';

export const FamilyInfo = () => {
  const [famille, setFamille] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editForm, setEditForm] = useState({
    nom: '',
    slogan: '',
    lienWhatsapp: ''
  });
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const handleCopyCode = () => {
    if (famille?.code_acces) {
      navigator.clipboard.writeText(famille.code_acces);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load family info
      const infoResponse = await familleAPI.getInfo();
      const familleData = infoResponse.data.data;

      // Get/generate access code if needed
      if (isAdmin && (!familleData.code_acces || familleData.code_acces === null)) {
        try {
          const codeResponse = await authAPI.getMyCode();
          familleData.code_acces = codeResponse.data.code;
        } catch (error) {
          console.error('Erreur génération code:', error);
        }
      }

      setFamille(familleData);
      setEditForm({
        nom: familleData.nom || '',
        slogan: familleData.slogan || '',
        lienWhatsapp: familleData.lien_whatsapp || ''
      });

      // Load statistics
      const statsResponse = await familleAPI.getStatistiques();
      setStats(statsResponse.data.data);

    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await familleAPI.update(editForm);
      alert('Informations mises à jour avec succès!');
      setEditing(false);
      loadData();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      await familleAPI.uploadLogo(formData);
      alert('Logo mis à jour avec succès!');
      loadData();
    } catch (error) {
      console.error('Erreur upload logo:', error);
      alert('Erreur lors de l\'upload du logo');
    }
  };

  if (loading) return <Loading text="Chargement des informations..." />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-2xl hover:text-slate-200">
              ←
            </button>
            <h1 className="text-3xl font-bold">Informations de la Famille</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Informations</h2>
                {isAdmin && !editing && (
                  <Button onClick={() => setEditing(true)}>Modifier</Button>
                )}
              </div>

              {!editing ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Nom de la famille</p>
                    <p className="text-xl font-bold">{famille?.nom}</p>
                  </div>
                  {famille?.slogan && (
                    <div>
                      <p className="text-sm text-slate-600">Slogan</p>
                      <p className="text-lg italic">"{famille.slogan}"</p>
                    </div>
                  )}

                  {/* Code d'accès - Section mise en avant */}
                  <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/20 p-3 rounded-xl">
                        <Key className="w-6 h-6" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-200">Code d'accès famille</p>
                        <p className="text-xs text-slate-300">Partagez ce code avec vos proches</p>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4">
                      <p className="text-4xl font-bold tracking-widest text-center font-mono">
                        {famille?.code_acces || 'XXXXXXXX'}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleCopyCode}
                        className="flex-1 bg-white text-slate-800 px-4 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        {copied ? (
                          <span key="copied" className="flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            Copié !
                          </span>
                        ) : (
                          <span key="copy" className="flex items-center gap-2">
                            <Copy className="w-5 h-5" />
                            Copier le code
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/login-code`;
                          const text = `Rejoins notre famille sur Baïla Généa !\n\nCode d'accès: ${famille?.code_acces}\n\nConnecte-toi ici: ${url}`;
                          if (navigator.share) {
                            navigator.share({ text });
                          } else {
                            navigator.clipboard.writeText(text);
                            alert('Lien copié dans le presse-papiers !');
                          }
                        }}
                        className="bg-white/20 text-white px-4 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2"
                        title="Partager le code"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-4 bg-white/10 rounded-lg p-3">
                      <p className="text-xs text-slate-200 text-center">
                        Les membres de votre famille peuvent se connecter avec ce code sur <span className="font-semibold">/login-code</span>
                      </p>
                    </div>
                  </div>

                  {famille?.lien_whatsapp && (
                    <div>
                      <p className="text-sm text-slate-600">Groupe WhatsApp</p>
                      <a href={famille.lien_whatsapp} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-800 hover:underline font-semibold">
                        Rejoindre le groupe
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-600">Nombre de membres</p>
                    <p className="text-3xl font-bold text-slate-800">{famille?.totalMembres || 0}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate}>
                  <Input
                    label="Nom de la famille"
                    value={editForm.nom}
                    onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                    required
                  />
                  <Input
                    label="Slogan (optionnel)"
                    value={editForm.slogan}
                    onChange={(e) => setEditForm({ ...editForm, slogan: e.target.value })}
                    className="mt-4"
                  />
                  <Input
                    label="Lien WhatsApp (optionnel)"
                    value={editForm.lienWhatsapp}
                    onChange={(e) => setEditForm({ ...editForm, lienWhatsapp: e.target.value })}
                    className="mt-4"
                    placeholder="https://chat.whatsapp.com/..."
                  />
                  <div className="flex gap-4 mt-6">
                    <Button type="submit" className="flex-1">Enregistrer</Button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setEditForm({
                          nom: famille?.nom || '',
                          slogan: famille?.slogan || '',
                          lienWhatsapp: famille?.lien_whatsapp || ''
                        });
                      }}
                      className="flex-1 px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}

              {/* Logo Upload */}
              {isAdmin && (
                <div className="mt-8 pt-8 border-t">
                  <h3 className="text-lg font-bold mb-4">Logo de la famille</h3>
                  {famille?.logo && (
                    <img
                      src={`http://localhost:3000/uploads/logos/${famille.logo}`}
                      alt="Logo famille"
                      className="w-32 h-32 object-cover rounded-lg mb-4"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-slate-600 file:text-white
                      hover:file:bg-slate-700
                      cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 mt-2">Format: JPG, PNG - Taille max: 2MB</p>
                </div>
              )}
            </Card>
          </div>

          {/* Statistiques */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold mb-4">Statistiques</h2>

              {stats && (
                <div className="space-y-4">
                  {/* Total membres */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 font-semibold uppercase">Total Membres</p>
                    <p className="text-3xl font-bold text-slate-800">{stats.totalMembres}</p>
                  </div>

                  {/* Par sexe */}
                  {stats.parSexe && stats.parSexe.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Répartition par sexe</p>
                      {stats.parSexe.map((s) => (
                        <div key={s.sexe} className="flex justify-between items-center py-2">
                          <span>{s.sexe === 'M' ? 'Hommes' : 'Femmes'}</span>
                          <span className="font-bold">{s.total}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cérémonies */}
                  {stats.ceremonies && stats.ceremonies.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Cérémonies</p>
                      {stats.ceremonies.map((c) => (
                        <div key={c.type_ceremonie} className="flex justify-between items-center py-2">
                          <span className="capitalize">{c.type_ceremonie}</span>
                          <span className="font-bold">{c.total}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Musée */}
                  <div className="bg-gradient-to-br from-stone-50 to-stone-100 border-2 border-stone-200 p-4 rounded-lg">
                    <p className="text-sm text-stone-600 font-semibold uppercase">Objets au Musée</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.objetsMusee || 0}</p>
                  </div>

                  {/* Membres actifs */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 font-semibold uppercase">Membres Actifs</p>
                    <p className="text-2xl font-bold text-slate-800">{stats.membresActifs || 0}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
