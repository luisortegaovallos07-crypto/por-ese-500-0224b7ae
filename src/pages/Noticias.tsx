import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { mockNoticias } from '@/data/mockData';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'academico': return 'bg-primary text-primary-foreground';
    case 'evento': return 'bg-success text-success-foreground';
    case 'aviso': return 'bg-warning text-warning-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const Noticias: React.FC = () => {
  const { id } = useParams();

  if (id) {
    const noticia = mockNoticias.find(n => n.id === id);
    if (!noticia) {
      return (
        <Layout>
          <div className="page-container text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Noticia no encontrada</h1>
            <Button asChild><Link to="/noticias">Volver a Noticias</Link></Button>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className="page-container max-w-3xl">
          <Button variant="ghost" asChild className="mb-6 gap-2">
            <Link to="/noticias"><ArrowLeft className="h-4 w-4" />Volver</Link>
          </Button>
          <article>
            <Badge className={getCategoryColor(noticia.categoria)}>{noticia.categoria}</Badge>
            <h1 className="text-3xl font-bold mt-4 mb-4">{noticia.titulo}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1"><User className="h-4 w-4" />{noticia.autor}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(noticia.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: noticia.contenido }} />
          </article>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="mb-8">
          <h1 className="section-title">Noticias</h1>
          <p className="text-muted-foreground">Mantente informado sobre las novedades académicas.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {mockNoticias.map((noticia, i) => (
            <Card key={noticia.id} className={`card-hover animate-fade-in stagger-${i + 1}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={getCategoryColor(noticia.categoria)}>{noticia.categoria}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(noticia.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <CardTitle className="line-clamp-2">{noticia.titulo}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3 mb-4">{noticia.resumen}</p>
                <Button variant="outline" asChild><Link to={`/noticias/${noticia.id}`}>Leer más</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Noticias;
