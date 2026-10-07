function calcularWHO5(respuestas) {
  if (!Array.isArray(respuestas)) {
    throw new Error('Las respuestas deben ser un arreglo');
  }

  if (respuestas.length !== 5) {
    throw new Error('WHO-5 requiere exactamente 5 respuestas');
  }

  for (let i = 0; i < respuestas.length; i++) {
    const valor = respuestas[i];
    if (!Number.isInteger(valor) || valor < 0 || valor > 5) {
      throw new Error(`Respuesta inválida en el ítem ${i + 1}: debe ser un entero entre 0 y 5`);
    }
  }

  const puntajeBruto = respuestas.reduce((suma, valor) => suma + valor, 0);
  const puntajePorcentaje = puntajeBruto * 4;

  let nivel;
  let etiqueta;

  if (puntajeBruto <= 12) {
    nivel = 'bajo';
    etiqueta = 'Bienestar bajo (se recomienda evaluación)';
  } else {
    nivel = 'normal';
    etiqueta = 'Bienestar normal';
  }

  return {
    puntaje: puntajeBruto,
    puntajePorcentaje,
    nivel,
    etiqueta,
    maximo: 25,
    minimo: 0,
    numItems: 5
  };
}

module.exports = { calcularWHO5 };