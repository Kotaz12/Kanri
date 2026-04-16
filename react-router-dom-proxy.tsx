import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { inicializarDatos } from '@/data';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { NotifProvider } from '@/hooks/useNotif';
import { ROUTES } from '@/lib';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Registro from '@/pages/Registro';
import Dashboard from '@/pages/Dashboard';
import Tramites from '@/pages/Tramites';
import TramiteForm from '@/pages/TramiteForm';
import TramiteDetalle from '@/pages/TramiteDetalle';
import Clientes from '@/pages/Clientes';
import TiposTramite from '@/pages/TiposTramite';
import Dependencias from '@/pages/Dependencias';
import Usuarios from '@/pages/Usuarios';
import Notificaciones from '@/pages/Notificaciones';

// Initialize demo data
inicializarDatos();

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 35 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { usuario, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!usuario) return <Navigate to={ROUTES.LOGIN} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path={ROUTES.LOGIN} element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path={ROUTES.REGISTRO} element={<AnimatedPage><Registro /></AnimatedPage>} />

        {/* Protected */}
        <Route path="/" element={<RequireAuth><Layout><AnimatedPage><Dashboard /></AnimatedPage></Layout></RequireAuth>} />
        <Route path={ROUTES.TRAMITES} element={<RequireAuth><Layout><AnimatedPage><Tramites /></AnimatedPage></Layout></RequireAuth>} />
        <Route path={ROUTES.TRAMITE_NUEVO} element={<RequireAuth><Layout><AnimatedPage><TramiteForm /></AnimatedPage></Layout></RequireAuth>} />
        <Route path="/tramites/:id/editar" element={<RequireAuth><Layout><AnimatedPage><TramiteForm /></AnimatedPage></Layout></RequireAuth>} />
        <Route path="/tramites/:id" element={<RequireAuth><Layout><AnimatedPage><TramiteDetalle /></AnimatedPage></Layout></RequireAuth>} />
        <Route path={ROUTES.CLIENTES} element={<RequireAuth><Layout><AnimatedPage><Clientes /></AnimatedPage></Layout></RequireAuth>} />
        <Route path={ROUTES.TIPOS_TRAMITE} element={<RequireAuth><Layout><AnimatedPage><TiposTramite /></AnimatedPage></Layout></RequireAuth>} />
        <Route path={ROUTES.DEPENDENCIAS} element={<RequireAuth><Layout><AnimatedPage><Dependencias /></AnimatedPage></Layout></RequireAuth>} />
        <Route path={ROUTES.USUARIOS} element={<RequireAuth><Layout><AnimatedPage><Usuarios /></AnimatedPage></Layout></RequireAuth>} />
        <Route path={ROUTES.NOTIFICACIONES} element={<RequireAuth><Layout><AnimatedPage><Notificaciones /></AnimatedPage></Layout></RequireAuth>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// PWA Install Banner
function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<Event | null>(null);
  const [show, setShow] = React.useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!show) return null;

  const install = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as unknown as { prompt: () => Promise<void> }).prompt();
    setShow(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
    >
      <div className="bg-card border border-border rounded-xl shadow-lg p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0 text-lg">📋</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Instalar Kanri</p>
          <p className="text-xs text-muted-foreground">Accede más rápido desde tu teléfono</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShow(false)} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground">✕</button>
          <button onClick={install} className="h-8 px-3 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors">Instalar</button>
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotifProvider>
          <AppRoutes />
          <PWAInstallBanner />
        </NotifProvider>
      </AuthProvider>
    </Router>
  );
}
