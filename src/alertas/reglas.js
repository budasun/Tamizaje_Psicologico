const NIVELES_ALERTA = {
  PHQ9_MODERADO: 'moderado',
  PHQ9_MODERADAMENTE_GRAVE: 'moderadamente_grave',
  PHQ9_GRAVE: 'grave',
  GAD7_MODERADO: 'moderado',
  GAD7_GRAVE: 'grave',
  WHO5_BAJO: 'bajo'
};

const PRIORIDADES = {
  ALTA: 'alta',
  MEDIA: 'media',
  BAJA: 'baja'
};

function validarRespuestasPHQ9(respuestasPHQ9) {
  if (!Array.isArray(respuestasPHQ9)) {
    throw new Error('respuestasPHQ9 debe ser un arreglo');
  }
  if (respuestasPHQ9.length !== 9) {
    throw new Error('respuestasPHQ9 debe tener exactamente 9 elementos');
  }
  for (let i = 0; i < 9; i++) {
    const valor = respuestasPHQ9[i];
    if (!Number.isInteger(valor) || valor < 0 || valor > 3) {
      throw new Error(`respuestasPHQ9[${i}]: valor inválido (${valor}), debe ser entero entre 0 y 3`);
    }
  }
}

function evaluarAlertas(resultados, respuestasPHQ9) {
  const alertas = [];
  const { phq9, gad7, who5 } = resultados;

  validarRespuestasPHQ9(respuestasPHQ9);

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

  const nivelesPHQ9Alerta = [
    NIVELES_ALERTA.PHQ9_MODERADO,
    NIVELES_ALERTA.PHQ9_MODERADAMENTE_GRAVE,
    NIVELES_ALERTA.PHQ9_GRAVE
  ];

  if (nivelesPHQ9Alerta.includes(phq9.nivel)) {
    alertas.push({
      tipo: 'depresion_moderada_o_mayor',
      prioridad: PRIORIDADES.MEDIA,
      mensaje: `PHQ-9 indica ${phq9.etiqueta} (puntaje: ${phq9.puntaje}). Se recomienda evaluación por profesional de salud mental.`,
      puntaje: phq9.puntaje,
      nivel: phq9.nivel
    });
  }

  const nivelesGAD7Alerta = [
    NIVELES_ALERTA.GAD7_MODERADO,
    NIVELES_ALERTA.GAD7_GRAVE
  ];

  if (nivelesGAD7Alerta.includes(gad7.nivel)) {
    alertas.push({
      tipo: 'ansiedad_moderada_o_mayor',
      prioridad: PRIORIDADES.MEDIA,
      mensaje: `GAD-7 indica ${gad7.etiqueta} (puntaje: ${gad7.puntaje}). Se recomienda evaluación por profesional de salud mental.`,
      puntaje: gad7.puntaje,
      nivel: gad7.nivel
    });
  }

  if (who5.nivel === NIVELES_ALERTA.WHO5_BAJO) {
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

module.exports = {
  evaluarAlertas,
  tieneAlertaAlta,
  obtenerPrioridadMaxima,
  validarRespuestasPHQ9,
  NIVELES_ALERTA,
  PRIORIDADES
};