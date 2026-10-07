# Arquitectura del Sistema

## Visión General

Sistema de tamizaje psicológico automatizado que integra:
- **Google Forms**: Recolección de respuestas (frontend para el usuario)
- **Zapier**: Orquestación y lógica de negocio (Code by Zapier en JavaScript)
- **Google Sheets**: Almacenamiento de resultados y trazabilidad
- **Gmail**: Notificaciones al usuario y alertas a profesionales

## Componentes

### 1. Cuestionarios (`cuestionarios/`)
- PHQ-9 (9 ítems, depresión) — `periodoReferencia`: "Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?"
- GAD-7 (7 ítems, ansiedad) — `periodoReferencia`: "Durante las últimas 2 semanas"
- WHO-5 (5 ítems, bienestar, escala 0-5) — `periodoReferencia`: "Durante las últimas 2 semanas"
- Formato JSON con `periodoReferencia`, preguntas, opciones y rangos de interpretación
- Los tres cuestionarios comparten periodo de referencia (últimas 2 semanas); se muestra en los correos al usuario y al profesional para que el resultado se interprete en el timeframe correcto

### Escala de respuesta del WHO-5 (0-5)

| Valor | Etiqueta |
|-------|----------|
| 5 | Todo el tiempo |
| 4 | La mayor parte del tiempo |
| 3 | Más de la mitad del tiempo |
| 2 | Menos de la mitad del tiempo |
| 1 | Algunas veces |
| 0 | En ningún momento |

> La redacción debe verificarse contra la versión oficial de la OMS. Ver el `TODO` en `cuestionarios/who5.json`.

### 2. Motor de Scoring (`src/scoring/`)
- Funciones puras en JavaScript sin dependencias externas
- Validación de entrada (número de items, rangos válidos)
- Retorna: `{ puntaje, nivel, etiqueta, ... }`

### 3. Reglas de Alertas (`src/alertas/reglas.js`)
- Evaluación automática basada en umbrales clínicos
- Tres niveles de prioridad: alta, media, baja
- Regla crítica: ítem 9 PHQ-9 > 0 = alerta inmediata
- `validarRespuestasPHQ9()` exige un arreglo de exactamente 9 enteros 0-3; si no, lanza `Error` (fail-fast: nunca se omite silenciosamente la regla del ítem 9)

### 4. Plantillas (`src/plantillas/`)
- Correo de resultados para el usuario
- Correo de alerta para profesional de salud mental

### 5. Integración Zapier (`zapier/codigo-pasos.js`)
- Código autónomo listo para pegar en "Code by Zapier"
- Reutiliza toda la lógica de scoring y alertas
- Convierte cada valor de `inputData` con `Number()` vía `convertirYValidarEntrada()` y rechaza `NaN` o valores fuera de rango **antes** de calcular
- Expone outputs mapeables a Sheets y Gmail

## Flujo de Datos

```
Google Forms → Zapier (Code) → Google Sheets
                    ↓
              Gmail (usuario)
                    ↓
         [Si alerta] Gmail (profesional)
```

## Consideraciones Técnicas

- **Sin base de datos**: Google Sheets actúa como store
- **Stateless**: Cada ejecución de Zapier es independiente
- **Validación temprana**: Errores en Code by Zapier detienen el flujo
- **Observabilidad**: Logs en Zapier + filas en Sheets para auditoría