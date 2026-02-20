# DIRECTIVA: ENEADISC_AI_ENGINE_ARCHITECT_SOP

> **ID:** ENEADISC_AI_001
> **Script Asociado:** `scripts/eneadisc_ai_engine_architect.py`
> **Última Actualización:** 2026-02-10
> **Estado:** ACTIVO

---

## 1. Objetivos y Alcance

### Contexto
Actuar como AI/ML Architect especializado en diseñar el motor de inteligencia artificial de ENEADISC: una plataforma SaaS B2B de análisis organizacional basada en el eneagrama.

### Objetivo Principal
Diseñar y documentar completamente la arquitectura del motor de IA que:
- Procesa evaluaciones (20-25 preguntas) en múltiples formatos (múltiple choice, escala Likert, texto corto)
- Infiere patrones de comportamiento con alta precisión (confidence >0.8)
- Genera insights personalizados y accionables
- Agrega datos para análisis de equipos completos
- Opera con latencia <15 segundos por evaluación

### Criterio de Éxito
Documento técnico markdown completo y accionable que incluya:
- Arquitectura del motor de IA (diagrama + componentes)
- Algoritmo de scoring detallado con pseudocódigo
- Pipeline de NLP para texto corto
- Sistema de generación de insights
- Agregación para equipos y detección de fricción
- Validación, métricas y deployment strategy
- Explainability (XAI) y roadmap

## 2. Especificaciones de Entrada/Salida (I/O)

### Entradas (Inputs)
- **Prompt del usuario:** Texto completo con todos los requerimientos del sistema
- **Secciones específicas:**
  - PRODUCCIÓN Y ESCALABILIDAD (latencia, escalabilidad, monitoreo, versionado, costo)
  - EXPLAINABILITY (XAI) (feature importance, confidence breakdown, alternative patterns, human-in-the-loop)
  - TU TAREA (9 puntos: arquitectura, algoritmo, NLP, insights, agregación, validación, deployment, explainability, roadmap)

### Salidas (Outputs)
- **Artefacto Generado:** 
  - `eneadisc_ai_architecture_complete.md` - Documento técnico blueprint
- **Formato:** Markdown estructurado con:
  - Diagramas Mermaid
  - Pseudocódigo
  - Ejemplos de código (Python)
  - Tablas de configuración
  - Enlaces a recursos técnicos

## 3. Flujo Lógico (Algoritmo)

1. **Análisis del Contexto:**
   - Comprender el dominio (eneagrama, evaluaciones organizacionales)
   - Identificar restricciones técnicas (latencia <15s, multi-tenancy, privacidad)
   - Definir scope MVP vs. futuras versiones

2. **Diseño de Arquitectura:**
   - Pipeline end-to-end (input → preprocessing → scoring → insight generation → output)
   - Componentes modulares (separar NLP, scoring, generación de texto)
   - Stack tecnológico (librerías ML/NLP recomendadas)

3. **Algoritmo de Scoring:**
   - Sistema de pesos y normalización
   - Mapeo de respuestas a dimensiones de comportamiento
   - Cálculo de confidence scores
   - Detección de sesgo e inconsistencias

4. **NLP para Texto Corto:**
   - Preprocessing (tokenización, limpieza)
   - Embedding (sentence transformers, BERT)
   - Mapeo semántico a patrones predefinidos
   - Manejo de ambigüedad y contexto limitado

5. **Generación de Insights:**
   - Estrategia (templates + variables, LLM, hybrid)
   - Personalización según patrón detectado
   - Validación de coherencia y utilidad

6. **Agregación para Equipos:**
   - Cálculo de distribución de patrones
   - Detección de fricciones (algoritmo de incompatibilidad)
   - Generación de recomendaciones para líderes

7. **Deployment y Producción:**
   - Infraestructura (local vs. cloud vs. API externa)
   - Optimizaciones de latencia (caching, batching, GPU)
   - Monitoreo (logs, alertas, métricas)
   - Versionado de modelos

8. **Explainability (XAI):**
   - Feature importance (qué preguntas influyeron más)
   - Confidence breakdown (por qué no es 100%)
   - Alternative patterns (segundo patrón más probable)

9. **Documentación:**
   - Estructurar en formato markdown accionable
   - Incluir ejemplos de código ejecutables
   - Roadmap MVP → V2 → V3

## 4. Herramientas y Librerías

