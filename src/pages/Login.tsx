import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import logoMain from '@/assets/logo-main.jpeg';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="login-branding-pattern" />
        
        <div className="login-branding-content">
          <Link to="/">
            <img src={logoMain} alt="POR ESE 500" className="login-branding-logo" />
          </Link>
        </div>

        <div className="login-branding-info">
          <h1 className="login-branding-title">
            Plataforma de Preparación<br />Académica
          </h1>
          <p className="login-branding-quote">
            "Donde cada día de disciplina acerca los sueños al 500"
          </p>
          <div className="login-branding-stats">
            <div className="login-branding-avatars">
              {[1, 2, 3].map(i => (
                <div key={i} className="login-branding-avatar">
                  {i}
                </div>
              ))}
            </div>
            <p className="login-branding-students">+2.000 estudiantes preparándose</p>
          </div>
        </div>

        <div className="login-branding-footer">
          © 2026 POR ESE 500
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-container">
        <div className="login-form-wrapper animate-fade-in">
          {/* Mobile Logo */}
          <div className="login-mobile-logo">
            <Link to="/">
              <img src={logoMain} alt="POR ESE 500" className="login-mobile-logo-img" />
            </Link>
          </div>

          <div className="login-card">
            <div className="login-card-header">
              <h2 className="login-card-title">Bienvenido</h2>
              <p className="login-card-description">
                Accede a la plataforma de preparación académica
              </p>
            </div>

            <div className="login-card-content">
              {error && (
                <div className="login-alert login-alert-error animate-fade-in">
                  <AlertCircle className="login-alert-icon" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Correo Electrónico</label>
                  <div className="input-wrapper">
                    <Mail className="input-icon" />
                    <input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="input input-with-icon"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="input input-with-icon input-with-action"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="input-action"
                    >
                      {showPassword ? <EyeOff className="input-action-icon" /> : <Eye className="input-action-icon" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="btn-loading">
                      <span className="btn-spinner" />
                      Ingresando...
                    </span>
                  ) : (
                    <span className="btn-content">
                      Ingresar
                      <ArrowRight className="btn-icon" />
                    </span>
                  )}
                </button>
              </form>
            </div>
          </div>

          <p className="login-help">
            ¿Problemas para acceder?{' '}
            <Link to="/contacto" className="login-help-link">
              Contacta al administrador
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
