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

## Instalación y Pruebas

```bash
# Clonar / entrar al directorio
cd tamizaje-psicologico-automatizado

# Instalar dependencias (ninguna requerida, solo Node.js nativo)
npm install

# Ejecutar pruebas
npm test
```

### Requisitos
- **Node.js 18+** (para `node:test` runner nativo)
- Cuenta de Google (Forms, Sheets, Gmail)
- Cuenta de Zapier (plan que permita Code by Zapier)

## Estructura del Proyecto

```
tamizaje-psicologico-automatizado/
├── README.md
├── .gitignore
├── package.json
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
│   └── scoring.test.js
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
- **Testing**: Node.js native test runner (`node:test`), cobertura de límites, casos edge
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