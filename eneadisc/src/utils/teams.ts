// Team management utilities
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

/**
 * Get all teams for a company
 */
export const getTeams = (companyId: string): Team[] => {
    const key = `teams_${companyId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

/**
 * Get a specific team by ID
 */
export const getTeam = (teamId: string): Team | null => {
    // Search across all companies (in production, would filter by companyId)
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('teams_'));

    for (const key of allKeys) {
        const teams: Team[] = JSON.parse(localStorage.getItem(key) || '[]');
        const team = teams.find(t => t.id === teamId);
        if (team) return team;
    }

    return null;
};

/**
 * Create a new team
 */
export const createTeam = (team: Omit<Team, 'id' | 'createdAt'>): Team => {
    const newTeam: Team = {
        ...team,
        id: `team-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        memberIds: team.memberIds || [],
        createdAt: new Date().toISOString(),
    };

    const teams = getTeams(team.companyId);
    teams.push(newTeam);

    const key = `teams_${team.companyId}`;
    localStorage.setItem(key, JSON.stringify(teams));

    return newTeam;
};

/**
 * Update a team
 */
export const updateTeam = (teamId: string, updates: Partial<Omit<Team, 'id' | 'companyId' | 'createdAt'>>): void => {
    const team = getTeam(teamId);
    if (!team) throw new Error('Team not found');

    const teams = getTeams(team.companyId);
    const index = teams.findIndex(t => t.id === teamId);

    if (index !== -1) {
        teams[index] = {
            ...teams[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };

        const key = `teams_${team.companyId}`;
        localStorage.setItem(key, JSON.stringify(teams));
    }
};

/**
 * Delete a team (only if it has no members)
 */
export const deleteTeam = (teamId: string): void => {
    const team = getTeam(teamId);
    if (!team) throw new Error('Team not found');

    if (team.memberIds.length > 0) {
        throw new Error('Cannot delete team with members. Please remove all members first.');
    }

    const teams = getTeams(team.companyId);
    const filtered = teams.filter(t => t.id !== teamId);

    const key = `teams_${team.companyId}`;
    localStorage.setItem(key, JSON.stringify(filtered));
};

// ============================================
// MEMBER MANAGEMENT
// ============================================

/**
 * Get team members with their full data
 */
export const getTeamMembers = (teamId: string): TeamMember[] => {
    const team = getTeam(teamId);
    if (!team) return [];

    // Get all users from localStorage (simplified - in production would use a proper user store)
    const members: TeamMember[] = [];

    team.memberIds.forEach(userId => {
        // Try to find user data
        // For demo user
        if (userId === 'demo-employee-001') {
            members.push({
                id: userId,
                name: 'Juan Pérez (Demo)',
                email: 'demo-employee@eneadisc.com',
                enneagramType: 7,
                role: 'employee',
                companyId: team.companyId,
                teamId: teamId,
            });
        }
        // For other users, try to get from a hypothetical users store
        // This would be replaced with actual user data fetching in production
    });

    return members;
};

/**
 * Add member to team (removes from previous team if exists)
 */
export const addMemberToTeam = (teamId: string, userId: string): void => {
    const team = getTeam(teamId);
    if (!team) throw new Error('Team not found');

    // Remove from any existing team first
    removeMemberFromAllTeams(userId, team.companyId);

    // Add to new team
    if (!team.memberIds.includes(userId)) {
        team.memberIds.push(userId);
        updateTeam(teamId, { memberIds: team.memberIds });
    }
};

/**
 * Remove member from team
 */
export const removeMemberFromTeam = (teamId: string, userId: string): void => {
    const team = getTeam(teamId);
    if (!team) throw new Error('Team not found');

    const filtered = team.memberIds.filter(id => id !== userId);
    updateTeam(teamId, { memberIds: filtered });
};

/**
 * Remove member from all teams in a company (helper function)
 */
const removeMemberFromAllTeams = (userId: string, companyId: string): void => {
    const teams = getTeams(companyId);

    teams.forEach(team => {
        if (team.memberIds.includes(userId)) {
            const filtered = team.memberIds.filter(id => id !== userId);
            updateTeam(team.id, { memberIds: filtered });
        }
    });
};

/**
 * Get employees available to add to teams (not currently in any team)
 */
export const getAvailableEmployees = (companyId: string): TeamMember[] => {
    // In production, this would fetch from a users database
    // For now, return demo employee if not in a team
    const teams = getTeams(companyId);
    const allMemberIds = teams.flatMap(t => t.memberIds);

    const demoEmployee: TeamMember = {
        id: 'demo-employee-001',
        name: 'Juan Pérez (Demo)',
        email: 'demo-employee@eneadisc.com',
        enneagramType: 7,
        role: 'employee',
        companyId: companyId,
    };

    // Return demo employee if not in any team
    if (!allMemberIds.includes(demoEmployee.id)) {
        return [demoEmployee];
    }

    return [];
};

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

/**
 * Get Enneagram type distribution for a team
 */
export const getTeamEnneagramDistribution = (teamId: string): EnneagramDistribution => {
    const members = getTeamMembers(teamId);
    const distribution: EnneagramDistribution = {};

    members.forEach(member => {
        if (member.enneagramType) {
            distribution[member.enneagramType] = (distribution[member.enneagramType] || 0) + 1;
        }
    });

    return distribution;
};

/**
 * Calculate team compatibility score (simplified)
 * Based on diversity of types - more diverse = better collaboration potential
 */
export const getTeamCompatibilityScore = (teamId: string): number => {
    const members = getTeamMembers(teamId);
    if (members.length === 0) return 0;

    const distribution = getTeamEnneagramDistribution(teamId);
    const uniqueTypes = Object.keys(distribution).length;

    // Score based on diversity (more types = higher score)
    // Also factor in total members
    const diversityScore = (uniqueTypes / 9) * 100; // Max diversity score
    const sizeBonus = Math.min(members.length / 5, 1) * 20; // Bonus for having 5+ members

    return Math.min(Math.round(diversityScore + sizeBonus), 100);
};

/**
 * Get team statistics
 */
export const getTeamStats = (teamId: string) => {
    const team = getTeam(teamId);
    const members = getTeamMembers(teamId);
    const distribution = getTeamEnneagramDistribution(teamId);
    const compatibilityScore = getTeamCompatibilityScore(teamId);

    return {
        teamName: team?.name || '',
        memberCount: members.length,
        membersWithEnneagram: members.filter(m => m.enneagramType).length,
        distribution,
        compatibilityScore,
    };
};
