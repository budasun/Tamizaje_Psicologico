# Flujo Detallado en Zapier

## Trigger: Google Forms - New Response in Spreadsheet

Se dispara cuando se envía una nueva respuesta al formulario.

### Campos esperados del Formulario

#### PHQ-9 (9 preguntas, escala 0-3)
- Encabezado del bloque en el formulario: **"Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?"** (`periodoReferencia` en `cuestionarios/phq9.json`)
- `phq9_1` a `phq9_9`: Valores numéricos 0-3

#### GAD-7 (7 preguntas, escala 0-3)
- Encabezado del bloque en el formulario: **"Durante las últimas 2 semanas"** (`periodoReferencia` en `cuestionarios/gad7.json`)
- `gad7_1` a `gad7_7`: Valores numéricos 0-3

#### WHO-5 (5 preguntas, escala 0-5)
- Encabezado del bloque en el formulario: **"Durante las últimas 2 semanas"** (`periodoReferencia` en `cuestionarios/who5.json`)
- `who5_1` a `who5_5`: Valores numéricos 0-5
- Etiquetas de la escala: 5 "Todo el tiempo" · 4 "La mayor parte del tiempo" · 3 "Más de la mitad del tiempo" · 2 "Menos de la mitad del tiempo" · 1 "Algunas veces" · 0 "En ningún momento"
- TODO: verificar las etiquetas contra la versión oficial de la OMS antes de producción

#### Datos del usuario
- `nombre`: Nombre completo (texto)
- `correo`: Email (texto)

## Paso 1: Code by Zapier (JavaScript)

**Archivo**: `zapier/codigo-pasos.js`

### Input Data (mapear en UI de Zapier)
```
phq9_1: {{phq9_1}} ... phq9_9: {{phq9_9}}
gad7_1: {{gad7_1}} ... gad7_7: {{gad7_7}}
who5_1: {{who5_1}} ... who5_5: {{who5_5}}
nombre: {{nombre}}
correo: {{correo}}
```

### Validación de entradas
Cada valor de `inputData` pasa por `convertirYValidarEntrada(valor, campo, min, max)`:
1. `Number(valor)` para coerción a número
2. Rechazo explícito si el resultado es `NaN` → `"<campo>: valor no numérico (...)"`
3. Rechazo si no es entero o está fuera de rango → `"<campo>: valor fuera de rango (...), debe ser entero entre min y max"`
4. Además `evaluarAlertas()` exige un arreglo PHQ-9 de 9 enteros 0-3 y lanza `Error` si no lo es

Ningún cálculo se ejecuta con datos inválidos: el flujo se detiene en este paso y el error queda visible en los logs de Zapier.

### Outputs disponibles para pasos siguientes
```
phq9_puntaje, phq9_nivel, phq9_etiqueta, phq9_respuestas
gad7_puntaje, gad7_nivel, gad7_etiqueta, gad7_respuestas
who5_puntaje_bruto, who5_puntaje_porcentaje, who5_nivel, who5_etiqueta, who5_respuestas
alertas_json, alertas_count, prioridad_maxima, requiere_atencion_inmediata
tiene_alertas, alertas_resumen
linea_crisis, avisos_legales
nombre, correo, fecha
```

## Paso 2: Google Sheets - Create Spreadsheet Row

### Hoja: `Respuestas_Tamizaje`

| Columna | Valor (mapear de output) |
|---------|-------------------------|
| ID | `{{zap_id}}` (ID único de Zapier) |
| Fecha | `{{fecha}}` |
| Nombre | `{{nombre}}` |
| Correo | `{{correo}}` |
| PHQ9_Puntaje | `{{phq9_puntaje}}` |
| PHQ9_Nivel | `{{phq9_nivel}}` |
| PHQ9_Etiqueta | `{{phq9_etiqueta}}` |
| PHQ9_Respuestas | `{{phq9_respuestas}}` |
| GAD7_Puntaje | `{{gad7_puntaje}}` |
| GAD7_Nivel | `{{gad7_nivel}}` |
| GAD7_Etiqueta | `{{gad7_etiqueta}}` |
| GAD7_Respuestas | `{{gad7_respuestas}}` |
| WHO5_Puntaje_Bruto | `{{who5_puntaje_bruto}}` |
| WHO5_Puntaje_Pct | `{{who5_puntaje_porcentaje}}` |
| WHO5_Nivel | `{{who5_nivel}}` |
| WHO5_Etiqueta | `{{who5_etiqueta}}` |
| WHO5_Respuestas | `{{who5_respuestas}}` |
| Alertas_Count | `{{alertas_count}}` |
| Prioridad_Maxima | `{{prioridad_maxima}}` |
| Requiere_Atencion_Inmediata | `{{requiere_atencion_inmediata}}` |
| Alertas_Resumen | `{{alertas_resumen}}` |

## Paso 3: Filter by Zapier (Opcional - Solo para alerta profesional)

**Condición**: `prioridad_maxima` **is** `alta` **OR** `prioridad_maxima` **is** `media`

## Paso 4: Gmail - Send Email (Resultados al Usuario)

**To**: `{{correo}}`
**Subject**: `Resultados de tu tamizaje de bienestar emocional`
**Body**: Usar plantilla `src/plantillas/correo-resultados.md` interpolando variables de output

### Variables para plantilla
```
{{nombre}}, {{phq9.puntaje}}, {{phq9_etiqueta}}, {{gad7_puntaje}}, {{gad7_etiqueta}},
{{who5_puntaje_bruto}}, {{who5_puntaje_porcentaje}}, {{who5_etiqueta}},
{{alertas_resumen}}, {{linea_crisis}}, {{avisos_legales}}
```

Las plantillas en `src/plantillas/` incluyen el `periodoReferencia` del PHQ-9 ("Durante las últimas 2 semanas...") para que la persona usuaria y el profesional interpreten el puntaje en el timeframe correcto.

## Paso 5: Gmail - Send Email (Alerta a Profesional) - Solo si paso 3 pasa

**To**: `profesional@clinica.ejemplo.com` (configurar)
**Subject**: `⚠️ ALERTA - Tamizaje requiere atención - {{nombre}} ({{fecha}})`
**Body**: Usar plantilla `src/plantillas/correo-alerta-profesional.md`

### Variables adicionales
```
{{alertas_json}}, {{prioridad_maxima}}, {{idRespuesta}} (usar zap_id)
```

## Manejo de Errores

- **Error en Code**: Zapier detiene el flujo, revisar logs
- **Error en Sheets**: Reintento automático de Zapier
- **Error en Gmail**: Reintento automático, verificar cuota
- **Validación**: El código lanza Error si inputs inválidos → visible en logs de Zapier

## Testing en Zapier

1. Usar datos de `datos-prueba/respuestas-ficticias.json`
2. En Code by Zapier: botón "Test" con sample data
3. Verificar outputs coinciden con tests unitarios (`tests/scoring.test.js`)
4. Probar flujo completo con Form de prueba