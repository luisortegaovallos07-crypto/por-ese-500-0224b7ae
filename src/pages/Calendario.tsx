import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { mockEventos, Evento, mockMaterias } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon, 
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Save,
  X
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

// Estado local para eventos
let eventosData = [...mockEventos];

interface EventoFormData {
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  tipo: 'simulacro' | 'taller' | 'entrega' | 'reunion' | 'examen';
  materia: string;
}

const initialFormData: EventoFormData = {
  titulo: '',
  descripcion: '',
  fecha: '',
  hora: '',
  tipo: 'simulacro',
  materia: '',
};

const getEventColor = (tipo: string) => {
  switch (tipo) {
    case 'simulacro': return 'bg-primary text-primary-foreground';
    case 'taller': return 'bg-success text-success-foreground';
    case 'entrega': return 'bg-warning text-warning-foreground';
    case 'examen': return 'bg-destructive text-destructive-foreground';
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
  const { isAdmin, isProfesor } = useAuth();
  const { toast } = useToast();
  const canManageEvents = isAdmin || isProfesor;

  const [eventos, setEventos] = useState<Evento[]>(eventosData);
  const [currentDate, setCurrentDate] = useState(new Date('2026-02-01'));
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
  
  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventos.filter(e => e.fecha === dateStr);
  };
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const upcomingEvents = eventos
    .filter(e => new Date(e.fecha) >= new Date('2026-01-01'))
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 5);

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof EventoFormData, string>> = {};

    if (!formData.titulo.trim()) {
      errors.titulo = 'El título es requerido';
    }
    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida';
    }
    if (!formData.fecha) {
      errors.fecha = 'La fecha es requerida';
    }
    if (!formData.hora) {
      errors.hora = 'La hora es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Abrir diálogo para crear
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

  // Abrir diálogo para editar
  const handleOpenEditDialog = (evento: Evento) => {
    setFormData({
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      fecha: evento.fecha,
      hora: evento.hora,
      tipo: evento.tipo,
      materia: evento.materia || '',
    });
    setFormErrors({});
    setIsEditing(true);
    setEditingEventId(evento.id);
    setIsDialogOpen(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setEditingEventId(null);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof EventoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Crear evento
  const handleCreateEvent = () => {
    if (!validateForm()) return;

    const newEvento: Evento = {
      id: `evt-${Date.now()}`,
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim(),
      fecha: formData.fecha,
      hora: formData.hora,
      tipo: formData.tipo,
      materia: formData.materia || undefined,
    };

    const updatedEventos = [...eventos, newEvento];
    setEventos(updatedEventos);
    eventosData = updatedEventos;

    toast({
      title: 'Evento creado',
      description: `El evento "${newEvento.titulo}" ha sido creado exitosamente.`,
    });

    handleCloseDialog();
  };

  // Actualizar evento
  const handleUpdateEvent = () => {
    if (!validateForm() || !editingEventId) return;

    const updatedEventos = eventos.map(evento => {
      if (evento.id === editingEventId) {
        return {
          ...evento,
          titulo: formData.titulo.trim(),
          descripcion: formData.descripcion.trim(),
          fecha: formData.fecha,
          hora: formData.hora,
          tipo: formData.tipo,
          materia: formData.materia || undefined,
        };
      }
      return evento;
    });

    setEventos(updatedEventos);
    eventosData = updatedEventos;

    toast({
      title: 'Evento actualizado',
      description: 'Los datos del evento han sido actualizados.',
    });

    handleCloseDialog();
  };

  // Confirmar eliminación
  const handleConfirmDelete = (eventoId: string) => {
    setEventToDelete(eventoId);
    setDeleteConfirmOpen(true);
  };

  // Eliminar evento
  const handleDeleteEvent = () => {
    if (!eventToDelete) return;

    const updatedEventos = eventos.filter(e => e.id !== eventToDelete);
    setEventos(updatedEventos);
    eventosData = updatedEventos;

    toast({
      title: 'Evento eliminado',
      description: 'El evento ha sido eliminado del calendario.',
    });

    setDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title flex items-center gap-3 mb-0">
              <CalendarDays className="h-8 w-8 text-primary" />
              Calendario Académico 2026
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
              {/* Nombres de los días */}
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
              
              {/* Días del mes */}
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
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{e.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalIcon className="h-3 w-3" />
                          {new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {e.hora}
                        </span>
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
              {/* Título */}
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

              {/* Descripción */}
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Detalles del evento"
                  value={formData.descripcion}
                  onChange={e => handleInputChange('descripcion', e.target.value)}
                  className={formErrors.descripcion ? 'border-destructive' : ''}
                  rows={3}
                />
                {formErrors.descripcion && (
                  <p className="text-xs text-destructive">{formErrors.descripcion}</p>
                )}
              </div>

              {/* Fecha y Hora */}
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
                  <Label htmlFor="hora">Hora *</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora}
                    onChange={e => handleInputChange('hora', e.target.value)}
                    className={formErrors.hora ? 'border-destructive' : ''}
                  />
                  {formErrors.hora && (
                    <p className="text-xs text-destructive">{formErrors.hora}</p>
                  )}
                </div>
              </div>

              {/* Tipo */}
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo de Evento *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: EventoFormData['tipo']) => handleInputChange('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
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

              {/* Materia (opcional) */}
              <div className="grid gap-2">
                <Label htmlFor="materia">Materia (opcional)</Label>
                <Select
                  value={formData.materia}
                  onValueChange={(value) => handleInputChange('materia', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin materia específica</SelectItem>
                    {mockMaterias.map(m => (
                      <SelectItem key={m.id} value={m.nombre}>{m.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleCloseDialog}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={isEditing ? handleUpdateEvent : handleCreateEvent}>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Guardar Cambios' : 'Crear Evento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmación de eliminación */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
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
