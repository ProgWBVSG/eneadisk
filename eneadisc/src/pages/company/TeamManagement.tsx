import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Eye, HelpCircle, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTeams, deleteTeam, type Team } from '../../utils/teams';
import { Button } from '../../components/ui/Button';
import { TeamModal } from '../../components/TeamModal';
import { TeamsTutorial } from '../../components/tutorial/TeamsTutorial';
import { TeamDetailView } from '../../components/TeamDetailView';
import { getEmployeesOverview } from '../../utils/adminFeatures';
import { suggestTeams, analyzeGaps, TRIADS, triadOf, type SuggestablePerson } from '../../utils/teamSuggester';
import { ENNEAGRAM_TYPES } from '../../data/enneagramData';

export const TeamManagement: React.FC = () => {
    const { user } = useAuth();
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [showDetailView, setShowDetailView] = useState(false);
    const [runTutorial, setRunTutorial] = useState(false);
    const [showSuggester, setShowSuggester] = useState(false);

    // Load teams
    useEffect(() => {
        if (user?.companyId) {
            loadTeams();
        }
    }, [user]);

    const loadTeams = async () => {
        if (user?.companyId) {
            const companyTeams = await getTeams(user.companyId);
            setTeams(companyTeams);
        }
    };

    const handleDelete = async (teamId: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar este equipo?')) {
            try {
                await deleteTeam(teamId);
                await loadTeams();
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
            <TeamsTutorial forceRun={runTutorial} onResetComplete={() => setRunTutorial(false)} />

            {/* Header */}
            <div id="tour-teams-header" className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900">Gestión de Equipos</h1>
                        <button 
                            onClick={() => setRunTutorial(true)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                            title="Repetir Tutorial"
                        >
                            <HelpCircle size={20} />
                        </button>
                    </div>
                    <p className="text-slate-600 mt-2">
                        Administra tus equipos y visualiza las características del eneagrama
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSuggester(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors font-medium text-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        Sugeridor de equipos
                    </button>
                    <Button
                        id="tour-create-team"
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Crear Equipo
                    </Button>
                </div>
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
            <div id="tour-teams-list">
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
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <TeamModal
                    isOpen={showCreateModal}
                    onClose={handleCloseModal}
                    team={editingTeam}
                    companyId={user?.companyId || ''}
                />
            )}

            {/* Sugeridor de equipos */}
            {showSuggester && <TeamSuggesterModal onClose={() => setShowSuggester(false)} />}
        </div>
    );
};

// ════════════════ SUGERIDOR DE EQUIPOS ════════════════
const TeamSuggesterModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [people, setPeople] = useState<SuggestablePerson[]>([]);
    const [loading, setLoading] = useState(true);
    const [numTeams, setNumTeams] = useState(2);

    useEffect(() => {
        (async () => {
            const overview = await getEmployeesOverview();
            setPeople(overview.filter((e) => e.enneagramType).map((e) => ({ id: e.id, name: e.name, enneagramType: e.enneagramType! })));
            setLoading(false);
        })();
    }, []);

    const suggested = people.length > 0 ? suggestTeams(people, numTeams) : [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full p-6 my-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Sparkles className="text-purple-600" size={22} /> Sugeridor de equipos equilibrados</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
                </div>
                <p className="text-sm text-slate-500 mb-4">Distribuye a tu gente en equipos balanceando los 3 centros del eneagrama: acción, relaciones e ideas.</p>

                {loading ? (
                    <div className="py-10 text-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mx-auto" /></div>
                ) : people.length < 2 ? (
                    <div className="py-8 text-center text-slate-500"><Users className="mx-auto mb-3 text-slate-300" size={40} /><p>Necesitás al menos 2 personas con el test completado para sugerir equipos.</p></div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-5">
                            <label className="text-sm font-medium text-slate-700">Cantidad de equipos:</label>
                            <div className="flex gap-1">
                                {[2, 3, 4].filter((n) => n <= people.length).map((n) => (
                                    <button key={n} onClick={() => setNumTeams(n)}
                                        className={`w-9 h-9 rounded-lg text-sm font-medium ${numTeams === n ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{n}</button>
                                ))}
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {suggested.map((team, i) => {
                                const gaps = analyzeGaps(team.members.map((m) => m.enneagramType));
                                return (
                                    <div key={i} className="border border-slate-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-bold text-slate-900">Equipo {i + 1}</h3>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${gaps.balance === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{gaps.balance}% equilibrado</span>
                                        </div>
                                        <div className="space-y-2 mb-3">
                                            {team.members.map((m) => {
                                                const ct = ENNEAGRAM_TYPES[m.enneagramType];
                                                return (
                                                    <div key={m.id} className="flex items-center gap-2 text-sm">
                                                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: ct.color }}>{m.enneagramType}</span>
                                                        <span className="text-slate-800 truncate">{m.name}</span>
                                                        <span className="text-xs text-slate-400 ml-auto">{TRIADS[triadOf(m.enneagramType)].emoji}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-slate-500 border-t border-slate-100 pt-2">{gaps.summary}</p>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-slate-400 mt-4">💡 Esta es una sugerencia. Podés crear los equipos manualmente con el botón "Crear Equipo".</p>
                    </>
                )}
            </div>
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
