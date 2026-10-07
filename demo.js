const fs = require('node:fs');
const path = require('node:path');

const { calcularPHQ9, calcularGAD7, calcularWHO5 } = require('./src/scoring');
const {
  evaluarAlertas,
  tieneAlertaAlta,
  obtenerPrioridadMaxima
} = require('./src/alertas/reglas');

const RUTA_DATOS = path.join(__dirname, 'datos-prueba', 'respuestas-ficticias.json');

function cargarPerfiles() {
  const contenido = fs.readFileSync(RUTA_DATOS, 'utf8');
  return JSON.parse(contenido);
}

function procesarPerfil(perfil) {
  const phq9 = calcularPHQ9(perfil.phq9);
  const gad7 = calcularGAD7(perfil.gad7);
  const who5 = calcularWHO5(perfil.who5);

  const alertas = evaluarAlertas({ phq9, gad7, who5 }, perfil.phq9);

  return {
    id: perfil.id,
    nombre: perfil.nombre,
    phq9,
    gad7,
    who5,
    alertas,
    prioridadMaxima: obtenerPrioridadMaxima(alertas),
    requiereAtencionInmediata: tieneAlertaAlta(alertas)
  };
}

function imprimirTabla(resultados) {
  const filas = resultados.map(r => ({
    'ID': r.id,
    'Perfil': r.nombre,
    'PHQ-9': `${r.phq9.puntaje}/27`,
    'PHQ-9 nivel': r.phq9.nivel,
    'GAD-7': `${r.gad7.puntaje}/21`,
    'GAD-7 nivel': r.gad7.nivel,
    'WHO-5': `${r.who5.puntaje}/25`,
    'WHO-5 nivel': r.who5.nivel,
    'Alertas': r.alertas.length,
    'Prioridad': r.prioridadMaxima
  }));

  console.table(filas);
}

function imprimirDetalleAlertas(resultados) {
  const conAlertas = resultados.filter(r => r.alertas.length > 0);

  if (conAlertas.length === 0) {
    console.log('Ningun perfil genero alertas.\n');
    return;
  }

  console.log('Detalle de alertas');
  console.log('------------------');

  for (const r of conAlertas) {
    console.log(`\n${r.id} - ${r.nombre}  [prioridad: ${r.prioridadMaxima}]`);
    for (const a of r.alertas) {
      const item = a.item ? ` (item ${a.item}, valor ${a.valor})` : '';
      console.log(`  - ${a.tipo}${item}`);
      console.log(`    ${a.mensaje}`);
    }
  }
  console.log('');
}

function imprimirResumen(resultados) {
  const total = resultados.length;
  const conAlta = resultados.filter(r => r.requiereAtencionInmediata).length;
  const conMedia = resultados.filter(r => r.prioridadMaxima === 'media').length;
  const sinAlerta = resultados.filter(r => r.alertas.length === 0).length;

  console.log('Resumen');
  console.log('-------');
  console.log(`  Perfiles procesados ........ ${total}`);
  console.log(`  Sin alerta ................. ${sinAlerta}`);
  console.log(`  Alerta media ............... ${conMedia}`);
  console.log(`  Alerta alta (inmediata) .... ${conAlta}`);
  console.log('');
}

function main() {
  console.log('Tamizaje psicologico automatizado - Demo');
  console.log('=========================================');
  console.log('');

  let perfiles;
  try {
    perfiles = cargarPerfiles();
  } catch (error) {
    console.error(`No se pudo leer ${RUTA_DATOS}: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const resultados = perfiles.map(procesarPerfil);

  imprimirTabla(resultados);
  imprimirDetalleAlertas(resultados);
  imprimirResumen(resultados);

  console.log('Aviso: esto es un tamizaje, NO un diagnostico.');
  console.log('Los datos usados son ficticios, unicamente para desarrollo.');
  console.log('En caso de crisis real: Linea de la Vida 800 911 2000 (Mexico, 24/7).');
}

main();
