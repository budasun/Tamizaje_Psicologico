# Tamizaje Psicológico Automatizado

Flujo automatizado que aplica tres cuestionarios de tamizaje (PHQ-9, GAD-7 y WHO-5), calcula puntajes, detecta casos que requieren atención prioritaria y avisa a un profesional. La lógica está en JavaScript puro, sin dependencias, con pruebas automatizadas y un demo que corre sin cuentas ni servicios externos.

> **Aviso:** esto es una herramienta de **tamizaje, no de diagnóstico**. Los resultados deben ser interpretados por un profesional de la salud mental. En México, en caso de crisis: Línea de la Vida **800 911 2000** (verifica el número vigente).
> Todos los datos del proyecto son **ficticios**.

## El problema y la solución

Un tamizaje en papel o en hoja de cálculo se califica a mano, tarde y con errores. Peor aún, una respuesta de riesgo (pensamientos de hacerse daño) puede quedar enterrada si el puntaje total es bajo.

Este proyecto automatiza el proceso completo: formulario → cálculo → registro → correos → alerta al profesional. Su regla central es que **la respuesta al ítem 9 del PHQ-9 manda sobre el puntaje total**.

## Estado del proyecto

| Componente | Estado |
|---|---|
| Lógica de puntuación (PHQ-9, GAD-7, WHO-5) | Listo, con pruebas |
| Reglas de alerta | Listo, con pruebas |
| Demo local con datos ficticios | Listo |
| Flujo en Google Forms + Zapier + Sheets + Gmail | En construcción (capturas próximamente) |
| Verificación de textos contra versiones oficiales en español | Pendiente |

## Demo en 30 segundos

Requiere Node.js 18 o superior. No hay nada que instalar.

```bash
git clone https://github.com/budasun/Tamizaje_Psicologico
cd Tamizaje_Psicologico
npm test        # pruebas automatizadas
npm run demo    # procesa 8 perfiles ficticios
```

Salida resumida del demo:

```
ID         Perfil                    PHQ-9   GAD-7   WHO-5   Alertas  Prioridad
resp-001   María González López      1/27    0/21    25/25   0        baja
resp-004   Jorge Luis Hernández      18/27   15/21   10/25   3        media
resp-005   Laura Elena Sánchez       24/27   19/21   1/25    4        alta
resp-006   Roberto Carlos Díaz       5/27    0/21    22/25   1        alta
```

`resp-006` es el caso que justifica el diseño: PHQ-9 total de 5 (nivel leve), pero con respuesta positiva en el ítem 9. Sin esa regla, el perfil iría a la cola normal. Con ella, sale con **prioridad alta e inmediata**.

## Cómo funciona

```
Google Forms ──▶ Zapier (Code by Zapier) ──▶ Google Sheets (registro)
 (persona)        • valida entradas                │
                  • calcula puntajes               ▼
                  • evalúa alertas          Gmail ──▶ resultados a la persona
                                                  └─▶ alerta al profesional
                                                      (si hay prioridad media o alta)
```

1. La persona responde el formulario.
2. Zapier detecta la respuesta y ejecuta `zapier/codigo-pasos.js`.
3. El código valida, calcula puntajes y evalúa las alertas.
4. Se registra una fila en Google Sheets.
5. La persona recibe sus resultados, siempre con la línea de crisis.
6. Si hay alerta media o alta, se avisa a un profesional.

## Reglas de alerta

| Condición | Prioridad | Acción prevista |
|---|---|---|
| PHQ-9, ítem 9 mayor que 0 | **Alta** | Aviso inmediato al profesional |
| PHQ-9 de 10 o más | Media | Aviso al profesional en 24–48 h |
| GAD-7 de 10 o más | Media | Aviso al profesional en 24–48 h |
| WHO-5 de 12 o menos | Media | Aviso al profesional en 24–48 h |

## Configuración paso a paso en Zapier

Detalle campo por campo en [`docs/flujo-zapier.md`](docs/flujo-zapier.md).

