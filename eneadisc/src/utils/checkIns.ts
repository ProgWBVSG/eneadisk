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

import { supabase } from '../lib/supabase';

export const saveCheckIn = async (checkIn: Omit<CheckIn, 'id'>): Promise<void> => {
    const { error } = await supabase.from('checkins').insert([{
        user_id: checkIn.userId,
        date: checkIn.date,
        mood: checkIn.mood,
        energy: checkIn.energy,
        stress: checkIn.stress,
        notes: checkIn.notes
    }]);
    if (error) {
        console.error("Error saving checkin to Supabase:", error);
        throw error;
    }
};

export const getCheckIns = async (userId: string): Promise<CheckIn[]> => {
    const { data, error } = await supabase.from('checkins')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
        
    if (error || !data) {
        console.error("Error getting checkins from Supabase:", error);
        return [];
    }
    
    return data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        mood: row.mood,
        energy: row.energy,
        stress: row.stress,
        notes: row.notes
    }));
};

export const getCheckInsFromLastDays = async (userId: string, days: number): Promise<CheckIn[]> => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const { data, error } = await supabase.from('checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('date', cutoff.toISOString())
        .order('date', { ascending: false });

    if (error || !data) return [];
    
    return data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        mood: row.mood,
        energy: row.energy,
        stress: row.stress,
        notes: row.notes
    }));
};

// Obtiene check-ins de múltiples usuarios en una sola query (para analytics de equipos)
export const getCheckInsForUsers = async (userIds: string[]): Promise<CheckIn[]> => {
    if (userIds.length === 0) return [];
    const { data, error } = await supabase.from('checkins')
        .select('*')
        .in('user_id', userIds)
        .order('date', { ascending: false });
    if (error || !data) return [];
    return data.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        date: row.date,
        mood: row.mood,
        energy: row.energy,
        stress: row.stress,
        notes: row.notes
    }));
};

// Historial mensual de bienestar para un conjunto de usuarios (últimos N meses)
export const getMonthlyWellbeingHistory = async (
    userIds: string[],
    months: number = 6
): Promise<Array<{ month: string; bienestar: number; retosCompletados: number }>> => {
    if (userIds.length === 0) return [];

    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const { data } = await supabase.from('checkins')
        .select('date, energy, stress, mood')
        .in('user_id', userIds)
        .gte('date', cutoff.toISOString())
        .order('date', { ascending: true });

    if (!data || data.length === 0) return [];

    // Agrupar por mes
    const byMonth: Record<string, { energySum: number; stressSum: number; count: number }> = {};
    const monthLabels: Record<string, string> = {
        '0': 'Ene', '1': 'Feb', '2': 'Mar', '3': 'Abr',
        '4': 'May', '5': 'Jun', '6': 'Jul', '7': 'Ago',
        '8': 'Sep', '9': 'Oct', '10': 'Nov', '11': 'Dic'
    };

    for (const row of data) {
        const d = new Date(row.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (!byMonth[key]) byMonth[key] = { energySum: 0, stressSum: 0, count: 0 };
        byMonth[key].energySum += row.energy;
        byMonth[key].stressSum += row.stress;
        byMonth[key].count++;
    }

    return Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-months)
        .map(([key, val]) => {
            const monthIdx = key.split('-')[1];
            const avgEnergy = val.energySum / val.count;
            const avgStress = val.stressSum / val.count;
            // Bienestar = promedio de energía ponderado inversamente con el estrés
            const bienestar = Math.max(1, Math.min(5, (avgEnergy + (6 - avgStress)) / 2));
            return {
                month: monthLabels[monthIdx] ?? monthIdx,
                bienestar: Number(bienestar.toFixed(1)),
                retosCompletados: val.count // check-ins completados ese mes como proxy
            };
        });
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
