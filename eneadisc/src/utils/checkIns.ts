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
