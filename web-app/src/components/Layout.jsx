import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SearchBar } from './SearchBar';
import { Sidebar } from './Sidebar';
import { Menu, X, LogOut, BookOpen, Users } from 'lucide-react';

export const Layout = ({ children }) => {
  const { user, famille, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // Boutons sponsors
  const sponsorButtons = [
    { id: 1, label: '1', color: 'from-amber-500 to-orange-600' },
    { id: 2, label: '2', color: 'from-emerald-500 to-teal-600' },
    { id: 3, label: '3', color: 'from-blue-500 to-indigo-600' },
    { id: 4, label: '4', color: 'from-purple-500 to-pink-600' },
  ];

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen z-30">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </aside>

      {/* Sidebar Mobile - Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative bg-white w-64 h-full shadow-2xl animate-slide-in">
            <Sidebar isCollapsed={false} setIsCollapsed={() => {}} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} flex flex-col min-h-screen transition-all duration-300`}>
        {/* Header */}
        <header className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white shadow-2xl sticky top-0 z-20 backdrop-blur-lg bg-opacity-95">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-8">
            <div className="flex items-center justify-between gap-4">
              {/* Menu hamburger (mobile) + Logo + Sponsors */}
              <div className="flex items-center gap-3 lg:gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-110"
                >
                  {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <div className="flex items-center gap-2">
                  <img
                    src="/logo.png"
                    alt="Baïla Généa"
                    className="w-8 h-8 lg:w-10 lg:h-10 object-contain"
                  />
                  <div>
                    <h1 className="text-lg lg:text-xl font-bold leading-tight">Baïla Généa</h1>
                    <p className="text-[10px] lg:text-xs text-slate-300 leading-tight flex items-center gap-1">
                      {famille ? (
                        <>
                          <Users className="w-3 h-3" />
                          <span>Famille {famille.nom}</span>
                        </>
                      ) : (
                        <span>{user?.email}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Boutons Sponsors */}
                <div className="hidden sm:flex items-center gap-1.5 ml-2 lg:ml-4">
                  {sponsorButtons.map((sponsor) => (
                    <button
                      key={sponsor.id}
                      onClick={() => navigate(`/sponsor/${sponsor.id}`)}
                      className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-gradient-to-br ${sponsor.color} text-white font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center border-2 border-white/30`}
                      title={`Sponsor ${sponsor.id}`}
                    >
                      {sponsor.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Barre de recherche */}
              <div className="flex-1 max-w-2xl hidden md:flex items-center">
                <SearchBar />
              </div>

              {/* Bouton de déconnexion */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border-2 border-white/20 px-3 lg:px-4 py-2.5 rounded-xl font-semibold hover:bg-white hover:text-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <LogOut className="w-5 h-5" strokeWidth={2} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>

            {/* Barre de recherche mobile */}
            <div className="mt-3 md:hidden">
              <SearchBar />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span>Made with</span>
                <span className="text-rose-500 animate-pulse">❤️</span>
                <span>by Baïla Team</span>
              </div>
              <div className="text-slate-500">© 2024 Tous droits réservés</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
