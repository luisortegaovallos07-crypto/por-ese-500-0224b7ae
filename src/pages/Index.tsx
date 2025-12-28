import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import logoBanner from '@/assets/logo-banner.jpeg';
import {
  FileText,
  BookOpen,
  TrendingUp,
  Calendar,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: FileText,
    title: 'Simulacros',
    description: 'Practica con evaluaciones similares al examen real',
  },
  {
    icon: BookOpen,
    title: 'Material',
    description: 'Accede a recursos de estudio organizados por materia',
  },
  {
    icon: TrendingUp,
    title: 'Progreso',
    description: 'Monitorea tu avance con gráficos detallados',
  },
  {
    icon: Calendar,
    title: 'Calendario',
    description: 'Mantente al día con eventos y fechas importantes',
  },
];

const stats = [
  { value: '500+', label: 'Estudiantes' },
  { value: '5', label: 'Materias' },
  { value: '100+', label: 'Simulacros' },
  { value: '95%', label: 'Satisfacción' },
];

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 text-success text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                Calendario 2026 Activo
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Prepárate para el{' '}
                <span className="text-gradient">Éxito Académico</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Plataforma integral de preparación con simulacros, material de estudio 
                y seguimiento personalizado de tu progreso.
              </p>

              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                "Donde cada día de disciplina acerca los sueños al 500"
              </blockquote>

              <div className="flex flex-wrap gap-4">
                {isAuthenticated ? (
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/dashboard">
                      Ir al Panel
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/login">
                      Iniciar Sesión
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="lg">
                  <Link to="/contacto">Más Información</Link>
                </Button>
              </div>
            </div>

            <div className="relative animate-fade-in stagger-2">
              <div className="relative rounded-2xl overflow-hidden shadow-elevated">
                <img
                  src={logoBanner}
                  alt="POR ESE 500 - Calendario 2026"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-card border border-border hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold">Resultados Comprobados</p>
                    <p className="text-sm text-muted-foreground">+95% de satisfacción</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`text-center animate-fade-in stagger-${index + 1}`}
              >
                <p className="text-3xl md:text-4xl font-bold text-primary-foreground">
                  {stat.value}
                </p>
                <p className="text-primary-foreground/80 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que Necesitas para Prepararte
            </h2>
            <p className="text-muted-foreground text-lg">
              Herramientas diseñadas para maximizar tu rendimiento académico
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`group p-6 rounded-xl bg-card border border-border card-hover animate-fade-in stagger-${index + 1}`}
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Users className="h-4 w-4" />
              Únete a nuestra comunidad
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              ¿Listo para Alcanzar tus Metas?
            </h2>
            <p className="text-muted-foreground text-lg">
              Comienza tu preparación hoy y acércate más a tu objetivo con cada día de práctica.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <Button asChild size="lg" className="gap-2">
                  <Link to="/simulacros">
                    Iniciar Simulacro
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" className="gap-2">
                  <Link to="/login">
                    Acceder a la Plataforma
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
