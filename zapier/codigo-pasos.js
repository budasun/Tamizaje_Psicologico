// Código para pegar en "Code by Zapier" (JavaScript)
// Este paso debe ir DESPUÉS de obtener las respuestas de Google Forms
// y ANTES de escribir a Google Sheets y enviar correo por Gmail

// ============================================
// CONFIGURACIÓN - AJUSTA LOS NOMBRES DE CAMPOS
// ============================================
// Los nombres de las variables de entrada dependen de cómo mapees
// los campos de Google Forms en Zapier. Ejemplo:
// inputData.phq9_1, inputData.phq9_2, ..., inputData.phq9_9
// inputData.gad7_1, ..., inputData.gad7_7
// inputData.who5_1, ..., inputData.who5_5
// inputData.nombre, inputData.correo, etc.

// ============================================
// FUNCIONES DE SCORING (COPIADAS DEL PROYECTO)
// ============================================

function calcularPHQ9(respuestas) {
  if (!Array.isArray(respuestas) || respuestas.length !== 9) {
    throw new Error('PHQ-9 requiere exactamente 9 respuestas');
  }
  for (let i = 0; i < 9; i++) {
    const v = parseInt(respuestas[i], 10);
    if (isNaN(v) || v < 0 || v > 3) {
      throw new Error(`PHQ-9 item ${i+1}: valor inválido (${respuestas[i]})`);
    }
  }
  const puntaje = respuestas.reduce((s, v) => s + parseInt(v, 10), 0);
  let nivel, etiqueta;
  if (puntaje <= 4) { nivel = 'ninguno'; etiqueta = 'Sin depresión significativa'; }
  else if (puntaje <= 9) { nivel = 'leve'; etiqueta = 'Depresión leve'; }
  else if (puntaje <= 14) { nivel = 'moderado'; etiqueta = 'Depresión moderada'; }
  else if (puntaje <= 19) { nivel = 'moderadamente_grave'; etiqueta = 'Depresión moderadamente grave'; }
  else { nivel = 'grave'; etiqueta = 'Depresión grave'; }
  return { puntaje, nivel, etiqueta, maximo: 27, minimo: 0, numItems: 9 };
}

function calcularGAD7(respuestas) {
  if (!Array.isArray(respuestas) || respuestas.length !== 7) {
    throw new Error('GAD-7 requiere exactamente 7 respuestas');
  }
  for (let i = 0; i < 7; i++) {
    const v = parseInt(respuestas[i], 10);
    if (isNaN(v) || v < 0 || v > 3) {
      throw new Error(`GAD-7 item ${i+1}: valor inválido (${respuestas[i]})`);
    }
  }
  const puntaje = respuestas.reduce((s, v) => s + parseInt(v, 10), 0);
  let nivel, etiqueta;
  if (puntaje <= 4) { nivel = 'ninguno'; etiqueta = 'Sin ansiedad significativa'; }
  else if (puntaje <= 9) { nivel = 'leve'; etiqueta = 'Ansiedad leve'; }
  else if (puntaje <= 14) { nivel = 'moderado'; etiqueta = 'Ansiedad moderada'; }
  else { nivel = 'grave'; etiqueta = 'Ansiedad grave'; }
  return { puntaje, nivel, etiqueta, maximo: 21, minimo: 0, numItems: 7 };
}

function calcularWHO5(respuestas) {
  if (!Array.isArray(respuestas) || respuestas.length !== 5) {
    throw new Error('WHO-5 requiere exactamente 5 respuestas');
  }
  for (let i = 0; i < 5; i++) {
    const v = parseInt(respuestas[i], 10);
    if (isNaN(v) || v < 0 || v > 5) {
      throw new Error(`WHO-5 item ${i+1}: valor inválido (${respuestas[i]})`);
    }
  }
  const puntajeBruto = respuestas.reduce((s, v) => s + parseInt(v, 10), 0);
  const puntajePorcentaje = puntajeBruto * 4;
  let nivel, etiqueta;
  if (puntajeBruto <= 12) { nivel = 'bajo'; etiqueta = 'Bienestar bajo (se recomienda evaluación)'; }
  else { nivel = 'normal'; etiqueta = 'Bienestar normal'; }
  return { puntaje: puntajeBruto, puntajePorcentaje, nivel, etiqueta, maximo: 25, minimo: 0, numItems: 5 };
}

// ============================================
// FUNCIÓN DE VALIDACIÓN Y CONVERSIÓN
// ============================================

function convertirYValidarEntrada(valor, nombreCampo, min, max) {
  const num = Number(valor);
  if (isNaN(num)) {
    throw new Error(`${nombreCampo}: valor no numérico (${valor})`);
  }
  if (!Number.isInteger(num) || num < min || num > max) {
    throw new Error(`${nombreCampo}: valor fuera de rango (${num}), debe ser entero entre ${min} y ${max}`);
  }
  return num;
}

