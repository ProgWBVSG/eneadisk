// Sistema de Tareas
import { supabase } from '../lib/supabase';

export interface Task {
    id: string;
    userId: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    category: 'personal' | 'team' | 'development';
    createdAt: string;
    completedAt?: string;
    dueDate?: string;
    assignedBy?: string; // ID del usuario que asignó la tarea (empresa)
    assignedByName?: string; // Nombre de quien asignó
    teamId?: string; // ID del equipo si es tarea de equipo
}

export const PRIORITY_CONFIG = {
    low: { label: 'Baja', color: '#3b82f6', bg: '#dbeafe' },
    medium: { label: 'Media', color: '#f59e0b', bg: '#fef3c7' },
    high: { label: 'Alta', color: '#ef4444', bg: '#fee2e2' }
};

export const CATEGORY_CONFIG = {
    personal: { label: 'Personal', icon: '👤' },
    team: { label: 'Equipo', icon: '👥' },
    development: { label: 'Desarrollo', icon: '🎯' }
};

const mapRowToTask = (row: any): Task => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    category: row.category,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    dueDate: row.due_date,
    assignedBy: row.assigned_by,
    assignedByName: row.profiles?.full_name, // If we join profiles
    teamId: row.team_id
});

export const getTasks = async (userId: string): Promise<Task[]> => {
    const { data } = await supabase.from('tasks')
        .select('*')
        .eq('user_id', userId)
        .is('team_id', null);
    return (data || []).map(mapRowToTask);
};

export const addTask = async (userId: string, task: Omit<Task, 'id' | 'userId' | 'createdAt'>): Promise<Task> => {
    const { data, error } = await supabase.from('tasks').insert([{
        user_id: userId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        category: task.category,
        due_date: task.dueDate
    }]).select().single();

    if (error) throw error;
    return mapRowToTask(data);
};

export const updateTask = async (userId: string, taskId: string, updates: Partial<Task>): Promise<void> => {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;

    await supabase.from('tasks').update(dbUpdates).eq('id', taskId).eq('user_id', userId);
};

export const completeTask = async (userId: string, taskId: string): Promise<void> => {
    await updateTask(userId, taskId, {
        status: 'completed',
        completedAt: new Date().toISOString()
    });
};

export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
    await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId);
};

export const getTaskStats = async (userId: string) => {
    const tasks = await getTasks(userId);
    const completed = tasks.filter(t => t.status === 'completed');
    const pending = tasks.filter(t => t.status === 'pending');
    const inProgress = tasks.filter(t => t.status === 'in_progress');

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const recentCompleted = completed.filter(t =>
        t.completedAt && new Date(t.completedAt) >= last7Days
    );

    return {
        total: tasks.length,
        completed: completed.length,
        pending: pending.length,
        inProgress: inProgress.length,
        completionRate: tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0,
        recentlyCompleted: recentCompleted.length
    };
};

// ==================== TEAM TASKS ====================

export const getTeamTasks = async (teamId: string): Promise<Task[]> => {
    const { data } = await supabase.from('tasks')
        .select('*, profiles!assigned_by(full_name)')
        .eq('team_id', teamId);
    return (data || []).map(mapRowToTask);
};

export const createTeamTask = async (
    teamId: string,
    task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'teamId'>,
    assignedBy: string,
    assignedByName: string
): Promise<Task> => {
    const { data, error } = await supabase.from('tasks').insert([{
        user_id: assignedBy, // Fallback rule for tasks requires a valid user_id
        team_id: teamId,
        title: task.title,
        description: task.description,
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        category: task.category || 'team',
        assigned_by: assignedBy,
        due_date: task.dueDate
    }]).select('*, profiles!assigned_by(full_name)').single();

    if (error) throw error;
    return mapRowToTask(data);
};

export const getUserTeamTasks = async (userId: string, teamId?: string): Promise<Task[]> => {
    const personalTasks = await getTasks(userId);
    const teamTasks = teamId ? await getTeamTasks(teamId) : [];

    return [...personalTasks, ...teamTasks].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export const updateTeamTask = async (teamId: string, taskId: string, updates: Partial<Task>): Promise<void> => {
    const dbUpdates: any = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
    
    await supabase.from('tasks').update(dbUpdates).eq('id', taskId).eq('team_id', teamId);
};

export const deleteTeamTask = async (teamId: string, taskId: string): Promise<void> => {
    await supabase.from('tasks').delete().eq('id', taskId).eq('team_id', teamId);
};

export const isTeamTask = (task: Task): boolean => {
    return !!task.teamId && !!task.assignedBy;
};

