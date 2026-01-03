import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import logoBanner from '@/assets/logo-banner.jpeg';
import logoPorese500 from '@/assets/logo-porese500.jpeg';
import {
  FileText,
  BookOpen,
  TrendingUp,
  Calendar,
  Users,
  Award,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  Star,
  Target,
  Lightbulb,
  Brain,
} from 'lucide-react';
import './Index.css';

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

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg" />
        <div className="hero-container">
          <div className="hero-grid">
            <div className="hero-content animate-fade-in">
              <div className="hero-badge">
                <CheckCircle className="hero-badge-icon" />
                Calendario 2026 Activo
              </div>
              
              <h1 className="hero-title">
                Prepárate para el{' '}
                <span className="text-gradient">Éxito Académico</span>
              </h1>
              
              <p className="hero-description">
                Plataforma integral de preparación con simulacros, material de estudio 
                y seguimiento personalizado de tu progreso.
              </p>

              <blockquote className="hero-quote">
                "Donde cada día de disciplina acerca los sueños al 500"
              </blockquote>

              <div className="hero-actions">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg">
                    Ir al Panel
                    <ArrowRight className="btn-icon" />
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-lg">
                    Iniciar Sesión
                    <ArrowRight className="btn-icon" />
                  </Link>
                )}
                <Link to="/contacto" className="btn btn-outline btn-lg">
                  Más Información
                </Link>
              </div>
            </div>

            <div className="hero-image-container animate-fade-in stagger-2">
              <div className="hero-image-wrapper">
                <img
                  src={logoBanner}
                  alt="POR ESE 500 - Calendario 2026"
                  className="hero-image"
                />
              </div>
              <div className="hero-floating-card">
                <div className="hero-floating-icon">
                  <Award className="hero-floating-svg" />
                </div>
                <div>
                  <p className="hero-floating-title">Resultados Comprobados</p>
                  <p className="hero-floating-subtitle">100% de satisfacción</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Platform Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-grid">
            <div className="about-content animate-fade-in">
              <h2 className="about-title">Nuestra Plataforma</h2>
              <p className="about-description">
                <strong>Por Ese 500</strong> es una plataforma educativa diseñada para ayudarte a alcanzar 
                tu máximo potencial académico. Combinamos tecnología avanzada con metodologías 
                de estudio probadas para ofrecerte la mejor experiencia de preparación.
              </p>
              <div className="about-features">
                <div className="about-feature">
                  <Target className="about-feature-icon" />
                  <div>
                    <h4>Enfoque en Resultados</h4>
                    <p>Cada herramienta está diseñada para maximizar tu puntaje</p>
                  </div>
                </div>
                <div className="about-feature">
                  <Lightbulb className="about-feature-icon" />
                  <div>
                    <h4>Aprendizaje Inteligente</h4>
                    <p>Simulacros adaptativos que identifican tus áreas de mejora</p>
                  </div>
                </div>
                <div className="about-feature">
                  <Brain className="about-feature-icon" />
                  <div>
                    <h4>Metodología Comprobada</h4>
                    <p>Basada en técnicas de estudio científicamente validadas</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-image-container animate-fade-in stagger-2">
              <img 
                src={logoPorese500} 
                alt="Por Ese 500 Logo" 
                className="about-logo"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            <div className="stat-card animate-fade-in stagger-1">
              <div className="stat-icon-circle">
                <GraduationCap className="stat-icon" />
              </div>
              <div className="stat-content">
                <p className="stat-value">+2.000</p>
                <p className="stat-label">Estudiantes Activos</p>
                <p className="stat-description">Preparándose para el éxito</p>
              </div>
            </div>
            <div className="stat-card animate-fade-in stagger-2">
              <div className="stat-icon-circle stat-icon-success">
                <Star className="stat-icon" />
              </div>
              <div className="stat-content">
                <p className="stat-value">100%</p>
                <p className="stat-label">Satisfacción</p>
                <p className="stat-description">Compromiso con la calidad</p>
              </div>
            </div>
            <div className="stat-card animate-fade-in stagger-3">
              <div className="stat-icon-circle stat-icon-info">
                <BookOpen className="stat-icon" />
              </div>
              <div className="stat-content">
                <p className="stat-value">5</p>
                <p className="stat-label">Materias Completas</p>
                <p className="stat-description">Contenido actualizado</p>
              </div>
            </div>
            <div className="stat-card animate-fade-in stagger-4">
              <div className="stat-icon-circle stat-icon-warning">
                <Target className="stat-icon" />
              </div>
              <div className="stat-content">
                <p className="stat-value">500</p>
                <p className="stat-label">Puntaje Meta</p>
                <p className="stat-description">Tu objetivo, nuestra misión</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">
              Todo lo que Necesitas para Prepararte
            </h2>
            <p className="features-subtitle">
              Herramientas diseñadas para maximizar tu rendimiento académico
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`feature-card animate-fade-in stagger-${index + 1}`}
                >
                  <div className="feature-icon-wrapper">
                    <Icon className="feature-icon" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <div className="cta-badge">
              <Users className="cta-badge-icon" />
              Únete a nuestra comunidad
            </div>
            <h2 className="cta-title">
              ¿Listo para Alcanzar tus Metas?
            </h2>
            <p className="cta-description">
              Comienza tu preparación hoy y acércate más a tu objetivo con cada día de práctica.
            </p>
            <div className="cta-actions">
              {isAuthenticated ? (
                <Link to="/simulacros" className="btn btn-primary btn-lg">
                  Iniciar Simulacro
                  <ArrowRight className="btn-icon" />
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary btn-lg">
                  Acceder a la Plataforma
                  <ArrowRight className="btn-icon" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
