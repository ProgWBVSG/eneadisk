// Team Task Card Component
import React from 'react';
import { Calendar, Flag, X } from 'lucide-react';
import type { Task } from '../utils/tasks';
import { PRIORITY_CONFIG, CATEGORY_CONFIG } from '../utils/tasks';

interface TeamTaskCardProps {
    task: Task;
    onDelete: () => void;
}

export const TeamTaskCard: React.FC<TeamTaskCardProps> = ({ task, onDelete }) => {
    const priority = PRIORITY_CONFIG[task.priority];
    const category = CATEGORY_CONFIG[task.category];

    return (
        <div
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-all"
            style={{ borderLeftWidth: '4px', borderLeftColor: priority.color }}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-900 flex-1">{task.title}</h4>
                <button
                    onClick={onDelete}
                    className="text-slate-400 hover:text-red-600 transition-colors"
                    title="Eliminar tarea"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {task.description && (
                <p className="text-sm text-slate-600 mb-3">{task.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs">
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

                {/* Due Date */}
                {task.dueDate && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                )}
            </div>

            {/* Assigned By */}
            <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                    Asignada por: <span className="font-medium text-slate-700">{task.assignedByName}</span>
                </span>
            </div>
        </div>
    );
};

// Team Task Modal Component
import { useState } from 'react';
import { createTeamTask } from '../utils/tasks';
import type { Team } from '../utils/teams';
import { useAuth } from '../context/AuthContext';

interface TeamTaskModalProps {
    team: Team;
    onClose: () => void;
    onSave: () => void;
}

export const TeamTaskModal: React.FC<TeamTaskModalProps> = ({ team, onClose, onSave }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium' as Task['priority'],
        category: 'team' as Task['category'],
        dueDate: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert('El tÃ­tulo es requerido');
            return;
        }

        if (!user) return;

        // Create team task
        createTeamTask(
            team.id,
            {
                ...formData,
                status: 'pending',
            },
            user.id,
            user.name ?? 'Usuario'
        );

        onSave();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">
                        Asignar Tarea al Equipo
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            TÃ­tulo *
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
                            DescripciÃ³n
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
                            Asignar Tarea
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

