import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserCircle,
  ClipboardList,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useNotif } from '@/hooks/useNotif';
import { ROUTES } from '@/lib';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  badge?: number;
}

function NavItemComp({ item, collapsed, onClick }: { item: NavItem; collapsed: boolean; onClick?: () => void }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        }`
      }
    >
      <span className="shrink-0">{item.icon}</span>
      {!collapsed && (
        <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
      )}
      {!collapsed && item.badge !== undefined && item.badge > 0 && (
        <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center p-0 text-xs">
          {item.badge > 9 ? '9+' : item.badge}
        </Badge>
      )}
      {collapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
      )}
    </NavLink>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { usuario, logout } = useAuth();
  const { noLeidas } = useNotif();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: <LayoutDashboard size={18} /> },
    { label: 'Trámites', to: ROUTES.TRAMITES, icon: <ClipboardList size={18} /> },
    { label: 'Clientes', to: ROUTES.CLIENTES, icon: <Users size={18} /> },
    { label: 'Tipos de Trámite', to: ROUTES.TIPOS_TRAMITE, icon: <Tag size={18} /> },
    { label: 'Dependencias', to: ROUTES.DEPENDENCIAS, icon: <Building2 size={18} /> },
    { label: 'Usuarios', to: ROUTES.USUARIOS, icon: <UserCircle size={18} /> },
    { label: 'Notificaciones', to: ROUTES.NOTIFICACIONES, icon: <Bell size={18} />, badge: noLeidas },
  ];

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  // Get current page title
  const currentItem = navItems.find(item => {
    if (item.to === ROUTES.DASHBOARD) return location.pathname === '/';
    return location.pathname.startsWith(item.to);
  });

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <FileText size={16} className="text-primary-foreground" />
        </div>
        {(!collapsed || isMobile) && (
          <div>
            <h1 className="text-base font-bold text-sidebar-foreground tracking-tight">Kanri</h1>
            <p className="text-xs text-muted-foreground">Control de Trámites</p>
          </div>
        )}
      </div>

      <Separator className="mb-3" />

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavItemComp
            key={item.to}
            item={item}
            collapsed={collapsed && !isMobile}
            onClick={() => isMobile && setSidebarOpen(false)}
          />
        ))}
      </nav>

      <Separator className="my-3" />

      {/* User info + logout */}
      <div className={`px-3 pb-4 ${collapsed && !isMobile ? 'flex flex-col items-center gap-2' : ''}`}>
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-sidebar-accent rounded-lg">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <UserCircle size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{usuario?.nombre}</p>
              <p className="text-xs text-muted-foreground truncate">{usuario?.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={`text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ${collapsed && !isMobile ? 'w-9 h-9 p-0' : 'w-full justify-start gap-2'}`}
        >
          <LogOut size={16} />
          {(!collapsed || isMobile) && 'Cerrar sesión'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0 ${
          collapsed ? 'w-[60px]' : 'w-[260px]'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-sidebar border-r border-sidebar-border z-50 lg:hidden"
            >
              <SidebarContent isMobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-card border-b border-border flex items-center gap-3 px-4 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hidden lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight size={18} className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
          </Button>

          <div className="flex-1">
            <h2 className="text-sm font-semibold text-foreground">{currentItem?.label ?? 'Trámite'}</h2>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="relative w-8 h-8 p-0"
            onClick={() => navigate(ROUTES.NOTIFICACIONES)}
          >
            <Bell size={18} />
            {noLeidas > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            )}
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
