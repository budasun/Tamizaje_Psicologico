const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const RUTA_ZAPIER = path.join(__dirname, '..', 'zapier', 'codigo-pasos.js');
const CODIGO = fs.readFileSync(RUTA_ZAPIER, 'utf8');

// Ejecuta el archivo real de Zapier como lo haria el runtime de Code by
// Zapier: se inyecta `inputData` como parametro y el archivo asigna `output`
// (en modo no estricto eso crea una global). Asi se prueba el artefacto que
// se pega en Zapier, no una copia, y no se requiere module.exports porque
// el archivo debe seguir siendo autocontenido.
function ejecutarZapier(inputData) {
  const fn = new Function('inputData', `${CODIGO}\n;return output;`);
  delete globalThis.output;
  try {
    return fn(inputData);
  } finally {
    delete globalThis.output;
  }
}

// Un juego de respuestas validas; cada prueba altera un solo campo.
// Incluye los 9 campos del PHQ-9 para que la validacion no truene antes
// de tiempo y cada prueba pueda alterar el campo que le interesa.
function datosValidos(overrides = {}) {
  const datos = { nombre: 'Perfil Ficticio', correo: 'prueba@correo.ficticio' };
  for (let i = 1; i <= 9; i++) datos[`phq9_${i}`] = 0;
  for (let i = 1; i <= 7; i++) datos[`gad7_${i}`] = 0;
  for (let i = 1; i <= 5; i++) datos[`who5_${i}`] = 5;
  return { ...datos, ...overrides };
}

const SIN_ALERTA = datosValidos({ phq9_9: 0 });
const CON_ALERTA = datosValidos({ phq9_9: 1 });

