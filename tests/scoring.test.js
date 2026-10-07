const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const { calcularPHQ9 } = require('../src/scoring/phq9');
const { calcularGAD7 } = require('../src/scoring/gad7');
const { calcularWHO5 } = require('../src/scoring/who5');
const { evaluarAlertas, tieneAlertaAlta, obtenerPrioridadMaxima, PRIORIDADES } = require('../src/alertas/reglas');

describe('PHQ-9 Scoring', () => {
  it('debe calcular puntaje 0 (ninguno)', () => {
    const respuestas = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    const resultado = calcularPHQ9(respuestas);
    assert.strictEqual(resultado.puntaje, 0);
    assert.strictEqual(resultado.nivel, 'ninguno');
    assert.strictEqual(resultado.etiqueta, 'Sin depresión significativa');
  });

  it('debe calcular puntaje 4 (límite superior none)', () => {
    const respuestas = [1, 1, 1, 1, 0, 0, 0, 0, 0];
    const resultado = calcularPHQ9(respuestas);
    assert.strictEqual(resultado.puntaje, 4);
    assert.strictEqual(resultado.nivel, 'ninguno');
  });

  it('debe calcular puntaje 5 (límite inferior leve)', () => {
    const respuestas = [1, 1, 1, 1, 1, 0, 0, 0, 0];
    const resultado = calcularPHQ9(respuestas);
    assert.strictEqual(resultado.puntaje, 5);
    assert.strictEqual(resultado.nivel, 'leve');
    assert.strictEqual(resultado.etiqueta, 'Depresión leve');
  });

  it('debe calcular puntaje 9 (límite superior leve)', () => {
    const respuestas = [3, 3, 3, 0, 0, 0, 0, 0, 0];
    const resultado = calcularPHQ9(respuestas);
    assert.strictEqual(resultado.puntaje, 9);
    assert.strictEqual(resultado.nivel, 'leve');
  });

  it('debe calcular puntaje 10 (límite inferior moderado)', () => {
    const respuestas = [3, 3, 2, 2, 0, 0, 0, 0, 0];
    const resultado = calcularPHQ9(respuestas);
    assert.strictEqual(resultado.puntaje, 10);
    assert.strictEqual(resultado.nivel, 'moderado');
    assert.strictEqual(resultado.etiqueta, 'Depresión moderada');
  });

  it('debe calcular puntaje 14 (límite superior moderado)', () => {
    const respuestas = [3, 3, 3, 3, 2, 0, 0, 0, 0];
    const resultado = calcularPHQ9(respuestas);
    assert.strictEqual(resultado.puntaje, 14);
    assert.strictEqual(resultado.nivel, 'moderado');
  });

  it('debe calcular puntaje 15 (límite inferior moderadamente grave)', () => {
    const respuestas = [3, 3, 3, 3, 3, 0, 0, 0, 0];
    const resultado = calcularPHQ9(respuestas);
    assert.strictEqual(resultado.puntaje, 15);
    assert.strictEqual(resultado.nivel, 'moderadamente_grave');
    assert.strictEqual(resultado.etiqueta, 'Depresión moderadamente grave');
  });

  it('debe calcular puntaje 19 (límite superior moderadamente grave)', () => {
    const respuestas = [3, 3, 3, 3, 3, 3, 1, 0, 0];
    const resultado = calcularPHQ9(respuestas);
    assert.strictEqual(resultado.puntaje, 19);
    assert.strictEqual(resultado.nivel, 'moderadamente_grave');
  });

  it('debe calcular puntaje 20 (límite inferior grave)', () => {
    const respuestas = [3, 3, 3, 3, 3, 3, 2, 0, 0];
    const resultado = calcularPHQ9(respuestas);
    assert.strictEqual(resultado.puntaje, 20);
    assert.strictEqual(resultado.nivel, 'grave');
    assert.strictEqual(resultado.etiqueta, 'Depresión grave');
  });

  it('debe calcular puntaje 27 (máximo)', () => {
    const respuestas = [3, 3, 3, 3, 3, 3, 3, 3, 3];
    const resultado = calcularPHQ9(respuestas);
    assert.strictEqual(resultado.puntaje, 27);
    assert.strictEqual(resultado.nivel, 'grave');
  });

  it('debe lanzar error si no es un arreglo', () => {
    assert.throws(() => calcularPHQ9('no-arreglo'), /deben ser un arreglo/);
  });

  it('debe lanzar error si no tiene 9 respuestas', () => {
    assert.throws(() => calcularPHQ9([0, 0, 0]), /exactamente 9 respuestas/);
  });

  it('debe lanzar error si valor fuera de rango (negativo)', () => {
    assert.throws(() => calcularPHQ9([-1, 0, 0, 0, 0, 0, 0, 0, 0]), /entre 0 y 3/);
  });

  it('debe lanzar error si valor fuera de rango (>3)', () => {
    assert.throws(() => calcularPHQ9([4, 0, 0, 0, 0, 0, 0, 0, 0]), /entre 0 y 3/);
  });

  it('debe lanzar error si valor no es entero', () => {
    assert.throws(() => calcularPHQ9([1.5, 0, 0, 0, 0, 0, 0, 0, 0]), /entero entre 0 y 3/);
  });
});

