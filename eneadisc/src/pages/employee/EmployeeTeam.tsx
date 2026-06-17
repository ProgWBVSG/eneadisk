import React, { useState, useEffect } from 'react';
import { Users, Heart, TrendingUp, Lightbulb, MessageCircle, HelpCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getEnneagramBadge } from '../../utils/enneagramColors';
import { getCompatibilityScore, getTeamDynamics } from '../../utils/compatibility';
import { ENNEAGRAM_TYPES } from '../../data/enneagramData';
import { WORK_PROFILES } from '../../data/enneagramWorkData';
import { EmployeeTeamTutorial } from '../../components/tutorial/EmployeeTeamTutorial';

interface Teammate {
  id: string;
  name: string;
  enneagramType: number | null;
}

export const EmployeeTeam: React.FC = () => {
  const { user } = useAuth();
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [loading, setLoading] = useState(true);
  const [forceRunTutorial, setForceRunTutorial] = useState(false);

  const myType = user?.enneagramType ?? null;

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase.rpc('get_my_teammates');
      const mapped: Teammate[] = (data || []).map((t: any) => ({
        id: t.id,
        name: t.full_name || 'Sin nombre',
        enneagramType: t.questionnaire_completed ? t.enneagram_type : null,
      }));
      setTeammates(mapped);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mb-4" />
        <p className="text-slate-500 text-sm">Cargando tu equipo...</p>
      </div>
    );
  }

  // Tipos del equipo (incluyendo el mío) para la dinámica
  const teamTypes = [myType, ...teammates.map((t) => t.enneagramType)].filter(
    (x): x is number => typeof x === 'number'
  );
  const teamDynamics = getTeamDynamics(teamTypes);
  const profiled = teammates.filter((t) => t.enneagramType);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <EmployeeTeamTutorial forceRun={forceRunTutorial} onResetComplete={() => setForceRunTutorial(false)} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Mi Equipo</h1>
          <button
            onClick={() => setForceRunTutorial(true)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-600 transition-colors"
          >
            <HelpCircle size={14} /> Ver tutorial
          </button>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Users className="w-5 h-5" />
          <span>{teammates.length + 1} miembro{teammates.length !== 0 ? 's' : ''}</span>
        </div>
      </div>

      {teammates.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Todavía sos el único en tu equipo</h3>
          <p className="text-slate-600 max-w-md mx-auto">
            Cuando se sumen más compañeros a tu empresa, vas a ver acá sus perfiles, tu compatibilidad
            y consejos de cómo trabajar mejor con cada uno.
          </p>
        </div>
      ) : (
        <>
          {/* ── Guía de comunicación por compañero (lo más valioso) ── */}
          <div id="tour-emp-team-list" className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Cómo trabajar con cada compañero</h2>
            <p className="text-sm text-slate-500 mb-4">Consejos personalizados según el eneatipo de cada persona</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {teammates.map((tm) => {
                const badge = tm.enneagramType ? getEnneagramBadge(tm.enneagramType) : null;
                const wp = tm.enneagramType ? WORK_PROFILES[tm.enneagramType] : null;
                const ct = tm.enneagramType ? ENNEAGRAM_TYPES[tm.enneagramType] : null;
                const score = myType && tm.enneagramType ? getCompatibilityScore(myType, tm.enneagramType) : null;

                return (
                  <div key={tm.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all">
                    {/* Header del compañero */}
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ background: ct ? `linear-gradient(135deg, ${ct.color}, ${ct.color}cc)` : 'linear-gradient(135deg,#94a3b8,#64748b)' }}
                      >
                        {tm.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{tm.name}</h4>
                        {badge ? (
                          <span className="text-xs font-medium" style={{ color: badge.text }}>
                            Tipo {tm.enneagramType}: {ct?.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock size={11} /> Pendiente de completar test
                          </span>
                        )}
                      </div>
                      {score !== null && (
                        <span
                          className={`text-sm font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}
                          title="Compatibilidad"
                        >
                          {score}%
                        </span>
                      )}
                    </div>

                    {/* Cómo comunicarte con él/ella */}
                    {wp ? (
                      <div className="bg-indigo-50/60 rounded-lg p-4">
                        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <MessageCircle size={13} /> Cómo comunicarte
                        </p>
                        <ul className="space-y-1.5">
                          {wp.howToCommunicate.slice(0, 3).map((tip, i) => (
                            <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                              <span className="text-indigo-400 mt-1">•</span> {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic bg-slate-50 rounded-lg p-4">
                        Cuando complete su test de eneagrama, vas a ver acá cómo comunicarte mejor con {tm.name.split(' ')[0]}.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Dinámica del equipo + compatibilidad ── */}
          {profiled.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dinámica */}
              <div id="tour-emp-team-dynamics" className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" /> Dinámica del Equipo
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Diversidad de perfiles</span>
                      <span className="text-lg font-bold text-purple-600">{teamDynamics.diversity}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: `${teamDynamics.diversity}%` }} />
                    </div>
                  </div>
                  {teamDynamics.strengths.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-green-700 mb-2">Fortalezas del equipo:</h4>
                      <ul className="space-y-1">
                        {teamDynamics.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {teamDynamics.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1"><Lightbulb className="w-4 h-4" /> Recomendaciones:</h4>
                      <ul className="space-y-1">
                        {teamDynamics.recommendations.slice(0, 3).map((r, i) => (
                          <li key={i} className="text-sm text-slate-700">• {r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Compatibilidad */}
              {myType && (
                <div id="tour-emp-team-compatibility" className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" /> Tu Compatibilidad
                  </h3>
                  <div className="space-y-3">
                    {profiled.map((tm) => {
                      const score = getCompatibilityScore(myType, tm.enneagramType!);
                      return (
                        <div key={tm.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-slate-900 text-sm">{tm.name}</span>
                            <span className={`text-sm font-semibold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>{score}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`} style={{ width: `${score}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {!myType && (
                    <p className="text-sm text-slate-400 italic mt-2">Completá tu test de eneagrama para ver tu compatibilidad.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