describe('Autocontención del archivo de Zapier', () => {
  it('no debe tener require ni import de archivos locales', () => {
    const tieneRequire = /(^|[^.\w])require\s*\(/.test(CODIGO);
    const tieneImport = /^\s*import\s/m.test(CODIGO);
    assert.strictEqual(tieneRequire, false, 'el archivo no debe usar require()');
    assert.strictEqual(tieneImport, false, 'el archivo no debe usar import');
  });

  it('debe aplicar la coerción en el límite de entrada con Number()', () => {
    assert.match(CODIGO, /const num = Number\(valor\)/);
    assert.doesNotMatch(CODIGO, /parseInt/, 'no debe quedar parseInt en el archivo');
  });
});

describe('convertirYValidarEntrada: respuestas ausentes o malformadas', () => {
  const casosRechazados = [
    { valor: '', etiqueta: 'cadena vacía' },
    { valor: ' ', etiqueta: 'cadena de un espacio' },
    { valor: '   ', etiqueta: 'cadena de varios espacios' },
    { valor: '\t\n', etiqueta: 'cadena de tabulación y salto de línea' },
    { valor: null, etiqueta: 'null' },
    { valor: undefined, etiqueta: 'undefined' },
    { valor: '3abc', etiqueta: 'cadena no numerica' },
    { valor: [], etiqueta: 'arreglo vacio' },
    { valor: true, etiqueta: 'booleano' }
  ];

  for (const { valor, etiqueta } of casosRechazados) {
    it(`debe rechazar ${etiqueta} en lugar de coercionarlo a 0`, () => {
      assert.throws(
        () => ejecutarZapier(SIN_ALERTA_CAMPO_9(valor)),
        Error,
        `esperaba un Error para ${JSON.stringify(valor)}`
      );
    });
  }

  function SIN_ALERTA_CAMPO_9(valor) {
    return datosValidos({ phq9_9: valor });
  }
});

describe('Regla del ítem 9 del PHQ-9 nunca se lee como 0 por defecto', () => {
  it('ítem 9 = 0 NO genera alerta de riesgo suicida (control positivo del valor nulo)', () => {
    const output = ejecutarZapier(SIN_ALERTA);
    assert.strictEqual(output.phq9_puntaje, 0);
    assert.strictEqual(output.requiere_atencion_inmediata, false);
    assert.ok(!output.alertas_json.includes('riesgo_suicida'));
  });

  it('ítem 9 = 1 SÍ genera alerta de riesgo suicida (control positivo)', () => {
    const output = ejecutarZapier(CON_ALERTA);
    assert.strictEqual(output.phq9_puntaje, 1);
    assert.strictEqual(output.requiere_atencion_inmediata, true);
    assert.strictEqual(output.prioridad_maxima, 'alta');
    assert.ok(output.alertas_json.includes('riesgo_suicida'));
  });

  for (const vacio of ['', ' ', '   ', null, undefined, [], true]) {
    it(`ítem 9 = ${JSON.stringify(vacio)} detiene el flujo en vez de asumir "ningún día"`, () => {
      let lanzo = false;
      try {
        const output = ejecutarZapier(datosValidos({ phq9_9: vacio }));
        // Si llegara aqui seria el fallo grave: se asumio 0 sin alerta.
        assert.fail(
          `el flujo NO debe continuar: produjo puntaje ${output.phq9_puntaje} ` +
          `y requiere_atencion_inmediata=${output.requiere_atencion_inmediata}`
        );
      } catch (error) {
        lanzo = true;
        assert.ok(
          /phq9_9/.test(error.message),
          `el error debe identificar el campo phq9_9, recibio: ${error.message}`
        );
      }
      assert.strictEqual(lanzo, true);
    });
  }
});

describe('Coherencia entre el paso de Zapier y el motor de scoring', () => {
  it('el paso de Zapier y src/scoring producen los mismos puntajes', () => {
    const { calcularPHQ9, calcularGAD7, calcularWHO5 } = require('../src/scoring');
    const phq9 = [1, 2, 3, 0, 1, 2, 0, 3, 0];
    const gad7 = [2, 2, 1, 3, 0, 1, 2];
    const who5 = [4, 3, 5, 2, 1];

    const output = ejecutarZapier({
      ...datosValidos(),
      phq9_1: phq9[0], phq9_2: phq9[1], phq9_3: phq9[2], phq9_4: phq9[3],
      phq9_5: phq9[4], phq9_6: phq9[5], phq9_7: phq9[6], phq9_8: phq9[7],
      phq9_9: phq9[8],
      gad7_1: gad7[0], gad7_2: gad7[1], gad7_3: gad7[2], gad7_4: gad7[3],
      gad7_5: gad7[4], gad7_6: gad7[5], gad7_7: gad7[6],
      who5_1: who5[0], who5_2: who5[1], who5_3: who5[2], who5_4: who5[3],
      who5_5: who5[4]
    });

    assert.strictEqual(output.phq9_puntaje, calcularPHQ9(phq9).puntaje);
    assert.strictEqual(output.gad7_puntaje, calcularGAD7(gad7).puntaje);
    assert.strictEqual(output.who5_puntaje_bruto, calcularWHO5(who5).puntaje);
  });

  it('acepta cadenas numéricas legítimas de Google Forms', () => {
    const output = ejecutarZapier(datosValidos({
      phq9_1: '2', phq9_2: '2', phq9_9: '0',
      who5_1: '5', who5_5: '5'
    }));
    assert.strictEqual(output.phq9_puntaje, 4);
    assert.strictEqual(typeof output.phq9_puntaje, 'number');
  });

  it('rechaza valores numéricos fuera de rango del cuestionario', () => {
    assert.throws(() => ejecutarZapier(datosValidos({ who5_1: 6 })), /who5_1/);
    assert.throws(() => ejecutarZapier(datosValidos({ phq9_1: 4 })), /phq9_1/);
    assert.throws(() => ejecutarZapier(datosValidos({ gad7_1: -1 })), /gad7_1/);
  });

  it('rechaza números decimales', () => {
    assert.throws(() => ejecutarZapier(datosValidos({ phq9_1: 1.5 })), /phq9_1/);
  });
});