describe('GAD-7 Scoring', () => {
  it('debe calcular puntaje 0 (ninguno)', () => {
    const respuestas = [0, 0, 0, 0, 0, 0, 0];
    const resultado = calcularGAD7(respuestas);
    assert.strictEqual(resultado.puntaje, 0);
    assert.strictEqual(resultado.nivel, 'ninguno');
    assert.strictEqual(resultado.etiqueta, 'Sin ansiedad significativa');
  });

  it('debe calcular puntaje 4 (límite superior none)', () => {
    const respuestas = [1, 1, 1, 1, 0, 0, 0];
    const resultado = calcularGAD7(respuestas);
    assert.strictEqual(resultado.puntaje, 4);
    assert.strictEqual(resultado.nivel, 'ninguno');
  });

  it('debe calcular puntaje 5 (límite inferior leve)', () => {
    const respuestas = [1, 1, 1, 1, 1, 0, 0];
    const resultado = calcularGAD7(respuestas);
    assert.strictEqual(resultado.puntaje, 5);
    assert.strictEqual(resultado.nivel, 'leve');
    assert.strictEqual(resultado.etiqueta, 'Ansiedad leve');
  });

  it('debe calcular puntaje 9 (límite superior leve)', () => {
    const respuestas = [3, 3, 3, 0, 0, 0, 0];
    const resultado = calcularGAD7(respuestas);
    assert.strictEqual(resultado.puntaje, 9);
    assert.strictEqual(resultado.nivel, 'leve');
  });

  it('debe calcular puntaje 10 (límite inferior moderado)', () => {
    const respuestas = [3, 3, 2, 2, 0, 0, 0];
    const resultado = calcularGAD7(respuestas);
    assert.strictEqual(resultado.puntaje, 10);
    assert.strictEqual(resultado.nivel, 'moderado');
    assert.strictEqual(resultado.etiqueta, 'Ansiedad moderada');
  });

  it('debe calcular puntaje 14 (límite superior moderado)', () => {
    const respuestas = [3, 3, 3, 3, 2, 0, 0];
    const resultado = calcularGAD7(respuestas);
    assert.strictEqual(resultado.puntaje, 14);
    assert.strictEqual(resultado.nivel, 'moderado');
  });

  it('debe calcular puntaje 15 (límite inferior grave)', () => {
    const respuestas = [3, 3, 3, 3, 3, 0, 0];
    const resultado = calcularGAD7(respuestas);
    assert.strictEqual(resultado.puntaje, 15);
    assert.strictEqual(resultado.nivel, 'grave');
    assert.strictEqual(resultado.etiqueta, 'Ansiedad grave');
  });

  it('debe calcular puntaje 21 (máximo)', () => {
    const respuestas = [3, 3, 3, 3, 3, 3, 3];
    const resultado = calcularGAD7(respuestas);
    assert.strictEqual(resultado.puntaje, 21);
    assert.strictEqual(resultado.nivel, 'grave');
  });

  it('debe lanzar error si no tiene 7 respuestas', () => {
    assert.throws(() => calcularGAD7([0, 0, 0]), /exactamente 7 respuestas/);
  });

  it('debe lanzar error si valor fuera de rango', () => {
    assert.throws(() => calcularGAD7([4, 0, 0, 0, 0, 0, 0]), /entre 0 y 3/);
  });
});