// ============================================
// REGLAS DE ALERTAS
// ============================================

const PRIORIDADES = { ALTA: 'alta', MEDIA: 'media', BAJA: 'baja' };

function evaluarAlertas(resultados, respuestasPHQ9) {
  const alertas = [];
  const { phq9, gad7, who5 } = resultados;

  // Validar respuestasPHQ9 (ya validado antes, pero doble check)
  if (!Array.isArray(respuestasPHQ9) || respuestasPHQ9.length !== 9) {
    throw new Error('respuestasPHQ9 debe ser un arreglo de 9 elementos');
  }

  // (a) Ítem 9 PHQ-9 > 0 = PRIORIDAD ALTA
  const respuesta9 = respuestasPHQ9[8];
  if (respuesta9 > 0) {
    alertas.push({
      tipo: 'riesgo_suicida',
      prioridad: PRIORIDADES.ALTA,
      mensaje: 'Respuesta positiva en el ítem 9 del PHQ-9 (pensamientos de autolesión o muerte). Requiere evaluación inmediata por profesional de salud mental.',
      item: 9,
      valor: respuesta9
    });
  }

  // (b) PHQ-9 moderado o superior
  const nivelesPHQ9Alerta = ['moderado', 'moderadamente_grave', 'grave'];
  if (nivelesPHQ9Alerta.includes(phq9.nivel)) {
    alertas.push({
      tipo: 'depresion_moderada_o_mayor',
      prioridad: PRIORIDADES.MEDIA,
      mensaje: `PHQ-9 indica ${phq9.etiqueta} (puntaje: ${phq9.puntaje}). Se recomienda evaluación por profesional de salud mental.`,
      puntaje: phq9.puntaje,
      nivel: phq9.nivel
    });
  }

  // (b) GAD-7 moderado o superior
  const nivelesGAD7Alerta = ['moderado', 'grave'];
  if (nivelesGAD7Alerta.includes(gad7.nivel)) {
    alertas.push({
      tipo: 'ansiedad_moderada_o_mayor',
      prioridad: PRIORIDADES.MEDIA,
      mensaje: `GAD-7 indica ${gad7.etiqueta} (puntaje: ${gad7.puntaje}). Se recomienda evaluación por profesional de salud mental.`,
      puntaje: gad7.puntaje,
      nivel: gad7.nivel
    });
  }

  // (c) WHO-5 < 13
  if (who5.nivel === 'bajo') {
    alertas.push({
      tipo: 'bienestar_bajo',
      prioridad: PRIORIDADES.MEDIA,
      mensaje: `WHO-5 indica ${who5.etiqueta} (puntaje bruto: ${who5.puntaje}, porcentaje: ${who5.puntajePorcentaje}%). Se recomienda evaluación por profesional de salud mental.`,
      puntaje: who5.puntaje,
      puntajePorcentaje: who5.puntajePorcentaje,
      nivel: who5.nivel
    });
  }

  return alertas;
}

function tieneAlertaAlta(alertas) {
  return alertas.some(a => a.prioridad === PRIORIDADES.ALTA);
}

function obtenerPrioridadMaxima(alertas) {
  if (alertas.some(a => a.prioridad === PRIORIDADES.ALTA)) return PRIORIDADES.ALTA;
  if (alertas.some(a => a.prioridad === PRIORIDADES.MEDIA)) return PRIORIDADES.MEDIA;
  return PRIORIDADES.BAJA;
}

// ============================================
// FUNCIÓN PRINCIPAL - ENTRY POINT DE ZAPIER
// ============================================

// Zapier expone inputData con los campos mapeados del trigger anterior
// inputData contiene todas las variables del paso anterior (Google Forms)

// Convertir y validar PHQ-9 (9 items, 0-3)
const phq9Respuestas = [
  convertirYValidarEntrada(inputData.phq9_1, 'phq9_1', 0, 3),
  convertirYValidarEntrada(inputData.phq9_2, 'phq9_2', 0, 3),
  convertirYValidarEntrada(inputData.phq9_3, 'phq9_3', 0, 3),
  convertirYValidarEntrada(inputData.phq9_4, 'phq9_4', 0, 3),
  convertirYValidarEntrada(inputData.phq9_5, 'phq9_5', 0, 3),
  convertirYValidarEntrada(inputData.phq9_6, 'phq9_6', 0, 3),
  convertirYValidarEntrada(inputData.phq9_7, 'phq9_7', 0, 3),
  convertirYValidarEntrada(inputData.phq9_8, 'phq9_8', 0, 3),
  convertirYValidarEntrada(inputData.phq9_9, 'phq9_9', 0, 3)
];

