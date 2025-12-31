import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGate } from '@/components/ProtectedRoute';
import logoMain from '@/assets/logo-main.jpeg';
import {
  Home,
  LayoutDashboard,
  FileText,
  BookOpen,
  TrendingUp,
  Newspaper,
  Calendar,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { path: '/', label: 'Inicio', icon: Home, public: true },
  { path: '/dashboard', label: 'Panel', icon: LayoutDashboard, requireAuth: true },
  { path: '/simulacros', label: 'Simulacros', icon: FileText, requireAuth: true },
  { path: '/material', label: 'Material', icon: BookOpen, requireAuth: true },
  { path: '/progreso', label: 'Progreso', icon: TrendingUp, requireAuth: true },
  { path: '/noticias', label: 'Noticias', icon: Newspaper, requireAuth: true },
  { path: '/calendario', label: 'Calendario', icon: Calendar, requireAuth: true },
  { path: '/contacto', label: 'Contacto', icon: Mail, public: true },
];

export const Header: React.FC = () => {
  const { profile, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.public) return true;
    if (item.requireAuth && isAuthenticated) return true;
    return false;
  });

  const getRoleLabel = () => {
    switch (profile?.role) {
      case 'admin': return 'Administrador';
      case 'profesor': return 'Profesor';
      case 'estudiante': return 'Estudiante';
      default: return '';
    }
  };

  const getRoleBadgeClass = () => {
    switch (profile?.role) {
      case 'admin': return 'bg-primary/10 text-primary';
      case 'profesor': return 'bg-success/10 text-success';
      case 'estudiante': return 'bg-accent text-accent-foreground';
      default: return '';
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logoMain}
              alt="POR ESE 500"
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {filteredNavItems.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}

            <RoleGate allowedRoles={['admin']}>
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/admin'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                }`}
              >
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            </RoleGate>
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{profile.nombre}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeClass()}`}>
                        {getRoleLabel()}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Mi Panel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-1">
              {filteredNavItems.map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              <RoleGate allowedRoles={['admin']}>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === '/admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  Admin
                </Link>
              </RoleGate>

              <div className="border-t border-border mt-2 pt-2">
                {isAuthenticated && profile ? (
                  <>
                    <div className="px-4 py-2 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{profile.nombre}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeClass()}`}>
                          {getRoleLabel()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 mx-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
