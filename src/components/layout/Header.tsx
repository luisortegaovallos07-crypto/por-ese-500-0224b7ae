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
import './Header.css';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
    setDropdownOpen(false);
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
      case 'admin': return 'role-badge-admin';
      case 'profesor': return 'role-badge-profesor';
      case 'estudiante': return 'role-badge-estudiante';
      default: return '';
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <Link to="/" className="header-logo">
            <img
              src={logoMain}
              alt="POR ESE 500"
              className="header-logo-img"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav">
            {filteredNavItems.map(item => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  {item.label}
                </Link>
              );
            })}

            <RoleGate allowedRoles={['admin']}>
              <Link
                to="/admin"
                className={`nav-link ${location.pathname === '/admin' ? 'nav-link-active' : ''}`}
              >
                <Settings className="nav-icon" />
                Admin
              </Link>
            </RoleGate>
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="header-auth">
            {isAuthenticated && profile ? (
              <div className="dropdown">
                <button 
                  className="dropdown-trigger"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="user-avatar">
                    <User className="user-avatar-icon" />
                  </div>
                  <div className="user-info">
                    <span className="user-name">{profile.nombre}</span>
                    <span className={`role-badge ${getRoleBadgeClass()}`}>
                      {getRoleLabel()}
                    </span>
                  </div>
                  <ChevronDown className="dropdown-chevron" />
                </button>
                {dropdownOpen && (
                  <>
                    <div className="dropdown-overlay" onClick={() => setDropdownOpen(false)} />
                    <div className="dropdown-content">
                      <Link 
                        to="/dashboard" 
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard className="dropdown-icon" />
                        Mi Panel
                      </Link>
                      <div className="dropdown-separator" />
                      <button onClick={handleLogout} className="dropdown-item dropdown-item-destructive">
                        <LogOut className="dropdown-icon" />
                        Cerrar Sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="mobile-menu-icon" /> : <Menu className="mobile-menu-icon" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-nav">
            <nav className="mobile-nav-list">
              {filteredNavItems.map(item => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`}
                  >
                    <Icon className="mobile-nav-icon" />
                    {item.label}
                  </Link>
                );
              })}

              <RoleGate allowedRoles={['admin']}>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-nav-link ${location.pathname === '/admin' ? 'mobile-nav-link-active' : ''}`}
                >
                  <Settings className="mobile-nav-icon" />
                  Admin
                </Link>
              </RoleGate>

              <div className="mobile-nav-divider">
                {isAuthenticated && profile ? (
                  <>
                    <div className="mobile-user-info">
                      <div className="mobile-user-avatar">
                        <User className="mobile-user-avatar-icon" />
                      </div>
                      <div>
                        <p className="mobile-user-name">{profile.nombre}</p>
                        <span className={`role-badge ${getRoleBadgeClass()}`}>
                          {getRoleLabel()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mobile-logout-btn"
                    >
                      <LogOut className="mobile-logout-icon" />
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mobile-login-btn"
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
