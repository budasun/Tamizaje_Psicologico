# Plantilla: Correo con Resultados de Tamizaje

**Asunto:** Resultados de tu tamizaje de bienestar emocional

---

Hola **{{nombre}}**,

Gracias por completar el tamizaje de bienestar emocional. A continuación encontrarás tus resultados:

## 📊 Resumen de Resultados

### PHQ-9 (Depresión)
- **Periodo de referencia:** Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?
- **Puntaje:** {{phq9.puntaje}} / 27
- **Nivel:** {{phq9.etiqueta}}

### GAD-7 (Ansiedad)
- **Periodo de referencia:** Durante las últimas 2 semanas
- **Puntaje:** {{gad7.puntaje}} / 21
- **Nivel:** {{gad7.etiqueta}}

### WHO-5 (Bienestar)
- **Periodo de referencia:** Durante las últimas 2 semanas
- **Puntaje bruto:** {{who5.puntaje}} / 25
- **Puntaje (%%):** {{who5.puntajePorcentaje}}%
- **Nivel:** {{who5.etiqueta}}

---

## ⚠️ Importante: Esto es un tamizaje, NO un diagnóstico

Estos resultados **no sustituyen una evaluación profesional**. Son una herramienta orientativa para identificar si podrías beneficiarte de una consulta con un profesional de la salud mental.

{{#if alertas.length}}
## 🚨 Recomendaciones basadas en tus resultados

{{#each alertas}}
- **{{this.tipo}}** (Prioridad: {{this.prioridad}}): {{this.mensaje}}
{{/each}}
{{/if}}

## 📞 ¿Necesitas apoyo?

**Línea de la Vida (México): 800 911 2000**
Disponible 24/7, gratuita y confidencial.

Si sientes que estás en crisis o tienes pensamientos de hacerte daño, **busca ayuda inmediata**:
- Acude a urgencias del hospital más cercano
- Llama al 911
- Contacta a la Línea de la Vida: **800 911 2000**

---

*Este es un mensaje automático generado por el sistema de tamizaje psicológico automatizado. Tus respuestas se tratan con confidencialidad de acuerdo con la LFPDPPP.*