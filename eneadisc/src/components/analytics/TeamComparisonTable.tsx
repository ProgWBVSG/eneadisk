import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TeamAnalytics } from '../../utils/analytics';

interface TeamComparisonTableProps {
    teams: TeamAnalytics[];
    onTeamClick?: (teamId: string) => void;
}

type SortField = 'name' | 'completion' | 'velocity' | 'mood' | 'overdue';
type SortDirection = 'asc' | 'desc';

export const TeamComparisonTable: React.FC<TeamComparisonTableProps> = ({ teams, onTeamClick }) => {
    const [sortField, setSortField] = useState<SortField>('completion');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);

    // Sort teams
    const sortedTeams = [...teams].sort((a, b) => {
        let aValue: number | string = 0;
        let bValue: number | string = 0;

        switch (sortField) {
            case 'name':
                aValue = a.teamName;
                bValue = b.teamName;
                break;
            case 'completion':
                aValue = a.completionRate;
                bValue = b.completionRate;
                break;
            case 'velocity':
                aValue = a.velocityPerWeek;
                bValue = b.velocityPerWeek;
                break;
            case 'mood':
                aValue = a.avgMoodScore;
                bValue = b.avgMoodScore;
                break;
            case 'overdue':
                aValue = a.tasksOverdue;
                bValue = b.tasksOverdue;
                break;
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        return sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
        if (sortField !== field) return <Minus className="w-4 h-4 text-slate-400" />;
        return sortDirection === 'asc' ?
            <ChevronUp className="w-4 h-4 text-blue-600" /> :
            <ChevronDown className="w-4 h-4 text-blue-600" />;
    };

    const getCompletionColor = (rate: number) => {
        if (rate >= 80) return 'bg-green-100 text-green-700 border-green-300';
        if (rate >= 60) return 'bg-blue-100 text-blue-700 border-blue-300';
        if (rate >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        return 'bg-red-100 text-red-700 border-red-300';
    };

    const getMoodColor = (mood: number) => {
        if (mood >= 4) return 'bg-purple-100 text-purple-700 border-purple-300';
        if (mood >= 3) return 'bg-blue-100 text-blue-700 border-blue-300';
        if (mood >= 2) return 'bg-orange-100 text-orange-700 border-orange-300';
        return 'bg-red-100 text-red-700 border-red-300';
    };

    const getTrend = (current: number, benchmark: number) => {
        if (current > benchmark) return <TrendingUp className="w-4 h-4 text-green-600" />;
        if (current < benchmark) return <TrendingDown className="w-4 h-4 text-red-600" />;
        return <Minus className="w-4 h-4 text-slate-400" />;
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    👥 Comparativa de Equipos
                </h3>
                <p className="text-sm text-slate-600">
                    {teams.length} equipos analizados
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th
                                className="text-left py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => handleSort('name')}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Equipo</span>
                                    <SortIcon field="name" />
                                </div>
                            </th>
                            <th
                                className="text-center py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => handleSort('completion')}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Completación</span>
                                    <SortIcon field="completion" />
                                </div>
                            </th>
                            <th
                                className="text-center py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => handleSort('velocity')}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Velocidad</span>
                                    <SortIcon field="velocity" />
                                </div>
                            </th>
                            <th
                                className="text-center py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => handleSort('mood')}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Mood</span>
                                    <SortIcon field="mood" />
                                </div>
                            </th>
                            <th
                                className="text-center py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => handleSort('overdue')}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-sm font-semibold text-slate-700">Atrasadas</span>
                                    <SortIcon field="overdue" />
                                </div>
                            </th>
                            <th className="text-center py-3 px-4">
                                <span className="text-sm font-semibold text-slate-700">Acciones</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTeams.map((team) => (
                            <React.Fragment key={team.teamId}>
                                <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="font-medium text-slate-900">{team.teamName}</p>
                                            <p className="text-xs text-slate-500">{team.memberCount} miembros</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getCompletionColor(team.completionRate)}`}>
                                                {Math.round(team.completionRate)}%
                                            </span>
                                            {getTrend(team.completionRate, 75)}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-slate-900 font-semibold">{team.velocityPerWeek.toFixed(1)}</span>
                                            <span className="text-xs text-slate-500">tareas/sem</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getMoodColor(team.avgMoodScore)}`}>
                                            {team.avgMoodScore.toFixed(1)}/5
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${team.tasksOverdue === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {team.tasksOverdue}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button
                                            onClick={() => setExpandedTeam(expandedTeam === team.teamId ? null : team.teamId)}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                                        >
                                            {expandedTeam === team.teamId ? 'Ocultar' : 'Ver más'}
                                        </button>
                                    </td>
                                </tr>

                                {/* Expanded Details */}
                                {expandedTeam === team.teamId && (
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <td colSpan={6} className="p-6">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                    <p className="text-xs text-slate-600 mb-1">Total Asignadas</p>
                                                    <p className="text-2xl font-bold text-slate-900">{team.tasksAssigned}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                    <p className="text-xs text-slate-600 mb-1">En Progreso</p>
                                                    <p className="text-2xl font-bold text-blue-600">{team.tasksInProgress}</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                    <p className="text-xs text-slate-600 mb-1">Índice de Estrés</p>
                                                    <p className="text-2xl font-bold text-orange-600">{team.stressIndex.toFixed(0)}%</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-lg border border-slate-200">
                                                    <p className="text-xs text-slate-600 mb-1">Check-ins</p>
                                                    <p className="text-2xl font-bold text-purple-600">{team.checkInCount}</p>
                                                </div>
                                            </div>

                                            {onTeamClick && (
                                                <button
                                                    onClick={() => onTeamClick(team.teamId)}
                                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                >
                                                    Ver Dashboard del Equipo
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
