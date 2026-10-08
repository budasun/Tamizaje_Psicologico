# Tamizaje Psicológico Automatizado

> ⚠️ **AVISO IMPORTANTE**: Esta es una herramienta de **tamizaje (screening)**, **NO de diagnóstico**. Los resultados deben ser interpretados y validados por un profesional de la salud mental calificado. En caso de crisis, contacte a la Línea de la Vida: **800 911 2000** (México, 24/7, gratuito).

## Descripción

Sistema automatizado de tamizaje psicológico que integra **Google Forms**, **Zapier (Code by Zapier en JavaScript)**, **Google Sheets** y **Gmail** para la detección temprana de síntomas de depresión, ansiedad y bajo bienestar emocional.

Todos los contenidos orientados al usuario están en **español de México**. El proyecto utiliza **únicamente datos ficticios** para desarrollo y pruebas.

## Cuestionarios Incluidos

| Cuestionario | Ítems | Rango | Qué Mide |
|--------------|-------|-------|----------|
| **PHQ-9** | 9 | 0–27 | Severidad de síntomas depresivos (periodo de referencia: últimas 2 semanas) |
| **GAD-7** | 7 | 0–21 | Severidad de ansiedad generalizada (periodo de referencia: últimas 2 semanas) |
| **WHO-5** | 5 | 0–25 (×4 = 0–100%) | Bienestar emocional (escala 0–5, periodo de referencia: últimas 2 semanas) |

Escala de respuesta del WHO-5: 5 "Todo el tiempo" · 4 "La mayor parte del tiempo" · 3 "Más de la mitad del tiempo" · 2 "Menos de la mitad del tiempo" · 1 "Algunas veces" · 0 "En ningún momento".

## Flujo del Sistema

```
┌─────────────┐     ┌──────────────────┐     ┌───────────────┐
│ Google Forms│────▶│  Zapier (Code)   │────▶│ Google Sheets │
│  (Usuario)  │     │  • Scoring       │     │  (Registro)   │
│             │     │  • Alertas       │     │               │
└─────────────┘     └────────┬─────────┘     └───────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       ┌─────────────┐               ┌─────────────┐
       │   Gmail     │               │   Gmail     │
       │ (Resultados │               │  (Alerta    │
       │  Usuario)   │               │ Profesional)│
       └─────────────┘               └─────────────┘
              │                             │
              ▼                             ▼
       ┌─────────────────────────────────────────┐
       │     Línea de la Vida: 800 911 2000     │
       │     (En TODOS los correos al usuario)   │
       └─────────────────────────────────────────┘
```

### Detalle del Flujo

1. **Usuario** completa formulario en Google Forms (PHQ-9 + GAD-7 + WHO-5)
2. **Zapier** detecta nueva respuesta → ejecuta `zapier/codigo-pasos.js`
3. **Código** calcula scores, evalúa alertas, prepara outputs
4. **Google Sheets** recibe fila con todos los datos + alertas
5. **Gmail** envía resultados al usuario (siempre con línea de crisis)
6. **Si hay alerta media/alta** → Gmail envía alerta a profesional

## Reglas de Alerta

| Condición | Prioridad | Acción |
|-----------|-----------|--------|
| PHQ-9 ítem 9 > 0 (pensamientos autolesión) | **ALTA** (Inmediata) | Alerta urgente a profesional + línea de crisis prominente |
| PHQ-9 ≥ 10 (moderado o superior) | MEDIA | Alerta a profesional en 24-48h |
| GAD-7 ≥ 10 (moderado o superior) | MEDIA | Alerta a profesional en 24-48h |
| WHO-5 ≤ 12 (bienestar bajo, "se recomienda evaluación") | MEDIA | Alerta a profesional en 24-48h |

**Fail-fast en el ítem 9**: si las respuestas del PHQ-9 no son un arreglo válido de 9 enteros (0–3), `evaluarAlertas()` lanza un `Error` en lugar de omitir la regla de riesgo suicida.

**Fail-fast en las entradas de Zapier**: `convertirYValidarEntrada()` valida el tipo *antes* de aplicar `Number()`. Esto importa porque `Number()` no devuelve `NaN` para todos los valores ausentes:

| Entrada | `Number()` | Sin la validación previa |
|---------|-----------|--------------------------|
| `""` | `0` | se aceptaba como "ningún día" |
| `" "` | `0` | se aceptaba como "ningún día" |
| `null` | `0` | se aceptaba como "ningún día" |
| `[]` | `0` | se aceptaba como "ningún día" |
| `undefined` | `NaN` | correcto |
| `"3abc"` | `NaN` | correcto |

Sin esa comprobación, una respuesta en blanco en el ítem 9 se leía como `0` y **no disparaba la alerta de riesgo suicida**: un falso negativo silencioso en la regla más grave del sistema. Ahora una respuesta vacía, nula o malformada detiene el flujo con un `Error` que identifica el campo exacto, y solo se aceptan cadenas con contenido o números.

## Instalación y Pruebas

```bash
# Clonar / entrar al directorio
cd tamizaje-psicologico-automatizado

# Ejecutar pruebas (49 pruebas con node:test)
npm test

# Ejecutar la demo con datos ficticios
npm run demo
```

No hay dependencias de npm que instalar: el proyecto usa solo el runtime de Node.js.

### `npm run demo`

Procesa los 8 perfiles de `datos-prueba/respuestas-ficticias.json` y muestra en consola:

