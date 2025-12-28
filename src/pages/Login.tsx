import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { credencialesPrueba } from '@/data/mockData';
import logoMain from '@/assets/logo-main.jpeg';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const fillCredentials = (type: 'admin' | 'profesor' | 'estudiante') => {
    const creds = credencialesPrueba[type];
    setEmail(creds.email);
    setPassword(creds.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2Mkg3djZoMTd2Mkgzdi00em0wLTR2Mkg3djZoMTd2Mkgzdi00em0wLTR2Mkg3djZoMTd2Mkgzdi00em0wLTR2Mkg3djZoMTd2Mkgzdi00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative z-10">
          <Link to="/">
            <img src={logoMain} alt="POR ESE 500" className="h-20 w-auto bg-white/90 rounded-xl p-2" />
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Plataforma de Preparación<br />Académica
          </h1>
          <p className="text-xl text-white/80 max-w-md">
            "Donde cada día de disciplina acerca los sueños al 500"
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-sm font-medium"
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="text-white/80 text-sm">+500 estudiantes preparándose</p>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2026 POR ESE 500
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link to="/">
              <img src={logoMain} alt="POR ESE 500" className="h-16 w-auto mx-auto" />
            </Link>
          </div>

          <Card className="border-0 shadow-card">
            <CardHeader className="space-y-1 text-center pb-6">
              <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder a la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="animate-fade-in">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Ingresando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Ingresar
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Test Credentials */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Credenciales de prueba:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials('admin')}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-sm">{credencialesPrueba.admin.nombre}</p>
                      <p className="text-xs text-muted-foreground">{credencialesPrueba.admin.email}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Admin
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('profesor')}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-sm">{credencialesPrueba.profesor.nombre}</p>
                      <p className="text-xs text-muted-foreground">{credencialesPrueba.profesor.email}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-success/10 text-success">
                      Profesor
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('estudiante')}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-sm">{credencialesPrueba.estudiante.nombre}</p>
                      <p className="text-xs text-muted-foreground">{credencialesPrueba.estudiante.email}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-accent text-accent-foreground">
                      Estudiante
                    </span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            ¿Problemas para acceder?{' '}
            <Link to="/contacto" className="text-primary hover:underline">
              Contacta al administrador
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
