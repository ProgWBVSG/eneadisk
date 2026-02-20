import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Users, UserPlus, UserMinus, TrendingUp, ListTodo, Plus } from 'lucide-react';
import {
    type Team,
    type TeamMember,
    getTeamMembers,
    addMemberToTeam,
    removeMemberFromTeam,
    getAvailableEmployees,
    getTeamEnneagramDistribution,
    getTeamCompatibilityScore,
} from '../utils/teams';
import { getEnneagramBadge } from '../utils/enneagramColors';
import { Button } from './ui/Button';
import type { Task } from '../utils/tasks';
import { getTeamTasks, deleteTeamTask } from '../utils/tasks';
import { TeamTaskCard, TeamTaskModal } from './TeamTaskComponents';

interface TeamDetailViewProps {
    team: Team;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const TeamDetailView: React.FC<TeamDetailViewProps> = ({
    team,
    onClose,
    onEdit,
    onDelete,
}) => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [availableEmployees, setAvailableEmployees] = useState<TeamMember[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [distribution, setDistribution] = useState<{ [key: number]: number }>({});
    const [compatibilityScore, setCompatibilityScore] = useState(0);
    const [teamTasks, setTeamTasks] = useState<Task[]>([]);
    const [showTaskModal, setShowTaskModal] = useState(false);

    useEffect(() => {
        loadData();
    }, [team]);

    const loadData = () => {
        const teamMembers = getTeamMembers(team.id);
        setMembers(teamMembers);

        const available = getAvailableEmployees(team.companyId);
        setAvailableEmployees(available);

        const dist = getTeamEnneagramDistribution(team.id);
        setDistribution(dist);

        const score = getTeamCompatibilityScore(team.id);
        setCompatibilityScore(score);

        // Load team tasks
        const tasks = getTeamTasks(team.id);
        setTeamTasks(tasks);
    };

    const handleAddMember = () => {
        if (!selectedEmployee) return;

        try {
            addMemberToTeam(team.id, selectedEmployee);
            setSelectedEmployee('');
            loadData();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Error al agregar miembro');
        }
    };

    const handleRemoveMember = (userId: string) => {
        if (confirm('¿Estás seguro de que deseas remover a este miembro del equipo?')) {
            try {
                removeMemberFromTeam(team.id, userId);
                loadData();
            } catch (error) {
                alert(error instanceof Error ? error.message : 'Error al remover miembro');
            }
        }
    };

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver a Equipos
                </button>

                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">{team.name}</h1>
                        {team.description && (
                            <p className="text-slate-600">{team.description}</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button onClick={onEdit} variant="outline" className="flex items-center gap-2">
                            <Edit className="w-4 h-4" />
                            Editar
                        </Button>
                        <Button
                            onClick={onDelete}
                            variant="outline"
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Members Section - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Add Member Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                            <UserPlus className="w-5 h-5" />
                            Agregar Miembro
                        </h3>

                        {availableEmployees.length === 0 ? (
                            <p className="text-blue-700 text-sm">
                                No hay empleados disponibles para agregar. Todos los empleados ya están asignados a equipos.
                            </p>
                        ) : (
                            <div className="flex gap-3">
                                <select
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                    className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    <option value="">Seleccionar empleado...</option>
                                    {availableEmployees.map(employee => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.name} - {employee.email}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    onClick={handleAddMember}
                                    disabled={!selectedEmployee}
                                    className="whitespace-nowrap"
                                >
                                    Agregar
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Members List */}
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Users className="w-6 h-6" />
                            Miembros del Equipo ({members.length})
                        </h3>

                        {members.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                                <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-600">
                                    Este equipo aún no tiene miembros. Agrega empleados para comenzar.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {members.map(member => (
                                    <MemberCard
                                        key={member.id}
                                        member={member}
                                        onRemove={() => handleRemoveMember(member.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Analysis Panel - 1/3 width */}
                <div className="space-y-6">
                    {/* Compatibility Score */}
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Score de Compatibilidad
                        </h3>

                        <div className="flex items-center justify-center mb-4">
                            <div className="relative w-32 h-32">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#e2e8f0"
                                        strokeWidth="12"
                                        fill="none"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="#8b5cf6"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeDasharray={`${(compatibilityScore / 100) * 351.86} 351.86`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-purple-900">{compatibilityScore}%</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-purple-700 text-center">
                            {compatibilityScore >= 70 ? '¡Excelente diversidad!' :
                                compatibilityScore >= 40 ? 'Buena composición' :
                                    'Considera agregar más diversidad'}
                        </p>
                    </div>

                    {/* Enneagram Distribution */}
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">
                            Distribución de Eneatipos
                        </h3>

                        {Object.keys(distribution).length === 0 ? (
                            <p className="text-sm text-slate-600 text-center py-4">
                                No hay datos de eneagrama disponibles
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(distribution)
                                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                    .map(([type, count]) => {
                                        const badge = getEnneagramBadge(parseInt(type));
                                        if (!badge) return null;

                                        return (
                                            <div key={type}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-slate-700">
                                                        Tipo {type}: {badge.name}
                                                    </span>
                                                    <span className="text-sm font-semibold text-slate-900">{count}</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2">
                                                    <div
                                                        className="h-2 rounded-full transition-all"
                                                        style={{
                                                            width: `${(count / members.length) * 100}%`,
                                                            backgroundColor: badge.text,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tasks Section - Full Width */}
            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                        <ListTodo className="w-6 h-6" />
                        Tareas del Equipo ({teamTasks.length})
                    </h3>
                    <Button
                        onClick={() => setShowTaskModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Asignar Tarea
                    </Button>
                </div>

                {teamTasks.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                        <ListTodo className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600">
                            No hay tareas asignadas a este equipo. Crea la primera tarea.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamTasks.map(task => (
                            <TeamTaskCard
                                key={task.id}
                                task={task}
                                onDelete={() => {
                                    deleteTeamTask(team.id, task.id);
                                    loadData();
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Task Creation Modal */}
            {showTaskModal && (
                <TeamTaskModal
                    team={team}
                    onClose={() => setShowTaskModal(false)}
                    onSave={() => {
                        setShowTaskModal(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

// Member Card Component
interface MemberCardProps {
    member: TeamMember;
    onRemove: () => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, onRemove }) => {
    const badge = member.enneagramType ? getEnneagramBadge(member.enneagramType) : null;

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{member.name}</h4>
                        <p className="text-sm text-slate-600">{member.email}</p>

                        {/* Enneagram Badge */}
                        {badge ? (
                            <div
                                className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: badge.bg, color: badge.text }}
                            >
                                <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold"
                                    style={{ backgroundColor: badge.text, color: 'white' }}>
                                    {member.enneagramType}
                                </span>
                                {badge.name}
                            </div>
                        ) : (
                            <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                Eneagrama pendiente
                            </span>
                        )}
                    </div>
                </div>

                {/* Remove Button */}
                <button
                    onClick={onRemove}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover del equipo"
                >
                    <UserMinus className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