**1. Disparador.** Google Forms → *New Response in Spreadsheet*.

**2. Code by Zapier** (JavaScript). Pega `zapier/codigo-pasos.js` sin modificarlo y mapea las 23 entradas en *Input Data*:

| Entrada | Origen en el formulario |
|---|---|
| `phq9_1` … `phq9_9` | Ítems 1 a 9 del PHQ-9 (0–3) |
| `gad7_1` … `gad7_7` | Ítems 1 a 7 del GAD-7 (0–3) |
| `who5_1` … `who5_5` | Ítems 1 a 5 del WHO-5 (0–5) |
| `nombre`, `correo` | Datos de contacto |

Los 21 campos numéricos pasan por `convertirYValidarEntrada()`. Si alguno llega vacío o malformado, el paso lanza un error y el Zap se detiene en lugar de adivinar un valor.

**3. Google Sheets → Create Spreadsheet Row.** Una columna por dato:

| Columna | Output del paso 2 |
|---|---|
| Fecha, Nombre, Correo | `fecha`, `nombre`, `correo` |
| PHQ-9 | `phq9_puntaje`, `phq9_nivel`, `phq9_respuestas` |
| GAD-7 | `gad7_puntaje`, `gad7_nivel`, `gad7_respuestas` |
| WHO-5 | `who5_puntaje_bruto`, `who5_puntaje_porcentaje`, `who5_nivel`, `who5_respuestas` |
| Alertas | `alertas_count`, `prioridad_maxima`, `requiere_atencion_inmediata`, `alertas_json` |

**4. Filter by Zapier** (opcional, solo para el correo al profesional): continuar si `prioridad_maxima` es `alta` **o** `media`.

**5. Gmail → Send Email** a la persona. Usa [`src/plantillas/correo-resultados.md`](src/plantillas/correo-resultados.md) e interpola los `output`. Este correo va **siempre**, tenga o no alertas, e incluye la línea de crisis y el aviso de que es tamizaje y no diagnóstico.

**6. Gmail → Send Email** al profesional. Solo si el filtro del paso 4 pasa. Usa [`src/plantillas/correo-alerta-profesional.md`](src/plantillas/correo-alerta-profesional.md), que además muestra el periodo de referencia del PHQ-9 para que el profesional interprete el puntaje en el timeframe correcto.

## Decisiones de diseño

- **Falla de forma visible, nunca en silencio.** Si las respuestas del PHQ-9 no son 9 enteros válidos, o hay valores vacíos, la función lanza un error en lugar de omitir la regla de riesgo. En Zapier, eso detiene el Zap y deja constancia, en vez de ocultar un caso.
- **El tipo se valida antes de convertir, no después.** Parece un detalle, pero `Number()` no devuelve `NaN` para todo lo que falta: `""`, `" "`, `null` y `[]` se convierten en **0**, y `true` en 1. Todos pasaban la validación de rango 0–3 como si fueran un cero legítimo, así que una respuesta en blanco en el ítem 9 se leía como "ningún día" y **no disparaba la alerta de riesgo suicida**: un falso negativo silencioso en la regla más grave del sistema, que mandaba a esa persona a la cola normal de 24–48 h en lugar de atención inmediata. Por eso se rechaza `null`, `undefined`, las cadenas vacías o solo con espacios, y cualquier tipo que no sea texto o número, *antes* de llamar a `Number()`.
- **Validación en la frontera.** Los datos llegan de Zapier como texto. Se convierten y validan una sola vez al entrar; el resto del código trabaja con números ya validados.
- **Funciones puras y sin dependencias.** Es fácil de probar, de auditar y de pegar en un paso de Code by Zapier, que no puede importar archivos locales.
- **Pruebas en los límites.** Cada rango se prueba en sus extremos (por ejemplo, WHO-5 de 12 contra 13) y las reglas de alerta se prueban en conjunto.
- **Datos ficticios por diseño.** El proyecto nunca maneja información de personas reales.

