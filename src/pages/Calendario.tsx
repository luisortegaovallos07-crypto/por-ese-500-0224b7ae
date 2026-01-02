import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon, 
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import './Calendario.css';

interface Evento {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  hora: string | null;
  tipo: string;
  materia_id: string | null;
}

interface Materia {
  id: string;
  nombre: string;
}

interface EventoFormData {
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  tipo: string;
  materia_id: string;
}

const initialFormData: EventoFormData = {
  titulo: '',
  descripcion: '',
  fecha: '',
  hora: '',
  tipo: 'simulacro',
  materia_id: '',
};

const getEventColor = (tipo: string) => {
  switch (tipo) {
    case 'simulacro': return 'bg-primary text-primary-foreground';
    case 'taller': return 'bg-success text-success-foreground';
    case 'entrega': return 'bg-warning text-warning-foreground';
    case 'examen': return 'bg-destructive text-destructive-foreground';
    case 'reunion': return 'bg-accent text-accent-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getTipoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    simulacro: 'Simulacro',
    taller: 'Taller',
    entrega: 'Entrega',
    reunion: 'Reunión',
    examen: 'Examen',
  };
  return labels[tipo] || tipo;
};

const Calendario: React.FC = () => {
  const { isAdmin, isProfesor, user } = useAuth();
  const { toast } = useToast();
  const canManageEvents = isAdmin || isProfesor;

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventoFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof EventoFormData, string>>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventosRes, materiasRes] = await Promise.all([
          supabase.from('eventos').select('*').order('fecha', { ascending: true }),
          supabase.from('materias').select('id, nombre').order('nombre')
        ]);

        if (eventosRes.error) throw eventosRes.error;
        if (materiasRes.error) throw materiasRes.error;

        setEventos(eventosRes.data || []);
        setMaterias(materiasRes.data || []);
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los eventos.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventos.filter(e => e.fecha === dateStr);
  };
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const upcomingEvents = eventos
    .filter(e => new Date(e.fecha) >= new Date())
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof EventoFormData, string>> = {};

    if (!formData.titulo.trim()) {
      errors.titulo = 'El título es requerido';
    }
    if (!formData.fecha) {
      errors.fecha = 'La fecha es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenCreateDialog = () => {
    const today = new Date();
    setFormData({
      ...initialFormData,
      fecha: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
    });
    setFormErrors({});
    setIsEditing(false);
    setEditingEventId(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (evento: Evento) => {
    setFormData({
      titulo: evento.titulo,
      descripcion: evento.descripcion || '',
      fecha: evento.fecha,
      hora: evento.hora || '',
      tipo: evento.tipo,
      materia_id: evento.materia_id || '',
    });
    setFormErrors({});
    setIsEditing(true);
    setEditingEventId(evento.id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setEditingEventId(null);
  };

  const handleInputChange = (field: keyof EventoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateEvent = async () => {
    if (!validateForm() || !user) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.from('eventos').insert({
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim() || null,
        fecha: formData.fecha,
        hora: formData.hora || null,
        tipo: formData.tipo,
        materia_id: formData.materia_id || null,
        created_by: user.id,
      }).select().single();

      if (error) throw error;

      setEventos(prev => [...prev, data]);
      toast({
        title: 'Evento creado',
        description: `El evento "${data.titulo}" ha sido creado exitosamente.`,
      });
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el evento.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!validateForm() || !editingEventId) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.from('eventos').update({
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim() || null,
        fecha: formData.fecha,
        hora: formData.hora || null,
        tipo: formData.tipo,
        materia_id: formData.materia_id || null,
      }).eq('id', editingEventId).select().single();

      if (error) throw error;

      setEventos(prev => prev.map(e => e.id === editingEventId ? data : e));
      toast({
        title: 'Evento actualizado',
        description: 'Los datos del evento han sido actualizados.',
      });
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el evento.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = (eventoId: string) => {
    setEventToDelete(eventoId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      const { error } = await supabase.from('eventos').delete().eq('id', eventToDelete);
      if (error) throw error;

      setEventos(prev => prev.filter(e => e.id !== eventToDelete));
      toast({
        title: 'Evento eliminado',
        description: 'El evento ha sido eliminado del calendario.',
      });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el evento.',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title flex items-center gap-3 mb-0">
              <CalendarDays className="h-8 w-8 text-primary" />
              Calendario Académico
            </h1>
            <p className="text-muted-foreground mt-2">Consulta y gestiona las fechas importantes del programa académico.</p>
          </div>
          {canManageEvents && (
            <Button onClick={handleOpenCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Evento
            </Button>
          )}
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendario principal */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">{monthNames[month]} {year}</CardTitle>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(d => (
                  <div 
                    key={d} 
                    className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase tracking-wide"
                  >
                    {d}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  return (
                    <div 
                      key={i} 
                      className={`
                        min-h-16 sm:min-h-20 p-1 rounded-lg border transition-colors
                        ${day ? 'border-border hover:bg-muted/50' : 'border-transparent'}
                      `}
                    >
                      {day && (
                        <>
                          <span className="text-sm font-medium">{day}</span>
                          <div className="space-y-0.5 mt-1">
                            {dayEvents.slice(0, 2).map(e => (
                              <div 
                                key={e.id} 
                                className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${getEventColor(e.tipo)}`}
                                onClick={() => canManageEvents && handleOpenEditDialog(e)}
                                title={e.titulo}
                              >
                                {e.titulo.length > 8 ? `${e.titulo.substring(0, 8)}...` : e.titulo}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-muted-foreground px-1">
                                +{dayEvents.length - 2} más
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Panel lateral - Próximos eventos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalIcon className="h-5 w-5 text-primary" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground text-sm">
                    No hay eventos programados.
                  </p>
                  {canManageEvents && (
                    <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={handleOpenCreateDialog}>
                      <Plus className="h-4 w-4" />
                      Crear evento
                    </Button>
                  )}
                </div>
              ) : (
                upcomingEvents.map(e => (
                  <div key={e.id} className="p-3 rounded-lg border border-border group hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-medium text-sm line-clamp-1 flex-1">{e.titulo}</span>
                      <Badge className={getEventColor(e.tipo)}>{getTipoLabel(e.tipo)}</Badge>
                    </div>
                    {e.descripcion && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{e.descripcion}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalIcon className="h-3 w-3" />
                          {new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                        {e.hora && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {e.hora}
                          </span>
                        )}
                      </div>
                      {canManageEvents && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleOpenEditDialog(e)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleConfirmDelete(e.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Diálogo para Crear/Editar Evento */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Pencil className="h-5 w-5" />
                    Editar Evento
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Nuevo Evento
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica los datos del evento.'
                  : 'Completa los datos para crear un nuevo evento en el calendario.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  placeholder="Nombre del evento"
                  value={formData.titulo}
                  onChange={e => handleInputChange('titulo', e.target.value)}
                  className={formErrors.titulo ? 'border-destructive' : ''}
                />
                {formErrors.titulo && (
                  <p className="text-xs text-destructive">{formErrors.titulo}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Detalles del evento"
                  value={formData.descripcion}
                  onChange={e => handleInputChange('descripcion', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fecha">Fecha *</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={e => handleInputChange('fecha', e.target.value)}
                    className={formErrors.fecha ? 'border-destructive' : ''}
                  />
                  {formErrors.fecha && (
                    <p className="text-xs text-destructive">{formErrors.fecha}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora}
                    onChange={e => handleInputChange('hora', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={val => handleInputChange('tipo', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simulacro">Simulacro</SelectItem>
                      <SelectItem value="taller">Taller</SelectItem>
                      <SelectItem value="entrega">Entrega</SelectItem>
                      <SelectItem value="reunion">Reunión</SelectItem>
                      <SelectItem value="examen">Examen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="materia">Materia</Label>
                  <Select value={formData.materia_id || "none"} onValueChange={val => handleInputChange('materia_id', val === "none" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Opcional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin materia</SelectItem>
                      {materias.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
                Cancelar
              </Button>
              <Button 
                onClick={isEditing ? handleUpdateEvent : handleCreateEvent} 
                disabled={saving}
                className="gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Evento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de confirmación de eliminación */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este evento?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. El evento será eliminado permanentemente del calendario.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Calendario;