describe('WHO-5 Scoring', () => {
  it('debe calcular puntaje 0 (bajo)', () => {
    const respuestas = [0, 0, 0, 0, 0];
    const resultado = calcularWHO5(respuestas);
    assert.strictEqual(resultado.puntaje, 0);
    assert.strictEqual(resultado.puntajePorcentaje, 0);
    assert.strictEqual(resultado.nivel, 'bajo');
    assert.strictEqual(resultado.etiqueta, 'Bienestar bajo (se recomienda evaluación)');
  });

  it('debe calcular puntaje 12 (límite superior bienestar bajo)', () => {
    const respuestas = [3, 3, 3, 3, 0];
    const resultado = calcularWHO5(respuestas);
    assert.strictEqual(resultado.puntaje, 12);
    assert.strictEqual(resultado.puntajePorcentaje, 48);
    assert.strictEqual(resultado.nivel, 'bajo');
  });

  it('debe calcular puntaje 13 (límite inferior bienestar normal)', () => {
    const respuestas = [3, 3, 3, 2, 2];
    const resultado = calcularWHO5(respuestas);
    assert.strictEqual(resultado.puntaje, 13);
    assert.strictEqual(resultado.puntajePorcentaje, 52);
    assert.strictEqual(resultado.nivel, 'normal');
    assert.strictEqual(resultado.etiqueta, 'Bienestar normal');
  });

  it('debe calcular puntaje 25 (máximo con escala 0-5, normal)', () => {
    const respuestas = [5, 5, 5, 5, 5];
    const resultado = calcularWHO5(respuestas);
    assert.strictEqual(resultado.puntaje, 25);
    assert.strictEqual(resultado.puntajePorcentaje, 100);
    assert.strictEqual(resultado.nivel, 'normal');
  });

  it('debe lanzar error si no tiene 5 respuestas', () => {
    assert.throws(() => calcularWHO5([0, 0, 0]), /exactamente 5 respuestas/);
  });

  it('debe lanzar error si valor fuera de rango (>5)', () => {
    assert.throws(() => calcularWHO5([6, 0, 0, 0, 0]), /entre 0 y 5/);
  });

  it('debe lanzar error si valor no es entero', () => {
    assert.throws(() => calcularWHO5([1.5, 0, 0, 0, 0]), /entero entre 0 y 5/);
  });
});

