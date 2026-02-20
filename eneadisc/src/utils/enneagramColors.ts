// Configuration for Enneagram type colors and names
export const ENNEAGRAM_COLORS = {
    1: { bg: '#fee2e2', text: '#b91c1c', name: 'El Perfeccionista' },
    2: { bg: '#fef3c7', text: '#d97706', name: 'El Ayudador' },
    3: { bg: '#dbeafe', text: '#1e40af', name: 'El Triunfador' },
    4: { bg: '#e9d5ff', text: '#7c3aed', name: 'El Individualista' },
    5: { bg: '#d1fae5', text: '#047857', name: 'El Investigador' },
    6: { bg: '#fed7aa', text: '#c2410c', name: 'El Leal' },
    7: { bg: '#fce7f3', text: '#be185d', name: 'El Enthusiasta' },
    8: { bg: '#e0e7ff', text: '#4338ca', name: 'El Desafiante' },
    9: { bg: '#dcfce7', text: '#15803d', name: 'El Pacificador' },
} as const;

export type EnneagramType = keyof typeof ENNEAGRAM_COLORS;

export interface EnneagramBadge {
    bg: string;
    text: string;
    name: string;
}

/**
 * Get badge configuration for an Enneagram type
 */
export const getEnneagramBadge = (type: number): EnneagramBadge | null => {
    if (type < 1 || type > 9) return null;
    return ENNEAGRAM_COLORS[type as EnneagramType];
};

/**
 * Get all Enneagram types as array
 */
export const getAllEnneagramTypes = (): Array<{ type: number; name: string; colors: EnneagramBadge }> => {
    return Object.entries(ENNEAGRAM_COLORS).map(([type, config]) => ({
        type: parseInt(type),
        name: config.name,
        colors: config,
    }));
};
