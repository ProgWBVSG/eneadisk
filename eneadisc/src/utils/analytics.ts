import type { Task } from './tasks';
import type { CheckIn } from './checkIns';
import { getTeamTasks } from './tasks';
import { getCheckIns } from './checkIns';

// ==========================================
// INTERFACES & TYPES
// ==========================================

export interface DateRange {
    start: Date;
    end: Date;
}

export interface TrendPoint {
    date: string;
    value: number;
    label?: string;
}

export interface TeamAnalytics {
    teamId: string;
    teamName: string;
    period: DateRange;

    // Productivity Metrics
    tasksAssigned: number;
    tasksCompleted: number;
    tasksInProgress: number;
    tasksOverdue: number;
    completionRate: number; // %
    avgCompletionTime: number; // days
    velocityPerWeek: number; // tasks/week

    // Priority Distribution
    highPriorityCompleted: number;
    mediumPriorityCompleted: number;
    lowPriorityCompleted: number;

    // Wellbeing Metrics
    avgMoodScore: number; // 1-5
    avgEnergyLevel: number; // 1-5
    stressIndex: number; // %
    checkInCount: number;

    // Trends
    moodTrend: TrendPoint[];
    productivityTrend: TrendPoint[];

    // Correlations
    wellnessProductivityCorr: number; // -1 to 1

    // Member Count
    memberCount: number;
}

export interface Insight {
    id: string;
    type: 'warning' | 'success' | 'info' | 'recommendation';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionable: boolean;
    suggestedAction?: string;
    metrics?: {
        value: number;
        benchmark?: number;
        unit: string;
    };
}

export interface CompanyWideAnalytics {
    overallCompletionRate: number;
    overallMoodScore: number;
    totalTasksCompleted: number;
    totalCheckIns: number;
    teams: TeamAnalytics[];
    insights: Insight[];
    topPerformingTeam?: TeamAnalytics;
    teamNeedingAttention?: TeamAnalytics;
}

/**
 * Period comparison data
 */
export interface PeriodComparison {
    current: CompanyWideAnalytics;
    previous: CompanyWideAnalytics;
    delta: {
        completionRate: number;  // % change
        moodScore: number;       // absolute change
        tasksCompleted: number;  // absolute change
        checkIns: number;        // absolute change
    };
}

// ==========================================
// MOOD & STRESS SCORING
// ==========================================

const MOOD_SCORES: Record<string, number> = {
    'excellent': 5,
    'good': 4,
    'neutral': 3,
    'stressed': 2,
    'overwhelmed': 1
};

function getMoodScore(mood: string): number {
    return MOOD_SCORES[mood] || 3;
}

function isStressful(mood: string): boolean {
    return mood === 'stressed' || mood === 'overwhelmed';
}

// ==========================================
// DATE UTILITIES
// ==========================================

function isWithinRange(date: string, range: DateRange): boolean {
    const d = new Date(date);
    return d >= range.start && d <= range.end;
}

