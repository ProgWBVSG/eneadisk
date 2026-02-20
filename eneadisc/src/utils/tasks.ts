// Sistema de Tareas
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

export const saveTasks = (userId: string, tasks: Task[]): void => {
    const key = `tasks_${userId}`;
    localStorage.setItem(key, JSON.stringify(tasks));
};

export const getTasks = (userId: string): Task[] => {
    const key = `tasks_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

export const addTask = (userId: string, task: Omit<Task, 'id' | 'userId' | 'createdAt'>): Task => {
    const newTask: Task = {
        ...task,
        id: Math.random().toString(36).substring(7),
        userId,
        createdAt: new Date().toISOString()
    };

    const tasks = getTasks(userId);
    saveTasks(userId, [...tasks, newTask]);
    return newTask;
};

export const updateTask = (userId: string, taskId: string, updates: Partial<Task>): void => {
    const tasks = getTasks(userId);
    const updated = tasks.map(t =>
        t.id === taskId ? { ...t, ...updates } : t
    );
    saveTasks(userId, updated);
};

export const completeTask = (userId: string, taskId: string): void => {
    updateTask(userId, taskId, {
        status: 'completed',
        completedAt: new Date().toISOString()
    });
};

export const deleteTask = (userId: string, taskId: string): void => {
    const tasks = getTasks(userId);
    saveTasks(userId, tasks.filter(t => t.id !== taskId));
};

export const getTaskStats = (userId: string) => {
    const tasks = getTasks(userId);
    const completed = tasks.filter(t => t.status === 'completed');
    const pending = tasks.filter(t => t.status === 'pending');
    const inProgress = tasks.filter(t => t.status === 'in_progress');

    // Tasks completed in last 7 days
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

/**
 * Get all tasks for a specific team
 */
export const getTeamTasks = (teamId: string): Task[] => {
    const key = `team_tasks_${teamId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

/**
 * Save team tasks to localStorage
 */
const saveTeamTasks = (teamId: string, tasks: Task[]): void => {
    const key = `team_tasks_${teamId}`;
    localStorage.setItem(key, JSON.stringify(tasks));
};

/**
 * Create a new task assigned to an entire team
 * This task will be visible to all team members
 */
export const createTeamTask = (
    teamId: string,
    task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'teamId'>,
    assignedBy: string,
    assignedByName: string
): Task => {
    const newTask: Task = {
        ...task,
        id: Math.random().toString(36).substring(7),
        userId: '', // Team tasks don't belong to a specific user
        teamId,
        assignedBy,
        assignedByName,
        createdAt: new Date().toISOString()
    };

    const tasks = getTeamTasks(teamId);
    saveTeamTasks(teamId, [...tasks, newTask]);
    return newTask;
};

/**
 * Get all tasks for a user including their personal tasks and team tasks
 */
export const getUserTeamTasks = (userId: string, teamId?: string): Task[] => {
    // Get personal tasks
    const personalTasks = getTasks(userId);

    // Get team tasks if teamId provided
    const teamTasks = teamId ? getTeamTasks(teamId) : [];

    // Combine and sort by creation date (newest first)
    return [...personalTasks, ...teamTasks].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

/**
 * Update a team task
 */
export const updateTeamTask = (teamId: string, taskId: string, updates: Partial<Task>): void => {
    const tasks = getTeamTasks(teamId);
    const updated = tasks.map(t =>
        t.id === taskId ? { ...t, ...updates } : t
    );
    saveTeamTasks(teamId, updated);
};

/**
 * Delete a team task (only company can do this)
 */
export const deleteTeamTask = (teamId: string, taskId: string): void => {
    const tasks = getTeamTasks(teamId);
    saveTeamTasks(teamId, tasks.filter(t => t.id !== taskId));
};

/**
 * Check if a task was assigned by company
 */
export const isTeamTask = (task: Task): boolean => {
    return !!task.teamId && !!task.assignedBy;
};

