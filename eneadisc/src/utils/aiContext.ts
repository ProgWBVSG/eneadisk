import type { CompanyWideAnalytics, TeamAnalytics } from './analytics';

/**
 * Generate rich structured context from analytics data for Claude AI
 */
export function generateAnalyticsContext(analytics: CompanyWideAnalytics): string {
    const fecha = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

    const generalMetrics = `
FECHA DEL REPORTE: ${fecha}

MÉTRICAS GENERALES DE LA EMPRESA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Completación promedio: ${analytics.overallCompletionRate.toFixed(1)}%
😊 Mood promedio: ${analytics.overallMoodScore.toFixed(1)}/5
✅ Tareas completadas: ${analytics.totalTasksCompleted}
📝 Check-ins realizados: ${analytics.totalCheckIns}
👥 Equipos activos: ${analytics.teams.length}
🏆 Mejor equipo: ${analytics.topPerformingTeam?.teamName || 'N/A'} (${analytics.topPerformingTeam?.completionRate.toFixed(1) || 0}%)
⚠️ Equipo que necesita atención: ${analytics.teamNeedingAttention?.teamName || 'N/A'}
`;

    const teamsAnalysis = analytics.teams.map((team: TeamAnalytics) => `
📋 ${team.teamName} (${team.memberCount} miembros):
  • Completación: ${team.completionRate.toFixed(1)}% ${team.completionRate >= 80 ? '🟢' : team.completionRate >= 60 ? '🟡' : '🔴'}
  • Mood: ${team.avgMoodScore.toFixed(1)}/5 ${team.avgMoodScore >= 4 ? '🟢' : team.avgMoodScore >= 3 ? '🟡' : '🔴'}
  • Energía promedio: ${team.avgEnergyLevel.toFixed(1)}/5
  • Velocidad: ${team.velocityPerWeek.toFixed(1)} tareas/semana
  • Nivel de estrés: ${team.stressIndex.toFixed(1)}% ${team.stressIndex > 40 ? '🔴 ALTO' : team.stressIndex > 20 ? '🟡' : '🟢'}
  • Tareas: ${team.tasksAssigned} asignadas | ${team.tasksCompleted} completadas | ${team.tasksInProgress} en progreso | ${team.tasksOverdue} atrasadas ${team.tasksOverdue > 0 ? '⚠️' : ''}
  • Tiempo promedio resolución: ${team.avgCompletionTime.toFixed(1)} días
  • Prioridades completadas: Alta=${team.highPriorityCompleted}, Media=${team.mediumPriorityCompleted}, Baja=${team.lowPriorityCompleted}
  • Correlación bienestar↔productividad: ${(team.wellnessProductivityCorr * 100).toFixed(0)}%
  • Check-ins registrados: ${team.checkInCount}
`).join('\n');

    const insightsSection = analytics.insights.length > 0
        ? `
ALERTAS E INSIGHTS AUTOMÁTICOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${analytics.insights.slice(0, 8).map(insight =>
            `[${insight.priority.toUpperCase()}] ${insight.title}
   ${insight.description}
   ${insight.suggestedAction ? `💡 Acción sugerida: ${insight.suggestedAction}` : ''}`
        ).join('\n\n')}`
        : 'No hay alertas activas.';

    return `${generalMetrics}
ANÁLISIS DETALLADO POR EQUIPO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${teamsAnalysis}
${insightsSection}
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
