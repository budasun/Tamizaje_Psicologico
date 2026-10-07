function calcularGAD7(respuestas) {
  if (!Array.isArray(respuestas)) {
    throw new Error('Las respuestas deben ser un arreglo');
  }

  if (respuestas.length !== 7) {
    throw new Error('GAD-7 requiere exactamente 7 respuestas');
  }

  for (let i = 0; i < respuestas.length; i++) {
    const valor = respuestas[i];
    if (!Number.isInteger(valor) || valor < 0 || valor > 3) {
      throw new Error(`Respuesta inválida en el ítem ${i + 1}: debe ser un entero entre 0 y 3`);
    }
  }

  const puntaje = respuestas.reduce((suma, valor) => suma + valor, 0);

  let nivel;
  let etiqueta;

  if (puntaje <= 4) {
    nivel = 'ninguno';
    etiqueta = 'Sin ansiedad significativa';
  } else if (puntaje <= 9) {
    nivel = 'leve';
    etiqueta = 'Ansiedad leve';
  } else if (puntaje <= 14) {
    nivel = 'moderado';
    etiqueta = 'Ansiedad moderada';
  } else {
    nivel = 'grave';
    etiqueta = 'Ansiedad grave';
  }

  return {
    puntaje,
    nivel,
    etiqueta,
    maximo: 21,
    minimo: 0,
    numItems: 7
  };
}

module.exports = { calcularGAD7 };