function getDaysBetween(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getWeeksBetween(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return diffTime / (1000 * 60 * 60 * 24 * 7);
}

// ==========================================
// CORE ANALYTICS FUNCTIONS
// ==========================================

export function calculateTeamMetrics(
    teamId: string,
    teamName: string,
    dateRange: DateRange,
    memberCount: number = 1
): TeamAnalytics {
    // Get all team tasks
    const allTasks = getTeamTasks(teamId);

    // Filter tasks within date range
    const tasksInPeriod = allTasks.filter(task =>
        isWithinRange(task.createdAt, dateRange)
    );

    // Get all check-ins for this period (would need team member IDs in real implementation)
    // For now, we'll use a simplified version
    const allCheckIns = getCheckIns('demo-employee-001'); // Simplified
    const checkInsInPeriod = allCheckIns.filter(checkIn =>
        isWithinRange(checkIn.date, dateRange)
    );

    // Calculate productivity metrics
    const tasksAssigned = tasksInPeriod.length;
    const tasksCompleted = tasksInPeriod.filter(t => t.status === 'completed').length;
    const tasksInProgress = tasksInPeriod.filter(t => t.status === 'in_progress').length;

    const now = new Date();
    const tasksOverdue = tasksInPeriod.filter(t =>
        t.status !== 'completed' &&
        t.dueDate &&
        new Date(t.dueDate) < now
    ).length;

    const completionRate = tasksAssigned > 0 ? (tasksCompleted / tasksAssigned) * 100 : 0;

    // Calculate average completion time
    const completedTasks = tasksInPeriod.filter(t => t.status === 'completed' && t.completedAt);
    const avgCompletionTime = completedTasks.length > 0
        ? completedTasks.reduce((sum, task) => {
            return sum + getDaysBetween(task.createdAt, task.completedAt!);
        }, 0) / completedTasks.length
        : 0;

    // Calculate velocity
    const weeks = getWeeksBetween(dateRange.start, dateRange.end);
    const velocityPerWeek = weeks > 0 ? tasksCompleted / weeks : tasksCompleted;

    // Priority distribution
    const completedByPriority = tasksInPeriod.filter(t => t.status === 'completed');
    const highPriorityCompleted = completedByPriority.filter(t => t.priority === 'high').length;
    const mediumPriorityCompleted = completedByPriority.filter(t => t.priority === 'medium').length;
    const lowPriorityCompleted = completedByPriority.filter(t => t.priority === 'low').length;

    // Calculate wellbeing metrics
    const avgMoodScore = checkInsInPeriod.length > 0
        ? checkInsInPeriod.reduce((sum, checkIn) => sum + getMoodScore(checkIn.mood), 0) / checkInsInPeriod.length
        : 3;

    const avgEnergyLevel = checkInsInPeriod.length > 0
        ? checkInsInPeriod.reduce((sum, checkIn) => sum + checkIn.energy, 0) / checkInsInPeriod.length
        : 3;

    const stressfulCheckIns = checkInsInPeriod.filter(c => isStressful(c.mood)).length;
    const stressIndex = checkInsInPeriod.length > 0
        ? (stressfulCheckIns / checkInsInPeriod.length) * 100
        : 0;

    // Generate trends (simplified - last 7 days)
    const moodTrend = generateMoodTrend(checkInsInPeriod);
    const productivityTrend = generateProductivityTrend(tasksInPeriod);

    // Calculate correlation
    const wellnessProductivityCorr = calculateCorrelation(moodTrend, productivityTrend);

    return {
        teamId,
        teamName,
        period: dateRange,
        tasksAssigned,
        tasksCompleted,
        tasksInProgress,
        tasksOverdue,
        completionRate,
        avgCompletionTime,
        velocityPerWeek,
        highPriorityCompleted,
        mediumPriorityCompleted,
        lowPriorityCompleted,
        avgMoodScore,
        avgEnergyLevel,
        stressIndex,
        checkInCount: checkInsInPeriod.length,
        moodTrend,
        productivityTrend,
        wellnessProductivityCorr,
        memberCount
    };
}

// ==========================================
// TREND GENERATION
// ==========================================

function generateMoodTrend(checkIns: CheckIn[]): TrendPoint[] {
    // Group by day and calculate average
    const byDay: Record<string, number[]> = {};

    checkIns.forEach(checkIn => {
        const day = checkIn.date.split('T')[0];
        if (!byDay[day]) byDay[day] = [];
        byDay[day].push(getMoodScore(checkIn.mood));
    });

    return Object.entries(byDay)
        .map(([date, scores]) => ({
            date,
            value: scores.reduce((a, b) => a + b, 0) / scores.length
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7); // Last 7 days
}

function generateProductivityTrend(tasks: Task[]): TrendPoint[] {
    // Group completed tasks by day
    const byDay: Record<string, number> = {};

    tasks.filter(t => t.status === 'completed' && t.completedAt).forEach(task => {
        const day = task.completedAt!.split('T')[0];
        byDay[day] = (byDay[day] || 0) + 1;
    });

    return Object.entries(byDay)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7); // Last 7 days
}

// ==========================================
// CORRELATION CALCULATION
// ==========================================

function calculateCorrelation(trend1: TrendPoint[], trend2: TrendPoint[]): number {
    if (trend1.length < 2 || trend2.length < 2) return 0;

    // Align trends by date
    const aligned: { mood: number; productivity: number }[] = [];

    trend1.forEach(t1 => {
        const t2 = trend2.find(t => t.date === t1.date);
        if (t2) {
            aligned.push({ mood: t1.value, productivity: t2.value });
        }
    });

    if (aligned.length < 2) return 0;

    // Calculate Pearson correlation coefficient
    const n = aligned.length;
    const sumMood = aligned.reduce((sum, p) => sum + p.mood, 0);
    const sumProd = aligned.reduce((sum, p) => sum + p.productivity, 0);
    const sumMoodSq = aligned.reduce((sum, p) => sum + p.mood * p.mood, 0);
    const sumProdSq = aligned.reduce((sum, p) => sum + p.productivity * p.productivity, 0);
    const sumMoodProd = aligned.reduce((sum, p) => sum + p.mood * p.productivity, 0);

    const numerator = n * sumMoodProd - sumMood * sumProd;
    const denominator = Math.sqrt(
        (n * sumMoodSq - sumMood * sumMood) * (n * sumProdSq - sumProd * sumProd)
    );

    return denominator === 0 ? 0 : numerator / denominator;
}

// ==========================================
// INSIGHTS GENERATION
// ==========================================

export function generateInsights(analytics: TeamAnalytics): Insight[] {
    const insights: Insight[] = [];

    // Insight 1: Low completion rate
    if (analytics.completionRate < 60) {
        insights.push({
            id: `${analytics.teamId}-low-completion`,
            type: 'warning',
            priority: 'high',
            title: 'Baja tasa de completación',
            description: `El equipo ${analytics.teamName} tiene una tasa de completación del ${analytics.completionRate.toFixed(1)}%, por debajo del objetivo del 75%.`,
            actionable: true,
            suggestedAction: 'Revisar carga de trabajo y redistribuir tareas si es necesario',
            metrics: {
                value: analytics.completionRate,
                benchmark: 75,
                unit: '%'
            }
        });
    }

    // Insight 2: High completion rate
    if (analytics.completionRate >= 90) {
        insights.push({
            id: `${analytics.teamId}-high-completion`,
            type: 'success',
            priority: 'low',
            title: '¡Excelente rendimiento!',
            description: `El equipo ${analytics.teamName} alcanzó un ${analytics.completionRate.toFixed(1)}% de completación. ¡Felicitaciones!`,
            actionable: false,
            metrics: {
                value: analytics.completionRate,
                unit: '%'
            }
        });
    }

    // Insight 3: High stress
    if (analytics.stressIndex > 40) {
        insights.push({
            id: `${analytics.teamId}-high-stress`,
            type: 'warning',
            priority: 'high',
            title: 'Alto nivel de estrés detectado',
            description: `El ${analytics.stressIndex.toFixed(1)}% de los check-ins muestran estrés o agobio en ${analytics.teamName}.`,
            actionable: true,
            suggestedAction: 'Considerar reunión 1-on-1 con miembros del equipo o reducir carga',
            metrics: {
                value: analytics.stressIndex,
                benchmark: 30,
                unit: '%'
            }
        });
    }

    // Insight 4: Positive correlation
    if (analytics.wellnessProductivityCorr > 0.5) {
        insights.push({
            id: `${analytics.teamId}-positive-correlation`,
            type: 'info',
            priority: 'medium',
            title: 'Fuerte correlación positiva',
            description: `Hay una correlación alta (${(analytics.wellnessProductivityCorr * 100).toFixed(0)}%) entre bienestar y productividad en ${analytics.teamName}.`,
            actionable: true,
            suggestedAction: 'Continuar invirtiendo en iniciativas de bienestar del equipo',
            metrics: {
                value: analytics.wellnessProductivityCorr * 100,
                unit: '%'
            }
        });
    }

    // Insight 5: Overdue tasks
    if (analytics.tasksOverdue > 0) {
        insights.push({
            id: `${analytics.teamId}-overdue`,
            type: 'warning',
            priority: analytics.tasksOverdue > 5 ? 'high' : 'medium',
            title: 'Tareas atrasadas',
            description: `Hay ${analytics.tasksOverdue} tarea(s) vencida(s) en ${analytics.teamName}.`,
            actionable: true,
            suggestedAction: 'Revisar fechas límite y re-priorizar si es necesario',
            metrics: {
                value: analytics.tasksOverdue,
                unit: 'tareas'
            }
        });
    }

    // Insight 6: Low mood
    if (analytics.avgMoodScore < 3) {
        insights.push({
            id: `${analytics.teamId}-low-mood`,
            type: 'warning',
            priority: 'high',
            title: 'Ánimo bajo del equipo',
            description: `El mood promedio de ${analytics.teamName} es ${analytics.avgMoodScore.toFixed(1)}/5, indicando posible insatisfacción.`,
            actionable: true,
            suggestedAction: 'Agendar reunión de equipo para identificar problemas y soluciones',
            metrics: {
                value: analytics.avgMoodScore,
                benchmark: 3.5,
                unit: '/5'
            }
        });
    }

    // Insight 7: High velocity
    if (analytics.velocityPerWeek > 10) {
        insights.push({
            id: `${analytics.teamId}-high-velocity`,
            type: 'success',
            priority: 'low',
            title: 'Alta velocidad de trabajo',
            description: `${analytics.teamName} completa ${analytics.velocityPerWeek.toFixed(1)} tareas por semana, superando el promedio.`,
            actionable: false,
            metrics: {
                value: analytics.velocityPerWeek,
                unit: 'tareas/semana'
            }
        });
    }

    return insights.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
}

// ==========================================
// COMPANY-WIDE ANALYTICS
// ==========================================

export function calculateCompanyAnalytics(
    teams: Array<{ id: string; name: string; memberCount: number }>,
    dateRange: DateRange
): CompanyWideAnalytics {
    const teamAnalytics = teams.map(team =>
        calculateTeamMetrics(team.id, team.name, dateRange, team.memberCount)
    );

    const overallCompletionRate = teamAnalytics.length > 0
        ? teamAnalytics.reduce((sum, t) => sum + t.completionRate, 0) / teamAnalytics.length
        : 0;

    const overallMoodScore = teamAnalytics.length > 0
        ? teamAnalytics.reduce((sum, t) => sum + t.avgMoodScore, 0) / teamAnalytics.length
        : 0;

    const totalTasksCompleted = teamAnalytics.reduce((sum, t) => sum + t.tasksCompleted, 0);
    const totalCheckIns = teamAnalytics.reduce((sum, t) => sum + t.checkInCount, 0);

    // Find top performing team
    const topPerformingTeam = teamAnalytics.reduce((best, current) =>
        current.completionRate > (best?.completionRate || 0) ? current : best
        , teamAnalytics[0]);

    // Find team needing attention (lowest mood + low completion)
    const teamNeedingAttention = teamAnalytics.reduce((worst, current) => {
        const currentScore = current.avgMoodScore + (current.completionRate / 100);
        const worstScore = worst ? worst.avgMoodScore + (worst.completionRate / 100) : Infinity;
        return currentScore < worstScore ? current : worst;
    }, teamAnalytics[0]);

    // Generate company-wide insights
    const allInsights = teamAnalytics.flatMap(team => generateInsights(team));

    return {
        overallCompletionRate,
        overallMoodScore,
        totalTasksCompleted,
        totalCheckIns,
        teams: teamAnalytics,
        insights: allInsights,
        topPerformingTeam,
        teamNeedingAttention
    };
}

// ==========================================
// HELPER: GET DATE RANGES
// ==========================================

export function getDateRange(period: 'week' | 'month' | 'quarter'): DateRange {
    const end = new Date();
    const start = new Date();

    switch (period) {
        case 'week':
            start.setDate(end.getDate() - 7);
            break;
        case 'month':
            start.setMonth(end.getMonth() - 1);
            break;
        case 'quarter':
            start.setMonth(end.getMonth() - 3);
            break;
    }

    return { start, end };
}

/**
 * Get the previous period's date range for comparison
 */
export function getPreviousPeriodRange(period: 'week' | 'month' | 'quarter'): DateRange {
    const currentRange = getDateRange(period);
    const end = new Date(currentRange.start);
    const start = new Date(currentRange.start);

    switch (period) {
        case 'week':
            start.setDate(end.getDate() - 7);
            break;
        case 'month':
            start.setMonth(end.getMonth() - 1);
            break;
        case 'quarter':
            start.setMonth(end.getMonth() - 3);
            break;
    }

    return { start, end };
}

/**
 * Calculate comparison between current and previous period
 */
export function calculatePeriodComparison(
    teams: Array<{ id: string; name: string; memberCount: number }>,
    period: 'week' | 'month' | 'quarter'
): PeriodComparison {
    const currentRange = getDateRange(period);
    const previousRange = getPreviousPeriodRange(period);

    const current = calculateCompanyAnalytics(teams, currentRange);
    const previous = calculateCompanyAnalytics(teams, previousRange);

    // Calculate deltas
    const delta = {
        completionRate: current.overallCompletionRate - previous.overallCompletionRate,
        moodScore: current.overallMoodScore - previous.overallMoodScore,
        tasksCompleted: current.totalTasksCompleted - previous.totalTasksCompleted,
        checkIns: current.totalCheckIns - previous.totalCheckIns
    };

    return { current, previous, delta };
}

/**
 * Calculate trend direction from trend points
 */
export function calculateTrend(trendPoints: TrendPoint[]): 'up' | 'down' | 'stable' {
    if (trendPoints.length < 2) return 'stable';

    // Calculate slope using linear regression
    const slope = calculateTrendSlope(trendPoints);

    // Threshold for considering trend as up/down (adjust as needed)
    const threshold = 0.05;

    if (slope > threshold) return 'up';
    if (slope < -threshold) return 'down';
    return 'stable';
}

/**
 * Calculate slope of trend using simple linear regression
 */

export function calculateTrendSlope(points: TrendPoint[]): number {
    if (points.length < 2) return 0;

    const n = points.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    points.forEach((point, index) => {
        const x = index;
        const y = point.value;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
}

