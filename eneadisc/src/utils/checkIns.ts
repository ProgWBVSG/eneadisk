// Sistema de Check-ins Emocionales
export interface CheckIn {
    id: string;
    userId: string;
    date: string;
    mood: 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible';
    energy: number; // 1-5
    stress: number; // 1-5
    notes?: string;
}

export const MOOD_CONFIG = {
    excellent: { emoji: '😄', label: 'Excelente', color: '#10b981' },
    good: { emoji: '😊', label: 'Bien', color: '#3b82f6' },
    neutral: { emoji: '😐', label: 'Normal', color: '#f59e0b' },
    bad: { emoji: '😔', label: 'Mal', color: '#f97316' },
    terrible: { emoji: '😢', label: 'Terrible', color: '#ef4444' }
};

export const saveCheckIn = (checkIn: CheckIn): void => {
    const key = `checkins_${checkIn.userId}`;
    const existing = getCheckIns(checkIn.userId);
    const updated = [...existing, checkIn];
    localStorage.setItem(key, JSON.stringify(updated));
};

export const getCheckIns = (userId: string): CheckIn[] => {
    const key = `checkins_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

export const getCheckInsFromLastDays = (userId: string, days: number): CheckIn[] => {
    const all = getCheckIns(userId);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return all.filter(c => new Date(c.date) >= cutoff);
};

export const getAverageMoodScore = (checkIns: CheckIn[]): number => {
    if (checkIns.length === 0) return 0;

    const moodScores = {
        excellent: 5,
        good: 4,
        neutral: 3,
        bad: 2,
        terrible: 1
    };

    const total = checkIns.reduce((sum, c) => sum + moodScores[c.mood], 0);
    return total / checkIns.length;
};
