import type { AIRequest, AIResponse, Recommendation } from '../types/ai';

// MOCK SERVICE - Replace with real N8N webhook when available
const USE_MOCK = true; // Set to false when N8N is configured

/**
 * Send message to AI assistant
 * MOCK MODE: Simulates AI responses for development
 * PRODUCTION MODE: Sends to N8N webhook
 */
export async function sendToAI(request: AIRequest): Promise<AIResponse> {
    if (USE_MOCK) {
        return mockAIResponse(request);
    }

    // Real N8N integration (uncomment when ready)
    throw new Error('N8N integration not configured. Set USE_MOCK=false and configure VITE_N8N_WEBHOOK_URL');
    /*
    const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;
    const API_KEY = import.meta.env.VITE_N8N_API_KEY;

    if (!N8N_WEBHOOK_URL) {
        throw new Error('N8N_WEBHOOK_URL no configurado en .env');
    }

    try {
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error comunicándose con N8N:', error);
        throw new Error('No se pudo conectar con el asistente de IA');
    }
    */
}

/**
 * MOCK AI Response Generator
 * Simulates intelligent responses based on keywords in the message
 */
function mockAIResponse(request: AIRequest): Promise<AIResponse> {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            const message = request.message.toLowerCase();
            let answer = '';
            const recommendations: Recommendation[] = [];

            // Detect intent and generate appropriate response
            if (message.includes('resumen') || message.includes('estado actual')) {
                answer = generateSummaryResponse(request.context);
                recommendations.push(...generateSummaryRecommendations());
            } else if (message.includes('atención') || message.includes('problemas') || message.includes('riesgos')) {
                answer = generateAttentionResponse(request.context);
                recommendations.push(...generateWarningRecommendations());
            } else if (message.includes('predicción') || message.includes('próxima semana') || message.includes('futuro')) {
                answer = generatePredictionResponse(request.context);
                recommendations.push(...generatePredictiveRecommendations());
            } else if (message.includes('tendencia') || message.includes('evolución') || message.includes('historial')) {
                answer = generateTrendResponse(request.context);
                recommendations.push(...generateTrendRecommendations());
            } else if (message.includes('mood') || message.includes('ánimo') || message.includes('moral')) {
                answer = generateMoodResponse(request.context);
                recommendations.push(...generateMoodRecommendations());
            } else if (message.includes('productividad') || message.includes('completación')) {
                answer = generateProductivityResponse(request.context);
                recommendations.push(...generateProductivityRecommendations());
            } else {
                answer = generateDefaultResponse(request.message);
                recommendations.push(...generateDefaultRecommendations());
            }

            resolve({
                answer,
                recommendations,
                confidence: 85,
                sources: ['Analytics Dashboard', 'Check-ins History', 'Task Completion Data'],
                processingTime: 1200
            });
        }, 1500); // Simulate 1.5s processing time
    });
}

function generateSummaryResponse(_context: string): string {
    return `📊 **Resumen del Estado Actual**

Basándome en los datos más recientes del sistema, aquí está el panorama general:

**Métricas Globales:**
• El sistema muestra una completación promedio del **75%** ✅
• El mood general del equipo está en **3.8/5** 😊
• Se han completado **127 tareas** en el período actual
• Registro de **45 check-ins** emocionales

**Equipos Destacados:**
🏆 **Mejor desempeño**: Equipo Marketing con 85% de completación
⚠️ **Requiere atención**: Se detectaron 2 equipos con mood < 3.5

**Tendencia General**: 📈 Positiva (+5% vs período anterior)

💡 **Análisis**: El equipo en general está saludable. Hay oportunidades de mejora en la distribución de carga de trabajo para equipos con alta densidad de tareas urgentes.`;
}

function generateAttentionResponse(_context: string): string {
    return `⚠️ **Equipos que Requieren Atención**

He identificado las siguientes áreas que necesitan intervención:

**🔴 Alta Prioridad:**
1. **Equipo con tareas atrasadas** (3 tareas críticas vencidas)
   - Riesgo: Impacto en entrega de proyectos
   - Acción: Redistribuir o renegociar deadlines

2. **Equipo con mood bajo** (Promedio 2.8/5)
   - Señales: Check-ins consistentemente bajos últimos 7 días
   - Riesgo: Posible burnout o desconexión

**🟡 Monitoreo:**
• Equipo con alta carga de tareas de prioridad alta (75% del backlog)
• Correlación negativa entre estrés y productividad detectada

**Recomendaciones inmediatas**:
1. Reunión 1-on-1 con líderes de equipos afectados
2. Revisar distribución de tareas urgentes
3. Programar sesión de team building para equipo con mood bajo`;
}

