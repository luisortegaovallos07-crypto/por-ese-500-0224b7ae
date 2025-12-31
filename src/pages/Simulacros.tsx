import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Globe,
  Calculator,
  Languages,
  BookOpen,
  Microscope,
  Play,
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
  Loader2,
  Timer,
  RotateCcw,
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

interface Materia {
  id: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  color: string | null;
}

interface Pregunta {
  id: string;
  materia_id: string;
  pregunta: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  opcion_d: string;
  respuesta_correcta: string;
  explicacion: string | null;
  activa: boolean | null;
}

interface PreguntaFormData {
  materia_id: string;
  pregunta: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  opcion_d: string;
  respuesta_correcta: string;
  explicacion: string;
  activa: boolean;
}

const initialFormData: PreguntaFormData = {
  materia_id: '',
  pregunta: '',
  opcion_a: '',
  opcion_b: '',
  opcion_c: '',
  opcion_d: '',
  respuesta_correcta: 'A',
  explicacion: '',
  activa: true,
};

// Componente del cronómetro
const Cronometro: React.FC<{ segundos: number }> = ({ segundos }) => {
  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  return (
    <div className="flex items-center gap-2 text-lg font-mono bg-muted px-4 py-2 rounded-lg">
      <Timer className="h-5 w-5 text-primary" />
      <span className={segundos < 60 ? 'text-destructive' : ''}>
        {String(minutos).padStart(2, '0')}:{String(segs).padStart(2, '0')}
      </span>
    </div>
  );
};

