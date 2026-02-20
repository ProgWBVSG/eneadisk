import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BarChart3, Calendar, Users } from 'lucide-react';
import { calculateCompanyAnalytics, calculatePeriodComparison, getDateRange } from '../../utils/analytics';
import { getTeams } from '../../utils/teams';
import { useAuth } from '../../context/AuthContext';
import { MetricsCards } from '../../components/analytics/MetricsCards';
import { ProductivityChart } from '../../components/analytics/ProductivityChart';
import { CorrelationScatter } from '../../components/analytics/CorrelationScatter';
import { PriorityDistribution } from '../../components/analytics/PriorityDistribution';
import { InsightsPanel } from '../../components/analytics/InsightsPanel';
import { TeamComparisonTable } from '../../components/analytics/TeamComparisonTable';
import { ExportButton } from '../../components/analytics/ExportButton';
import { ProjectionsPanel } from '../../components/analytics/ProjectionsPanel';

type PeriodType = 'week' | 'month' | 'quarter';

export const CompanyAnalytics: React.FC = () => {
    const { user } = useAuth();
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
    const [selectedTeam, setSelectedTeam] = useState<string | 'all'>('all');
    const [isComparing, setIsComparing] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Ref for export functionality
    const dashboardRef = useRef<HTMLDivElement | null>(null);

    // Load real teams from localStorage
    const realTeams = useMemo(() => {
        if (!user?.companyId) return [];

        const teams = getTeams(user.companyId);
        return teams.map(team => ({
            id: team.id,
            name: team.name,
            memberCount: team.memberIds.length
        }));
    }, [user?.companyId, refreshKey]);

    // Sync with localStorage changes (when teams are created/deleted)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key?.startsWith('teams_')) {
                setRefreshKey(prev => prev + 1);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Calculate analytics for selected period
    const analytics = useMemo(() => {
        if (realTeams.length === 0) {
            // Return empty analytics structure
            return {
                teams: [],
                insights: [],
                overallCompletionRate: 0,
                overallMoodScore: 0,
                totalTasksCompleted: 0,
                totalCheckIns: 0
            };
        }

        const dateRange = getDateRange(selectedPeriod);
        return calculateCompanyAnalytics(realTeams, dateRange);
    }, [selectedPeriod, realTeams]);

    // Calculate period comparison if enabled
    const comparison = useMemo(() => {
        if (!isComparing || realTeams.length === 0) return null;
        return calculatePeriodComparison(realTeams, selectedPeriod);
    }, [selectedPeriod, isComparing, realTeams]);

    // Filtrar analytics por equipo seleccionado
    const displayAnalytics = useMemo(() => {
        if (selectedTeam === 'all') {
            return {
                overallCompletionRate: analytics.overallCompletionRate,
                overallMoodScore: analytics.overallMoodScore,
                totalTasksCompleted: analytics.totalTasksCompleted,
                totalCheckIns: analytics.totalCheckIns
            };
        }
        return analytics.teams.find(t => t.teamId === selectedTeam) || null;
    }, [analytics, selectedTeam]);

    const periodLabels: Record<PeriodType, string> = {
        week: 'Última Semana',
        month: 'Último Mes',
        quarter: 'Último Trimestre'
    };

    // Empty state cuando no hay equipos
    if (realTeams.length === 0) {
        return (
            <div className="p-8">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-8 mb-8">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-8 h-8" />
                        <div>
                            <h1 className="text-3xl font-bold">Analytics & Insights</h1>
                            <p className="text-blue-100 mt-1">Análisis avanzado de productividad y bienestar del equipo</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
                    <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                        No hay equipos creados aún
                    </h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Para comenzar a analizar métricas de productividad y bienestar, primero debes crear al menos un equipo.
                    </p>
                    <a
                        href="/dashboard/company/teams"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        <Users className="w-5 h-5" />
                        Ir a Gestión de Equipos
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header with Export Button */}
            <div className="mb-8">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Analytics & Insights</h1>
                            <p className="text-slate-600">Análisis de productividad y bienestar del equipo</p>
                        </div>
                    </div>

                    {/* Export Button */}
                    <ExportButton
                        analytics={analytics}
                        containerRef={dashboardRef}
                        periodLabel={periodLabels[selectedPeriod]}
                        teamFilter={selectedTeam}
                    />
                </div>
            </div>

            {/* Dashboard Content - Wrapped for export */}
            <div ref={dashboardRef}>

                {/* Filters */}
                <div className="mb-6 bg-white rounded-lg border border-slate-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Period Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Período de Análisis
                            </label>
                            <div className="flex gap-2">
                                {(['week', 'month', 'quarter'] as PeriodType[]).map(period => (
                                    <button
                                        key={period}
                                        onClick={() => setSelectedPeriod(period)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedPeriod === period
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                    >
                                        {periodLabels[period]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Team Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Equipo
                            </label>
                            <select
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">Todos los Equipos</option>
                                {realTeams.map((team: { id: string; name: string; memberCount: number }) => (
                                    <option key={team.id} value={team.id}>{team.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={isComparing} onChange={(e) => setIsComparing(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                            <span className="text-sm font-medium text-slate-700">Comparar con período anterior</span>
                        </label>
                    </div>
                </div>

                {/* Metrics Cards */}
                <MetricsCards
                    analytics={selectedTeam !== 'all' ? displayAnalytics as any : null}
                    companyWide={selectedTeam === 'all' ? displayAnalytics as any : undefined}
                    comparison={isComparing ? comparison : null}
                />

                {/* Charts */}
                {selectedTeam !== 'all' && analytics.teams.find(t => t.teamId === selectedTeam) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <ProductivityChart analytics={analytics.teams.find(t => t.teamId === selectedTeam)!} />
                        <PriorityDistribution analytics={analytics.teams.find(t => t.teamId === selectedTeam)!} />
                    </div>
                )}

                {selectedTeam === 'all' && (
                    <div className="mb-6">
                        <CorrelationScatter teams={analytics.teams} />
                    </div>
                )}

                {/* Insights Panel */}
                <div className="mb-6">
                    <InsightsPanel insights={analytics.insights} maxInsights={6} />
                </div>

                {/* Projections Panel */}
                {selectedTeam === 'all' && (
                    <div className="mb-6">
                        <ProjectionsPanel analytics={analytics} />
                    </div>
                )}

                {/* Team Comparison Table */}
                {selectedTeam === 'all' && (
                    <div className="mt-6">
                        <TeamComparisonTable
                            teams={analytics.teams}
                            onTeamClick={(teamId) => setSelectedTeam(teamId)}
                        />
                    </div>
                )}
            </div> {/* Close dashboardRef wrapper */}
        </div>
    );
};
