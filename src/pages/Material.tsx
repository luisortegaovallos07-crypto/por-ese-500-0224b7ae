import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileText,
  Video,
  BookOpen,
  Download,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface Material {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipo: string;
  url: string;
  materia_id: string;
  created_at: string | null;
}

interface Materia {
  id: string;
  nombre: string;
  color: string | null;
}

interface MaterialFormData {
  titulo: string;
  descripcion: string;
  tipo: string;
  url: string;
  materia_id: string;
}

const initialFormData: MaterialFormData = {
  titulo: '',
  descripcion: '',
  tipo: 'pdf',
  url: '',
  materia_id: '',
};

const Material: React.FC = () => {
  const { user, isAdmin, isProfesor } = useAuth();
  const { toast } = useToast();
  const canManage = isAdmin || isProfesor;

  const [materiales, setMateriales] = useState<Material[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMateria, setSelectedMateria] = useState<string>('all');

  // UI States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MaterialFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MaterialFormData, string>>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [materialesRes, materiasRes] = await Promise.all([
          supabase.from('materiales').select('*').order('created_at', { ascending: false }),
          supabase.from('materias').select('id, nombre, color').order('nombre')
        ]);

        if (materialesRes.error) throw materialesRes.error;
        if (materiasRes.error) throw materiasRes.error;

        setMateriales(materialesRes.data || []);
        setMaterias(materiasRes.data || []);
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast({ title: 'Error', description: 'No se pudieron cargar los materiales.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMaterial = materiales.filter(item => {
    const matchesSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.descripcion?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesMateria = selectedMateria === 'all' || item.materia_id === selectedMateria;
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
    return materias.find(m => m.id === materiaId)?.nombre || 'General';
  };

  const getMateriaColor = (materiaId: string) => {
    return materias.find(m => m.id === materiaId)?.color || 'bg-gray-500';
  };

  const materialByType = {
    all: filteredMaterial,
    pdf: filteredMaterial.filter(m => m.tipo === 'pdf'),
    video: filteredMaterial.filter(m => m.tipo === 'video'),
    resumen: filteredMaterial.filter(m => m.tipo === 'resumen'),
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof MaterialFormData, string>> = {};
    if (!formData.titulo.trim()) errors.titulo = 'El título es requerido';
    if (!formData.url.trim()) errors.url = 'La URL es requerida';
    if (!formData.materia_id) errors.materia_id = 'Selecciona una materia';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateDialog = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setEditingMaterialId(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (material: Material) => {
    setFormData({
      titulo: material.titulo,
      descripcion: material.descripcion || '',
      tipo: material.tipo,
      url: material.url,
      materia_id: material.materia_id,
    });
    setFormErrors({});
    setIsEditing(true);
    setEditingMaterialId(material.id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setEditingMaterialId(null);
  };

  const handleInputChange = (field: keyof MaterialFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateMaterial = async () => {
    if (!validateForm() || !user) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.from('materiales').insert({
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim() || null,
        tipo: formData.tipo,
        url: formData.url.trim(),
        materia_id: formData.materia_id,
        created_by: user.id,
      }).select().single();

      if (error) throw error;

      setMateriales(prev => [data, ...prev]);
      toast({ title: 'Material creado', description: 'El material ha sido añadido.' });
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error creating material:', error);
      toast({ title: 'Error', description: 'No se pudo crear el material.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMaterial = async () => {
    if (!validateForm() || !editingMaterialId) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.from('materiales').update({
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim() || null,
        tipo: formData.tipo,
        url: formData.url.trim(),
        materia_id: formData.materia_id,
      }).eq('id', editingMaterialId).select().single();

      if (error) throw error;

      setMateriales(prev => prev.map(m => m.id === editingMaterialId ? data : m));
      toast({ title: 'Material actualizado', description: 'Los cambios han sido guardados.' });
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error updating material:', error);
      toast({ title: 'Error', description: 'No se pudo actualizar el material.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = (materialId: string) => {
    setMaterialToDelete(materialId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteMaterial = async () => {
    if (!materialToDelete) return;

    try {
      const { error } = await supabase.from('materiales').delete().eq('id', materialToDelete);
      if (error) throw error;

      setMateriales(prev => prev.filter(m => m.id !== materialToDelete));
      toast({ title: 'Material eliminado', description: 'El material ha sido eliminado.' });
    } catch (error: any) {
      console.error('Error deleting material:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar el material.', variant: 'destructive' });
    } finally {
      setDeleteConfirmOpen(false);
      setMaterialToDelete(null);
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title">Material de Estudio</h1>
            <p className="text-muted-foreground max-w-2xl">
              PDFs, videos explicativos y resúmenes para tu preparación.
            </p>
          </div>
          {canManage && (
            <Button onClick={handleOpenCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Material
            </Button>
          )}
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
            {materias.map(materia => (
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
                      {canManage ? 'Agrega nuevos materiales de estudio.' : 'Intenta ajustar los filtros.'}
                    </p>
                    {canManage && (
                      <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={handleOpenCreateDialog}>
                        <Plus className="h-4 w-4" />
                        Agregar Material
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item, index) => {
                    const Icon = getTypeIcon(item.tipo);
                    return (
                      <Card key={item.id} className={`card-hover animate-fade-in`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className={`h-10 w-10 rounded-lg ${getTypeColor(item.tipo)} flex items-center justify-center`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className={`${getMateriaColor(item.materia_id)} text-white`}>
                                {getMateriaName(item.materia_id)}
                              </Badge>
                              {canManage && (
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleOpenEditDialog(item)}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleConfirmDelete(item.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
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
                              {item.created_at ? new Date(item.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                              }) : '-'}
                            </div>
                            <div className="flex gap-2">
                              {item.tipo === 'pdf' && (
                                <Button size="sm" variant="outline" className="gap-1" asChild>
                                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-3 w-3" />
                                    Descargar
                                  </a>
                                </Button>
                              )}
                              {item.tipo === 'video' && (
                                <Button size="sm" className="gap-1" asChild>
                                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3" />
                                    Ver Video
                                  </a>
                                </Button>
                              )}
                              {item.tipo === 'resumen' && (
                                <Button size="sm" variant="outline" className="gap-1" asChild>
                                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                                    <BookOpen className="h-3 w-3" />
                                    Leer
                                  </a>
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

        {/* Diálogo para Crear/Editar Material */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEditing ? <><Pencil className="h-5 w-5" /> Editar Material</> : <><Plus className="h-5 w-5" /> Nuevo Material</>}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Modifica los datos del material.' : 'Añade un nuevo recurso de estudio.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Título *</Label>
                <Input
                  placeholder="Título del material"
                  value={formData.titulo}
                  onChange={e => handleInputChange('titulo', e.target.value)}
                  className={formErrors.titulo ? 'border-destructive' : ''}
                />
                {formErrors.titulo && <p className="text-xs text-destructive">{formErrors.titulo}</p>}
              </div>

              <div className="grid gap-2">
                <Label>Descripción</Label>
                <Textarea
                  placeholder="Descripción del material"
                  value={formData.descripcion}
                  onChange={e => handleInputChange('descripcion', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={v => handleInputChange('tipo', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="resumen">Resumen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Materia *</Label>
                  <Select value={formData.materia_id} onValueChange={v => handleInputChange('materia_id', v)}>
                    <SelectTrigger className={formErrors.materia_id ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {materias.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.materia_id && <p className="text-xs text-destructive">{formErrors.materia_id}</p>}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>URL *</Label>
                <Input
                  placeholder="https://..."
                  value={formData.url}
                  onChange={e => handleInputChange('url', e.target.value)}
                  className={formErrors.url ? 'border-destructive' : ''}
                />
                {formErrors.url && <p className="text-xs text-destructive">{formErrors.url}</p>}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={isEditing ? handleUpdateMaterial : handleCreateMaterial} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isEditing ? 'Guardar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmación de eliminación */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar material?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteMaterial} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Material;
