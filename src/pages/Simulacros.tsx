import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { mockMaterias, mockResultados } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import {
  Globe,
  Calculator,
  Languages,
  BookOpen,
  Microscope,
  Play,
  History,
  Clock,
  Target,
  Award,
  ArrowRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

const iconMap: { [key: string]: React.ElementType } = {
  Globe,
  Calculator,
  Languages,
  BookOpen,
  Microscope,
};

const Simulacros: React.FC = () => {
  const { user } = useAuth();
  const [selectedMateria, setSelectedMateria] = useState<string | null>(null);
  const [showHistorico, setShowHistorico] = useState(false);

  const userResults = mockResultados.filter(r => r.usuarioId === user?.id);

  const getMateriaResults = (materiaId: string) => {
    return userResults.filter(r => r.materiaId === materiaId);
  };

  const getMateriaStats = (materiaId: string) => {
    const results = getMateriaResults(materiaId);
    if (results.length === 0) return null;
    
    const avgScore = Math.round(results.reduce((acc, r) => acc + r.puntaje, 0) / results.length);
    const bestScore = Math.max(...results.map(r => r.puntaje));
    const lastResult = results[results.length - 1];
    
    return { avgScore, bestScore, lastResult, total: results.length };
  };

  return (
    <Layout>
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">Simulacros</h1>
          <p className="text-muted-foreground max-w-2xl">
            Practica con simulacros de evaluación en cada materia. 
            Mejora tu desempeño con práctica constante y análisis de resultados.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockMaterias.length}</p>
                <p className="text-xs text-muted-foreground">Materias</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userResults.length}</p>
                <p className="text-xs text-muted-foreground">Completados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {userResults.length > 0
                    ? Math.round(userResults.reduce((acc, r) => acc + r.puntaje, 0) / userResults.length)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Promedio</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {userResults.length > 0
                    ? Math.round(userResults.reduce((acc, r) => acc + r.tiempoMinutos, 0) / userResults.length)
                    : 0}min
                </p>
                <p className="text-xs text-muted-foreground">T. Promedio</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMaterias.map((materia, index) => {
            const Icon = iconMap[materia.icono] || BookOpen;
            const stats = getMateriaStats(materia.id);
            const results = getMateriaResults(materia.id);

            return (
              <Card
                key={materia.id}
                className={`subject-card animate-fade-in stagger-${index + 1}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`h-14 w-14 rounded-xl ${materia.color} flex items-center justify-center shadow-md`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    {stats && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{stats.avgScore}%</p>
                        <p className="text-xs text-muted-foreground">Promedio</p>
                      </div>
                    )}
                  </div>
                  <CardTitle className="mt-4">{materia.nombre}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {materia.descripcion}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {stats && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium">{stats.total} simulacros</span>
                      </div>
                      <Progress value={stats.avgScore} className="h-2" />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2">
                      <Play className="h-4 w-4" />
                      Iniciar
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <History className="h-4 w-4" />
                          Histórico
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-lg ${materia.color} flex items-center justify-center`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            {materia.nombre} - Histórico
                          </DialogTitle>
                          <DialogDescription>
                            Revisa tus resultados anteriores
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 mt-4 max-h-80 overflow-y-auto">
                          {results.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                              <p>Aún no has realizado simulacros en esta materia</p>
                            </div>
                          ) : (
                            results.map(result => (
                              <div
                                key={result.id}
                                className="p-4 rounded-lg border border-border"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(result.fecha).toLocaleDateString('es-ES', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                    })}
                                  </span>
                                  <span className={`text-lg font-bold ${
                                    result.puntaje >= 70 ? 'text-success' : 'text-warning'
                                  }`}>
                                    {result.puntaje}%
                                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <CheckCircle className="h-3 w-3 text-success" />
                                    {result.respuestasCorrectas} correctas
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <XCircle className="h-3 w-3 text-destructive" />
                                    {result.totalPreguntas - result.respuestasCorrectas} incorrectas
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {result.tiempoMinutos} min
                                  </div>
                                </div>
                                <Progress 
                                  value={(result.respuestasCorrectas / result.totalPreguntas) * 100} 
                                  className="h-1.5 mt-2" 
                                />
                              </div>
                            ))
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                Selecciona una materia y haz clic en "Iniciar" para comenzar un simulacro.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                Cada simulacro tiene un límite de tiempo. Administra bien tu tiempo.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                Revisa tus resultados en "Histórico" para identificar áreas de mejora.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                Practica regularmente para mejorar tu desempeño.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Simulacros;
