import React, { useState, useEffect } from 'react';
import { Target, Users } from 'lucide-react';
import { useAuth, type AppUser } from '../../context/AuthContext';
import { generateTrackingData } from '../../utils/trackingMocks';
import { supabase } from '../../lib/supabase';

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

  useEffect(() => {
    const loadData = async () => {
      if (!user?.companyId) return;

      // 1. Obtener equipos reales de Supabase
      const { data: teamsData } = await supabase.from('teams').select('id, name').eq('company_id', user.companyId);
      if (teamsData) setTeamsConfig(teamsData);

      // 2. Obtener empleados reales de Supabase
      const { data: profilesData } = await supabase.from('profiles')
        .select('*')
        .eq('company_id', user.companyId)
        .in('role', ['employee', 'company_admin']);

      const mappedUsers: AppUser[] = (profilesData || []).map((p: any) => ({
        id: p.id,
        role: p.role,
        companyId: p.company_id,
        name: p.full_name || p.email,
        email: p.email,
        enneagramType: p.enneagram_type,
        questionnaireCompleted: true
      }));

      setEmployees(mappedUsers);
    };

    loadData();
  }, [user?.companyId]);

  const [trackingData, setTrackingData] = useState<{
    matrix: any[];
    kpis: any;
    chartData: any[];
  } | null>(null);

  useEffect(() => {
    const fetchTracking = async () => {
       let filteredEmployees = employees;
       if (selectedTeam !== 'all' && employees.length > 0) {
          const { data: members } = await supabase.from('team_members').select('user_id').eq('team_id', selectedTeam);
          if (members) {
             const memberIds = members.map((m: any) => m.user_id);
             filteredEmployees = employees.filter(e => memberIds.includes(e.id));
          }
       }
       
       const data = await generateTrackingData(filteredEmployees);
       setTrackingData(data);
    };
    fetchTracking();
  }, [employees, selectedTeam]);

  if (!trackingData) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-4" />
        <p className="text-slate-500 text-sm">Cargando métricas de tu equipo...</p>
      </div>
    );
  }

  const hasEmployees = trackingData.matrix.length > 0;


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

      {/* Estado vacío cuando no hay empleados */}
      {!hasEmployees ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
            <Users className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Sin empleados aún</h2>
          <p className="text-slate-500 max-w-md mb-6">
            Cuando tus empleados se unan a la plataforma y completen check-ins y tareas, sus métricas de evolución y bienestar aparecerán aquí en tiempo real.
          </p>
          <p className="text-sm text-indigo-600 font-medium bg-indigo-50 px-4 py-2 rounded-full">
            💡 Invitá a tu equipo desde el Panel Principal → Copiar link de invitación
          </p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};
