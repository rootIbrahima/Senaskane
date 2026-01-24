import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loading, Layout, SplashScreen } from './components';

// Lazy loading des pages pour réduire le bundle initial
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const LoginWithCode = lazy(() => import('./pages/LoginWithCode').then(m => ({ default: m.LoginWithCode })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Members = lazy(() => import('./pages/Members').then(m => ({ default: m.Members })));
const MemberDetail = lazy(() => import('./pages/MemberDetail').then(m => ({ default: m.MemberDetail })));
const FamilyTree = lazy(() => import('./pages/FamilyTree').then(m => ({ default: m.FamilyTree })));
const Museum = lazy(() => import('./pages/Museum').then(m => ({ default: m.Museum })));
const MuseumDetail = lazy(() => import('./pages/MuseumDetail').then(m => ({ default: m.MuseumDetail })));
const Ceremonies = lazy(() => import('./pages/Ceremonies').then(m => ({ default: m.Ceremonies })));
const Cotisations = lazy(() => import('./pages/Cotisations').then(m => ({ default: m.Cotisations })));
const FamilyInfo = lazy(() => import('./pages/FamilyInfo').then(m => ({ default: m.FamilyInfo })));
const AdvancedSearch = lazy(() => import('./pages/AdvancedSearch').then(m => ({ default: m.AdvancedSearch })));
const Sponsor = lazy(() => import('./pages/Sponsor').then(m => ({ default: m.Sponsor })));

// Route protégée avec Layout
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading />;

  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/login-code" element={<LoginWithCode />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/membres"
        element={
          <ProtectedRoute>
            <Members />
          </ProtectedRoute>
        }
      />
      <Route
        path="/membres/:id"
        element={
          <ProtectedRoute>
            <MemberDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/arbre"
        element={
          <ProtectedRoute>
            <FamilyTree />
          </ProtectedRoute>
        }
      />
      <Route
        path="/musee"
        element={
          <ProtectedRoute>
            <Museum />
          </ProtectedRoute>
        }
      />
      <Route
        path="/musee/:id"
        element={
          <ProtectedRoute>
            <MuseumDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ceremonies"
        element={
          <ProtectedRoute>
            <Ceremonies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cotisations/:ceremonieId"
        element={
          <ProtectedRoute>
            <Cotisations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/famille"
        element={
          <ProtectedRoute>
            <FamilyInfo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recherche"
        element={
          <ProtectedRoute>
            <AdvancedSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sponsor/:id"
        element={
          <ProtectedRoute>
            <Sponsor />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
