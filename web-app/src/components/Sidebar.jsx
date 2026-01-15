import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, GitBranch, Building2, Calendar, UserCheck, Search, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: 'Accueil', path: '/', icon: Home, gradient: 'from-slate-700 to-slate-800', hoverGradient: 'from-slate-800 to-slate-900' },
    { title: 'Membres', path: '/membres', icon: Users, gradient: 'from-blue-600 to-blue-700', hoverGradient: 'from-blue-700 to-blue-800' },
    { title: 'Arbre Généalogique', path: '/arbre', icon: GitBranch, gradient: 'from-emerald-600 to-emerald-700', hoverGradient: 'from-emerald-700 to-emerald-800' },
    { title: 'Musée', path: '/musee', icon: Building2, gradient: 'from-amber-600 to-amber-700', hoverGradient: 'from-amber-700 to-amber-800' },
    { title: 'Cérémonies', path: '/ceremonies', icon: Calendar, gradient: 'from-rose-600 to-rose-700', hoverGradient: 'from-rose-700 to-rose-800' },
    { title: 'Famille', path: '/famille', icon: UserCheck, gradient: 'from-indigo-600 to-indigo-700', hoverGradient: 'from-indigo-700 to-indigo-800' },
    { title: 'Recherche', path: '/recherche', icon: Search, gradient: 'from-violet-600 to-violet-700', hoverGradient: 'from-violet-700 to-violet-800' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 h-full flex flex-col shadow-xl transition-all duration-300`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-slate-800 to-slate-900 relative">
        {!isCollapsed ? (
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold text-white">Baïla Généa</h2>
            <p className="text-xs text-slate-300 mt-1">Navigation</p>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
        )}

        {/* Bouton pour plier/déplier */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full p-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 border-2 border-white group"
          title={isCollapsed ? 'Déplier la sidebar' : 'Plier la sidebar'}
        >
          <div className="relative">
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.5} />
            ) : (
              <ChevronLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2.5} />
            )}
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item, index) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <li key={index}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-4 px-4'} py-3.5 rounded-xl transition-all duration-300 transform hover:scale-105 group relative ${
                    active
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                      : `text-slate-700 hover:bg-gradient-to-r hover:${item.hoverGradient} hover:text-white hover:shadow-md`
                  }`}
                  title={isCollapsed ? item.title : ''}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  {!isCollapsed && (
                    <>
                      <span className="font-semibold text-sm flex-1 text-left">{item.title}</span>
                      {active && (
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse shadow-sm"></div>
                      )}
                    </>
                  )}

                  {/* Tooltip pour la sidebar pliée */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap shadow-lg">
                      {item.title}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-slate-900"></div>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-center">
            <div className="text-xs text-slate-500 font-medium">Version 1.0</div>
            <div className="text-xs text-slate-400 mt-1">© 2024 Baïla Généa</div>
          </div>
        </div>
      )}
    </div>
  );
};