- Una tabla con perfil, puntajes (PHQ-9, GAD-7, WHO-5), niveles, número de alertas y prioridad máxima
- El detalle de cada alerta generada, agrupado por perfil
- Un resumen con conteo por nivel de prioridad

No requiere credenciales ni servicios externos: todo corre localmente.

Salida resumida:

```
ID         Perfil                    PHQ-9   GAD-7   WHO-5   Alertas  Prioridad
resp-001   María González López      1/27    0/21    25/25   0        baja
resp-005   Laura Elena Sánchez       24/27   19/21   1/25    4        alta
resp-006   Roberto Carlos Díaz       5/27    0/21    22/25   1        alta
```

> `resp-006` ilustra la regla fail-safe: un puntaje total bajo (PHQ-9 5/27, nivel leve) pero con respuesta positiva en el ítem 9 dispara alerta de prioridad **alta** e inmediata.

### Requisitos
- **Node.js 18+** (para `node:test` runner nativo)
- Cuenta de Google (Forms, Sheets, Gmail)
- Cuenta de Zapier (plan que permita Code by Zapier)

## Estructura del Proyecto

```
tamizaje-psicologico-automatizado/
├── README.md
├── .gitignore
├── .gitattributes
├── package.json
├── demo.js                # demo local con datos ficticios (npm run demo)
├── docs/
│   ├── arquitectura.md
│   ├── flujo-zapier.md
│   ├── protocolo-crisis.md
│   └── privacidad.md
├── cuestionarios/
│   ├── phq9.json
│   ├── gad7.json
│   └── who5.json
├── src/
│   ├── scoring/
│   │   ├── phq9.js
│   │   ├── gad7.js
│   │   ├── who5.js
│   │   └── index.js
│   ├── alertas/
│   │   └── reglas.js
│   └── plantillas/
│       ├── correo-resultados.md
│       └── correo-alerta-profesional.md
├── tests/
│   ├── scoring.test.js
│   └── zapier-codigo.test.js
├── datos-prueba/
│   └── respuestas-ficticias.json
└── zapier/
    └── codigo-pasos.js
```

## Configuración en Zapier

Ver guía completa en [`docs/flujo-zapier.md`](docs/flujo-zapier.md).

### Resumen Rápido

1. **Trigger**: Google Forms → New Response in Spreadsheet
2. **Action**: Code by Zapier (JavaScript) → Pegar contenido de `zapier/codigo-pasos.js`
   - Mapear `inputData` con campos del formulario
3. **Action**: Google Sheets → Create Spreadsheet Row
   - Mapear todos los `output` a columnas
4. **Action**: Filter by Zapier (opcional) → `prioridad_maxima` es `alta` o `media`
5. **Action**: Gmail → Send Email (usuario) → Plantilla `correo-resultados.md`
6. **Action**: Gmail → Send Email (profesional) → Plantilla `correo-alerta-profesional.md` (solo si paso 4 pasa)

## Datos de Prueba

Archivo: `datos-prueba/respuestas-ficticias.json`

8 perfiles ficticios que cubren:
- Sin síntomas (bienestar alto)
- Leve (PHQ-9/GAD-7 leve, WHO-5 normal)
- Moderado (alertas medias)
- Grave (alertas medias)
- **Riesgo suicida** (ítem 9 PHQ-9 > 0, prioridad ALTA)
- Bienestar bajo (WHO-5 < 13)

## Documentación

| Archivo | Contenido |
|---------|-----------|
| `docs/arquitectura.md` | Visión general, componentes, flujo de datos |
| `docs/flujo-zapier.md` | Configuración paso a paso en Zapier |
| `docs/protocolo-crisis.md` | Línea de la Vida, escalamiento, responsabilidades |
| `docs/privacidad.md` | LFPDPPP, consentimiento, medidas de seguridad, checklist producción |

## Habilidades Demostradas

- **JavaScript moderno**: ES Modules, funciones puras, validación robusta, sin dependencias externas
- **Automatización con Zapier**: Code by Zapier, mapeo de datos, manejo de errores, flujos condicionales
- **Google Workspace APIs**: Forms, Sheets, Gmail integration via Zapier
- **Diseño centrado en la persona usuaria**:
  - Lenguaje claro en español de México
  - Línea de crisis en **todas** las comunicaciones
  - Aviso prominente de "tamizaje, no diagnóstico"
  - Privacidad by design (LFPDPPP, datos sensibles)
  - Protocolo de crisis con escalamiento humano
- **Testing**: Node.js native test runner (`node:test`), 73 pruebas con cobertura de límites y casos edge, incluyendo el archivo real de Zapier ejecutado como en producción
- **Demo ejecutable**: Script de consola que procesa datos ficticios de extremo a extremo sin servicios externos
- **Documentación técnica**: Arquitectura, flujos, protocolos, cumplimiento legal

## Próximos Pasos (Roadmap)

- [ ] Implementar envío real de correos (Nodemailer / Gmail API)
- [ ] Dashboard de seguimiento (Looker Studio / Google Data Studio)
- [ ] Validación de redacción oficial de cuestionarios (TODO en JSONs)
- [ ] Versión multilingüe (es-MX, en-US)
- [ ] API REST propia (reemplazar Zapier para mayor control)
- [ ] Auditoría de seguridad y penetración pre-producción
- [ ] Consentimiento digital firmado (e.firma / DocuSign)

## Licencia

MIT — Solo para fines educativos y de desarrollo. **No usar en producción sin cumplimiento legal completo (LFPDPPP, NOMs, ética profesional).**

---

**¿Preguntas?** Revisa `docs/` o abre un issue.