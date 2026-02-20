// Mock data para colaboración con equipo
export interface TeamInteraction {
    id: string;
    userId: string;
    teammateId: string;
    teammateName: string;
    teammateType: number; // Eneatipo
    type: 'collaboration' | 'feedback' | 'conflict' | 'support';
    quality: 'positive' | 'neutral' | 'negative';
    date: string;
    notes?: string;
}

export const INTERACTION_TYPES = {
    collaboration: { label: 'Colaboración', icon: '🤝', color: '#3b82f6' },
    feedback: { label: 'Feedback', icon: '💬', color: '#8b5cf6' },
    conflict: { label: 'Conflicto', icon: '⚠️', color: '#ef4444' },
    support: { label: 'Apoyo', icon: '❤️', color: '#10b981' }
};

export const saveTeamInteraction = (interaction: TeamInteraction): void => {
    const key = `team_interactions_${interaction.userId}`;
    const existing = getTeamInteractions(interaction.userId);
    localStorage.setItem(key, JSON.stringify([...existing, interaction]));
};

export const getTeamInteractions = (userId: string): TeamInteraction[] => {
    const key = `team_interactions_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

export const getTeamStats = (userId: string) => {
    const interactions = getTeamInteractions(userId);

    const positive = interactions.filter(i => i.quality === 'positive').length;
    const neutral = interactions.filter(i => i.quality === 'neutral').length;
    const negative = interactions.filter(i => i.quality === 'negative').length;

    const collaborationScore = interactions.length > 0
        ? ((positive * 1 + neutral * 0.5) / interactions.length) * 100
        : 0;

    return {
        total: interactions.length,
        positive,
        neutral,
        negative,
        collaborationScore: Math.round(collaborationScore)
    };
};

// Mock teammates para demo
export const getMockTeammates = () => [
    { id: '1', name: 'María González', enneagramType: 2, role: 'Marketing' },
    { id: '2', name: 'Juan Pérez', enneagramType: 8, role: 'Ventas' },
    { id: '3', name: 'Ana López', enneagramType: 5, role: 'IT' },
    { id: '4', name: 'Carlos Ruiz', enneagramType: 3, role: 'Gerencia' }
];
