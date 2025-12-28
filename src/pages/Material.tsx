import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { mockMaterial, mockMaterias } from '@/data/mockData';
import {
  FileText,
  Video,
  BookOpen,
  Download,
  ExternalLink,
  Search,
  Filter,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Material: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMateria, setSelectedMateria] = useState<string>('all');

  const filteredMaterial = mockMaterial.filter(item => {
    const matchesSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMateria = selectedMateria === 'all' || item.materiaId === selectedMateria;
    return matchesSearch && matchesMateria;
  });

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'pdf': return FileText;
      case 'video': return Video;
      case 'resumen': return BookOpen;
      default: return FileText;
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'pdf': return 'bg-destructive/10 text-destructive';
      case 'video': return 'bg-primary/10 text-primary';
      case 'resumen': return 'bg-success/10 text-success';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMateriaName = (materiaId: string) => {
    return mockMaterias.find(m => m.id === materiaId)?.nombre || 'General';
  };

  const getMateriaColor = (materiaId: string) => {
    return mockMaterias.find(m => m.id === materiaId)?.color || 'bg-gray-500';
  };

  const materialByType = {
    all: filteredMaterial,
    pdf: filteredMaterial.filter(m => m.tipo === 'pdf'),
    video: filteredMaterial.filter(m => m.tipo === 'video'),
    resumen: filteredMaterial.filter(m => m.tipo === 'resumen'),
  };

  return (
    <Layout>
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">Material de Estudio</h1>
          <p className="text-muted-foreground max-w-2xl">
            Accede a recursos de estudio organizados por materia. 
            PDFs, videos explicativos y resúmenes para tu preparación.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar material..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedMateria === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMateria('all')}
            >
              Todas
            </Button>
            {mockMaterias.map(materia => (
              <Button
                key={materia.id}
                variant={selectedMateria === materia.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMateria(materia.id)}
              >
                {materia.nombre}
              </Button>
            ))}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Filter className="h-4 w-4" />
              Todos ({materialByType.all.length})
            </TabsTrigger>
            <TabsTrigger value="pdf" className="gap-2">
              <FileText className="h-4 w-4" />
              PDFs ({materialByType.pdf.length})
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-2">
              <Video className="h-4 w-4" />
              Videos ({materialByType.video.length})
            </TabsTrigger>
            <TabsTrigger value="resumen" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Resúmenes ({materialByType.resumen.length})
            </TabsTrigger>
          </TabsList>

          {Object.entries(materialByType).map(([key, items]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              {items.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-medium mb-2">No se encontraron recursos</h3>
                    <p className="text-sm text-muted-foreground">
                      Intenta ajustar los filtros o el término de búsqueda
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item, index) => {
                    const Icon = getTypeIcon(item.tipo);
                    return (
                      <Card
                        key={item.id}
                        className={`card-hover animate-fade-in stagger-${(index % 5) + 1}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className={`h-10 w-10 rounded-lg ${getTypeColor(item.tipo)} flex items-center justify-center`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <Badge variant="secondary" className={`${getMateriaColor(item.materiaId)} text-white`}>
                              {getMateriaName(item.materiaId)}
                            </Badge>
                          </div>
                          <CardTitle className="text-base mt-3 line-clamp-1">
                            {item.titulo}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {item.descripcion}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.fecha).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </div>
                            <div className="flex gap-2">
                              {item.tipo === 'pdf' && (
                                <Button size="sm" variant="outline" className="gap-1">
                                  <Download className="h-3 w-3" />
                                  Descargar
                                </Button>
                              )}
                              {item.tipo === 'video' && (
                                <Button size="sm" className="gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  Ver Video
                                </Button>
                              )}
                              {item.tipo === 'resumen' && (
                                <Button size="sm" variant="outline" className="gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  Leer
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Info Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Sobre el Material
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">PDFs</h4>
                  <p className="text-sm text-muted-foreground">
                    Guías y documentos descargables para estudio offline
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Video className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Videos</h4>
                  <p className="text-sm text-muted-foreground">
                    Explicaciones visuales de temas complejos
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Resúmenes</h4>
                  <p className="text-sm text-muted-foreground">
                    Síntesis de conceptos clave por materia
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Material;
