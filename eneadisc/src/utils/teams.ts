import { supabase } from '../lib/supabase';

export interface Team {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    ownerId: string;
    memberIds: string[];
    createdAt: string;
    updatedAt?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    enneagramType?: number;
    role: 'employee';
    companyId: string;
    teamId?: string;
}

export interface EnneagramDistribution {
    [key: number]: number; // type -> count
}

// ============================================
// TEAM CRUD OPERATIONS
// ============================================

const loadMemberIds = async (teamId: string): Promise<string[]> => {
    const { data } = await supabase.from('team_members').select('user_id').eq('team_id', teamId);
    return data ? data.map(m => m.user_id) : [];
};

export const getTeams = async (companyId: string): Promise<Team[]> => {
    const { data, error } = await supabase.from('teams').select('*').eq('company_id', companyId);
    if (error || !data) return [];
    
    const teams: Team[] = [];
    for (const row of data) {
        const memberIds = await loadMemberIds(row.id);
        teams.push({
            id: row.id,
            companyId: row.company_id,
            name: row.name,
            description: row.description,
            ownerId: row.owner_id,
            memberIds,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        });
    }
    return teams;
};

export const getTeam = async (teamId: string): Promise<Team | null> => {
    const { data, error } = await supabase.from('teams').select('*').eq('id', teamId).single();
    if (error || !data) return null;
    
    const memberIds = await loadMemberIds(data.id);
    return {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        description: data.description,
        ownerId: data.owner_id,
        memberIds,
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
};

export const createTeam = async (team: Omit<Team, 'id' | 'createdAt'>): Promise<Team> => {
    const { data, error } = await supabase.from('teams').insert([{
        company_id: team.companyId,
        name: team.name,
        description: team.description,
        owner_id: team.ownerId
    }]).select().single();

    if (error) throw error;
    
    const createdTeam = {
        id: data.id,
        companyId: data.company_id,
        name: data.name,
        description: data.description,
        ownerId: data.owner_id,
        memberIds: [] as string[],
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };

    // Add initial members if any
    if (team.memberIds && team.memberIds.length > 0) {
        for (const uid of team.memberIds) {
            await addMemberToTeam(createdTeam.id, uid);
        }
        createdTeam.memberIds = team.memberIds;
    }

    return createdTeam;
};

export const updateTeam = async (teamId: string, updates: Partial<Omit<Team, 'id' | 'companyId' | 'createdAt'>>): Promise<void> => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    
    if (Object.keys(dbUpdates).length > 0) {
        await supabase.from('teams').update(dbUpdates).eq('id', teamId);
    }

    if (updates.memberIds) {
        const currentMemberIds = await loadMemberIds(teamId);
        // Remove those not in new array
        for (const oldId of currentMemberIds) {
            if (!updates.memberIds.includes(oldId)) {
                await removeMemberFromTeam(teamId, oldId);
            }
        }
        // Add new ones
        for (const newId of updates.memberIds) {
            if (!currentMemberIds.includes(newId)) {
                await addMemberToTeam(teamId, newId);
            }
        }
    }
};

export const deleteTeam = async (teamId: string): Promise<void> => {
    // Member checking handled by application flow usually
    // By postgres rules ON DELETE CASCADE this cleans up team_members automatically
    await supabase.from('teams').delete().eq('id', teamId);
};

// ============================================
// MEMBER MANAGEMENT
// ============================================

export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
    const { data, error } = await supabase.from('team_members')
        .select(`
            user_id,
            profiles!inner ( id, full_name, email, enneagram_type, company_id )
        `)
        .eq('team_id', teamId);
        
    if (error || !data) return [];

    return data.map((m: any) => ({
        id: m.profiles.id,
        name: m.profiles.full_name || m.profiles.email,
        email: m.profiles.email,
        enneagramType: m.profiles.enneagram_type,
        role: 'employee',
        companyId: m.profiles.company_id,
        teamId
    }));
};

export const addMemberToTeam = async (teamId: string, userId: string): Promise<void> => {
    // Delete from other teams in DB first if required to be in only 1 team. 
    // In our system right now we allow multiple, but typically we constrain it via UI.
    const { error } = await supabase.from('team_members').insert([{
        team_id: teamId,
        user_id: userId
    }]);
    if (error && error.code !== '23505') { // Ignore unique violation if already added
       throw error;
    }
};

export const removeMemberFromTeam = async (teamId: string, userId: string): Promise<void> => {
    await supabase.from('team_members').delete().eq('team_id', teamId).eq('user_id', userId);
};

export const getAvailableEmployees = async (companyId: string): Promise<TeamMember[]> => {
    // En producción, consulta a 'profiles' donde id NO esté en 'team_members' de algún team_id de la compañia.
    // Para simplificar, obtenemos todos los empleados y filtramos.
    const { data: profiles } = await supabase.from('profiles').select('*').eq('company_id', companyId);
    
    // Obtenemos todos los miembros
    const { data: membersInTeams } = await supabase.from('team_members').select('user_id');
    const memberSet = new Set(membersInTeams?.map(m => m.user_id) || []);

    const available: TeamMember[] = [];
    (profiles || []).forEach(p => {
        if (!memberSet.has(p.id) && p.role === 'employee') {
            available.push({
                id: p.id,
                name: p.full_name || p.email,
                email: p.email,
                enneagramType: p.enneagram_type,
                role: 'employee',
                companyId: p.company_id
            });
        }
    });

    return available;
};

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

export const getTeamEnneagramDistribution = async (teamId: string): Promise<EnneagramDistribution> => {
    const members = await getTeamMembers(teamId);
    const distribution: EnneagramDistribution = {};

    members.forEach(member => {
        if (member.enneagramType) {
            distribution[member.enneagramType] = (distribution[member.enneagramType] || 0) + 1;
        }
    });

    return distribution;
};

export const getTeamCompatibilityScore = async (teamId: string): Promise<number> => {
    const members = await getTeamMembers(teamId);
    if (members.length === 0) return 0;

    const distribution = await getTeamEnneagramDistribution(teamId);
    const uniqueTypes = Object.keys(distribution).length;

    const diversityScore = (uniqueTypes / 9) * 100; 
    const sizeBonus = Math.min(members.length / 5, 1) * 20;

    return Math.min(Math.round(diversityScore + sizeBonus), 100);
};

export const getTeamStats = async (teamId: string) => {
    const team = await getTeam(teamId);
    const members = await getTeamMembers(teamId);
    const distribution = await getTeamEnneagramDistribution(teamId);
    const compatibilityScore = await getTeamCompatibilityScore(teamId);

    return {
        teamName: team?.name || '',
        memberCount: members.length,
        membersWithEnneagram: members.filter(m => m.enneagramType).length,
        distribution,
        compatibilityScore,
    };
};
