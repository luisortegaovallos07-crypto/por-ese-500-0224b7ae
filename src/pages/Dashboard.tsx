import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { RoleGate } from '@/components/ProtectedRoute';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  TrendingUp,
  Calendar,
  Newspaper,
  Users,
  Award,
  Clock,
  ArrowRight,
  BarChart3,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Noticia {
  id: string;
  titulo: string;
  contenido: string;
  autor: string;
  created_at: string;
}

interface Evento {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  hora: string | null;
  tipo: string;
}

interface Materia {
  id: string;
  nombre: string;
  color: string | null;
}

const Dashboard: React.FC = () => {
  const { profile, isAdmin, isProfesor } = useAuth();
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [stats, setStats] = useState({
    totalEstudiantes: 0,
    totalSimulacros: 0,
    promedioGeneral: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch noticias
      const { data: noticiasData } = await supabase
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (noticiasData) setNoticias(noticiasData);

      // Fetch eventos
      const today = new Date().toISOString().split('T')[0];
      const { data: eventosData } = await supabase
        .from('eventos')
        .select('*')
        .gte('fecha', today)
        .order('fecha', { ascending: true })
        .limit(3);
      
      if (eventosData) setEventos(eventosData);

      // Fetch materias
      const { data: materiasData } = await supabase
        .from('materias')
        .select('*');
      
      if (materiasData) setMaterias(materiasData);

      // Only fetch stats for admin/profesor
      if (isAdmin || isProfesor) {
        const { count: estudiantesCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'estudiante');

        const { count: simulacrosCount } = await supabase
          .from('resultados_simulacro')
          .select('*', { count: 'exact', head: true });

        setStats({
          totalEstudiantes: estudiantesCount || 0,
          totalSimulacros: simulacrosCount || 0,
          promedioGeneral: 0,
        });
      }
    };

    fetchData();
  }, [isAdmin, isProfesor]);

  const getEventTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'simulacro': return 'bg-primary/10 text-primary';
      case 'clase': return 'bg-success/10 text-success';
      case 'tarea': return 'bg-warning/10 text-warning';
      case 'reunion': return 'bg-accent text-accent-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="page-container">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            ¡Hola, {profile?.nombre}! 👋
          </h1>
          <p className="text-muted-foreground">
            Bienvenido a tu panel de control. Aquí puedes ver tu progreso y actividades recientes.
          </p>
        </div>

        {/* Quick Stats - Student View */}
        <RoleGate allowedRoles={['estudiante']}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Promedio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Simulacros</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{materias.length}</p>
                    <p className="text-xs text-muted-foreground">Materias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{eventos.length}</p>
                    <p className="text-xs text-muted-foreground">Próximos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </RoleGate>

        {/* Admin/Professor Stats */}
        <RoleGate allowedRoles={['admin', 'profesor']}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalEstudiantes}</p>
                    <p className="text-xs text-muted-foreground">Estudiantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Promedio General</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                    <FileText className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalSimulacros}</p>
                    <p className="text-xs text-muted-foreground">Simulacros</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{eventos.length}</p>
                    <p className="text-xs text-muted-foreground">Eventos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </RoleGate>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link
                    to="/simulacros"
                    className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Iniciar Simulacro</h3>
                      <p className="text-sm text-muted-foreground">Practica ahora</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/progreso"
                    className="flex items-center gap-4 p-4 rounded-xl bg-success/5 hover:bg-success/10 border border-success/20 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-lg bg-success flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Ver Progreso</h3>
                      <p className="text-sm text-muted-foreground">Tu evolución</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-success group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent News */}
            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-primary" />
                  Noticias Recientes
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/noticias" className="gap-1">
                    Ver todas
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {noticias.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay noticias disponibles</p>
                ) : (
                  noticias.map(noticia => (
                    <div
                      key={noticia.id}
                      className="block p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <h3 className="font-medium mb-1 line-clamp-1">{noticia.titulo}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{noticia.contenido}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(noticia.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Próximos Eventos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {eventos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay eventos programados</p>
                ) : (
                  eventos.map(evento => (
                    <div
                      key={evento.id}
                      className="p-3 rounded-lg border border-border space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm line-clamp-1">{evento.titulo}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getEventTypeColor(evento.tipo)}`}>
                          {evento.tipo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(evento.fecha).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                        {evento.hora && (
                          <>
                            <Clock className="h-3 w-3 ml-2" />
                            {evento.hora}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/calendario">Ver Calendario</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Subjects Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Materias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {materias.map(materia => (
                    <Link
                      key={materia.id}
                      to="/simulacros"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div 
                        className="h-8 w-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: materia.color || '#3B82F6' }}
                      >
                        <span className="text-white text-xs font-bold">
                          {materia.nombre.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{materia.nombre}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
