// Demo data for testing the app without registration
// This includes pre-defined users, company, teams, check-ins, tasks, and collaboration data

import type { CheckIn } from './checkIns';
import type { Task } from './tasks';
import type { TeamInteraction } from './teamCollaboration';

// ============================================
// USER DATA
// ============================================

export interface DemoUser {
    id: string;
    role: 'company_admin' | 'employee';
    companyId: string;
    name: string;
    email: string;
    teamId?: string;
    enneagramType?: number;
}

export const DEMO_OWNER: DemoUser = {
    id: 'demo-owner-001',
    role: 'company_admin',
    companyId: 'demo-company-001',
    name: 'María González (Demo)',
    email: 'demo-owner@eneadisc.com',
};

export const DEMO_EMPLOYEE: DemoUser = {
    id: 'demo-employee-001',
    role: 'employee',
    companyId: 'demo-company-001',
    name: 'Juan Pérez (Demo)',
    email: 'demo-employee@eneadisc.com',
    teamId: 'demo-team-marketing',
    enneagramType: 7, // El Enthusiasta
};

// ============================================
// COMPANY & TEAM DATA
// ============================================

export interface DemoCompany {
    id: string;
    name: string;
    industry: string;
    size: string;
}

export interface DemoTeam {
    id: string;
    name: string;
    description?: string;
    companyId: string;
    ownerId: string;
    memberIds: string[];
    createdAt: string;
    updatedAt?: string;
}

export const DEMO_COMPANY: DemoCompany = {
    id: 'demo-company-001',
    name: 'Empresa Demo Marketing',
    industry: 'Marketing y Publicidad',
    size: '10-50 empleados',
};

