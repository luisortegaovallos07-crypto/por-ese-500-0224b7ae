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
  Clock,
  ArrowRight,
  BarChart3,
  Target,
} from 'lucide-react';
import './Dashboard.css';

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
      const { data: noticiasData } = await supabase
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2);
      
      if (noticiasData) setNoticias(noticiasData);

      const today = new Date().toISOString().split('T')[0];
      const { data: eventosData } = await supabase
        .from('eventos')
        .select('*')
        .gte('fecha', today)
        .order('fecha', { ascending: true })
        .limit(3);
      
      if (eventosData) setEventos(eventosData);

      const { data: materiasData } = await supabase
        .from('materias')
        .select('*');
      
      if (materiasData) setMaterias(materiasData);

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

  const getEventTypeClass = (tipo: string) => {
    switch (tipo) {
      case 'simulacro': return 'event-type-simulacro';
      case 'clase': return 'event-type-clase';
      case 'tarea': return 'event-type-tarea';
      case 'reunion': return 'event-type-reunion';
      default: return 'event-type-default';
    }
  };

  return (
    <Layout>
      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            ¡Hola, {profile?.nombre}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Bienvenido a tu panel de control. Aquí puedes ver tu progreso y actividades recientes.
          </p>
        </div>

        {/* Quick Stats - Student View */}
        <RoleGate allowedRoles={['estudiante']}>
          <div className="stats-grid">
            <div className="stat-card-item">
              <div className="stat-card-content">
                <div className="stat-icon-box stat-icon-primary">
                  <Target className="stat-icon" />
                </div>
                <div>
                  <p className="stat-number">0</p>
                  <p className="stat-text">Promedio</p>
                </div>
              </div>
            </div>
            <div className="stat-card-item">
              <div className="stat-card-content">
                <div className="stat-icon-box stat-icon-success">
                  <FileText className="stat-icon" />
                </div>
                <div>
                  <p className="stat-number">0</p>
                  <p className="stat-text">Simulacros</p>
                </div>
              </div>
            </div>
            <div className="stat-card-item">
              <div className="stat-card-content">
                <div className="stat-icon-box stat-icon-accent">
                  <BookOpen className="stat-icon" />
                </div>
                <div>
                  <p className="stat-number">{materias.length}</p>
                  <p className="stat-text">Materias</p>
                </div>
              </div>
            </div>
            <div className="stat-card-item">
              <div className="stat-card-content">
                <div className="stat-icon-box stat-icon-warning">
                  <Calendar className="stat-icon" />
                </div>
                <div>
                  <p className="stat-number">{eventos.length}</p>
                  <p className="stat-text">Próximos</p>
                </div>
              </div>
            </div>
          </div>
        </RoleGate>

        {/* Admin/Professor Stats */}
        <RoleGate allowedRoles={['admin', 'profesor']}>
          <div className="stats-grid">
            <div className="stat-card-item">
              <div className="stat-card-content">
                <div className="stat-icon-box stat-icon-primary">
                  <Users className="stat-icon" />
                </div>
                <div>
                  <p className="stat-number">{stats.totalEstudiantes}</p>
                  <p className="stat-text">Estudiantes</p>
                </div>
              </div>
            </div>
            <div className="stat-card-item">
              <div className="stat-card-content">
                <div className="stat-icon-box stat-icon-success">
                  <BarChart3 className="stat-icon" />
                </div>
                <div>
                  <p className="stat-number">0</p>
                  <p className="stat-text">Promedio General</p>
                </div>
              </div>
            </div>
            <div className="stat-card-item">
              <div className="stat-card-content">
                <div className="stat-icon-box stat-icon-accent">
                  <FileText className="stat-icon" />
                </div>
                <div>
                  <p className="stat-number">{stats.totalSimulacros}</p>
                  <p className="stat-text">Simulacros</p>
                </div>
              </div>
            </div>
            <div className="stat-card-item">
              <div className="stat-card-content">
                <div className="stat-icon-box stat-icon-warning">
                  <Calendar className="stat-icon" />
                </div>
                <div>
                  <p className="stat-number">{eventos.length}</p>
                  <p className="stat-text">Eventos</p>
                </div>
              </div>
            </div>
          </div>
        </RoleGate>

        <div className="dashboard-grid">
          {/* Main Content */}
          <div className="dashboard-main">
            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <FileText className="card-title-icon" />
                  Acciones Rápidas
                </h2>
              </div>
              <div className="card-content">
                <div className="quick-actions-grid">
                  <Link to="/simulacros" className="quick-action quick-action-primary">
                    <div className="quick-action-icon-box quick-action-icon-primary">
                      <FileText className="quick-action-icon" />
                    </div>
                    <div className="quick-action-text">
                      <h3 className="quick-action-title">Iniciar Simulacro</h3>
                      <p className="quick-action-subtitle">Practica ahora</p>
                    </div>
                    <ArrowRight className="quick-action-arrow" />
                  </Link>

                  <Link to="/progreso" className="quick-action quick-action-success">
                    <div className="quick-action-icon-box quick-action-icon-success">
                      <TrendingUp className="quick-action-icon" />
                    </div>
                    <div className="quick-action-text">
                      <h3 className="quick-action-title">Ver Progreso</h3>
                      <p className="quick-action-subtitle">Tu evolución</p>
                    </div>
                    <ArrowRight className="quick-action-arrow quick-action-arrow-success" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent News */}
            <div className="card">
              <div className="card-header card-header-row">
                <h2 className="card-title">
                  <Newspaper className="card-title-icon" />
                  Noticias Recientes
                </h2>
                <Link to="/noticias" className="btn btn-ghost btn-sm">
                  Ver todas
                  <ArrowRight className="btn-icon-sm" />
                </Link>
              </div>
              <div className="card-content">
                {noticias.length === 0 ? (
                  <p className="empty-message">No hay noticias disponibles</p>
                ) : (
                  <div className="news-list">
                    {noticias.map(noticia => (
                      <div key={noticia.id} className="news-item">
                        <h3 className="news-title">{noticia.titulo}</h3>
                        <p className="news-excerpt">{noticia.contenido}</p>
                        <div className="news-meta">
                          <Clock className="news-meta-icon" />
                          {new Date(noticia.created_at).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="dashboard-sidebar">
            {/* Upcoming Events */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <Calendar className="card-title-icon" />
                  Próximos Eventos
                </h2>
              </div>
              <div className="card-content">
                {eventos.length === 0 ? (
                  <p className="empty-message">No hay eventos programados</p>
                ) : (
                  <div className="events-list">
                    {eventos.map(evento => (
                      <div key={evento.id} className="event-item">
                        <div className="event-header">
                          <h4 className="event-title">{evento.titulo}</h4>
                          <span className={`event-type ${getEventTypeClass(evento.tipo)}`}>
                            {evento.tipo}
                          </span>
                        </div>
                        <div className="event-meta">
                          <Calendar className="event-meta-icon" />
                          {new Date(evento.fecha).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                          })}
                          {evento.hora && (
                            <>
                              <Clock className="event-meta-icon event-meta-icon-ml" />
                              {evento.hora}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Link to="/calendario" className="btn btn-outline btn-full">
                  Ver Calendario
                </Link>
              </div>
            </div>

            {/* Subjects Overview */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <BookOpen className="card-title-icon" />
                  Materias
                </h2>
              </div>
              <div className="card-content">
                <div className="subjects-list">
                  {materias.map(materia => (
                    <Link key={materia.id} to="/simulacros" className="subject-item">
                      <div 
                        className="subject-icon"
                        style={{ backgroundColor: materia.color || '#3B82F6' }}
                      >
                        <span className="subject-initial">
                          {materia.nombre.charAt(0)}
                        </span>
                      </div>
                      <span className="subject-name">{materia.nombre}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