// Convertir y validar GAD-7 (7 items, 0-3)
const gad7Respuestas = [
  convertirYValidarEntrada(inputData.gad7_1, 'gad7_1', 0, 3),
  convertirYValidarEntrada(inputData.gad7_2, 'gad7_2', 0, 3),
  convertirYValidarEntrada(inputData.gad7_3, 'gad7_3', 0, 3),
  convertirYValidarEntrada(inputData.gad7_4, 'gad7_4', 0, 3),
  convertirYValidarEntrada(inputData.gad7_5, 'gad7_5', 0, 3),
  convertirYValidarEntrada(inputData.gad7_6, 'gad7_6', 0, 3),
  convertirYValidarEntrada(inputData.gad7_7, 'gad7_7', 0, 3)
];

// Convertir y validar WHO-5 (5 items, 0-5)
const who5Respuestas = [
  convertirYValidarEntrada(inputData.who5_1, 'who5_1', 0, 5),
  convertirYValidarEntrada(inputData.who5_2, 'who5_2', 0, 5),
  convertirYValidarEntrada(inputData.who5_3, 'who5_3', 0, 5),
  convertirYValidarEntrada(inputData.who5_4, 'who5_4', 0, 5),
  convertirYValidarEntrada(inputData.who5_5, 'who5_5', 0, 5)
];

// Calcular scores
const resultadoPHQ9 = calcularPHQ9(phq9Respuestas);
const resultadoGAD7 = calcularGAD7(gad7Respuestas);
const resultadoWHO5 = calcularWHO5(who5Respuestas);

// Evaluar alertas
const alertas = evaluarAlertas(
  { phq9: resultadoPHQ9, gad7: resultadoGAD7, who5: resultadoWHO5 },
  phq9Respuestas
);

const prioridadMaxima = obtenerPrioridadMaxima(alertas);
const requiereAtencionInmediata = tieneAlertaAlta(alertas);

// Preparar salida para siguientes pasos de Zapier
// Estos valores estarán disponibles para mapear en Google Sheets y Gmail
output = {
  // Datos básicos
  nombre: inputData.nombre || 'Sin nombre',
  correo: inputData.correo || 'Sin correo',
  fecha: new Date().toISOString(),

  // Scores PHQ-9
  phq9_puntaje: resultadoPHQ9.puntaje,
  phq9_nivel: resultadoPHQ9.nivel,
  phq9_etiqueta: resultadoPHQ9.etiqueta,
  phq9_respuestas: phq9Respuestas.join(','),

  // Scores GAD-7
  gad7_puntaje: resultadoGAD7.puntaje,
  gad7_nivel: resultadoGAD7.nivel,
  gad7_etiqueta: resultadoGAD7.etiqueta,
  gad7_respuestas: gad7Respuestas.join(','),

  // Scores WHO-5
  who5_puntaje_bruto: resultadoWHO5.puntaje,
  who5_puntaje_porcentaje: resultadoWHO5.puntajePorcentaje,
  who5_nivel: resultadoWHO5.nivel,
  who5_etiqueta: resultadoWHO5.etiqueta,
  who5_respuestas: who5Respuestas.join(','),

  // Alertas
  alertas_json: JSON.stringify(alertas),
  alertas_count: alertas.length,
  prioridad_maxima: prioridadMaxima,
  requiere_atencion_inmediata: requiereAtencionInmediata,

  // Para plantilla de correo
  tiene_alertas: alertas.length > 0,
  alertas_resumen: alertas.map(a => `${a.tipo} (${a.prioridad}): ${a.mensaje}`).join(' | '),

  // Línea de crisis (TODO: verificar vigencia)
  linea_crisis: '800 911 2000',
  avisos_legales: 'Este es un tamizaje, NO un diagnóstico. Consulte a un profesional de salud mental.'
};

// ============================================
// INSTRUCCIONES DE USO EN ZAPIER
// ============================================
/*
1. Trigger: Google Forms - New Response in Spreadsheet
2. Action: Code by Zapier (JavaScript) - PEGAR ESTE CÓDIGO
   - En "Input Data", mapear cada campo del Form:
     phq9_1, phq9_2, ..., phq9_9
     gad7_1, ..., gad7_7
     who5_1, ..., who5_5
     nombre, correo (y otros que necesites)
3. Action: Google Sheets - Create Spreadsheet Row
   - Mapear todos los campos de output a columnas de la hoja
4. Action: Filter by Zapier (opcional)
   - Solo continuar si "requiere_atencion_inmediata" es true
   - O si "prioridad_maxima" es "media" o "alta"
5. Action: Gmail - Send Email
   - Para: {{correo}} (del paciente)
   - Asunto: "Resultados de tu tamizaje de bienestar emocional"
   - Cuerpo: Usar plantilla de correo-resultados.md con variables de output
6. Action (opcional): Gmail - Send Email al profesional
   - Solo si prioridad_maxima es "alta" o "media"
   - Usar plantilla correo-alerta-profesional.md
*/