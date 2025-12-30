import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { mockMaterias, mockResultados, mockPreguntas, Pregunta, Materia } from '@/data/mockData';
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
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Settings,
  ListChecks,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const iconMap: { [key: string]: React.ElementType } = {
  Globe,
  Calculator,
  Languages,
  BookOpen,
  Microscope,
};

// Estado local para preguntas
let preguntasData = [...mockPreguntas];

interface PreguntaFormData {
  materiaId: string;
  texto: string;
  opcion1: string;
  opcion2: string;
  opcion3: string;
  opcion4: string;
  respuestaCorrecta: number;
  explicacion: string;
  activa: boolean;
}

const initialFormData: PreguntaFormData = {
  materiaId: '',
  texto: '',
  opcion1: '',
  opcion2: '',
  opcion3: '',
  opcion4: '',
  respuestaCorrecta: 0,
  explicacion: '',
  activa: true,
};

const Simulacros: React.FC = () => {
  const { user, isAdmin, isProfesor } = useAuth();
  const { toast } = useToast();
  const canManageQuestions = isAdmin || isProfesor;

  const [preguntas, setPreguntas] = useState<Pregunta[]>(preguntasData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPreguntaId, setEditingPreguntaId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PreguntaFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PreguntaFormData, string>>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [preguntaToDelete, setPreguntaToDelete] = useState<string | null>(null);
  const [selectedMateriaForQuestions, setSelectedMateriaForQuestions] = useState<string | null>(null);
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);

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

  const getPreguntasByMateria = (materiaId: string) => {
    return preguntas.filter(p => p.materiaId === materiaId);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PreguntaFormData, string>> = {};

    if (!formData.materiaId) {
      errors.materiaId = 'Selecciona una materia';
    }
    if (!formData.texto.trim()) {
      errors.texto = 'El texto de la pregunta es requerido';
    }
    if (!formData.opcion1.trim()) {
      errors.opcion1 = 'La opción 1 es requerida';
    }
    if (!formData.opcion2.trim()) {
      errors.opcion2 = 'La opción 2 es requerida';
    }
    if (!formData.opcion3.trim()) {
      errors.opcion3 = 'La opción 3 es requerida';
    }
    if (!formData.opcion4.trim()) {
      errors.opcion4 = 'La opción 4 es requerida';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Abrir diálogo para crear pregunta
  const handleOpenCreateDialog = (materiaId?: string) => {
    setFormData({
      ...initialFormData,
      materiaId: materiaId || '',
    });
    setFormErrors({});
    setIsEditing(false);
    setEditingPreguntaId(null);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar pregunta
  const handleOpenEditDialog = (pregunta: Pregunta) => {
    setFormData({
      materiaId: pregunta.materiaId,
      texto: pregunta.texto,
      opcion1: pregunta.opciones[0] || '',
      opcion2: pregunta.opciones[1] || '',
      opcion3: pregunta.opciones[2] || '',
      opcion4: pregunta.opciones[3] || '',
      respuestaCorrecta: pregunta.respuestaCorrecta,
      explicacion: pregunta.explicacion || '',
      activa: pregunta.activa,
    });
    setFormErrors({});
    setIsEditing(true);
    setEditingPreguntaId(pregunta.id);
    setIsDialogOpen(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setEditingPreguntaId(null);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof PreguntaFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Crear pregunta
  const handleCreatePregunta = () => {
    if (!validateForm()) return;

    const newPregunta: Pregunta = {
      id: `preg-${Date.now()}`,
      materiaId: formData.materiaId,
      texto: formData.texto.trim(),
      opciones: [
        formData.opcion1.trim(),
        formData.opcion2.trim(),
        formData.opcion3.trim(),
        formData.opcion4.trim(),
      ],
      respuestaCorrecta: formData.respuestaCorrecta,
      explicacion: formData.explicacion.trim() || undefined,
      activa: formData.activa,
    };

    const updatedPreguntas = [...preguntas, newPregunta];
    setPreguntas(updatedPreguntas);
    preguntasData = updatedPreguntas;

    toast({
      title: 'Pregunta creada',
      description: 'La pregunta ha sido añadida al banco de preguntas.',
    });

    handleCloseDialog();
  };

  // Actualizar pregunta
  const handleUpdatePregunta = () => {
    if (!validateForm() || !editingPreguntaId) return;

    const updatedPreguntas = preguntas.map(pregunta => {
      if (pregunta.id === editingPreguntaId) {
        return {
          ...pregunta,
          materiaId: formData.materiaId,
          texto: formData.texto.trim(),
          opciones: [
            formData.opcion1.trim(),
            formData.opcion2.trim(),
            formData.opcion3.trim(),
            formData.opcion4.trim(),
          ],
          respuestaCorrecta: formData.respuestaCorrecta,
          explicacion: formData.explicacion.trim() || undefined,
          activa: formData.activa,
        };
      }
      return pregunta;
    });

    setPreguntas(updatedPreguntas);
    preguntasData = updatedPreguntas;

    toast({
      title: 'Pregunta actualizada',
      description: 'Los cambios han sido guardados.',
    });

    handleCloseDialog();
  };

  // Confirmar eliminación
  const handleConfirmDelete = (preguntaId: string) => {
    setPreguntaToDelete(preguntaId);
    setDeleteConfirmOpen(true);
  };

  // Eliminar pregunta
  const handleDeletePregunta = () => {
    if (!preguntaToDelete) return;

    const updatedPreguntas = preguntas.filter(p => p.id !== preguntaToDelete);
    setPreguntas(updatedPreguntas);
    preguntasData = updatedPreguntas;

    toast({
      title: 'Pregunta eliminada',
      description: 'La pregunta ha sido eliminada del banco.',
    });

    setDeleteConfirmOpen(false);
    setPreguntaToDelete(null);
  };

  // Ver preguntas de una materia
  const handleViewQuestions = (materiaId: string) => {
    setSelectedMateriaForQuestions(materiaId);
    setShowQuestionsDialog(true);
  };

  const selectedMateria = mockMaterias.find(m => m.id === selectedMateriaForQuestions);
  const selectedMateriaPreguntas = selectedMateriaForQuestions 
    ? getPreguntasByMateria(selectedMateriaForQuestions)
    : [];

  return (
    <Layout>
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title mb-0">Simulacros</h1>
            <p className="text-muted-foreground max-w-2xl mt-2">
              Practica con simulacros de evaluación en cada materia. 
              Mejora tu desempeño con práctica constante y análisis de resultados.
            </p>
          </div>
          {canManageQuestions && (
            <Button onClick={() => handleOpenCreateDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Pregunta
            </Button>
          )}
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
                <ListChecks className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{preguntas.length}</p>
                <p className="text-xs text-muted-foreground">Preguntas</p>
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
                <CheckCircle className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userResults.length}</p>
                <p className="text-xs text-muted-foreground">Completados</p>
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
            const materiaPreguntas = getPreguntasByMateria(materia.id);
            const preguntasActivas = materiaPreguntas.filter(p => p.activa).length;

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
                    <div className="text-right">
                      {stats ? (
                        <>
                          <p className="text-2xl font-bold text-primary">{stats.avgScore}%</p>
                          <p className="text-xs text-muted-foreground">Promedio</p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-semibold text-muted-foreground">{preguntasActivas}</p>
                          <p className="text-xs text-muted-foreground">Preguntas</p>
                        </>
                      )}
                    </div>
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

                  <div className="flex flex-wrap gap-2">
                    <Button className="flex-1 gap-2" disabled={preguntasActivas === 0}>
                      <Play className="h-4 w-4" />
                      Iniciar
                    </Button>
                    
                    <Dialog>
                      <Button variant="outline" className="gap-2" asChild>
                        <span onClick={() => {}}>
                          <History className="h-4 w-4" />
                          Histórico
                        </span>
                      </Button>
                    </Dialog>
                  </div>

                  {/* Botones de gestión para admin/profesor */}
                  {canManageQuestions && (
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2"
                        onClick={() => handleViewQuestions(materia.id)}
                      >
                        <Settings className="h-4 w-4" />
                        Gestionar ({materiaPreguntas.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handleOpenCreateDialog(materia.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
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

        {/* Diálogo para ver/gestionar preguntas de una materia */}
        <Dialog open={showQuestionsDialog} onOpenChange={setShowQuestionsDialog}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedMateria && (
                  <>
                    <div className={`h-8 w-8 rounded-lg ${selectedMateria.color} flex items-center justify-center`}>
                      {(() => {
                        const Icon = iconMap[selectedMateria.icono] || BookOpen;
                        return <Icon className="h-4 w-4 text-white" />;
                      })()}
                    </div>
                    {selectedMateria.nombre} - Banco de Preguntas
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Gestiona las preguntas de esta materia
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {selectedMateriaPreguntas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay preguntas en esta materia</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 gap-2"
                    onClick={() => {
                      setShowQuestionsDialog(false);
                      handleOpenCreateDialog(selectedMateriaForQuestions || undefined);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Añadir primera pregunta
                  </Button>
                </div>
              ) : (
                selectedMateriaPreguntas.map((pregunta, index) => (
                  <div key={pregunta.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={pregunta.activa ? 'default' : 'secondary'}>
                            {pregunta.activa ? 'Activa' : 'Inactiva'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Pregunta {index + 1}</span>
                        </div>
                        <p className="font-medium">{pregunta.texto}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setShowQuestionsDialog(false);
                            handleOpenEditDialog(pregunta);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleConfirmDelete(pregunta.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {pregunta.opciones.map((opcion, opIndex) => (
                        <div 
                          key={opIndex}
                          className={`p-2 rounded text-sm ${
                            opIndex === pregunta.respuestaCorrecta 
                              ? 'bg-success/20 text-success border border-success/30' 
                              : 'bg-muted'
                          }`}
                        >
                          <span className="font-medium mr-2">{String.fromCharCode(65 + opIndex)}.</span>
                          {opcion}
                          {opIndex === pregunta.respuestaCorrecta && (
                            <CheckCircle className="h-3 w-3 inline ml-2" />
                          )}
                        </div>
                      ))}
                    </div>
                    {pregunta.explicacion && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        💡 {pregunta.explicacion}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowQuestionsDialog(false)}
              >
                Cerrar
              </Button>
              <Button 
                onClick={() => {
                  setShowQuestionsDialog(false);
                  handleOpenCreateDialog(selectedMateriaForQuestions || undefined);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Añadir Pregunta
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo para Crear/Editar Pregunta */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Pencil className="h-5 w-5" />
                    Editar Pregunta
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Nueva Pregunta
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica los datos de la pregunta.'
                  : 'Completa los datos para crear una nueva pregunta de simulacro.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Materia */}
              <div className="grid gap-2">
                <Label htmlFor="materia">Materia *</Label>
                <Select
                  value={formData.materiaId}
                  onValueChange={(value) => handleInputChange('materiaId', value)}
                >
                  <SelectTrigger className={formErrors.materiaId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecciona una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMaterias.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.materiaId && (
                  <p className="text-xs text-destructive">{formErrors.materiaId}</p>
                )}
              </div>

              {/* Texto de la pregunta */}
              <div className="grid gap-2">
                <Label htmlFor="texto">Pregunta *</Label>
                <Textarea
                  id="texto"
                  placeholder="Escribe el texto de la pregunta"
                  value={formData.texto}
                  onChange={e => handleInputChange('texto', e.target.value)}
                  className={formErrors.texto ? 'border-destructive' : ''}
                  rows={3}
                />
                {formErrors.texto && (
                  <p className="text-xs text-destructive">{formErrors.texto}</p>
                )}
              </div>

              {/* Opciones */}
              <div className="grid gap-3">
                <Label>Opciones de respuesta *</Label>
                {[1, 2, 3, 4].map(num => {
                  const fieldName = `opcion${num}` as keyof PreguntaFormData;
                  return (
                    <div key={num} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(64 + num)}
                      </span>
                      <Input
                        placeholder={`Opción ${num}`}
                        value={formData[fieldName] as string}
                        onChange={e => handleInputChange(fieldName, e.target.value)}
                        className={`flex-1 ${formErrors[fieldName] ? 'border-destructive' : ''}`}
                      />
                      <input
                        type="radio"
                        name="respuestaCorrecta"
                        checked={formData.respuestaCorrecta === num - 1}
                        onChange={() => handleInputChange('respuestaCorrecta', num - 1)}
                        className="h-4 w-4 text-primary"
                        title="Marcar como respuesta correcta"
                      />
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground">
                  Selecciona el círculo junto a la opción correcta.
                </p>
              </div>

              {/* Explicación */}
              <div className="grid gap-2">
                <Label htmlFor="explicacion">Explicación (opcional)</Label>
                <Textarea
                  id="explicacion"
                  placeholder="Explicación de la respuesta correcta"
                  value={formData.explicacion}
                  onChange={e => handleInputChange('explicacion', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Estado activo */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="activa" className="text-sm font-medium">
                    Pregunta Activa
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Las preguntas inactivas no aparecen en los simulacros.
                  </p>
                </div>
                <Switch
                  id="activa"
                  checked={formData.activa}
                  onCheckedChange={checked => handleInputChange('activa', checked)}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleCloseDialog}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={isEditing ? handleUpdatePregunta : handleCreatePregunta}>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Guardar Cambios' : 'Crear Pregunta'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmación de eliminación */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. La pregunta será eliminada permanentemente del banco de preguntas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePregunta} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Simulacros;
