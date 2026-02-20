import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTeams, deleteTeam, type Team } from '../../utils/teams';
import { Button } from '../../components/ui/Button';
import { TeamModal } from '../../components/TeamModal';
import { TeamDetailView } from '../../components/TeamDetailView';

export const TeamManagement: React.FC = () => {
    const { user } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [showDetailView, setShowDetailView] = useState(false);

    // Load teams
    useEffect(() => {
        if (user?.companyId) {
            loadTeams();
        }
    }, [user]);

    const loadTeams = () => {
        if (user?.companyId) {
            const companyTeams = getTeams(user.companyId);
            setTeams(companyTeams);
        }
    };

    const handleDelete = (teamId: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
            try {
                deleteTeam(teamId);
                loadTeams();
            } catch (error) {
                alert(error instanceof Error ? error.message : 'Error al eliminar equipo');
            }
        }
    };

    const handleViewDetail = (team: Team) => {
        setSelectedTeam(team);
        setShowDetailView(true);
    };

    const handleEdit = (team: Team) => {
        setEditingTeam(team);
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setEditingTeam(null);
        loadTeams();
    };

    const handleCloseDetailView = () => {
        setShowDetailView(false);
        setSelectedTeam(null);
        loadTeams();
    };

    if (showDetailView && selectedTeam) {
        return (
            <TeamDetailView
                team={selectedTeam}
                onClose={handleCloseDetailView}
                onEdit={() => {
                    setEditingTeam(selectedTeam);
                    setShowDetailView(false);
                    setShowCreateModal(true);
                }}
                onDelete={() => {
                    handleDelete(selectedTeam.id);
                    setShowDetailView(false);
                    setSelectedTeam(null);
                }}
            />
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestión de Equipos</h1>
                    <p className="text-slate-600 mt-2">
                        Administra tus equipos y visualiza las características del eneagrama
                    </p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Crear Equipo
                </Button>
            </div>

            {/* Stats */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-blue-900">
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">
                        Total de equipos: {teams.length}
                    </span>
                </div>
            </div>

            {/* Teams Grid */}
            {teams.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                    <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        No hay equipos creados
                    </h3>
                    <p className="text-slate-600 mb-6">
                        Crea tu primer equipo para comenzar a organizar a tus empleados
                    </p>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Crear Primer Equipo
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map(team => (
                        <TeamCard
                            key={team.id}
                            team={team}
                            onView={() => handleViewDetail(team)}
                            onEdit={() => handleEdit(team)}
                            onDelete={() => handleDelete(team.id)}
                        />
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <TeamModal
                    isOpen={showCreateModal}
                    onClose={handleCloseModal}
                    team={editingTeam}
                    companyId={user?.companyId || ''}
                />
            )}
        </div>
    );
};

// Team Card Component
interface TeamCardProps {
    team: Team;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onView, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-lg border border-slate-200 hover:border-blue-400 transition-all hover:shadow-lg p-6">
            {/* Team Name */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{team.name}</h3>
                    {team.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">{team.description}</p>
                    )}
                </div>
            </div>

            {/* Member Count */}
            <div className="flex items-center gap-2 mb-4 text-slate-700">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                    {team.memberIds.length} {team.memberIds.length === 1 ? 'miembro' : 'miembros'}
                </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                    onClick={onView}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors text-sm font-medium"
                >
                    <Eye className="w-4 h-4" />
                    Ver Detalle
                </button>
                <button
                    onClick={onEdit}
                    className="flex items-center justify-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                >
                    <Edit className="w-4 h-4" />
                </button>
                <button
                    onClick={onDelete}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