## Cuestionarios

| Cuestionario | Ítems | Rango | Qué mide |
|---|---|---|---|
| PHQ-9 | 9 | 0–27 | Síntomas depresivos, últimas 2 semanas |
| GAD-7 | 7 | 0–21 | Ansiedad generalizada, últimas 2 semanas |
| WHO-5 | 5 | 0–25 (×4 = 0–100 %) | Bienestar emocional, últimas 2 semanas |

## Estructura

```
├── cuestionarios/   preguntas, opciones y rangos (JSON)
├── src/
│   ├── scoring/     puntuación de cada prueba
│   ├── alertas/     reglas de prioridad
│   └── plantillas/  correos a la persona y al profesional
├── zapier/          código autocontenido para Code by Zapier
├── tests/           pruebas con node:test
├── datos-prueba/    perfiles ficticios
├── docs/            arquitectura, flujo de Zapier, protocolo de crisis, privacidad
└── demo.js          demo ejecutable sin servicios externos
```

Documentación en `docs/`:

- [`docs/flujo-zapier.md`](docs/flujo-zapier.md) — mapeo de campos, outputs y manejo de errores
- [`docs/arquitectura.md`](docs/arquitectura.md) — componentes, flujo de datos y decisiones técnicas
- [`docs/protocolo-crisis.md`](docs/protocolo-crisis.md) — escalamiento por prioridad y líneas de crisis
- [`docs/privacidad.md`](docs/privacidad.md) — LFPDPPP, consentimiento expreso y checklist previo a producción

## Stack y habilidades

- **JavaScript (Node.js, CommonJS):** funciones puras, validación de entradas, cero dependencias.
- **Pruebas automatizadas:** 73 pruebas con `node:test`, entre casos límite, errores de validación y el archivo real de Zapier ejecutado con `inputData` inyectada, igual que el runtime de Code by Zapier.
- **Automatización con Zapier:** Code by Zapier y mapeo de datos (flujo en construcción).
- **Google Workspace:** Forms, Sheets y Gmail integrados mediante Zapier (en construcción).
- **Diseño centrado en la persona usuaria:** lenguaje claro en español de México, línea de crisis en cada comunicación y aviso visible de "tamizaje, no diagnóstico".
- **Documentación técnica:** arquitectura, protocolo de crisis y consideraciones de privacidad.

## Limitaciones y siguientes pasos

- Los textos en español son una adaptación **pendiente de verificar** contra las versiones oficiales validadas. No usar con personas reales hasta hacerlo.
- No es un dispositivo clínico ni sustituye la valoración de un profesional.
- El envío de correos depende de Zapier y Gmail; falta publicar el flujo con capturas.
- Siguientes pasos: verificar textos oficiales, publicar el flujo con capturas, agregar integración continua (GitHub Actions) que corra las pruebas en cada cambio y un tablero de seguimiento en Looker Studio.

## Créditos y atribución

PHQ-9 y GAD-7 fueron desarrollados por Spitzer, Williams, Kroenke y colegas, con apoyo educativo de Pfizer. WHO-5 es un instrumento de la Organización Mundial de la Salud. *(Verifica los textos de atribución exactos de cada instrumento antes de publicar.)*

## Licencia

MIT. Solo para fines educativos y de desarrollo; no usar en producción sin cumplir la normativa aplicable (LFPDPPP, NOM) ni contar con supervisión profesional.

---

## English summary

Automated mental-health screening workflow (PHQ-9, GAD-7, WHO-5) built with plain JavaScript, Google Forms, Zapier, Google Sheets and Gmail. It validates inputs, scores each questionnaire, and flags high-priority cases, most importantly any positive answer to PHQ-9 item 9, regardless of total score. Dependency-free logic, automated tests (`node:test`), and a runnable local demo with fictitious data. **Screening tool, not a diagnosis. Zapier flow in progress; Spanish wording pending verification against official versions.**

```bash
npm test && npm run demo
```