export const DEMO_TEAM: DemoTeam = {
    id: 'demo-team-marketing',
    name: 'Equipo Marketing',
    description: 'Equipo enfocado en estrategias de marketing digital y contenido',
    companyId: 'demo-company-001',
    ownerId: 'demo-owner-001',
    memberIds: ['demo-employee-001', 'demo-employee-002', 'demo-employee-003'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
};

// ============================================
// CHECK-INS DATA (for employee)
// ============================================

export const DEMO_CHECKINS: CheckIn[] = [
    {
        id: 'checkin-001',
        userId: 'demo-employee-001',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        mood: 'excellent',
        energy: 4,
        stress: 2,
        notes: '€xcelente día, terminé varias tareas importantes',
    },
    {
        id: 'checkin-002',
        userId: 'demo-employee-001',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        mood: 'good',
        energy: 4,
        stress: 3,
        notes: 'Día productivo con el equipo',
    },
    {
        id: 'checkin-003',
        userId: 'demo-employee-001',
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
        mood: 'neutral',
        energy: 3,
        stress: 3,
        notes: 'Reunión larga pero necesaria',
    },
    {
        id: 'checkin-004',
        userId: 'demo-employee-001',
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
        mood: 'good',
        energy: 4,
        stress: 2,
        notes: 'Colaboración fluida con el equipo',
    },
    {
        id: 'checkin-005',
        userId: 'demo-employee-001',
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
        mood: 'excellent',
        energy: 5,
        stress: 1,
        notes: 'Semana increíble, logré mis objetivos',
    },
    {
        id: 'checkin-006',
        userId: 'demo-employee-001',
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
        mood: 'neutral',
        energy: 3,
        stress: 4,
        notes: 'Día con algunos desafíos',
    },
    {
        id: 'checkin-007',
        userId: 'demo-employee-001',
        date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
        mood: 'good',
        energy: 4,
        stress: 2,
        notes: 'Buena semana en general',
    },
];

// TASKS DATA (for employee)
// ============================================

export const DEMO_TASKS: Task[] = [
    {
        id: 'task-001',
        userId: 'demo-employee-001',
        title: 'Preparar presentación de campaña Q1',
        description: 'Crear slides y materiales para la campaña del primer trimestre',
        status: 'completed',
        priority: 'high',
        category: 'team',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'task-002',
        userId: 'demo-employee-001',
        title: 'Revisar métricas de redes sociales',
        description: 'Analizar engagement de las últimas semanas',
        status: 'in_progress',
        priority: 'medium',
        category: 'team',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'task-003',
        userId: 'demo-employee-001',
        title: 'Reunión con diseñador para nuevo branding',
        description: 'Coordinar reunión de brainstorming',
        status: 'completed',
        priority: 'medium',
        category: 'team',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'task-004',
        userId: 'demo-employee-001',
        title: 'Planificar contenido para blog',
        description: 'Definir temas y calendario editorial del mes',
        status: 'pending',
        priority: 'low',
        category: 'personal',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'task-005',
        userId: 'demo-employee-001',
        title: 'Implementar A/B testing en landing',
        description: 'Configurar tests para optimizar conversión',
        status: 'in_progress',
        priority: 'high',
        category: 'development',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

// Team tasks assigned by company
export const DEMO_TEAM_TASKS: Task[] = [
    {
        id: 'team-task-001',
        userId: '',
        teamId: 'demo-team-marketing',
        assignedBy: 'demo-owner-001',
        assignedByName: 'María González',
        title: 'Presentar informe mensual de resultados',
        description: 'Preparar y presentar los KPIs y métricas del mes a la dirección',
        status: 'pending',
        priority: 'high',
        category: 'team',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // in 3 days
    },
    {
        id: 'team-task-002',
        userId: '',
        teamId: 'demo-team-marketing',
        assignedBy: 'demo-owner-001',
        assignedByName: 'María González',
        title: 'Actualizar estrategia de contenido 2024',
        description: 'Revisar y actualizar el plan de contenido para los próximos 6 meses',
        status: 'pending',
        priority: 'medium',
        category: 'team',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // in 1 week
    },
];

// ============================================
// TEAM COLLABORATION DATA
// ============================================

export const DEMO_TEAM_INTERACTIONS: TeamInteraction[] = [
    {
        id: 'interaction-001',
        userId: 'demo-employee-001',
        teammateId: 'demo-owner-001',
        teammateName: 'María González',
        teammateType: 1,
        type: 'feedback',
        quality: 'positive',
        notes: 'Excelente feedback en la reunión de equipo',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'interaction-002',
        userId: 'demo-employee-001',
        teammateId: 'demo-owner-001',
        teammateName: 'María González',
        teammateType: 1,
        type: 'collaboration',
        quality: 'positive',
        notes: 'Colaboración fluida en el proyecto de campaña',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'interaction-003',
        userId: 'demo-employee-001',
        teammateId: 'demo-owner-001',
        teammateName: 'María González',
        teammateType: 1,
        type: 'support',
        quality: 'neutral',
        notes: 'Reunión de seguimiento rutinaria',
        date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getDemoUser(role: 'owner' | 'employee'): DemoUser {
    return role === 'owner' ? DEMO_OWNER : DEMO_EMPLOYEE;
}

export function getDemoCompany(): DemoCompany {
    return DEMO_COMPANY;
}

export function getDemoTeam(): DemoTeam {
    return DEMO_TEAM;
}

export function getDemoCheckIns(): CheckIn[] {
    return DEMO_CHECKINS;
}

export function getDemoTasks(): Task[] {
    return DEMO_TASKS;
}

export function getDemoTeamInteractions(): TeamInteraction[] {
    return DEMO_TEAM_INTERACTIONS;
}

/**
 * Initialize demo data in localStorage for demo sessions
 * This loads all demo data so it's available to the app
 */
export function initializeDemoData(): void {
    // Store demo check-ins for employee
    const checkInsKey = `checkIns_${DEMO_EMPLOYEE.id}`;
    localStorage.setItem(checkInsKey, JSON.stringify(DEMO_CHECKINS));

    // Store demo personal tasks for employee
    const tasksKey = `tasks_${DEMO_EMPLOYEE.id}`;
    localStorage.setItem(tasksKey, JSON.stringify(DEMO_TASKS));

    // Store demo team tasks for the marketing team
    const teamTasksKey = `team_tasks_demo-team-marketing`;
    localStorage.setItem(teamTasksKey, JSON.stringify(DEMO_TEAM_TASKS));

    // Store demo team interactions
    const interactionsKey = `teamInteractions_${DEMO_EMPLOYEE.id}`;
    localStorage.setItem(interactionsKey, JSON.stringify(DEMO_TEAM_INTERACTIONS));

    // Store demo company and user data
    localStorage.setItem('demo_data', JSON.stringify({
        company: DEMO_COMPANY,
        owner: DEMO_OWNER,
        employee: DEMO_EMPLOYEE,
        team: DEMO_TEAM,
    }));

    // Store demo team in teams list
    localStorage.setItem(`teams_${DEMO_COMPANY.id}`, JSON.stringify([DEMO_TEAM]));
}

/**
 * Clear demo data from localStorage
 * Call this on logout to ensure fresh demo data on next demo login
 */
export function clearDemoData(): void {
    // Remove demo check-ins
    const existingCheckIns = JSON.parse(localStorage.getItem('checkIns') || '[]');
    const filteredCheckIns = existingCheckIns.filter((c: CheckIn) => !c.userId.startsWith('demo-'));
    localStorage.setItem('checkIns', JSON.stringify(filteredCheckIns));

    // Remove demo tasks
    const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const filteredTasks = existingTasks.filter((t: Task) => !t.userId.startsWith('demo-'));
    localStorage.setItem('tasks', JSON.stringify(filteredTasks));

    // Remove demo team interactions
    const existingInteractions = JSON.parse(localStorage.getItem('teamInteractions') || '[]');
    const filteredInteractions = existingInteractions.filter((i: TeamInteraction) => !i.userId.startsWith('demo-'));
    localStorage.setItem('teamInteractions', JSON.stringify(filteredInteractions));

    // Remove demo company and team
    localStorage.removeItem('demoCompany');
    localStorage.removeItem('demoTeam');
}

