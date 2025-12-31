import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import logoMain from '@/assets/logo-main.jpeg';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const { login, signup, isAuthenticated } = useAuth();
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
    setSuccess('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }

    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!nombre.trim()) {
      setError('Por favor ingresa tu nombre completo');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    const result = await signup(email, password, nombre);

    if (result.success) {
      setSuccess('¡Cuenta creada exitosamente! Ya puedes acceder a la plataforma.');
      setActiveTab('login');
    } else {
      setError(result.error || 'Error al registrarse');
    }

    setIsLoading(false);
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
            <p className="text-white/80 text-sm">+2.000 estudiantes preparándose</p>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2026 POR ESE 500
        </div>
      </div>

      {/* Right Side - Login/Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link to="/">
              <img src={logoMain} alt="POR ESE 500" className="h-16 w-auto mx-auto" />
            </Link>
          </div>

          <Card className="border-0 shadow-card">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-2xl font-bold">Bienvenido</CardTitle>
              <CardDescription>
                Accede a la plataforma de preparación académica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="signup">Registrarse</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert variant="destructive" className="animate-fade-in mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="animate-fade-in mb-4 border-success bg-success/10">
                    <AlertCircle className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success">{success}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
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
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nombre">Nombre Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="nombre"
                          type="text"
                          placeholder="Tu nombre completo"
                          value={nombre}
                          onChange={e => setNombre(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Correo Electrónico</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
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
                      <Label htmlFor="signup-password">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          minLength={6}
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
                          Creando cuenta...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Crear Cuenta
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Al registrarte, aceptas nuestros términos y condiciones.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
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
