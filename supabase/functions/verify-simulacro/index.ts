import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client to access preguntas table with answers
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { pregunta_ids, respuestas } = await req.json();

    if (!pregunta_ids || !Array.isArray(pregunta_ids) || pregunta_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Se requiere un array de pregunta_ids' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!respuestas || typeof respuestas !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Se requiere un objeto de respuestas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verifying simulacro with', pregunta_ids.length, 'questions');

    // Get questions with correct answers from preguntas table (bypassing RLS)
    const { data: preguntas, error } = await supabaseAdmin
      .from('preguntas')
      .select('id, respuesta_correcta, explicacion')
      .in('id', pregunta_ids);

    if (error) {
      console.error('Error fetching preguntas:', error);
      return new Response(
        JSON.stringify({ error: 'Error al obtener las preguntas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate results
    let correctas = 0;
    const detalles: Record<string, { 
      respuesta_usuario: string | null; 
      respuesta_correcta: string; 
      es_correcta: boolean;
      explicacion: string | null;
    }> = {};

    preguntas?.forEach(pregunta => {
      const respuestaUsuario = respuestas[pregunta.id] || null;
      const esCorrecta = respuestaUsuario === pregunta.respuesta_correcta;
      
      if (esCorrecta) {
        correctas++;
      }

      detalles[pregunta.id] = {
        respuesta_usuario: respuestaUsuario,
        respuesta_correcta: pregunta.respuesta_correcta,
        es_correcta: esCorrecta,
        explicacion: pregunta.explicacion,
      };
    });

    const total = preguntas?.length || 0;
    const puntaje = total > 0 ? Math.round((correctas / total) * 100) : 0;

    console.log('Simulacro verified:', correctas, '/', total, '- Score:', puntaje);

    return new Response(
      JSON.stringify({
        correctas,
        total,
        puntaje,
        detalles,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
