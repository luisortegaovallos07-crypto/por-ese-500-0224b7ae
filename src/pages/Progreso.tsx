import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { mockResultados, mockMaterias } from '@/data/mockData';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Clock,
  Calendar,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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

const Progreso: React.FC = () => {
  const { user } = useAuth();

  const userResults = mockResultados.filter(r => r.usuarioId === user?.id);

  // Calculate stats
  const totalSimulacros = userResults.length;
  const averageScore = userResults.length > 0
    ? Math.round(userResults.reduce((acc, r) => acc + r.puntaje, 0) / userResults.length)
    : 0;
  const bestScore = userResults.length > 0
    ? Math.max(...userResults.map(r => r.puntaje))
    : 0;
  const averageTime = userResults.length > 0
    ? Math.round(userResults.reduce((acc, r) => acc + r.tiempoMinutos, 0) / userResults.length)
    : 0;

  // Prepare chart data - evolution over time
  const evolutionData = userResults
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .map(r => ({
      fecha: new Date(r.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      puntaje: r.puntaje,
      materia: mockMaterias.find(m => m.id === r.materiaId)?.nombre || 'General',
    }));

  // Prepare data by subject
  const subjectData = mockMaterias.map(materia => {
    const materiaResults = userResults.filter(r => r.materiaId === materia.id);
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

  // Radar chart data
  const radarData = subjectData.map(d => ({
    subject: d.shortName,
    A: d.score,
    fullMark: 100,
  }));

  // Calculate trend
  const getTrend = () => {
    if (userResults.length < 2) return { trend: 'neutral', value: 0 };
    const sorted = [...userResults].sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
    const recent = sorted[0].puntaje;
    const previous = sorted[1].puntaje;
    const diff = recent - previous;
    return {
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
      value: Math.abs(diff),
    };
  };

  const trend = getTrend();

  return (
    <Layout>
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">Mi Progreso</h1>
          <p className="text-muted-foreground max-w-2xl">
            Visualiza tu evolución académica con gráficos detallados por materia y tiempo.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{averageScore}%</p>
                  <p className="text-xs text-muted-foreground">Promedio General</p>
                </div>
              </div>
              {trend.trend !== 'neutral' && (
                <div className={`flex items-center gap-1 mt-2 text-xs ${
                  trend.trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {trend.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  {trend.value}% vs anterior
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{bestScore}%</p>
                  <p className="text-xs text-muted-foreground">Mejor Puntaje</p>
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
                  <p className="text-xs text-muted-foreground">Tiempo Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              Revisa tu progreso en cada área de estudio
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
                      {subject.score > 0 ? `${subject.score}%` : 'Sin datos'}
                    </span>
                  </div>
                  <Progress value={subject.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Progreso;
