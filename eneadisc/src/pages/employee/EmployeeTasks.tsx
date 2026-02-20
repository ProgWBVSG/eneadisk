import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Clock, Building2, User, X, Calendar, Flag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Task } from '../../utils/tasks';
import {
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    getUserTeamTasks,
    isTeamTask,
    PRIORITY_CONFIG,
    CATEGORY_CONFIG
} from '../../utils/tasks';

type FilterType = 'all' | 'personal' | 'team';
type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed';

export const EmployeeTasks: React.FC = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Demo team ID - in production this would come from user data
    const teamId = 'demo-team-marketing';

    useEffect(() => {
        loadTasks();
    }, [user]);

    const loadTasks = () => {
        if (!user) return;
        const allTasks = getUserTeamTasks(user.id, teamId);
        setTasks(allTasks);
    };

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        // Filter by type
        if (filterType === 'personal' && isTeamTask(task)) return false;
        if (filterType === 'team' && !isTeamTask(task)) return false;

        // Filter by status
        if (statusFilter !== 'all' && task.status !== statusFilter) return false;

        return true;
    });

    // Calculate stats
    const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        personal: tasks.filter(t => !isTeamTask(t)).length,
        team: tasks.filter(t => isTeamTask(t)).length,
    };

    const handleCreateTask = () => {
        setEditingTask(null);
        setShowModal(true);
    };

    const handleEditTask = (task: Task) => {
        if (isTeamTask(task)) {
            alert('No puedes editar tareas asignadas por la empresa');
            return;
        }
        setEditingTask(task);
        setShowModal(true);
    };

    const handleDeleteTask = (task: Task) => {
        if (isTeamTask(task)) {
            alert('No puedes eliminar tareas asignadas por la empresa');
            return;
        }
        if (confirm('¿Estás seguro de eliminar esta tarea?')) {
            deleteTask(user!.id, task.id);
            loadTasks();
        }
    };

    const handleToggleComplete = (task: Task) => {
        if (!user) return;

        if (isTeamTask(task)) {
            // Team tasks can't be completed by employees in this version
            alert('Solo puedes marcar como completadas tus tareas personales');
            return;
        }

        if (task.status === 'completed') {
            updateTask(user.id, task.id, { status: 'pending', completedAt: undefined });
        } else {
            completeTask(user.id, task.id);
        }
        loadTasks();
    };

    const handleToggleInProgress = (task: Task) => {
        if (!user || isTeamTask(task)) return;

        const newStatus = task.status === 'in_progress' ? 'pending' : 'in_progress';
        updateTask(user.id, task.id, { status: newStatus });
        loadTasks();
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header with Stats */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-slate-900">Mis Tareas</h1>
                    <button
                        onClick={handleCreateTask}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Tarea
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="text-sm text-slate-600 mb-1">Total</div>
                        <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-sm text-green-700 mb-1">Completadas</div>
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-sm text-purple-700 mb-1">En Progreso</div>
                        <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="text-sm text-orange-700 mb-1">Pendientes</div>
                        <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
                {/* Type Filters */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filterType === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        Todas ({stats.total})
                    </button>
                    <button
                        onClick={() => setFilterType('personal')}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${filterType === 'personal'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        Personales ({stats.personal})
                    </button>
                    <button
                        onClick={() => setFilterType('team')}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${filterType === 'team'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        <Building2 className="w-4 h-4" />
                        Del Equipo ({stats.team})
                    </button>
                </div>

                {/* Status Filters */}
                <div className="flex gap-2 flex-wrap">
                    <span className="text-sm text-slate-600 py-2">Filtrar por estado:</span>
                    {(['all', 'pending', 'in_progress', 'completed'] as StatusFilter[]).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${statusFilter === status
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {status === 'all' && 'Todas'}
                            {status === 'pending' && 'Pendientes'}
                            {status === 'in_progress' && 'En Progreso'}
                            {status === 'completed' && 'Completadas'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tasks List */}
            <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                        <Circle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700 mb-2">
                            No hay tareas aquí
                        </h3>
                        <p className="text-slate-600">
                            {filterType === 'personal' ? 'Crea tu primera tarea personal' : 'No hay tareas que mostrar'}
                        </p>
                    </div>
                ) : (
                    filteredTasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onToggleComplete={() => handleToggleComplete(task)}
                            onToggleInProgress={() => handleToggleInProgress(task)}
                            onEdit={() => handleEditTask(task)}
                            onDelete={() => handleDeleteTask(task)}
                        />
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <TaskModal
                    task={editingTask}
                    onClose={() => {
                        setShowModal(false);
                        setEditingTask(null);
                    }}
                    onSave={() => {
                        setShowModal(false);
                        setEditingTask(null);
                        loadTasks();
                    }}
                    userId={user!.id}
                />
            )}
        </div>
    );
};

// Task Card Component
interface TaskCardProps {
    task: Task;
    onToggleComplete: () => void;
    onToggleInProgress: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onToggleInProgress, onEdit, onDelete }) => {
    const isTeam = isTeamTask(task);
    const priority = PRIORITY_CONFIG[task.priority];
    const category = CATEGORY_CONFIG[task.category];

    return (
        <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all ${task.status === 'completed' ? 'opacity-60' : ''
            }`} style={{ borderLeftWidth: '4px', borderLeftColor: priority.color }}>
            <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                    onClick={onToggleComplete}
                    className="mt-0.5 flex-shrink-0"
                    disabled={isTeam}
                >
                    {task.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                        <Circle className={`w-6 h-6 ${isTeam ? 'text-slate-300' : 'text-slate-400 hover:text-blue-600'}`} />
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className={`font-semibold text-slate-900 ${task.status === 'completed' ? 'line-through' : ''}`}>
                            {task.title}
                        </h3>
                        {!isTeam && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={onEdit}
                                    className="text-slate-400 hover:text-blue-600 transition-colors"
                                    title="Editar"
                                >
                                    <Calendar className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="text-slate-400 hover:text-red-600 transition-colors"
                                    title="Eliminar"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {task.description && (
                        <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                    )}

                    {/* Badges and Meta */}
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        {/* Priority Badge */}
                        <span
                            className="px-2 py-1 rounded-full font-medium flex items-center gap-1"
                            style={{ backgroundColor: priority.bg, color: priority.color }}
                        >
                            <Flag className="w-3 h-3" />
                            {priority.label}
                        </span>

                        {/* Category Badge */}
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full">
                            {category.icon} {category.label}
                        </span>

                        {/* Status Badge */}
                        {task.status === 'in_progress' && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                En Progreso
                            </span>
                        )}

                        {/* Team Task Badge */}
                        {isTeam && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                Asignada por {task.assignedByName || 'Empresa'}
                            </span>
                        )}

                        {/* Due Date */}
                        {task.dueDate && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    {/* In Progress Toggle (only for personal tasks) */}
                    {!isTeam && task.status !== 'completed' && (
                        <button
                            onClick={onToggleInProgress}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                        >
                            {task.status === 'in_progress' ? '← Volver a pendiente' : '▶ Marcar en progreso'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Task Modal Component
interface TaskModalProps {
    task: Task | null;
    onClose: () => void;
    onSave: () => void;
    userId: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave, userId }) => {
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'medium' as Task['priority'],
        category: task?.category || 'personal' as Task['category'],
        dueDate: task?.dueDate || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('El título es requerido');
            return;
        }

        if (task) {
            // Edit existing task
            updateTask(userId, task.id, formData);
        } else {
            // Create new task
            addTask(userId, {
                ...formData,
                status: 'pending',
            });
        }

        onSave();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {task ? 'Editar Tarea' : 'Nueva Tarea'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Título *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: Completar reporte semanal"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            placeholder="Detalles adicionales..."
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Prioridad
                        </label>
                        <div className="flex gap-2">
                            {(Object.entries(PRIORITY_CONFIG) as [Task['priority'], typeof PRIORITY_CONFIG[Task['priority']]][]).map(([key, config]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: key })}
                                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${formData.priority === key
                                        ? 'border-current'
                                        : 'border-transparent'
                                        }`}
                                    style={{
                                        backgroundColor: config.bg,
                                        color: config.color,
                                    }}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Categoría
                        </label>
                        <div className="flex gap-2">
                            {(Object.entries(CATEGORY_CONFIG) as [Task['category'], typeof CATEGORY_CONFIG[Task['category']]][]).map(([key, config]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: key })}
                                    className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all ${formData.category === key
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                        }`}
                                >
                                    {config.icon} {config.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Fecha de vencimiento
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {task ? 'Guardar Cambios' : 'Crear Tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
