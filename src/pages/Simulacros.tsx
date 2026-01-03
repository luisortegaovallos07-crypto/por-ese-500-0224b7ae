import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ImageUpload } from '@/components/ImageUpload';
import {
  Globe,
  Calculator,
  Languages,
  BookOpen,
  Atom,
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
  Settings,
  ListChecks,
  Loader2,
  Timer,
  RotateCcw,
  Image as ImageIcon,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import './Simulacros.css';

const iconMap: { [key: string]: React.ElementType } = {
  Globe,
  Calculator,
  Languages,
  BookOpen,
  Atom,
};

interface Materia {
  id: string;
  nombre: string;
  descripcion: string | null;
  icono: string | null;
  color: string | null;
  tiempo_simulacro: number;
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
  imagen_url: string | null;
  activa: boolean | null;
}

interface PreguntaSimulacro {
  id: string;
  materia_id: string;
  pregunta: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  opcion_d: string;
  imagen_url: string | null;
  activa: boolean | null;
}

interface VerifySimulacroResult {
  correctas: number;
  total: number;
  puntaje: number;
  detalles: Record<string, {
    respuesta_usuario: string | null;
    respuesta_correcta: string;
    es_correcta: boolean;
    explicacion: string | null;
  }>;
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
  imagen_url: string;
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
  imagen_url: '',
  activa: true,
};

const Cronometro: React.FC<{ segundos: number }> = ({ segundos }) => {
  const minutos = Math.floor(segundos / 60);
  const segs = segundos % 60;
  return (
    <div className="cronometro">
      <Timer />
      <span className={segundos < 60 ? 'cronometro-warning' : ''}>
        {String(minutos).padStart(2, '0')}:{String(segs).padStart(2, '0')}
      </span>
    </div>
  );
};

const Simulacros: React.FC = () => {
  const { user, isAdmin, isProfesor } = useAuth();
  const { toast } = useToast();
  const canManageQuestions = isAdmin || isProfesor;

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [preguntasEstudiante, setPreguntasEstudiante] = useState<PreguntaSimulacro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPreguntaId, setEditingPreguntaId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PreguntaFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PreguntaFormData, string>>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [preguntaToDelete, setPreguntaToDelete] = useState<string | null>(null);
  const [selectedMateriaForQuestions, setSelectedMateriaForQuestions] = useState<string | null>(null);
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [editingMateriaTime, setEditingMateriaTime] = useState<Materia | null>(null);
  const [newTimeMinutes, setNewTimeMinutes] = useState(30);

  const [simulacroActivo, setSimulacroActivo] = useState(false);
  const [simulacroMateria, setSimulacroMateria] = useState<Materia | null>(null);
  const [preguntasSimulacro, setPreguntasSimulacro] = useState<PreguntaSimulacro[]>([]);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [tiempoInicial, setTiempoInicial] = useState(0);
  const [simulacroTerminado, setSimulacroTerminado] = useState(false);
  const [resultadoVerificacion, setResultadoVerificacion] = useState<VerifySimulacroResult | null>(null);
  const [resultadoFinal, setResultadoFinal] = useState<{
    correctas: number;
    total: number;
    puntaje: number;
    porcentaje: number;
    tiempo: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const materiasRes = await supabase.from('materias').select('*').order('nombre');
        if (materiasRes.error) throw materiasRes.error;
        setMaterias(materiasRes.data || []);

        if (canManageQuestions) {
          const preguntasRes = await supabase.from('preguntas').select('*').order('created_at', { ascending: false });
          if (preguntasRes.error) throw preguntasRes.error;
          setPreguntas(preguntasRes.data || []);
        } else {
          const preguntasRes = await supabase.from('preguntas_simulacro').select('*');
          if (preguntasRes.error) throw preguntasRes.error;
          setPreguntasEstudiante((preguntasRes.data || []) as PreguntaSimulacro[]);
        }
      } catch (error: unknown) {
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
  }, [canManageQuestions, toast]);

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

  const getPreguntasSimulacroByMateria = (materiaId: string): PreguntaSimulacro[] => {
    if (canManageQuestions) {
      return preguntas
        .filter(p => p.materia_id === materiaId && p.activa)
        .map(p => ({
          id: p.id,
          materia_id: p.materia_id,
          pregunta: p.pregunta,
          opcion_a: p.opcion_a,
          opcion_b: p.opcion_b,
          opcion_c: p.opcion_c,
          opcion_d: p.opcion_d,
          imagen_url: p.imagen_url,
          activa: p.activa,
        }));
    }
    return preguntasEstudiante.filter(p => p.materia_id === materiaId && p.activa);
  };

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

  const handleOpenCreateDialog = (materiaId?: string) => {
    setFormData({ ...initialFormData, materia_id: materiaId || '' });
    setFormErrors({});
    setIsEditing(false);
    setEditingPreguntaId(null);
    setIsDialogOpen(true);
  };

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
      imagen_url: pregunta.imagen_url || '',
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
        imagen_url: formData.imagen_url.trim() || null,
        activa: formData.activa,
        created_by: user.id,
      }).select().single();

      if (error) throw error;

      setPreguntas(prev => [data, ...prev]);
      toast({ title: 'Pregunta creada', description: 'La pregunta ha sido añadida.' });
      handleCloseDialog();
    } catch (error: unknown) {
      console.error('Error creating question:', error);
      toast({ title: 'Error', description: 'No se pudo crear la pregunta.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

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
        imagen_url: formData.imagen_url.trim() || null,
        activa: formData.activa,
      }).eq('id', editingPreguntaId).select().single();

      if (error) throw error;

      setPreguntas(prev => prev.map(p => p.id === editingPreguntaId ? data : p));
      toast({ title: 'Pregunta actualizada', description: 'Los cambios han sido guardados.' });
      handleCloseDialog();
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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

  const handleOpenTimeDialog = (materia: Materia) => {
    setEditingMateriaTime(materia);
    setNewTimeMinutes(Math.floor(materia.tiempo_simulacro / 60));
    setShowTimeDialog(true);
  };

  const handleSaveTime = async () => {
    if (!editingMateriaTime) return;

    setSaving(true);
    try {
      const tiempoSegundos = newTimeMinutes * 60;
      const { error } = await supabase
        .from('materias')
        .update({ tiempo_simulacro: tiempoSegundos })
        .eq('id', editingMateriaTime.id);

      if (error) throw error;

      setMaterias(prev => prev.map(m =>
        m.id === editingMateriaTime.id ? { ...m, tiempo_simulacro: tiempoSegundos } : m
      ));
      toast({ title: 'Tiempo actualizado', description: `Tiempo configurado: ${newTimeMinutes} minutos.` });
      setShowTimeDialog(false);
    } catch (error: unknown) {
      console.error('Error saving time:', error);
      toast({ title: 'Error', description: 'No se pudo guardar el tiempo.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const iniciarSimulacro = (materia: Materia) => {
    const preguntasParaSimulacro = getPreguntasSimulacroByMateria(materia.id);
    if (preguntasParaSimulacro.length === 0) {
      toast({
        title: 'Sin preguntas',
        description: 'No hay preguntas activas para esta materia.',
        variant: 'destructive',
      });
      return;
    }

    const preguntasMezcladas = [...preguntasParaSimulacro].sort(() => Math.random() - 0.5);

    setPreguntasSimulacro(preguntasMezcladas);
    setSimulacroMateria(materia);
    setPreguntaActual(0);
    setRespuestas({});
    setResultadoVerificacion(null);
    const tiempo = materia.tiempo_simulacro || 1800;
    setTiempoRestante(tiempo);
    setTiempoInicial(tiempo);
    setSimulacroActivo(true);
    setSimulacroTerminado(false);
    setResultadoFinal(null);
  };

  const seleccionarRespuesta = (preguntaId: string, opcion: string) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: opcion }));
  };

  const finalizarSimulacro = useCallback(async () => {
    setSimulacroTerminado(true);

    const tiempoUsado = tiempoInicial - tiempoRestante;
    const preguntaIds = preguntasSimulacro.map(p => p.id);

    try {
      const { data, error } = await supabase.functions.invoke('verify-simulacro', {
        body: {
          pregunta_ids: preguntaIds,
          respuestas: respuestas,
        },
      });

      if (error) throw error;

      const resultado = data as VerifySimulacroResult;
      setResultadoVerificacion(resultado);

      const { correctas, total, puntaje } = resultado;
      setResultadoFinal({ correctas, total, puntaje, porcentaje: puntaje, tiempo: tiempoUsado });

      if (user && simulacroMateria) {
        await supabase.from('resultados_simulacro').insert({
          user_id: user.id,
          materia_id: simulacroMateria.id,
          puntaje,
          total_preguntas: total,
          respuestas_correctas: correctas,
          tiempo_segundos: tiempoUsado,
          detalles: { respuestas },
        });
      }
    } catch (error) {
      console.error('Error verifying simulacro:', error);
      toast({
        title: 'Error',
        description: 'No se pudo verificar el simulacro.',
        variant: 'destructive',
      });
      setResultadoFinal({
        correctas: 0,
        total: preguntasSimulacro.length,
        puntaje: 0,
        porcentaje: 0,
        tiempo: tiempoUsado,
      });
    }
  }, [preguntasSimulacro, respuestas, tiempoRestante, tiempoInicial, user, simulacroMateria, toast]);

  const cerrarSimulacro = () => {
    setSimulacroActivo(false);
    setSimulacroTerminado(false);
    setPreguntasSimulacro([]);
    setSimulacroMateria(null);
    setResultadoFinal(null);
    setResultadoVerificacion(null);
  };

  const selectedMateria = materias.find(m => m.id === selectedMateriaForQuestions);
  const selectedMateriaPreguntas = selectedMateriaForQuestions
    ? getPreguntasByMateria(selectedMateriaForQuestions)
    : [];

  if (loading) {
    return (
      <Layout>
        <div className="page-container">
          <div className="simulacros-loading">
            <Loader2 />
          </div>
        </div>
      </Layout>
    );
  }

  // Vista de resultados
  if (simulacroActivo && simulacroTerminado && resultadoFinal) {
    const obtenerCalificacion = (puntaje: number): string => {
      if (puntaje >= 90) return 'Excelente';
      if (puntaje >= 80) return 'Muy Bien';
      if (puntaje >= 70) return 'Bien';
      if (puntaje >= 60) return 'Aprobado';
      return 'Necesita Mejorar';
    };

    return (
      <Layout>
        <div className="page-container resultado-container">
          <Card className="resultado-card">
            <CardHeader>
              <div className={`resultado-icon ${resultadoFinal.puntaje >= 60 ? 'aprobado' : 'reprobado'}`}>
                <Award />
              </div>
              <CardTitle>¡Simulacro Completado!</CardTitle>
              <CardDescription>{simulacroMateria?.nombre}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`resultado-score ${resultadoFinal.puntaje >= 60 ? 'aprobado' : 'reprobado'}`}>
                {resultadoFinal.puntaje}
                <span>/100</span>
              </div>

              <p className="resultado-calificacion">
                {obtenerCalificacion(resultadoFinal.puntaje)}
              </p>

              <div className="resultado-stats">
                <div className="resultado-stat correctas">
                  <CheckCircle className="success" />
                  <p className="resultado-stat-value">{resultadoFinal.correctas}</p>
                  <p className="resultado-stat-label">Correctas</p>
                </div>
                <div className="resultado-stat incorrectas">
                  <XCircle className="destructive" />
                  <p className="resultado-stat-value">{resultadoFinal.total - resultadoFinal.correctas}</p>
                  <p className="resultado-stat-label">Incorrectas</p>
                </div>
                <div className="resultado-stat tiempo">
                  <Clock className="primary" />
                  <p className="resultado-stat-value">
                    {Math.floor(resultadoFinal.tiempo / 60)}:{String(resultadoFinal.tiempo % 60).padStart(2, '0')}
                  </p>
                  <p className="resultado-stat-label">Tiempo</p>
                </div>
              </div>

              <div className="resultado-resumen">
                <div className="resumen-item">
                  <span className="resumen-label">Preguntas Totales:</span>
                  <span className="resumen-value">{resultadoFinal.total}</span>
                </div>
                <div className="resumen-item">
                  <span className="resumen-label">Respuestas Correctas:</span>
                  <span className="resumen-value success">{resultadoFinal.correctas}</span>
                </div>
                <div className="resumen-item">
                  <span className="resumen-label">Respuestas Incorrectas:</span>
                  <span className="resumen-value destructive">{resultadoFinal.total - resultadoFinal.correctas}</span>
                </div>
                <div className="resumen-item destacado">
                  <span className="resumen-label">Calificación Final:</span>
                  <span className={`resumen-value ${resultadoFinal.puntaje >= 60 ? 'aprobado' : 'reprobado'}`}>
                    {resultadoFinal.puntaje}/100
                  </span>
                </div>
              </div>

              <Progress value={resultadoFinal.porcentaje} className="resultado-progress" />

              <div className="revision-container">
                <h4>Revisión de respuestas:</h4>
                <div className="revision-list">
                  {preguntasSimulacro.map((p, index) => {
                    const detalle = resultadoVerificacion?.detalles[p.id];
                    const esCorrecta = detalle?.es_correcta ?? false;
                    const respuestaUsuario = detalle?.respuesta_usuario;
                    return (
                      <div key={p.id} className={`revision-item ${esCorrecta ? 'correcta' : 'incorrecta'}`}>
                        <div className="revision-item-header">
                          {esCorrecta ? (
                            <CheckCircle className="success" />
                          ) : (
                            <XCircle className="destructive" />
                          )}
                          <div className="revision-item-content">
                            <p className="titulo">Pregunta {index + 1}</p>
                            <p className="pregunta-text">{p.pregunta}</p>
                            <p className="respuesta-usuario">
                              Tu respuesta: {respuestaUsuario ? respuestaUsuario : 'Sin responder'}
                            </p>
                            {!esCorrecta && detalle && (
                              <p className="respuesta-correcta">Respuesta correcta: {detalle.respuesta_correcta}</p>
                            )}
                            {detalle?.explicacion && (
                              <p className="explicacion">{detalle.explicacion}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button onClick={cerrarSimulacro} className="resultado-action">
                <span className="resultado-action-content">
                  <RotateCcw />
                  Volver a Simulacros
                </span>
              </Button>
            </CardContent>
          </Card>
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

    return (
      <Layout>
        <div className="page-container simulacro-container">
          <div className="simulacro-header">
            <div className="simulacro-header-info">
              <h2>{simulacroMateria?.nombre}</h2>
              <p>Pregunta {preguntaActual + 1} de {preguntasSimulacro.length}</p>
            </div>
            <Cronometro segundos={tiempoRestante} />
          </div>

          <Progress value={((preguntaActual + 1) / preguntasSimulacro.length) * 100} className="simulacro-progress" />

          <Card>
            <CardHeader>
              <CardTitle className="pregunta-texto">{preguntaActualData?.pregunta}</CardTitle>
              {preguntaActualData?.imagen_url && (
                <img
                  src={preguntaActualData.imagen_url}
                  alt="Imagen de la pregunta"
                  className="pregunta-imagen"
                />
              )}
            </CardHeader>
            <CardContent>
              <div className="opciones-container">
                {opciones.map(op => (
                  <button
                    key={op.key}
                    onClick={() => seleccionarRespuesta(preguntaActualData.id, op.key)}
                    className={`opcion-button ${respuestas[preguntaActualData.id] === op.key ? 'selected' : ''}`}
                  >
                    <span className="opcion-letra">{op.key}</span>
                    {op.value}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="simulacro-navigation">
            <Button
              variant="outline"
              disabled={preguntaActual === 0}
              onClick={() => setPreguntaActual(prev => prev - 1)}
            >
              Anterior
            </Button>

            <div className="simulacro-navigation-dots">
              {preguntasSimulacro.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPreguntaActual(i)}
                  className={`nav-dot ${
                    i === preguntaActual
                      ? 'current'
                      : respuestas[preguntasSimulacro[i].id]
                        ? 'answered'
                        : 'unanswered'
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

  // Vista principal
  return (
    <Layout>
      <div className="page-container">
        <div className="simulacros-header">
          <div className="simulacros-header-text">
            <h1 className="section-title">Simulacros</h1>
            <p>Practica con simulacros. Cada materia se califica de 0 a 100.</p>
          </div>
          {canManageQuestions && (
            <Button onClick={() => handleOpenCreateDialog()}>
              <span className="btn-gap">
                <Plus />
                Nueva Pregunta
              </span>
            </Button>
          )}
        </div>

        <div className="stats-grid">
          <Card>
            <div className="stat-card-content">
              <div className="stat-icon primary">
                <Target />
              </div>
              <div className="stat-info">
                <p className="stat-value">{materias.length}</p>
                <p className="stat-label">Materias</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="stat-card-content">
              <div className="stat-icon success">
                <ListChecks />
              </div>
              <div className="stat-info">
                <p className="stat-value">{preguntas.filter(p => p.activa).length}</p>
                <p className="stat-label">Preguntas Activas</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="stat-card-content">
              <div className="stat-icon warning">
                <Award />
              </div>
              <div className="stat-info">
                <p className="stat-value">100</p>
                <p className="stat-label">Puntaje por Materia</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="stat-card-content">
              <div className="stat-icon accent">
                <Timer />
              </div>
              <div className="stat-info">
                <p className="stat-value">500</p>
                <p className="stat-label">Total Máximo</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="materias-grid">
          {materias.map((materia) => {
            const Icon = iconMap[materia.icono || 'BookOpen'] || BookOpen;
            const materiaPreguntas = getPreguntasByMateria(materia.id);
            const preguntasActivas = materiaPreguntas.filter(p => p.activa).length;
            const tiempoMinutos = Math.floor(materia.tiempo_simulacro / 60);

            return (
              <Card key={materia.id}>
                <CardHeader>
                  <div className="materia-card-header">
                    <div
                      className="materia-icon"
                      style={{ backgroundColor: materia.color || '#3B82F6' }}
                    >
                      <Icon />
                    </div>
                    <div className="materia-stats">
                      <p className="count">{preguntasActivas}</p>
                      <p className="label">Preguntas</p>
                    </div>
                  </div>
                  <CardTitle>{materia.nombre}</CardTitle>
                  <CardDescription>{materia.descripcion}</CardDescription>
                  <div className="materia-time">
                    <Timer />
                    <span>{tiempoMinutos} minutos</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <Button
                    className="btn-full"
                    disabled={preguntasActivas === 0}
                    onClick={() => iniciarSimulacro(materia)}
                  >
                    <span className="btn-gap">
                      <Play />
                      Iniciar Simulacro
                    </span>
                  </Button>

                  {canManageQuestions && (
                    <div className="materia-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        className="btn-flex"
                        onClick={() => handleViewQuestions(materia.id)}
                      >
                        <span className="btn-gap">
                          <Settings />
                          Gestionar
                        </span>
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenTimeDialog(materia)}
                        >
                          <Timer />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCreateDialog(materia.id)}
                      >
                        <Plus />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="instructions-card">
          <CardHeader>
            <CardTitle>Instrucciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="instructions-list">
              <li>
                <ArrowRight />
                Selecciona una materia y haz clic en "Iniciar Simulacro".
              </li>
              <li>
                <ArrowRight />
                El tiempo es GENERAL por materia (configurable por el administrador).
              </li>
              <li>
                <ArrowRight />
                Cada materia se califica de 0 a 100 puntos.
              </li>
              <li>
                <ArrowRight />
                El puntaje total máximo es 500 (5 materias × 100 puntos).
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Dialog: Ver preguntas */}
        <Dialog open={showQuestionsDialog} onOpenChange={setShowQuestionsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Preguntas de {selectedMateria?.nombre}</DialogTitle>
              <DialogDescription>
                {selectedMateriaPreguntas.length} preguntas en total
              </DialogDescription>
            </DialogHeader>
            <div className="preguntas-dialog-list">
              {selectedMateriaPreguntas.length === 0 ? (
                <p className="empty-state">No hay preguntas registradas.</p>
              ) : (
                selectedMateriaPreguntas.map((pregunta, index) => (
                  <div key={pregunta.id} className="pregunta-dialog-item">
                    <div className="pregunta-dialog-item-header">
                      <div className="pregunta-dialog-item-content">
                        <div className="pregunta-dialog-meta">
                          <Badge variant={pregunta.activa ? "default" : "secondary"}>
                            {pregunta.activa ? 'Activa' : 'Inactiva'}
                          </Badge>
                          <span>#{index + 1}</span>
                          {pregunta.imagen_url && <ImageIcon />}
                        </div>
                        <p className="pregunta-dialog-text">{pregunta.pregunta}</p>
                        <p className="pregunta-dialog-respuesta">Respuesta: {pregunta.respuesta_correcta}</p>
                      </div>
                      <div className="pregunta-dialog-actions">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="btn-icon"
                          onClick={() => {
                            setShowQuestionsDialog(false);
                            handleOpenEditDialog(pregunta);
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="btn-icon btn-destructive-ghost"
                          onClick={() => handleConfirmDelete(pregunta.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog: Configurar tiempo */}
        <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Tiempo</DialogTitle>
              <DialogDescription>
                Tiempo general para {editingMateriaTime?.nombre}
              </DialogDescription>
            </DialogHeader>
            <div className="dialog-form">
              <div className="form-group">
                <Label>Tiempo (minutos)</Label>
                <Input
                  type="number"
                  min="1"
                  max="180"
                  value={newTimeMinutes}
                  onChange={e => setNewTimeMinutes(parseInt(e.target.value) || 30)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTimeDialog(false)}>Cancelar</Button>
              <Button onClick={handleSaveTime} disabled={saving}>
                {saving && <Loader2 className="icon-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog: Crear/Editar Pregunta */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Pregunta' : 'Nueva Pregunta'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Modifica los datos de la pregunta.' : 'Completa los datos de la pregunta.'}
              </DialogDescription>
            </DialogHeader>
            <div className="dialog-form">
              <div className="form-group">
                <Label>Materia *</Label>
                <Select value={formData.materia_id} onValueChange={val => handleInputChange('materia_id', val)}>
                  <SelectTrigger className={formErrors.materia_id ? 'form-error' : ''}>
                    <SelectValue placeholder="Selecciona materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {materias.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="form-group">
                <Label>Pregunta *</Label>
                <Textarea
                  value={formData.pregunta}
                  onChange={e => handleInputChange('pregunta', e.target.value)}
                  rows={3}
                  className={formErrors.pregunta ? 'form-error' : ''}
                />
              </div>

              <ImageUpload
                value={formData.imagen_url}
                onChange={(url) => handleInputChange('imagen_url', url)}
                folder="preguntas"
                label="Imagen (opcional)"
              />

              <div className="form-grid-2">
                <div className="form-group">
                  <Label>Opción A *</Label>
                  <Input
                    value={formData.opcion_a}
                    onChange={e => handleInputChange('opcion_a', e.target.value)}
                    className={formErrors.opcion_a ? 'form-error' : ''}
                  />
                </div>
                <div className="form-group">
                  <Label>Opción B *</Label>
                  <Input
                    value={formData.opcion_b}
                    onChange={e => handleInputChange('opcion_b', e.target.value)}
                    className={formErrors.opcion_b ? 'form-error' : ''}
                  />
                </div>
                <div className="form-group">
                  <Label>Opción C *</Label>
                  <Input
                    value={formData.opcion_c}
                    onChange={e => handleInputChange('opcion_c', e.target.value)}
                    className={formErrors.opcion_c ? 'form-error' : ''}
                  />
                </div>
                <div className="form-group">
                  <Label>Opción D *</Label>
                  <Input
                    value={formData.opcion_d}
                    onChange={e => handleInputChange('opcion_d', e.target.value)}
                    className={formErrors.opcion_d ? 'form-error' : ''}
                  />
                </div>
              </div>

              <div className="form-group">
                <Label>Respuesta Correcta *</Label>
                <Select value={formData.respuesta_correcta} onValueChange={val => handleInputChange('respuesta_correcta', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="form-group">
                <Label>Explicación (opcional)</Label>
                <Textarea
                  value={formData.explicacion}
                  onChange={e => handleInputChange('explicacion', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="form-row">
                <Label>Pregunta activa</Label>
                <Switch checked={formData.activa} onCheckedChange={val => handleInputChange('activa', val)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              <Button onClick={isEditing ? handleUpdatePregunta : handleCreatePregunta} disabled={saving}>
                {saving && <Loader2 className="icon-spin" />}
                {isEditing ? 'Guardar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* AlertDialog: Confirmar eliminación */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
              <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePregunta}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Simulacros;
