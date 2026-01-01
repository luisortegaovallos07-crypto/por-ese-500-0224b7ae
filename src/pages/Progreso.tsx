import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  Target,
  Award,
  Clock,
  BarChart3,
  User,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface Resultado {
  id: string;
  user_id: string;
  materia_id: string | null;
  puntaje: number;
  total_preguntas: number;
  respuestas_correctas: number;
  tiempo_segundos: number;
  created_at: string;
  profiles?: {
    nombre: string;
    email: string;
  };
  materias?: {
    nombre: string;
  };
}

interface Materia {
  id: string;
  nombre: string;
}

const Progreso: React.FC = () => {
  const { user, isAdmin, isProfesor } = useAuth();
  const canViewAll = isAdmin || isProfesor;

  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Cargar materias
        const { data: materiasData } = await supabase
          .from('materias')
          .select('id, nombre')
          .order('nombre');
        
        setMaterias(materiasData || []);

        // Cargar resultados
        const { data: resultadosData, error } = await supabase
          .from('resultados_simulacro')
          .select('*, materias:materia_id (nombre)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Cargar perfiles para los resultados
        const userIds = [...new Set((resultadosData || []).map(r => r.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, nombre, email')
          .in('id', userIds);

        // Combinar datos
        const resultadosConPerfiles = (resultadosData || [])
          .filter(r => canViewAll || r.user_id === user.id)
          .map(r => ({
            ...r,
            profiles: profilesData?.find(p => p.id === r.user_id) || { nombre: 'Usuario', email: '' },
          }));

        setResultados(resultadosConPerfiles as Resultado[]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, canViewAll]);

  // Filtrar resultados del usuario actual para estadísticas personales
  const myResults = resultados.filter(r => r.user_id === user?.id);

  // Calcular estadísticas
  const totalSimulacros = myResults.length;
  const averageScore = myResults.length > 0
    ? Math.round(myResults.reduce((acc, r) => acc + r.puntaje, 0) / myResults.length)
    : 0;
  const bestScore = myResults.length > 0
    ? Math.max(...myResults.map(r => r.puntaje))
    : 0;
  const averageTime = myResults.length > 0
    ? Math.round(myResults.reduce((acc, r) => acc + r.tiempo_segundos, 0) / myResults.length / 60)
    : 0;

  // Datos para gráfico de evolución
  const evolutionData = myResults
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(-10)
    .map(r => ({
      fecha: new Date(r.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      puntaje: r.puntaje,
      materia: r.materias?.nombre || 'General',
    }));

  // Datos por materia
  const subjectData = materias.map(materia => {
    const materiaResults = myResults.filter(r => r.materia_id === materia.id);
    const avg = materiaResults.length > 0
      ? Math.round(materiaResults.reduce((acc, r) => acc + r.puntaje, 0) / materiaResults.length)
      : 0;
    return {
      subject: materia.nombre,
      shortName: materia.nombre.substring(0, 3).toUpperCase(),
      score: avg,
      count: materiaResults.length,
      fullMark: 100,
    };
  });

  // Calcular puntaje total (sumatoria de todas las materias)
  const puntajeTotalActual = subjectData.reduce((acc, d) => acc + d.score, 0);
  const puntajeMaximo = materias.length * 100;

  // Datos para radar
  const radarData = subjectData.map(d => ({
    subject: d.shortName,
    A: d.score,
    fullMark: 100,
  }));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-container flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">
            {canViewAll ? 'Resultados de Simulacros' : 'Mi Progreso'}
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            {canViewAll 
              ? 'Visualiza los resultados de todos los estudiantes.' 
              : 'Visualiza tu evolución académica con gráficos detallados por materia.'}
          </p>
        </div>

        {/* Stats Cards - Mis estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{averageScore}</p>
                  <p className="text-xs text-muted-foreground">Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{bestScore}</p>
                  <p className="text-xs text-muted-foreground">Mejor</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSimulacros}</p>
                  <p className="text-xs text-muted-foreground">Simulacros</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{averageTime}min</p>
                  <p className="text-xs text-muted-foreground">Tiempo Prom.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover lg:col-span-1 col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{puntajeTotalActual}<span className="text-sm text-muted-foreground">/{puntajeMaximo}</span></p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de resultados (Admin/Profesor ven todos) */}
        {canViewAll && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Historial de Simulacros</CardTitle>
              <CardDescription>
                Todos los resultados de simulacros realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Estudiante</th>
                      <th className="text-left py-3 px-2 font-medium">Materia</th>
                      <th className="text-left py-3 px-2 font-medium">Puntaje</th>
                      <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">%</th>
                      <th className="text-left py-3 px-2 font-medium hidden md:table-cell">Tiempo</th>
                      <th className="text-left py-3 px-2 font-medium hidden lg:table-cell">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.slice(0, 50).map(r => (
                      <tr key={r.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{r.profiles?.nombre || 'Usuario'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline">{r.materias?.nombre || 'General'}</Badge>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`font-bold ${r.puntaje >= 60 ? 'text-success' : 'text-destructive'}`}>
                            {r.puntaje}/100
                          </span>
                        </td>
                        <td className="py-3 px-2 hidden sm:table-cell">
                          <span className={r.puntaje >= 60 ? 'text-success' : 'text-destructive'}>
                            {r.puntaje}%
                          </span>
                        </td>
                        <td className="py-3 px-2 hidden md:table-cell text-muted-foreground">
                          {formatTime(r.tiempo_segundos)}
                        </td>
                        <td className="py-3 px-2 hidden lg:table-cell text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {resultados.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No hay simulacros registrados.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Gráficos */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Evolution Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Evolución Temporal
              </CardTitle>
              <CardDescription>
                Tu progreso en los simulacros a lo largo del tiempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evolutionData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Realiza simulacros para ver tu evolución</p>
                  </div>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="fecha" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="puntaje"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Rendimiento por Materia
              </CardTitle>
              <CardDescription>
                Promedio de puntajes en cada área
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subjectData.every(d => d.score === 0) ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Sin datos de simulacros</p>
                  </div>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="subject" width={100} className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Perfil de Competencias
              </CardTitle>
              <CardDescription>
                Visualización radial de tus fortalezas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subjectData.every(d => d.score === 0) ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Sin datos de simulacros</p>
                  </div>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid className="stroke-muted" />
                      <PolarAngleAxis dataKey="subject" className="text-xs" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="Puntaje"
                        dataKey="A"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subject Progress List */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detalle por Materia</CardTitle>
            <CardDescription>
              Revisa tu progreso en cada área de estudio. Puntaje total: {puntajeTotalActual}/{puntajeMaximo}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectData.map(subject => (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{subject.subject}</span>
                      <span className="text-xs text-muted-foreground">
                        ({subject.count} simulacros)
                      </span>
                    </div>
                    <span className={`font-semibold ${
                      subject.score >= 70 ? 'text-success' : 
                      subject.score >= 50 ? 'text-warning' : 
                      subject.score > 0 ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {subject.score > 0 ? `${subject.score}/100` : 'Sin datos'}
                    </span>
                  </div>
                  <Progress value={subject.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Historial personal (para estudiantes) */}
        {!canViewAll && myResults.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Mi Historial</CardTitle>
              <CardDescription>
                Tus últimos simulacros realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myResults.slice(0, 10).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{r.materias?.nombre || 'General'}</Badge>
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        {new Date(r.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground hidden sm:inline">
                        {formatTime(r.tiempo_segundos)}
                      </span>
                      <span className={`font-bold ${r.puntaje >= 60 ? 'text-success' : 'text-destructive'}`}>
                        {r.puntaje}/100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Progreso;