### Stack Tecnológico Recomendado
- **ML/NLP:** 
  - scikit-learn (scoring, normalización)
  - sentence-transformers (embeddings semánticos)
  - spaCy o NLTK (preprocessing)
  - OpenAI API o Anthropic Claude (generación de insights, opcional)
- **Backend:** 
  - Python 3.10+
  - FastAPI o Flask (API)
- **Database:** 
  - PostgreSQL (datos estructurados)
  - Redis (caching de embeddings)
- **Deployment:**
  - Docker + Kubernetes (escalabilidad)
  - AWS/GCP/Azure (cloud)
- **Monitoreo:**
  - Sentry (errores)
  - Prometheus + Grafana (métricas)

## 5. Restricciones y Casos Borde (Edge Cases)

### Restricciones de Producción
- **Latencia:** Target <15 seg, máximo aceptable 20 seg
- **Confidence mínima:** >0.5 en al menos 80% de casos
- **Rate limits:** Si usa OpenAI, considerar límites de API
- **Costo:** GPT-4 ~$0.03/evaluación, balancear con latencia

### Casos Borde
- **Respuestas inconsistentes:** Usuario marca extremos opuestos (ej: "muy colaborativo" y "muy autónomo")
- **Texto ambiguo:** "Depende del contexto" → difícil de mapear a patrón
- **Evaluaciones incompletas:** <80% de preguntas respondidas
- **Sesgo cultural:** Patrones pueden variar según región/cultura
- **Equipos pequeños:** <5 personas, analytics agregados menos significativos

### Privacidad
- **NUNCA** exponer respuestas individuales crudas a líderes/RRHH
- **Solo** mostrar insights agregados y anonimizados
- **Compliance:** GDPR, CCPA (ver directiva de seguridad)

## 6. Protocolo de Errores y Aprendizajes (Memoria Viva)

| Fecha | Error Detectado | Causa Raíz | Solución/Parche Aplicado |
|-------|-----------------|------------|--------------------------|
| 10/02 | N/A - Directiva inicial | Setup | Establecer estructura base |

> **Nota de Implementación:** Tras implementar el motor, actualizar esta sección con problemas de precisión, latencia o generación de insights.

## 7. Ejemplos de Uso

### Ejecución del script de documentación
```bash
# Generar documento técnico completo
python scripts/eneadisc_ai_engine_architect.py --output-dir ./docs --format markdown

# Validar arquitectura propuesta
python scripts/eneadisc_ai_engine_architect.py --validate
```

### Output esperado
```
✅ Documento generado: docs/eneadisc_ai_architecture_complete.md
📊 Secciones completadas: 9/9
⚡ Roadmap definido: MVP → V2 → V3
```

## 8. Checklist de Pre-Ejecución
- [ ] Prompt completo del usuario disponible
- [ ] Contexto de ENEADISC comprendido (SaaS B2B, eneagrama, multi-tenancy)
- [ ] Acceso a ejemplos de evaluaciones (estructura de preguntas/respuestas)
- [ ] Referencias técnicas (papers de NLP para texto corto, algoritmos de scoring)

## 9. Checklist Post-Ejecución
- [ ] Documento markdown generado con 9 secciones completas
- [ ] Diagramas Mermaid incluidos (pipeline, arquitectura)
- [ ] Pseudocódigo del algoritmo de scoring validado
- [ ] Stack tecnológico justificado (pros/cons)
- [ ] Deployment strategy definida (latencia, costo)
- [ ] Explainability (XAI) documentada
- [ ] Roadmap MVP/V2/V3 claro y accionable

## 10. Notas Adicionales

### Filosofía de Diseño
- **Determinismo:** Misma evaluación → mismo resultado (reproducible)
- **Transparencia:** Usuario debe entender POR QUÉ se le asignó un patrón
- **Privacidad by design:** Nunca exponer datos sensibles
- **Escalabilidad:** Diseñar para 1,000+ organizaciones, 100k+ evaluaciones

### Referencias Técnicas
- Sentence Transformers: https://www.sbert.net/
- Fine-tuning BERT para clasificación: https://huggingface.co/docs/transformers/
- Explainable AI: SHAP, LIME
- Eneagrama: https://www.enneagraminstitute.com/ (dominio de negocio)

### Consideraciones Éticas
- Evitar uso del sistema para discriminación laboral
- Clarificar que resultados son orientativos, no diagnósticos médicos
- Permitir opt-out de empleados (GDPR right to deletion)