describe('Reglas de Alertas', () => {
  const resultadosBase = {
    phq9: { puntaje: 0, nivel: 'ninguno', etiqueta: 'Sin depresión significativa' },
    gad7: { puntaje: 0, nivel: 'ninguno', etiqueta: 'Sin ansiedad significativa' },
    who5: { puntaje: 25, nivel: 'normal', etiqueta: 'Bienestar normal', puntajePorcentaje: 100 }
  };

  it('debe detectar alerta alta por item 9 PHQ-9 > 0', () => {
    const respuestasPHQ9 = [0, 0, 0, 0, 0, 0, 0, 0, 1];
    const alertas = evaluarAlertas(resultadosBase, respuestasPHQ9);
    assert.strictEqual(alertas.length, 1);
    assert.strictEqual(alertas[0].tipo, 'riesgo_suicida');
    assert.strictEqual(alertas[0].prioridad, PRIORIDADES.ALTA);
    assert.strictEqual(alertas[0].item, 9);
    assert.strictEqual(alertas[0].valor, 1);
  });

  it('debe detectar alerta media por PHQ-9 moderado', () => {
    const resultados = { ...resultadosBase, phq9: { puntaje: 10, nivel: 'moderado', etiqueta: 'Depresión moderada' } };
    const alertas = evaluarAlertas(resultados, [0,0,0,0,0,0,0,0,0]);
    assert.ok(alertas.some(a => a.tipo === 'depresion_moderada_o_mayor' && a.prioridad === PRIORIDADES.MEDIA));
  });

  it('debe detectar alerta media por PHQ-9 moderadamente grave', () => {
    const resultados = { ...resultadosBase, phq9: { puntaje: 16, nivel: 'moderadamente_grave', etiqueta: 'Depresión moderadamente grave' } };
    const alertas = evaluarAlertas(resultados, [0,0,0,0,0,0,0,0,0]);
    assert.ok(alertas.some(a => a.tipo === 'depresion_moderada_o_mayor'));
  });

  it('debe detectar alerta media por PHQ-9 grave', () => {
    const resultados = { ...resultadosBase, phq9: { puntaje: 22, nivel: 'grave', etiqueta: 'Depresión grave' } };
    const alertas = evaluarAlertas(resultados, [0,0,0,0,0,0,0,0,0]);
    assert.ok(alertas.some(a => a.tipo === 'depresion_moderada_o_mayor'));
  });

  it('debe detectar alerta media por GAD-7 moderado', () => {
    const resultados = { ...resultadosBase, gad7: { puntaje: 10, nivel: 'moderado', etiqueta: 'Ansiedad moderada' } };
    const alertas = evaluarAlertas(resultados, [0,0,0,0,0,0,0,0,0]);
    assert.ok(alertas.some(a => a.tipo === 'ansiedad_moderada_o_mayor' && a.prioridad === PRIORIDADES.MEDIA));
  });

  it('debe detectar alerta media por GAD-7 grave', () => {
    const resultados = { ...resultadosBase, gad7: { puntaje: 16, nivel: 'grave', etiqueta: 'Ansiedad grave' } };
    const alertas = evaluarAlertas(resultados, [0,0,0,0,0,0,0,0,0]);
    assert.ok(alertas.some(a => a.tipo === 'ansiedad_moderada_o_mayor'));
  });

  it('debe detectar alerta media por WHO-5 bajo (< 13)', () => {
    const resultados = { ...resultadosBase, who5: { puntaje: 10, nivel: 'bajo', etiqueta: 'Bienestar bajo', puntajePorcentaje: 40 } };
    const alertas = evaluarAlertas(resultados, [0,0,0,0,0,0,0,0,0]);
    assert.ok(alertas.some(a => a.tipo === 'bienestar_bajo' && a.prioridad === PRIORIDADES.MEDIA));
  });

  it('NO debe alertar si WHO-5 es 13 (normal)', () => {
    const resultados = { ...resultadosBase, who5: { puntaje: 13, nivel: 'normal', etiqueta: 'Bienestar normal', puntajePorcentaje: 52 } };
    const alertas = evaluarAlertas(resultados, [0,0,0,0,0,0,0,0,0]);
    assert.ok(!alertas.some(a => a.tipo === 'bienestar_bajo'));
  });

  it('tieneAlertaAlta debe retornar true si hay alerta prioridad alta', () => {
    const alertas = [{ prioridad: PRIORIDADES.ALTA }, { prioridad: PRIORIDADES.MEDIA }];
    assert.strictEqual(tieneAlertaAlta(alertas), true);
  });

  it('tieneAlertaAlta debe retornar false si solo hay alertas media/baja', () => {
    const alertas = [{ prioridad: PRIORIDADES.MEDIA }, { prioridad: PRIORIDADES.BAJA }];
    assert.strictEqual(tieneAlertaAlta(alertas), false);
  });

  it('obtenerPrioridadMaxima debe retornar ALTA si existe', () => {
    const alertas = [{ prioridad: PRIORIDADES.MEDIA }, { prioridad: PRIORIDADES.ALTA }];
    assert.strictEqual(obtenerPrioridadMaxima(alertas), PRIORIDADES.ALTA);
  });

  it('obtenerPrioridadMaxima debe retornar MEDIA si no hay ALTA pero hay MEDIA', () => {
    const alertas = [{ prioridad: PRIORIDADES.BAJA }, { prioridad: PRIORIDADES.MEDIA }];
    assert.strictEqual(obtenerPrioridadMaxima(alertas), PRIORIDADES.MEDIA);
  });

  it('obtenerPrioridadMaxima debe retornar BAJA si solo hay BAJA', () => {
    const alertas = [{ prioridad: PRIORIDADES.BAJA }];
    assert.strictEqual(obtenerPrioridadMaxima(alertas), PRIORIDADES.BAJA);
  });

  it('debe generar múltiples alertas simultáneas', () => {
    const resultados = {
      phq9: { puntaje: 15, nivel: 'moderadamente_grave', etiqueta: 'Depresión moderadamente grave' },
      gad7: { puntaje: 12, nivel: 'moderado', etiqueta: 'Ansiedad moderada' },
      who5: { puntaje: 8, nivel: 'bajo', etiqueta: 'Bienestar bajo', puntajePorcentaje: 32 }
    };
    const respuestasPHQ9 = [0, 0, 0, 0, 0, 0, 0, 0, 2];
    const alertas = evaluarAlertas(resultados, respuestasPHQ9);
    assert.strictEqual(alertas.length, 4);
    assert.ok(tieneAlertaAlta(alertas));
    assert.strictEqual(obtenerPrioridadMaxima(alertas), PRIORIDADES.ALTA);
  });

  it('debe lanzar error si respuestasPHQ9 no es un arreglo', () => {
    const resultados = {
      phq9: { puntaje: 0, nivel: 'ninguno', etiqueta: 'Sin depresión significativa' },
      gad7: { puntaje: 0, nivel: 'ninguno', etiqueta: 'Sin ansiedad significativa' },
      who5: { puntaje: 25, nivel: 'normal', etiqueta: 'Bienestar normal', puntajePorcentaje: 100 }
    };
    assert.throws(() => evaluarAlertas(resultados, 'no-arreglo'), /debe ser un arreglo/);
  });

  it('debe lanzar error si respuestasPHQ9 no tiene 9 elementos', () => {
    const resultados = {
      phq9: { puntaje: 0, nivel: 'ninguno', etiqueta: 'Sin depresión significativa' },
      gad7: { puntaje: 0, nivel: 'ninguno', etiqueta: 'Sin ansiedad significativa' },
      who5: { puntaje: 25, nivel: 'normal', etiqueta: 'Bienestar normal', puntajePorcentaje: 100 }
    };
    assert.throws(() => evaluarAlertas(resultados, [0, 0, 0]), /exactamente 9 elementos/);
  });

  it('debe lanzar error si respuestasPHQ9 tiene valor inválido', () => {
    const resultados = {
      phq9: { puntaje: 0, nivel: 'ninguno', etiqueta: 'Sin depresión significativa' },
      gad7: { puntaje: 0, nivel: 'ninguno', etiqueta: 'Sin ansiedad significativa' },
      who5: { puntaje: 25, nivel: 'normal', etiqueta: 'Bienestar normal', puntajePorcentaje: 100 }
    };
    assert.throws(() => evaluarAlertas(resultados, [0, 0, 0, 0, 0, 0, 0, 0, 4]), /valor inválido/);
  });
});