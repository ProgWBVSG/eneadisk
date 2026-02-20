import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEnneagramResult, hasCompletedQuestionnaire } from '../../utils/calculateEnneagram';
import { ENNEAGRAM_TYPES, getAllEnneagramTypes } from '../../data/enneagramData';
import { getCheckIns, getCheckInsFromLastDays, getAverageMoodScore, MOOD_CONFIG } from '../../utils/checkIns';
import { getTaskStats } from '../../utils/tasks';
import { getTeamStats } from '../../utils/teamCollaboration';
import { Lock, TrendingUp, Target, Zap, CheckCircle2, Heart, Users, BarChart3, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const EmployeeProgress: React.FC = () => {
    const { user } = useAuth();
    const hasCompleted = user ? hasCompletedQuestionnaire(user.id) : false;
    const result = user ? getEnneagramResult(user.id) : null;

    // Data fetching
    const checkIns = user ? getCheckIns(user.id) : [];
    const recentCheckIns = user ? getCheckInsFromLastDays(user.id, 30) : [];
    const taskStats = user ? getTaskStats(user.id) : null;
    const teamStats = user ? getTeamStats(user.id) : null;

    // Calculate metrics
    const avgMoodScore = getAverageMoodScore(recentCheckIns);
    const avgEnergy = recentCheckIns.length > 0
        ? recentCheckIns.reduce((sum, c) => sum + c.energy, 0) / recentCheckIns.length
        : 0;
    const avgStress = recentCheckIns.length > 0
        ? recentCheckIns.reduce((sum, c) => sum + c.stress, 0) / recentCheckIns.length
        : 0;

    // Radar chart data
    const chartData = useMemo(() => {
        if (!result) return [];
        const allTypes = getAllEnneagramTypes();
        const total = Object.values(result.scores).reduce((sum, score) => sum + score, 0);

        return allTypes.map(type => ({
            type: type.id,
            name: type.name,
            score: result.scores[type.id] || 0,
            percentage: total > 0 ? ((result.scores[type.id] || 0) / total) * 100 : 0,
            color: type.color
        }));
    }, [result]);

    const primaryType = result ? ENNEAGRAM_TYPES[result.primaryType] : null;

    if (!hasCompleted || !result || !primaryType) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
                    <Lock size={64} className="mx-auto text-purple-600 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Completa tu Perfil</h2>
                    <p className="text-slate-600 mb-6">
                        Para ver tu progreso, primero debes completar el cuestionario de Eneagrama.
                    </p>
                    <a
                        href="/questionnaire"
                        className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                        Completar Cuestionario
                    </a>
                </div>
            </div>
        );
    }

    const maxScore = Math.max(...chartData.map(d => d.score));
    const centerX = 200;
    const centerY = 200;
    const maxRadius = 150;

    const radarPoints = chartData.map((data, index) => {
        const angle = (index * 2 * Math.PI) / 9 - Math.PI / 2;
        const radius = (data.score / maxScore) * maxRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return { x, y, ...data };
    });

    const radarPolygon = radarPoints.map(p => `${p.x},${p.y}`).join(' ');
    const gridCircles = [0.25, 0.5, 0.75, 1].map(ratio => ratio * maxRadius);

    const labels = chartData.map((data, index) => {
        const angle = (index * 2 * Math.PI) / 9 - Math.PI / 2;
        const labelRadius = maxRadius + 30;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);
        return { x, y, type: data.type, name: data.name.replace('El ', '') };
    });

    // Mood timeline chart (last 7 check-ins)
    const moodTimeline = recentCheckIns.slice(-7).reverse();

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
            {/* Header con botón de acción rápida */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                        <TrendingUp className="text-purple-600" size={40} />
                        Mi Proceso
                    </h1>
                    <p className="text-slate-600">Tu evolución impulsada por check-ins, tareas y colaboración</p>
                </div>
                <Button
                    onClick={() => window.location.href = '/dashboard/employee/checkins'}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Check-in
                </Button>
            </div>

            {/* Stats Cards - Métricas Principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <Heart className="text-pink-500" size={24} />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">{checkIns.length}</p>
                    <p className="text-xs md:text-sm text-slate-500">Check-ins Totales</p>
                    <div className="mt-2 text-xs text-pink-600 font-medium">
                        {recentCheckIns.length} este mes
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle2 className="text-green-500" size={24} />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">
                        {taskStats?.completed || 0}
                    </p>
                    <p className="text-xs md:text-sm text-slate-500">Tareas Completadas</p>
                    <div className="mt-2 text-xs text-green-600 font-medium">
                        {taskStats?.recentlyCompleted || 0} esta semana
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="text-blue-500" size={24} />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">
                        {teamStats?.collaborationScore || 0}%
                    </p>
                    <p className="text-xs md:text-sm text-slate-500">Score Colaboración</p>
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                        {teamStats?.total || 0} interacciones
                    </div>
                </div>

                <div className="bg-white rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <Zap className="text-amber-500" size={24} />
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-slate-900">
                        {avgEnergy.toFixed(1)}
                    </p>
                    <p className="text-xs md:text-sm text-slate-500">Energía Promedio</p>
                    <div className="mt-2 text-xs text-amber-600 font-medium">
                        De 5.0 max
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Estado Emocional */}
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Estado Emocional</h2>
                            <p className="text-sm text-slate-500">Últimos 30 días</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold" style={{ color: avgMoodScore >= 4 ? '#10b981' : avgMoodScore >= 3 ? '#f59e0b' : '#ef4444' }}>
                                {avgMoodScore.toFixed(1)}
                            </div>
                            <div className="text-xs text-slate-500">de 5.0</div>
                        </div>
                    </div>

                    {moodTimeline.length > 0 ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                                <span>Últimos check-ins</span>
                                <span>Nivel</span>
                            </div>
                            {moodTimeline.map((checkIn) => {
                                const moodConfig = MOOD_CONFIG[checkIn.mood];
                                return (
                                    <div key={checkIn.id} className="flex items-center gap-3">
                                        <div className="text-2xl">{moodConfig.emoji}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-slate-700">
                                                    {new Date(checkIn.date).toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })}
                                                </span>
                                                <span className="text-xs text-slate-500">{moodConfig.label}</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${(checkIn.energy / 5) * 100}%`,
                                                        backgroundColor: moodConfig.color
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-slate-700 w-8 text-right">
                                            {checkIn.energy}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Heart className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500 mb-4">Aún no hay check-ins registrados</p>
                            <Button
                                onClick={() => window.location.href = '/dashboard/employee/checkins'}
                                variant="outline"
                            >
                                Crear Primer Check-in
                            </Button>
                        </div>
                    )}

                    {/* Wellness Score */}
                    {recentCheckIns.length > 0 && (
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-blue-900">Energía</span>
                                    <Zap size={16} className="text-blue-600" />
                                </div>
                                <div className="text-2xl font-bold text-blue-900">{avgEnergy.toFixed(1)}</div>
                                <div className="text-xs text-blue-700">Promedio mensual</div>
                            </div>

                            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-orange-900">Estrés</span>
                                    <BarChart3 size={16} className="text-orange-600" />
                                </div>
                                <div className="text-2xl font-bold text-orange-900">{avgStress.toFixed(1)}</div>
                                <div className="text-xs text-orange-700">Promedio mensual</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Productividad - Tareas */}
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Productividad</h2>
                            <p className="text-sm text-slate-500">Gestión de tareas</p>
                        </div>
                        <Button
                            onClick={() => window.location.href = '/dashboard/employee/tareas'}
                            size="sm"
                            variant="outline"
                        >
                            Ver Tareas
                        </Button>
                    </div>

                    {taskStats && taskStats.total > 0 ? (
                        <div className="space-y-6">
                            {/* Completion Ring */}
                            <div className="flex items-center justify-center">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            fill="none"
                                            stroke="#e2e8f0"
                                            strokeWidth="12"
                                        />
                                        <circle
                                            cx="80"
                                            cy="80"
                                            r="70"
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="12"
                                            strokeDasharray={`${2 * Math.PI * 70 * (taskStats.completionRate / 100)} ${2 * Math.PI * 70}`}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <div className="text-3xl font-bold text-slate-900">
                                            {Math.round(taskStats.completionRate)}%
                                        </div>
                                        <div className="text-xs text-slate-500">Completitud</div>
                                    </div>
                                </div>
                            </div>

                            {/* Task Breakdown */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-900">{taskStats.completed}</div>
                                    <div className="text-xs text-green-700">Completadas</div>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-900">{taskStats.inProgress}</div>
                                    <div className="text-xs text-blue-700">En Progreso</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <div className="text-2xl font-bold text-slate-900">{taskStats.pending}</div>
                                    <div className="text-xs text-slate-700">Pendientes</div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="text-white" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-green-900">
                                            {taskStats.recentlyCompleted} tareas completadas
                                        </p>
                                        <p className="text-xs text-green-700">En los últimos 7 días</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Target className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500 mb-4">Aún no hay tareas creadas</p>
                            <Button
                                onClick={() => window.location.href = '/dashboard/employee/tareas'}
                                variant="outline"
                            >
                                Crear Primera Tarea
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Radar Chart & Team Collaboration */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Radar Chart */}
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Distribución de Eneatipos</h2>
                    <p className="text-sm text-slate-500 mb-6">Tu perfil a través de los 9 tipos</p>

                    <div className="flex justify-center">
                        <svg viewBox="0 0 400 400" className="w-full max-w-md">
                            {gridCircles.map((radius, i) => (
                                <circle key={i} cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="1" />
                            ))}
                            {chartData.map((_, index) => {
                                const angle = (index * 2 * Math.PI) / 9 - Math.PI / 2;
                                const endX = centerX + maxRadius * Math.cos(angle);
                                const endY = centerY + maxRadius * Math.sin(angle);
                                return <line key={index} x1={centerX} y1={centerY} x2={endX} y2={endY} stroke="#e2e8f0" strokeWidth="1" />;
                            })}
                            <polygon points={radarPolygon} fill={primaryType.color} fillOpacity="0.3" stroke={primaryType.color} strokeWidth="3" />
                            {radarPoints.map((point, index) => (
                                <circle key={index} cx={point.x} cy={point.y} r="6" fill={point.type === result.primaryType ? primaryType.color : '#94a3b8'} stroke="white" strokeWidth="2" />
                            ))}
                            {labels.map((label, index) => (
                                <g key={index}>
                                    <circle cx={label.x} cy={label.y} r="18" fill={chartData[index].color} opacity="0.9" />
                                    <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="bold">{label.type}</text>
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* Team Collaboration */}
                <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Colaboración en Equipo</h2>
                            <p className="text-sm text-slate-500">Cómo te llevás con tu equipo</p>
                        </div>
                        <Button
                            onClick={() => window.location.href = '/dashboard/employee/equipo'}
                            size="sm"
                            variant="outline"
                        >
                            Ver Equipo
                        </Button>
                    </div>

                    {teamStats && teamStats.total > 0 ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-blue-600 mb-2">
                                    {teamStats.collaborationScore}%
                                </div>
                                <div className="text-sm text-slate-600">Score de Colaboración</div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="text-2xl mb-1">😊</div>
                                    <div className="text-lg font-bold text-green-900">{teamStats.positive}</div>
                                    <div className="text-xs text-green-700">Positivas</div>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="text-2xl mb-1">😐</div>
                                    <div className="text-lg font-bold text-blue-900">{teamStats.neutral}</div>
                                    <div className="text-xs text-blue-700">Neutrales</div>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                                    <div className="text-2xl mb-1">😔</div>
                                    <div className="text-lg font-bold text-red-900">{teamStats.negative}</div>
                                    <div className="text-xs text-red-700">Negativas</div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                                <p className="text-sm text-slate-700">
                                    💡 <strong>Consejo:</strong> Tu tipo {result.primaryType} trabaja mejor con tipos{' '}
                                    {primaryType.compatibleWith.join(', ')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users className="mx-auto text-slate-300 mb-4" size={48} />
                            <p className="text-slate-500 mb-2">Sin interacciones registradas</p>
                            <p className="text-xs text-slate-400 mb-4">Las interacciones se registrarán automáticamente</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