function generatePredictionResponse(_context: string): string {
    return `🔮 **Predicciones para la Próxima Semana**

**Análisis Predictivo Basado en Tendencias Actuales:**

📈 **Escenario Probable (Probabilidad: 75%)**
• Completación general: **78-82%** (↑ ligero incremento)
• Mood promedio: **3.9/5** (estable con tendencia positiva)
• Tareas completadas estimadas: **95-110**

⚠️ **Riesgos Identificados:**
1. **Burnout en Equipo A** - Probabilidad: 45%
   - Causa: 3 semanas consecutivas con >90% carga
   - Prevención: Reducir asignación de tareas nuevas en 20%

2. **Retraso en entregas** - Probabilidad: 30%
   - Equipos afectados: 1
   - Mitigación: Adelantar revisión de prioridades a mitad de semana

✅ **Oportunidades:**
• Equipo con momentum positivo puede absorber 2-3 tareas extra
• Proyección de mood alcanzando 4.0/5 si se mantiene tendencia

**Acción Recomendada**: Balanceo proactivo de carga de trabajo este lunes.`;
}

function generateTrendResponse(_context: string): string {
    return `📊 **Análisis de Tendencias - Últimos 30 Días**

**Evolución de Productividad:**
• Semana 1-2: **72% completación** (baseline)
• Semana 3: **78% completación** (+8.3% 📈)
• Semana 4: **75% completación** (-3.8% 📉 ajuste natural)

**Evolución de Mood:**
📊 **Progresión emocional del equipo**
• Inicio del mes: 3.5/5 ➡️ Actualidad: 3.8/5 (+8.6% mejora)
• Tendencia: Ascendente con estabilización

**Factores Positivos Identificados:**
✅ Finalización del Proyecto X (impacto en moral: +0.4 puntos)
✅ Reducción de tareas urgentes (-15%)
✅ Mejor distribución de carga entre equipos

**Correlaciones Encontradas:**
• Mood ↔️ Productividad: Correlación positiva de 0.68
• Check-ins  regulares ↔️ Completación: +12% en equipos constantes

**Proyección**: Si la tendencia continúa, esperamos alcanzar **80% completación** y **4.0/5 mood** en 2 semanas.`;
}

function generateMoodResponse(_context: string): string {
    return `😊 **Análisis de Mood y Bienestar del Equipo**

**Estado Actual del Bienestar:**
• Mood promedio general: **3.8/5** (Bueno 👍)
• Equipos con excelente mood (>4.0): 2
• Equipos en zona de alerta (<3.0): 1

**Distribución por Equipo:**
🟢 **Equipo Marketing**: 4.2/5 - Excelente moral
🔵 **Equipo Desarrollo**: 3.7/5 - Saludable
🟡 **Equipo Ventas**: 3.2/5 - Requiere monitoreo

**Factores que Impactan el Mood:**
✅ **Positivos:**
• Logros recientes y reconocimiento
• Trabajo colaborativo efectivo
• Claridad en objetivos

⚠️ **Negativos:**
• Alta carga de trabajo sin breaks
• Tareas repetitivas sin variedad
• Falta de feedback constructivo

**Recomendaciones para Mejorar:**
1. Celebrar pequeñas victorias semanalmente
2. Implementar "focus time" sin interrupciones
3. Rotación de tareas para evitar monotonía
4. Check-ins más frecuentes con equipos <3.5`;
}

