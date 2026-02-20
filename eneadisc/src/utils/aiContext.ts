import type { CompanyWideAnalytics, TeamAnalytics } from './analytics';

/**
 * Generate structured context from analytics data for AI processing
 */
export function generateAnalyticsContext(analytics: CompanyWideAnalytics): string {
    const generalMetrics = `
MÉTRICAS GENERALES (Período actual):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Completación promedio: ${analytics.overallCompletionRate.toFixed(1)}%
😊 Mood promedio: ${analytics.overallMoodScore.toFixed(1)}/5
✅ Tareas completadas: ${analytics.totalTasksCompleted}
📝 Check-ins realizados: ${analytics.totalCheckIns}
👥 Equipos activos: ${analytics.teams.length}
`;

    const teamsAnalysis = analytics.teams.map((team: TeamAnalytics) => `
${team.teamName}:
  • Completación: ${team.completionRate.toFixed(1)}% ${team.completionRate >= 80 ? '🟢' : team.completionRate >= 60 ? '🟡' : '🔴'}
  • Mood: ${team.avgMoodScore.toFixed(1)}/5 ${team.avgMoodScore >= 4 ? '😊' : team.avgMoodScore >= 3 ? '😐' : '😕'}
  • Velocidad: ${team.velocityPerWeek.toFixed(1)} tareas/semana
  • Nivel de estrés: ${team.stressIndex ? (team.stressIndex * 100).toFixed(0) : '0'}%
  • Tareas atrasadas: ${team.tasksOverdue || 0} ${(team.tasksOverdue || 0) > 0 ? '⚠️' : '✅'}
`).join('\n');

    const insightsSection = analytics.insights.length > 0
        ? `
INSIGHTS DETECTADOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${analytics.insights.map(insight =>
            `[${insight.priority.toUpperCase()}] ${insight.title}
   ${insight.description}
   ${insight.suggestedAction ? `💡 Acción: ${insight.suggestedAction}` : ''}`
        ).join('\n\n')}`
        : '';

    return `${generalMetrics}
ANÁLISIS POR EQUIPO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${teamsAnalysis}
${insightsSection}

NOTA: Usa estos datos para responder de forma específica, accionable y con emojis para mejor claridad.
`.trim();
}

/**
 * Extract key insights from analytics for quick summary
 */
export function extractKeyInsights(analytics: CompanyWideAnalytics): string[] {
    const insights: string[] = [];

    if (analytics.overallCompletionRate >= 80) {
        insights.push(`✅ Completación general saludable (${analytics.overallCompletionRate.toFixed(1)}%)`);
    } else if (analytics.overallCompletionRate < 60) {
        insights.push(`⚠️ Completación baja (${analytics.overallCompletionRate.toFixed(1)}%)`);
    }

    if (analytics.overallMoodScore >= 4) {
        insights.push(`😊 Excelente moral de equipo (${analytics.overallMoodScore.toFixed(1)}/5)`);
    } else if (analytics.overallMoodScore < 3) {
        insights.push(`😕 Moral baja requiere atención (${analytics.overallMoodScore.toFixed(1)}/5)`);
    }

    const strugglingTeams = analytics.teams.filter(t => t.completionRate < 60 || t.avgMoodScore < 3);
    if (strugglingTeams.length > 0) {
        insights.push(`⚠️ ${strugglingTeams.length} equipo(s) necesitan soporte`);
    }

    const highPriorityInsights = analytics.insights.filter(i => i.priority === 'high');
    if (highPriorityInsights.length > 0) {
        insights.push(`🔴 ${highPriorityInsights.length} alerta(s) de alta prioridad`);
    }

    return insights;
}
