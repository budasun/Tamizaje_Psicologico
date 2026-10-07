# Privacidad y Protección de Datos

## Marco Legal Aplicable (México)

### LFPDPPP
**Ley Federal de Protección de Datos Personales en Posesión de los Particulares**
- Regula el tratamiento de datos personales por privados
- Requiere: consentimiento, aviso de privacidad, derechos ARCO
- Aplicable a este sistema en entorno de producción

### Normas Complementarias
- **Reglamento de la LFPDPPP**
- **Lineamientos del Aviso de Privacidad**
- **NOM-024-SSA3-2012** (Expediente clínico electrónico)
- **NOM-004-SSA3-2012** (Archivo clínico)

## Clasificación de Datos

| Tipo de Dato | Sensibilidad | Tratamiento Requerido |
|-------------|--------------|----------------------|
| Nombre, correo | Datos personales | Consentimiento, aviso de privacidad |
| Respuestas PHQ-9/GAD-7/WHO-5 | **Datos sensibles (salud mental)** | Consentimiento **expreso y por escrito**, medidas de seguridad reforzadas |
| Resultados scoring | Datos sensibles derivados | Mismo tratamiento que respuestas |
| Alertas generadas | Datos sensibles + riesgo | Acceso restringido a personal autorizado |

## Principios de Tratamiento (Art. 16 LFPDPPP)

1. **Licitud**: Base legal clara (consentimiento expreso)
2. **Consentimiento**: Libre, informado, específico, expreso y revocable
3. **Información**: Aviso de privacidad completo y accesible
4. **Calidad**: Datos exactos, completos, actualizados
5. **Finalidad**: Solo para tamizaje y derivación oportuna
6. **Lealtad**: No engañar al titular
7. **Proporcionalidad**: Solo datos necesarios
8. **Responsabilidad**: Rendir cuentas del tratamiento

## Estado Actual: SOLO DATOS FICTICIOS

> ⚠️ **IMPORTANTE**: Este proyecto en su estado actual **SOLO UTILIZA DATOS FICTICIOS** para desarrollo y pruebas.
>
> - `datos-prueba/respuestas-ficticias.json`: Nombres, correos y respuestas **inventados**
> - No hay datos reales de personas en este repositorio
> - Antes de producción: reemplazar con flujo real + cumplimiento LFPDPPP

## Requisitos para Puesta en Producción

### 1. Aviso de Privacidad
- Redactar aviso completo (integral y simplificado)
- Incluir: identidad del responsable, finalidades, transferencias, derechos ARCO, medios de ejercicio
- Poner a disposición **antes** de recabar datos

### 2. Consentimiento Expreso
- Checkbox obligatorio no preseleccionado en Google Forms
- Texto: "Autorizo el tratamiento de mis datos sensibles de salud mental para tamizaje y derivación a profesional..."
- Guardar evidencia de consentimiento (timestamp, IP, versión de aviso)

### 3. Medidas de Seguridad (Art. 19 LFPDPPP)
- **Administrativas**: Políticas, capacitación, confidencialidad, acceso por roles
- **Físicas**: Acceso restringido a servidores/equipos (Google Workspace enterprise)
- **Técnicas**: Cifrado en tránsito (TLS 1.2+), en reposo (AES-256), logs de acceso, MFA

### 4. Derechos ARCO
- Proceso para: Acceso, Rectificación, Cancelación, Oposición
- Plazo: 20 días hábiles (prorrogable 20 más)
- Canal: correo dedicado privacidad@dominio.mx

### 5. Transferencias
- Google (Forms, Sheets, Gmail): **Encargados** → Contrato de encargo (DPA)
- Profesionales de salud: **Terceros** → Consentimiento para transferencia
- Zapier: **Encargado** → Evaluar DPA y certificaciones (SOC 2, ISO 27001)

### 6. Tiempo de Conservación
- Sugerido: 5 años post-último contacto (normativa clínica)
- Política documentada y automatizada (scripts de purga en Sheets)

### 7. Brechas de Seguridad
- Plan de respuesta a incidentes
- Notificación a INAI y titulares en 72 hrs (si riesgo alto)
- Registro de incidentes

## Checklist Pre-Producción

- [ ] Aviso de privacidad publicado y vinculado en Form
- [ ] Consentimiento expreso implementado en Form
- [ ] DPA firmado con Google Workspace
- [ ] DPA evaluado/firmado con Zapier
- [ ] Cifrado y MFA configurados en todas las cuentas
- [ ] Acceso a Sheets restringido (solo personal autorizado)
- [ ] Profesionales de guardia designados con SLA de respuesta
- [ ] Proceso ARCO documentado y probado
- [ ] Política de retención y purga automatizada
- [ ] Plan de respuesta a incidentes aprobado
- [ ] Auditoría de seguridad inicial realizada
- [ ] **TODO: Verificar vigencia de LFPDPPP y normativa asociada**

## Nota Ética

Este sistema es una **herramienta de apoyo**, no sustituye la relación terapéutica. El diseño centrado en la persona usuaria implica:
- Transparencia: el usuario sabe qué se mide y para qué
- Autonomía: consentimiento revocable en cualquier momento
- No maleficencia: alertas conservadoras (mejor falso positivo que falso negativo)
- Justicia: acceso equitativo, sin sesgos en preguntas