function generateProductivityResponse(_context: string): string {
    return `📈 **Análisis de Productividad**

**Métricas de Rendimiento Actuales:**
• Tasa de completación: **75%** ✅
• Velocidad promedio: **8.5 tareas/semana** por persona
• Tiempo promedio de resolución: **2.3 días**

**Eficiencia por Equipo:**
🏆 Top performers:
1. Equipo Marketing: 85% completación, 10.2 tareas/sem
2. Equipo Desarrollo: 78% completación, 9.1 tareas/sem

**Análisis de Bloqueos:**
• Tareas atrasadas: **8** (5% del total)
• Principal causa: Dependencias entre equipos (60%)
• Tiempo promedio de bloqueo: 1.5 días

**Distribución de Prioridades:**
• Alta: 28% (bien balanceado)
• Media: 52% (núcleo del trabajo)
• Baja: 20% (backlog saludable)

**Insights Accionables:**
💡 Mejorar coordinación inter-equipos reduciría bloqueos en 40%
💡 Equipos con >85% completación pueden absorber más carga
💡 Implementar daily stand-ups reduciría tiempo de resolución en 15%`;
}

function generateDefaultResponse(_message: string): string {
    return `Hola 👋, soy tu Asistente de IA para análisis de equipos.

Puedo ayudarte con:

📊 **Análisis y Resúmenes**
• Estado actual de los equipos
• Tendencias de productividad y mood
• Comparativas entre períodos

🔮 **Predicciones**
• Riesgos potenciales (burnout, retrasos)
• Proyecciones basadas en tendencias
• Oportunidades de optimización

💡 **Recomendaciones**
• Acciones para mejorar mood
• Redistribución de carga de trabajo
• Mejores prácticas para tu equipo

**¿En qué te puedo ayudar hoy?**

*Tip: Usa los botones de sugerencias arriba para comenzar* ⬆️`;
}

// Recommendation generators
function generateSummaryRecommendations(): Recommendation[] {
    return [
        {
            type: 'insight',
            title: 'Tendencia Positiva Detectada',
            description: 'El mood general ha mejorado un 8% en las últimas 2 semanas',
            priority: 'medium'
        },
        {
            type: 'action',
            title: 'Revisar Distribución de Carga',
            description: 'Hay oportunidad de balancear mejor las tareas entre equipos',
            priority: 'medium'
        }
    ];
}

function generateWarningRecommendations(): Recommendation[] {
    return [
        {
            type: 'warning',
            title: 'Intervención Requerida',
            description: 'Equipo con mood < 3.0 necesita atención en las próximas 48hrs',
            priority: 'high'
        },
        {
            type: 'action',
            title: 'Reunión de Equipo',
            description: 'Programar sesión para abordar preocupaciones y redistribuir tareas',
            priority: 'high'
        }
    ];
}

function generatePredictiveRecommendations(): Recommendation[] {
    return [
        {
            type: 'suggestion',
            title: 'Prevención de Burnout',
            description: 'Reducir asignación de tareas nuevas en equipos con alta carga',
            priority: 'high'
        },
        {
            type: 'insight',
            title: 'Oportunidad de Crecimiento',
            description: 'Equipo con momentum positivo puede tomar proyectos adicionales',
            priority: 'low'
        }
    ];
}

function generateTrendRecommendations(): Recommendation[] {
    return [
        {
            type: 'insight',
            title: 'Correlación Positiva',
            description: 'Check-ins regulares mejoran completación en 12%',
            priority: 'medium'
        },
        {
            type: 'suggestion',
            title: 'Mantener Momentum',
            description: 'Continuar con estrategias actuales para alcanzar 80% completación',
            priority: 'medium'
        }
    ];
}

function generateMoodRecommendations(): Recommendation[] {
    return [
        {
            type: 'action',
            title: 'Celebración de Logros',
            description: 'Implementar ritual semanal de reconocimiento de victorias',
            priority: 'medium'
        },
        {
            type: 'suggestion',
            title: 'Focus Time',
            description: 'Bloques de 2hrs sin interrupciones pueden mejorar mood en 15%',
            priority: 'low'
        }
    ];
}

function generateProductivityRecommendations(): Recommendation[] {
    return [
        {
            type: 'action',
            title: 'Mejorar Coordinación',
            description: 'Daily stand-ups reducirían tiempo de resolución en 15%',
            priority: 'high'
        },
        {
            type: 'insight',
            title: 'Capacidad Disponible',
            description: 'Top performers pueden absorber 10-15% más de carga',
            priority: 'low'
        }
    ];
}

function generateDefaultRecommendations(): Recommendation[] {
    return [
        {
            type: 'suggestion',
            title: 'Explora el Dashboard',
            description: 'Revisa las métricas detalladas en Analytics & Insights',
            priority: 'low'
        }
    ];
}
