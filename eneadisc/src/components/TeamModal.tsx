import React, { useState } from 'react';
import { X } from 'lucide-react';
import { createTeam, updateTeam, type Team } from '../utils/teams';
import { Button } from './ui/Button';

interface TeamModalProps {
    isOpen: boolean;
    onClose: () => void;
    team: Team | null; // null = crear, objeto = editar
    companyId: string;
}

export const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose, team, companyId }) => {
    const [name, setName] = useState(team?.name || '');
    const [description, setDescription] = useState(team?.description || '');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (!name.trim()) {
            setError('El nombre del equipo es obligatorio');
            return;
        }

        if (name.length > 50) {
            setError('El nombre no puede tener más de 50 caracteres');
            return;
        }

        if (description && description.length > 200) {
            setError('La descripción no puede tener más de 200 caracteres');
            return;
        }

        try {
            if (team) {
                // Editar equipo existente
                updateTeam(team.id, { name: name.trim(), description: description.trim() });
            } else {
                // Crear nuevo equipo
                createTeam({
                    name: name.trim(),
                    description: description.trim(),
                    companyId,
                    ownerId: companyId, // In production, use actual owner ID
                    memberIds: [],
                });
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar el equipo');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {team ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Name Input */}
                    <div className="mb-4">
                        <label htmlFor="team-name" className="block text-sm font-semibold text-slate-700 mb-2">
                            Nombre del Equipo <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="team-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: Equipo Marketing"
                            maxLength={50}
                        />
                        <p className="text-xs text-slate-500 mt-1">{name.length}/50 caracteres</p>
                    </div>

                    {/* Description Input */}
                    <div className="mb-4">
                        <label htmlFor="team-description" className="block text-sm font-semibold text-slate-700 mb-2">
                            Descripción (Opcional)
                        </label>
                        <textarea
                            id="team-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            placeholder="Ej: Equipo enfocado en estrategias de marketing digital..."
                            rows={3}
                            maxLength={200}
                        />
                        <p className="text-xs text-slate-500 mt-1">{description.length}/200 caracteres</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1">
                            {team ? 'Guardar Cambios' : 'Crear Equipo'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
