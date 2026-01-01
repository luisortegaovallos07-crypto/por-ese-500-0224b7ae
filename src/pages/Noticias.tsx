import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ImageUpload } from '@/components/ImageUpload';
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2,
  Newspaper,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface Noticia {
  id: string;
  titulo: string;
  contenido: string;
  autor: string;
  imagen_url: string | null;
  destacada: boolean | null;
  created_at: string | null;
}

interface NoticiaFormData {
  titulo: string;
  contenido: string;
  autor: string;
  imagen_url: string;
  destacada: boolean;
}

const initialFormData: NoticiaFormData = {
  titulo: '',
  contenido: '',
  autor: '',
  imagen_url: '',
  destacada: false,
};

const Noticias: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user, profile } = useAuth();
  const { toast } = useToast();

  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoticiaId, setEditingNoticiaId] = useState<string | null>(null);
  const [formData, setFormData] = useState<NoticiaFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NoticiaFormData, string>>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noticiaToDelete, setNoticiaToDelete] = useState<string | null>(null);

  // Cargar noticias
  useEffect(() => {
    const fetchNoticias = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('noticias')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNoticias(data || []);
      } catch (error: any) {
        console.error('Error fetching noticias:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las noticias.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNoticias();
  }, []);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof NoticiaFormData, string>> = {};

    if (!formData.titulo.trim()) {
      errors.titulo = 'El título es requerido';
    }
    if (!formData.contenido.trim()) {
      errors.contenido = 'El contenido es requerido';
    }
    if (!formData.autor.trim()) {
      errors.autor = 'El autor es requerido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      ...initialFormData,
      autor: profile?.nombre || '',
    });
    setFormErrors({});
    setIsEditing(false);
    setEditingNoticiaId(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (noticia: Noticia) => {
    setFormData({
      titulo: noticia.titulo,
      contenido: noticia.contenido,
      autor: noticia.autor,
      imagen_url: noticia.imagen_url || '',
      destacada: noticia.destacada || false,
    });
    setFormErrors({});
    setIsEditing(true);
    setEditingNoticiaId(noticia.id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setEditingNoticiaId(null);
  };

  const handleInputChange = (field: keyof NoticiaFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateNoticia = async () => {
    if (!validateForm() || !user) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.from('noticias').insert({
        titulo: formData.titulo.trim(),
        contenido: formData.contenido.trim(),
        autor: formData.autor.trim(),
        imagen_url: formData.imagen_url.trim() || null,
        destacada: formData.destacada,
        created_by: user.id,
      }).select().single();

      if (error) throw error;

      setNoticias(prev => [data, ...prev]);
      toast({
        title: 'Noticia creada',
        description: `La noticia "${data.titulo}" ha sido publicada.`,
      });
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error creating noticia:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la noticia.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNoticia = async () => {
    if (!validateForm() || !editingNoticiaId) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.from('noticias').update({
        titulo: formData.titulo.trim(),
        contenido: formData.contenido.trim(),
        autor: formData.autor.trim(),
        imagen_url: formData.imagen_url.trim() || null,
        destacada: formData.destacada,
      }).eq('id', editingNoticiaId).select().single();

      if (error) throw error;

      setNoticias(prev => prev.map(n => n.id === editingNoticiaId ? data : n));
      toast({
        title: 'Noticia actualizada',
        description: 'Los cambios han sido guardados.',
      });
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error updating noticia:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la noticia.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = (noticiaId: string) => {
    setNoticiaToDelete(noticiaId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteNoticia = async () => {
    if (!noticiaToDelete) return;

    try {
      const { error } = await supabase.from('noticias').delete().eq('id', noticiaToDelete);
      if (error) throw error;

      setNoticias(prev => prev.filter(n => n.id !== noticiaToDelete));
      toast({
        title: 'Noticia eliminada',
        description: 'La noticia ha sido eliminada.',
      });

      // Si estamos viendo la noticia eliminada, volver a la lista
      if (id === noticiaToDelete) {
        navigate('/noticias');
      }
    } catch (error: any) {
      console.error('Error deleting noticia:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la noticia.',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setNoticiaToDelete(null);
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

  // Vista de noticia individual
  if (id) {
    const noticia = noticias.find(n => n.id === id);
    if (!noticia) {
      return (
        <Layout>
          <div className="page-container text-center py-20">
            <Newspaper className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Noticia no encontrada</h1>
            <Button asChild><Link to="/noticias">Volver a Noticias</Link></Button>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className="page-container max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" asChild className="gap-2">
              <Link to="/noticias"><ArrowLeft className="h-4 w-4" />Volver</Link>
            </Button>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => handleOpenEditDialog(noticia)}>
                  <Pencil className="h-4 w-4" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-destructive" onClick={() => handleConfirmDelete(noticia.id)}>
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            )}
          </div>
          <article>
            <div className="flex items-center gap-2 mb-4">
              {noticia.destacada && (
                <Badge className="bg-warning text-warning-foreground gap-1">
                  <Star className="h-3 w-3" />
                  Destacada
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{noticia.titulo}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1"><User className="h-4 w-4" />{noticia.autor}</span>
              {noticia.created_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(noticia.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
            {noticia.imagen_url && (
              <img src={noticia.imagen_url} alt={noticia.titulo} className="w-full rounded-lg mb-8 max-h-96 object-cover" />
            )}
            <div className="prose prose-lg max-w-none whitespace-pre-wrap">
              {noticia.contenido}
            </div>
          </article>
        </div>

        {/* Dialogs */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                Editar Noticia
              </DialogTitle>
            </DialogHeader>
            <NoticiaForm 
              formData={formData}
              formErrors={formErrors}
              saving={saving}
              onInputChange={handleInputChange}
              onSave={handleUpdateNoticia}
              onCancel={handleCloseDialog}
              isEditing={true}
            />
          </DialogContent>
        </Dialog>

        <DeleteConfirmDialog 
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={handleDeleteNoticia}
        />
      </Layout>
    );
  }

  // Vista de lista de noticias
  return (
    <Layout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title flex items-center gap-3 mb-0">
              <Newspaper className="h-8 w-8 text-primary" />
              Noticias
            </h1>
            <p className="text-muted-foreground mt-2">Mantente informado sobre las novedades académicas.</p>
          </div>
          {isAdmin && (
            <Button onClick={handleOpenCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Noticia
            </Button>
          )}
        </div>

        {noticias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Newspaper className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No hay noticias</h2>
            <p className="text-muted-foreground mb-4">Aún no se han publicado noticias.</p>
            {isAdmin && (
              <Button onClick={handleOpenCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Crear primera noticia
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {noticias.map((noticia, i) => (
              <Card key={noticia.id} className={`card-hover animate-fade-in stagger-${(i % 4) + 1} group`}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {noticia.destacada && (
                        <Badge className="bg-warning text-warning-foreground gap-1">
                          <Star className="h-3 w-3" />
                          Destacada
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {noticia.created_at && new Date(noticia.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{noticia.titulo}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">{noticia.contenido.substring(0, 150)}...</p>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" asChild><Link to={`/noticias/${noticia.id}`}>Leer más</Link></Button>
                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenEditDialog(noticia);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            handleConfirmDelete(noticia.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Diálogo para Crear/Editar */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Pencil className="h-5 w-5" />
                    Editar Noticia
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Nueva Noticia
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Modifica el contenido de la noticia.' : 'Publica una nueva noticia para los estudiantes.'}
              </DialogDescription>
            </DialogHeader>
            <NoticiaForm 
              formData={formData}
              formErrors={formErrors}
              saving={saving}
              onInputChange={handleInputChange}
              onSave={isEditing ? handleUpdateNoticia : handleCreateNoticia}
              onCancel={handleCloseDialog}
              isEditing={isEditing}
            />
          </DialogContent>
        </Dialog>

        <DeleteConfirmDialog 
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={handleDeleteNoticia}
        />
      </div>
    </Layout>
  );
};

// Componente de formulario
interface NoticiaFormProps {
  formData: NoticiaFormData;
  formErrors: Partial<Record<keyof NoticiaFormData, string>>;
  saving: boolean;
  onInputChange: (field: keyof NoticiaFormData, value: string | boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const NoticiaForm: React.FC<NoticiaFormProps> = ({
  formData,
  formErrors,
  saving,
  onInputChange,
  onSave,
  onCancel,
  isEditing,
}) => (
  <>
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          placeholder="Título de la noticia"
          value={formData.titulo}
          onChange={e => onInputChange('titulo', e.target.value)}
          className={formErrors.titulo ? 'border-destructive' : ''}
        />
        {formErrors.titulo && (
          <p className="text-xs text-destructive">{formErrors.titulo}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contenido">Contenido *</Label>
        <Textarea
          id="contenido"
          placeholder="Escribe el contenido de la noticia..."
          value={formData.contenido}
          onChange={e => onInputChange('contenido', e.target.value)}
          className={formErrors.contenido ? 'border-destructive' : ''}
          rows={8}
        />
        {formErrors.contenido && (
          <p className="text-xs text-destructive">{formErrors.contenido}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="autor">Autor *</Label>
        <Input
          id="autor"
          placeholder="Nombre del autor"
          value={formData.autor}
          onChange={e => onInputChange('autor', e.target.value)}
          className={formErrors.autor ? 'border-destructive' : ''}
        />
        {formErrors.autor && (
          <p className="text-xs text-destructive">{formErrors.autor}</p>
        )}
      </div>

      <div className="grid gap-2">
        <ImageUpload
          value={formData.imagen_url}
          onChange={(url) => onInputChange('imagen_url', url)}
          folder="noticias"
          label="Imagen"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="destacada"
          checked={formData.destacada}
          onCheckedChange={checked => onInputChange('destacada', checked)}
        />
        <Label htmlFor="destacada" className="flex items-center gap-2">
          <Star className="h-4 w-4 text-warning" />
          Marcar como destacada
        </Label>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={onCancel} disabled={saving}>
        Cancelar
      </Button>
      <Button onClick={onSave} disabled={saving} className="gap-2">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {isEditing ? 'Guardar Cambios' : 'Publicar'}
      </Button>
    </DialogFooter>
  </>
);

// Componente de confirmación de eliminación
interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ open, onOpenChange, onConfirm }) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Eliminar esta noticia?</AlertDialogTitle>
        <AlertDialogDescription>
          Esta acción no se puede deshacer. La noticia será eliminada permanentemente.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          Eliminar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default Noticias;