const Simulacros: React.FC = () => {
  const { user, isAdmin, isProfesor } = useAuth();
  const { toast } = useToast();
  const canManageQuestions = isAdmin || isProfesor;

  // Estados de datos
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados de UI
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPreguntaId, setEditingPreguntaId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PreguntaFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PreguntaFormData, string>>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [preguntaToDelete, setPreguntaToDelete] = useState<string | null>(null);
  const [selectedMateriaForQuestions, setSelectedMateriaForQuestions] = useState<string | null>(null);
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);

  // Estados del simulacro activo
  const [simulacroActivo, setSimulacroActivo] = useState(false);
  const [simulacroMateria, setSimulacroMateria] = useState<Materia | null>(null);
  const [preguntasSimulacro, setPreguntasSimulacro] = useState<Pregunta[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [simulacroTerminado, setSimulacroTerminado] = useState(false);
  const [resultadoFinal, setResultadoFinal] = useState<{
    correctas: number;
    total: number;
    puntaje: number;
    tiempo: number;
  } | null>(null);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [materiasRes, preguntasRes] = await Promise.all([
          supabase.from('materias').select('*').order('nombre'),
          supabase.from('preguntas').select('*').order('created_at', { ascending: false })
        ]);

        if (materiasRes.error) throw materiasRes.error;
        if (preguntasRes.error) throw preguntasRes.error;

        setMaterias(materiasRes.data || []);
        setPreguntas(preguntasRes.data || []);
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cronómetro
  useEffect(() => {
    if (!simulacroActivo || simulacroTerminado) return;

    const interval = setInterval(() => {
      setTiempoRestante(prev => {
        if (prev <= 1) {
          finalizarSimulacro();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simulacroActivo, simulacroTerminado]);

  const getPreguntasByMateria = (materiaId: string) => {
    return preguntas.filter(p => p.materia_id === materiaId);
  };

  const getPreguntasActivasByMateria = (materiaId: string) => {
    return preguntas.filter(p => p.materia_id === materiaId && p.activa);
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PreguntaFormData, string>> = {};

    if (!formData.materia_id) errors.materia_id = 'Selecciona una materia';
    if (!formData.pregunta.trim()) errors.pregunta = 'La pregunta es requerida';
    if (!formData.opcion_a.trim()) errors.opcion_a = 'La opción A es requerida';
    if (!formData.opcion_b.trim()) errors.opcion_b = 'La opción B es requerida';
    if (!formData.opcion_c.trim()) errors.opcion_c = 'La opción C es requerida';
    if (!formData.opcion_d.trim()) errors.opcion_d = 'La opción D es requerida';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Abrir diálogo para crear pregunta
  const handleOpenCreateDialog = (materiaId?: string) => {
    setFormData({ ...initialFormData, materia_id: materiaId || '' });
    setFormErrors({});
    setIsEditing(false);
    setEditingPreguntaId(null);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar pregunta
  const handleOpenEditDialog = (pregunta: Pregunta) => {
    setFormData({
      materia_id: pregunta.materia_id,
      pregunta: pregunta.pregunta,
      opcion_a: pregunta.opcion_a,
      opcion_b: pregunta.opcion_b,
      opcion_c: pregunta.opcion_c,
      opcion_d: pregunta.opcion_d,
      respuesta_correcta: pregunta.respuesta_correcta,
      explicacion: pregunta.explicacion || '',
      activa: pregunta.activa ?? true,
    });
    setFormErrors({});
    setIsEditing(true);
    setEditingPreguntaId(pregunta.id);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setEditingPreguntaId(null);
  };

  const handleInputChange = (field: keyof PreguntaFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Crear pregunta
  const handleCreatePregunta = async () => {
    if (!validateForm() || !user) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.from('preguntas').insert({
        materia_id: formData.materia_id,
        pregunta: formData.pregunta.trim(),
        opcion_a: formData.opcion_a.trim(),
        opcion_b: formData.opcion_b.trim(),
        opcion_c: formData.opcion_c.trim(),
        opcion_d: formData.opcion_d.trim(),
        respuesta_correcta: formData.respuesta_correcta,
        explicacion: formData.explicacion.trim() || null,
        activa: formData.activa,
        created_by: user.id,
      }).select().single();

      if (error) throw error;

      setPreguntas(prev => [data, ...prev]);
      toast({ title: 'Pregunta creada', description: 'La pregunta ha sido añadida.' });
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error creating question:', error);
      toast({ title: 'Error', description: 'No se pudo crear la pregunta.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Actualizar pregunta
  const handleUpdatePregunta = async () => {
    if (!validateForm() || !editingPreguntaId) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.from('preguntas').update({
        materia_id: formData.materia_id,
        pregunta: formData.pregunta.trim(),
        opcion_a: formData.opcion_a.trim(),
        opcion_b: formData.opcion_b.trim(),
        opcion_c: formData.opcion_c.trim(),
        opcion_d: formData.opcion_d.trim(),
        respuesta_correcta: formData.respuesta_correcta,
        explicacion: formData.explicacion.trim() || null,
        activa: formData.activa,
      }).eq('id', editingPreguntaId).select().single();

      if (error) throw error;

      setPreguntas(prev => prev.map(p => p.id === editingPreguntaId ? data : p));
      toast({ title: 'Pregunta actualizada', description: 'Los cambios han sido guardados.' });
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error updating question:', error);
      toast({ title: 'Error', description: 'No se pudo actualizar la pregunta.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = (preguntaId: string) => {
    setPreguntaToDelete(preguntaId);
    setDeleteConfirmOpen(true);
  };

  const handleDeletePregunta = async () => {
    if (!preguntaToDelete) return;

    try {
      const { error } = await supabase.from('preguntas').delete().eq('id', preguntaToDelete);
      if (error) throw error;

      setPreguntas(prev => prev.filter(p => p.id !== preguntaToDelete));
      toast({ title: 'Pregunta eliminada', description: 'La pregunta ha sido eliminada.' });
    } catch (error: any) {
      console.error('Error deleting question:', error);
      toast({ title: 'Error', description: 'No se pudo eliminar la pregunta.', variant: 'destructive' });
    } finally {
      setDeleteConfirmOpen(false);
      setPreguntaToDelete(null);
    }
  };

  const handleViewQuestions = (materiaId: string) => {
    setSelectedMateriaForQuestions(materiaId);
    setShowQuestionsDialog(true);
  };

  // Iniciar simulacro
  const iniciarSimulacro = (materia: Materia) => {
    const preguntasActivas = getPreguntasActivasByMateria(materia.id);
    if (preguntasActivas.length === 0) {
      toast({
        title: 'Sin preguntas',
        description: 'No hay preguntas activas para esta materia.',
        variant: 'destructive',
      });
      return;
    }

    // Mezclar y tomar máximo 20 preguntas
    const preguntasMezcladas = [...preguntasActivas].sort(() => Math.random() - 0.5).slice(0, 20);
    
    setPreguntasSimulacro(preguntasMezcladas);
    setSimulacroMateria(materia);
    setPreguntaActual(0);
    setRespuestas({});
    setTiempoRestante(preguntasMezcladas.length * 60); // 1 minuto por pregunta
    setSimulacroActivo(true);
    setSimulacroTerminado(false);
    setResultadoFinal(null);
  };

  // Seleccionar respuesta
  const seleccionarRespuesta = (preguntaId: string, opcion: string) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: opcion }));
  };

  // Finalizar simulacro
  const finalizarSimulacro = useCallback(async () => {
    setSimulacroTerminado(true);
    
    let correctas = 0;
    preguntasSimulacro.forEach(p => {
      if (respuestas[p.id] === p.respuesta_correcta) {
        correctas++;
      }
    });

    const total = preguntasSimulacro.length;
    const tiempoUsado = (preguntasSimulacro.length * 60) - tiempoRestante;
    
    // Calificación de 0 a 500
    const puntaje = Math.round((correctas / total) * 500);

    setResultadoFinal({ correctas, total, puntaje, tiempo: tiempoUsado });

    // Guardar resultado en base de datos
    if (user) {
      try {
        await supabase.from('resultados_simulacro').insert({
          user_id: user.id,
          puntaje,
          total_preguntas: total,
          respuestas_correctas: correctas,
          tiempo_segundos: tiempoUsado,
          detalles: { materia_id: simulacroMateria?.id, respuestas },
        });
      } catch (error) {
        console.error('Error saving result:', error);
      }
    }
  }, [preguntasSimulacro, respuestas, tiempoRestante, user, simulacroMateria]);

  const cerrarSimulacro = () => {
    setSimulacroActivo(false);
    setSimulacroTerminado(false);
    setPreguntasSimulacro([]);
    setSimulacroMateria(null);
    setResultadoFinal(null);
  };

  const selectedMateria = materias.find(m => m.id === selectedMateriaForQuestions);
  const selectedMateriaPreguntas = selectedMateriaForQuestions 
    ? getPreguntasByMateria(selectedMateriaForQuestions)
    : [];

  if (loading) {
    return (
      <Layout>
        <div className="page-container flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Vista del simulacro activo
  if (simulacroActivo) {
    const preguntaActualData = preguntasSimulacro[preguntaActual];
    const opciones = [
      { key: 'A', value: preguntaActualData?.opcion_a },
      { key: 'B', value: preguntaActualData?.opcion_b },
      { key: 'C', value: preguntaActualData?.opcion_c },
      { key: 'D', value: preguntaActualData?.opcion_d },
    ];

    if (simulacroTerminado && resultadoFinal) {
      return (
        <Layout>
          <div className="page-container max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl">¡Simulacro Completado!</CardTitle>
                <CardDescription>{simulacroMateria?.nombre}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-6xl font-bold text-primary">
                  {resultadoFinal.puntaje}
                  <span className="text-2xl text-muted-foreground">/500</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <CheckCircle className="h-6 w-6 text-success mx-auto mb-2" />
                    <p className="text-2xl font-bold">{resultadoFinal.correctas}</p>
                    <p className="text-xs text-muted-foreground">Correctas</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <XCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
                    <p className="text-2xl font-bold">{resultadoFinal.total - resultadoFinal.correctas}</p>
                    <p className="text-xs text-muted-foreground">Incorrectas</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold">{Math.floor(resultadoFinal.tiempo / 60)}:{String(resultadoFinal.tiempo % 60).padStart(2, '0')}</p>
                    <p className="text-xs text-muted-foreground">Tiempo</p>
                  </div>
                </div>

                <Progress value={(resultadoFinal.correctas / resultadoFinal.total) * 100} className="h-3" />

                <div className="space-y-3">
                  <h4 className="font-semibold">Revisión de respuestas:</h4>
                  {preguntasSimulacro.map((p, index) => {
                    const esCorrecta = respuestas[p.id] === p.respuesta_correcta;
                    return (
                      <div key={p.id} className={`p-3 rounded-lg border text-left ${esCorrecta ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
                        <div className="flex items-start gap-2">
                          {esCorrecta ? <CheckCircle className="h-4 w-4 text-success mt-0.5" /> : <XCircle className="h-4 w-4 text-destructive mt-0.5" />}
                          <div className="flex-1">
                            <p className="text-sm font-medium">Pregunta {index + 1}</p>
                            <p className="text-xs text-muted-foreground">{p.pregunta.substring(0, 80)}...</p>
                            {!esCorrecta && (
                              <p className="text-xs text-success mt-1">Respuesta correcta: {p.respuesta_correcta}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button onClick={cerrarSimulacro} className="w-full gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Volver a Simulacros
                </Button>
              </CardContent>
            </Card>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <div className="page-container max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">{simulacroMateria?.nombre}</h2>
              <p className="text-sm text-muted-foreground">Pregunta {preguntaActual + 1} de {preguntasSimulacro.length}</p>
            </div>
            <Cronometro segundos={tiempoRestante} />
          </div>

          <Progress value={((preguntaActual + 1) / preguntasSimulacro.length) * 100} className="h-2 mb-6" />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg leading-relaxed">{preguntaActualData?.pregunta}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {opciones.map(op => (
                <button
                  key={op.key}
                  onClick={() => seleccionarRespuesta(preguntaActualData.id, op.key)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    respuestas[preguntaActualData.id] === op.key
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}
                >
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-sm font-medium mr-3">
                    {op.key}
                  </span>
                  {op.value}
                </button>
              ))}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              disabled={preguntaActual === 0}
              onClick={() => setPreguntaActual(prev => prev - 1)}
            >
              Anterior
            </Button>

            <div className="flex gap-2">
              {preguntasSimulacro.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPreguntaActual(i)}
                  className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                    i === preguntaActual
                      ? 'bg-primary text-primary-foreground'
                      : respuestas[preguntasSimulacro[i].id]
                        ? 'bg-success/20 text-success'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {preguntaActual === preguntasSimulacro.length - 1 ? (
              <Button onClick={finalizarSimulacro}>
                Finalizar
              </Button>
            ) : (
              <Button onClick={() => setPreguntaActual(prev => prev + 1)}>
                Siguiente
              </Button>
            )}
          </div>
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
            <h1 className="section-title mb-0">Simulacros</h1>
            <p className="text-muted-foreground max-w-2xl mt-2">
              Practica con simulacros de evaluación. Calificación de 0 a 500 puntos.
            </p>
          </div>
          {canManageQuestions && (
            <Button onClick={() => handleOpenCreateDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Pregunta
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{materias.length}</p>
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
                <p className="text-2xl font-bold">{preguntas.filter(p => p.activa).length}</p>
                <p className="text-xs text-muted-foreground">Preguntas Activas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">500</p>
                <p className="text-xs text-muted-foreground">Puntaje Máximo</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Timer className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">1 min</p>
                <p className="text-xs text-muted-foreground">Por Pregunta</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materias.map((materia, index) => {
            const Icon = iconMap[materia.icono || 'BookOpen'] || BookOpen;
            const materiaPreguntas = getPreguntasByMateria(materia.id);
            const preguntasActivas = materiaPreguntas.filter(p => p.activa).length;

            return (
              <Card key={materia.id} className={`card-hover animate-fade-in`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`h-14 w-14 rounded-xl ${materia.color || 'bg-primary'} flex items-center justify-center shadow-md`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{preguntasActivas}</p>
                      <p className="text-xs text-muted-foreground">Preguntas</p>
                    </div>
                  </div>
                  <CardTitle className="mt-4">{materia.nombre}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {materia.descripcion}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Button 
                    className="w-full gap-2" 
                    disabled={preguntasActivas === 0}
                    onClick={() => iniciarSimulacro(materia)}
                  >
                    <Play className="h-4 w-4" />
                    Iniciar Simulacro
                  </Button>

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
                Selecciona una materia y haz clic en "Iniciar Simulacro".
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                Cada simulacro tiene un cronómetro de 1 minuto por pregunta.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                La calificación es automática de 0 a 500 puntos.
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-1 text-primary" />
                Al finalizar verás el resultado y la revisión de respuestas.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Diálogo para ver/gestionar preguntas */}
        <Dialog open={showQuestionsDialog} onOpenChange={setShowQuestionsDialog}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedMateria && (
                  <>
                    <div className={`h-8 w-8 rounded-lg ${selectedMateria.color || 'bg-primary'} flex items-center justify-center`}>
                      {(() => {
                        const Icon = iconMap[selectedMateria.icono || 'BookOpen'] || BookOpen;
                        return <Icon className="h-4 w-4 text-white" />;
                      })()}
                    </div>
                    {selectedMateria.nombre} - Banco de Preguntas
                  </>
                )}
              </DialogTitle>
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
                        <p className="font-medium">{pregunta.pregunta}</p>
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
                      {['A', 'B', 'C', 'D'].map(opcion => {
                        const valor = pregunta[`opcion_${opcion.toLowerCase()}` as keyof Pregunta];
                        const esCorrecta = opcion === pregunta.respuesta_correcta;
                        return (
                          <div 
                            key={opcion}
                            className={`p-2 rounded text-sm ${
                              esCorrecta 
                                ? 'bg-success/20 text-success border border-success/30' 
                                : 'bg-muted'
                            }`}
                          >
                            <span className="font-medium mr-2">{opcion}.</span>
                            {String(valor)}
                            {esCorrecta && <CheckCircle className="h-3 w-3 inline ml-2" />}
                          </div>
                        );
                      })}
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
              <Button variant="outline" onClick={() => setShowQuestionsDialog(false)}>
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
                {isEditing ? <><Pencil className="h-5 w-5" /> Editar Pregunta</> : <><Plus className="h-5 w-5" /> Nueva Pregunta</>}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Modifica los datos de la pregunta.' : 'Crea una nueva pregunta de simulacro.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Materia *</Label>
                <Select value={formData.materia_id} onValueChange={(v) => handleInputChange('materia_id', v)}>
                  <SelectTrigger className={formErrors.materia_id ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecciona una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {materias.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.materia_id && <p className="text-xs text-destructive">{formErrors.materia_id}</p>}
              </div>

              <div className="grid gap-2">
                <Label>Pregunta *</Label>
                <Textarea
                  placeholder="Escribe la pregunta"
                  value={formData.pregunta}
                  onChange={e => handleInputChange('pregunta', e.target.value)}
                  className={formErrors.pregunta ? 'border-destructive' : ''}
                  rows={3}
                />
                {formErrors.pregunta && <p className="text-xs text-destructive">{formErrors.pregunta}</p>}
              </div>

              <div className="grid gap-3">
                <Label>Opciones de respuesta *</Label>
                {['A', 'B', 'C', 'D'].map(letra => {
                  const fieldName = `opcion_${letra.toLowerCase()}` as keyof PreguntaFormData;
                  return (
                    <div key={letra} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{letra}</span>
                      <Input
                        placeholder={`Opción ${letra}`}
                        value={formData[fieldName] as string}
                        onChange={e => handleInputChange(fieldName, e.target.value)}
                        className={`flex-1 ${formErrors[fieldName] ? 'border-destructive' : ''}`}
                      />
                      <input
                        type="radio"
                        name="respuestaCorrecta"
                        checked={formData.respuesta_correcta === letra}
                        onChange={() => handleInputChange('respuesta_correcta', letra)}
                        className="h-4 w-4"
                        title="Marcar como correcta"
                      />
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground">Selecciona el círculo junto a la opción correcta.</p>
              </div>

              <div className="grid gap-2">
                <Label>Explicación (opcional)</Label>
                <Textarea
                  placeholder="Explicación de la respuesta"
                  value={formData.explicacion}
                  onChange={e => handleInputChange('explicacion', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label className="text-sm font-medium">Pregunta Activa</Label>
                  <p className="text-xs text-muted-foreground">Las inactivas no aparecen en simulacros.</p>
                </div>
                <Switch checked={formData.activa} onCheckedChange={v => handleInputChange('activa', v)} />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={isEditing ? handleUpdatePregunta : handleCreatePregunta} disabled={saving}>
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
              <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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
