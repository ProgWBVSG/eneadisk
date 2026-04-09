import React, { useState, useEffect, useMemo } from 'react';
import { Target, Users } from 'lucide-react';
import { useAuth, type AppUser } from '../../context/AuthContext';
import { getTeams } from '../../utils/teams';
import { generateTrackingData } from '../../utils/trackingMocks';

// Import Tracking subcomponents
import { TrackingKPIs } from '../../components/tracking/TrackingKPIs';
import { StressRadar } from '../../components/tracking/StressRadar';
import { EvolutionChart } from '../../components/tracking/EvolutionChart';
import { EvolutionMatrix } from '../../components/tracking/EvolutionMatrix';

export const CompanyTracking: React.FC = () => {
  const { user } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [employees, setEmployees] = useState<AppUser[]>([]);
  const [teamsConfig, setTeamsConfig] = useState<{id: string, name: string}[]>([]);

  // Característica simulada: Extraer a los usuarios de localStorage para general mocks
  // (En un entorno real vendrían directamente de Supabase)
  useEffect(() => {
    if (!user?.companyId) return;
    
    // Obtenemos equipos reales
    const teams = getTeams(user.companyId);
    setTeamsConfig(teams.map(t => ({ id: t.id, name: t.name })));
    
    // Y extraemos los usuarios "reales" de localStorage o usamos un mock vacío
    try {
      const storedProfiles = localStorage.getItem('mockProfiles');
      // @ts-ignore
      let allUsers: any[] = storedProfiles ? JSON.parse(storedProfiles) : [];
      
      // Filtrar a los empleados de esta compañía
      allUsers = allUsers.filter(p => p.role === 'employee' || p.role === 'company_admin');
      
      // Mapear al modelo AppUser para consistencia
      let mappedUsers: AppUser[] = allUsers.map(p => ({
        id: p.id,
        role: p.role,
        companyId: p.companyId || user.companyId,
        name: p.fullName || p.name || p.email,
        email: p.email,
        enneagramType: p.enneagramType,
        questionnaireCompleted: true
      }));

      // Si el array está vacío o muy bajo (es desarrollo), generamos defaults para probar UI
      if (mappedUsers.length < 3) {
         mappedUsers = [
           ...mappedUsers,
           { id: 'usr-1', role: 'employee', name: 'Laura Martínez', email: 'laura@test.com', enneagramType: 2, companyId: user.companyId },
           { id: 'usr-2', role: 'employee', name: 'Carlos Rivera', email: 'carlos@test.com', enneagramType: 8, companyId: user.companyId },
           { id: 'usr-3', role: 'employee', name: 'Ana Gómez', email: 'ana@test.com', enneagramType: 9, companyId: user.companyId },
           { id: 'usr-4', role: 'employee', name: 'Sofía López', email: 'sofia@test.com', enneagramType: 1, companyId: user.companyId },
           { id: 'usr-5', role: 'employee', name: 'Javier Pérez', email: 'javier@test.com', enneagramType: 5, companyId: user.companyId }
         ];
      }
      
      setEmployees(mappedUsers);
    } catch (e) {
      console.error(e);
    }
  }, [user?.companyId]);

  // Generamos los datos funcionales basados en la lista 
  const trackingData = useMemo(() => {
    // Si hubiese filtrado por equipo, lo simularíamos aquí reduciendo el array "employees"
    return generateTrackingData(employees);
  }, [employees, selectedTeam]);

  if (employees.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-slate-900">Seguimiento y Evolución</h1>
        <p className="text-slate-600 mb-8 mt-1">Cargando métricas de tu equipo...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
      {/* Header & Controls */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Seguimiento y Evolución</h1>
              <p className="text-slate-600 mt-1">Rastrea la evolución humana y progreso en sus retos del Eneagrama.</p>
            </div>
          </div>

          {/* Filtro de Equipos */}
          {teamsConfig.length > 0 && (
            <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
              <Users className="w-5 h-5 text-slate-400" />
              <select 
                value={selectedTeam} 
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Toda la Organización</option>
                {teamsConfig.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Renders subcomponents */}
      <TrackingKPIs kpis={trackingData.kpis} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <EvolutionChart data={trackingData.chartData} />
        </div>
        <div className="lg:col-span-1">
          <StressRadar matrix={trackingData.matrix} />
        </div>
      </div>

      <EvolutionMatrix matrix={trackingData.matrix} />
    </div>
  );
};
