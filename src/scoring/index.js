const { calcularPHQ9 } = require('./phq9');
const { calcularGAD7 } = require('./gad7');
const { calcularWHO5 } = require('./who5');

function calcularTodos(resultados) {
  const { phq9, gad7, who5 } = resultados;

  const resultadoPHQ9 = calcularPHQ9(phq9);
  const resultadoGAD7 = calcularGAD7(gad7);
  const resultadoWHO5 = calcularWHO5(who5);

  return {
    phq9: resultadoPHQ9,
    gad7: resultadoGAD7,
    who5: resultadoWHO5
  };
}

module.exports = {
  calcularPHQ9,
  calcularGAD7,
  calcularWHO5,
  calcularTodos
};