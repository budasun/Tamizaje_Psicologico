# Plantilla: Alerta para Profesional de Salud Mental

**Asunto:** ⚠️ ALERTA - Tamizaje requiere atención profesional - {{nombre}} ({{fecha}})

---

## 📋 Información del Paciente (Datos Ficticios)
- **Nombre:** {{nombre}}
- **Correo:** {{correo}}
- **Fecha de tamizaje:** {{fecha}}
- **ID de respuesta:** {{idRespuesta}}

## 📊 Resultados del Tamizaje

### PHQ-9 (Depresión)
- **Periodo de referencia:** Durante las últimas 2 semanas, ¿con qué frecuencia le han molestado los siguientes problemas?
- **Puntaje:** {{phq9.puntaje}} / 27
- **Nivel:** {{phq9.etiqueta}}
- **Respuestas:** {{phq9.respuestas}}

### GAD-7 (Ansiedad)
- **Periodo de referencia:** Durante las últimas 2 semanas
- **Puntaje:** {{gad7.puntaje}} / 21
- **Nivel:** {{gad7.etiqueta}}
- **Respuestas:** {{gad7.respuestas}}

### WHO-5 (Bienestar)
- **Periodo de referencia:** Durante las últimas 2 semanas
- **Puntaje bruto:** {{who5.puntaje}} / 25
- **Puntaje (%%%):** {{who5.puntajePorcentaje}}%
- **Nivel:** {{who5.etiqueta}}
- **Respuestas:** {{who5.respuestas}}

## 🚨 Alertas Detectadas

{{#each alertas}}
### {{@index}} - {{this.tipo.toUpperCase()}}
- **Prioridad:** {{this.prioridad}}
- **Mensaje:** {{this.mensaje}}
{{#if this.item}}
- **Ítem PHQ-9:** {{this.item}} (valor: {{this.valor}})
{{/if}}
{{#if this.puntaje}}
- **Puntaje:** {{this.puntaje}}
{{/if}}
{{#if this.nivel}}
- **Nivel:** {{this.nivel}}
{{/if}}
---
{{/each}}

## 🎯 Prioridad General: {{prioridadMaxima}}

---

## 📝 Acciones Recomendadas

1. **Revisar** los resultados completos en Google Sheets
2. **Contactar** al paciente dentro de las próximas {{#if (eq prioridadMaxima "alta")}}24 horas{{else}}48-72 horas{{/if}}
3. **Evaluar** riesgo y determinar plan de acción
4. **Documentar** seguimiento en historial clínico

---

## ⚠️ Recordatorio Legal
- Este sistema utiliza **únicamente datos ficticios** para desarrollo y pruebas
- En producción, cumplir con **LFPDPPP** (Ley Federal de Protección de Datos Personales en Posesión de los Particulares)
- Obtener consentimiento informado por escrito
- Garantizar confidencialidad y seguridad de la información

---

*Sistema de tamizaje psicológico automatizado - Solo para fines de desarrollo/testing con datos ficticios*