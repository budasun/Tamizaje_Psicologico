function calcularPHQ9(respuestas) {
  if (!Array.isArray(respuestas)) {
    throw new Error('Las respuestas deben ser un arreglo');
  }

  if (respuestas.length !== 9) {
    throw new Error('PHQ-9 requiere exactamente 9 respuestas');
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
    etiqueta = 'Sin depresión significativa';
  } else if (puntaje <= 9) {
    nivel = 'leve';
    etiqueta = 'Depresión leve';
  } else if (puntaje <= 14) {
    nivel = 'moderado';
    etiqueta = 'Depresión moderada';
  } else if (puntaje <= 19) {
    nivel = 'moderadamente_grave';
    etiqueta = 'Depresión moderadamente grave';
  } else {
    nivel = 'grave';
    etiqueta = 'Depresión grave';
  }

  return {
    puntaje,
    nivel,
    etiqueta,
    maximo: 27,
    minimo: 0,
    numItems: 9
  };
}

module.exports = { calcularPHQ9 };