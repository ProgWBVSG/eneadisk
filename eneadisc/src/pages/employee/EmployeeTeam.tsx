import React, { useState, useEffect, useCallback } from 'react';
import { Users, Heart, TrendingUp, Lightbulb, MessageCircle, HelpCircle, Clock, Award, Send, X, ShieldAlert, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { getEnneagramBadge } from '../../utils/enneagramColors';
import { getCompatibilityScore, getTeamDynamics } from '../../utils/compatibility';
import { ENNEAGRAM_TYPES } from '../../data/enneagramData';
import { WORK_PROFILES } from '../../data/enneagramWorkData';
import { CONFLICT_GUIDANCE, KUDOS_CATEGORIES } from '../../data/enneagramResources';
import {
  getTeamMood, sendKudo, getCompanyKudos, type Kudo, type TeamMood,
} from '../../utils/employeeFeatures';
import { EmployeeTeamTutorial } from '../../components/tutorial/EmployeeTeamTutorial';

interface Teammate {
  id: string;
  name: string;
  enneagramType: number | null;
}

export const EmployeeTeam: React.FC = () => {
  const { user } = useAuth();
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [mood, setMood] = useState<TeamMood | null>(null);
  const [kudos, setKudos] = useState<Kudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [forceRunTutorial, setForceRunTutorial] = useState(false);
  const [kudoTarget, setKudoTarget] = useState<Teammate | null>(null);
  const [expandedConflict, setExpandedConflict] = useState<string | null>(null);

  const myType = user?.enneagramType ?? null;

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: mates }, tm, ku] = await Promise.all([
      supabase.rpc('get_my_teammates'),
      getTeamMood(),
      getCompanyKudos(15),
    ]);
    setTeammates((mates || []).map((t: any) => ({
      id: t.id, name: t.full_name || 'Sin nombre',
      enneagramType: t.questionnaire_completed ? t.enneagram_type : null,
    })));
    setMood(tm);
    setKudos(ku);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mb-4" />
        <p className="text-slate-500 text-sm">Cargando tu equipo...</p>
      </div>
    );
  }

  const teamTypes = [myType, ...teammates.map((t) => t.enneagramType)].filter((x): x is number => typeof x === 'number');
  const teamDynamics = getTeamDynamics(teamTypes);
  const profiled = teammates.filter((t) => t.enneagramType);

  const catEmoji = (c: string) => KUDOS_CATEGORIES.find((k) => k.value === c)?.emoji || '⭐';

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <EmployeeTeamTutorial forceRun={forceRunTutorial} onResetComplete={() => setForceRunTutorial(false)} />

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Mi Equipo</h1>
          <button onClick={() => setForceRunTutorial(true)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-600">
            <HelpCircle size={14} /> Ver tutorial
          </button>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Users className="w-5 h-5" /><span>{teammates.length + 1} miembro{teammates.length !== 0 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Termómetro de equipo ── */}
      {mood && mood.checkinCount > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-indigo-600" size={22} />
            <h2 className="text-xl font-bold text-slate-900">Termómetro del equipo</h2>
            <span className="text-xs text-slate-400 ml-auto">últimos 7 días · {mood.checkinCount} check-ins</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs font-medium text-blue-700 mb-1">Energía del equipo</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-blue-900">{mood.avgEnergy.toFixed(1)}</span>
                <span className="text-sm text-blue-600 mb-1">/ 5</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2 mt-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(mood.avgEnergy / 5) * 100}%` }} /></div>
            </div>
            <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
              <p className="text-xs font-medium text-rose-700 mb-1">Estrés del equipo</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-rose-900">{mood.avgStress.toFixed(1)}</span>
                <span className="text-sm text-rose-600 mb-1">/ 5</span>
              </div>
              <div className="w-full bg-rose-100 rounded-full h-2 mt-2"><div className="bg-rose-500 h-2 rounded-full" style={{ width: `${(mood.avgStress / 5) * 100}%` }} /></div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Promedios anónimos del equipo. Nadie ve los check-ins individuales de otra persona.</p>
        </div>
      )}

      {/* ── Reconocimientos recientes (kudos) ── */}
      {kudos.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-amber-600" size={22} />
            <h2 className="text-xl font-bold text-slate-900">Reconocimientos del equipo</h2>
          </div>
          <div className="space-y-2.5">
            {kudos.slice(0, 5).map((k) => (
              <div key={k.id} className="bg-white rounded-lg p-3 border border-amber-100 flex items-start gap-3">
                <span className="text-xl shrink-0">{catEmoji(k.category)}</span>
                <div className="text-sm">
                  <span className="font-semibold text-slate-900">{k.fromName}</span>
                  <span className="text-slate-500"> reconoció a </span>
                  <span className="font-semibold text-slate-900">{k.toName}</span>
                  <p className="text-slate-600 italic mt-0.5">"{k.message}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {teammates.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Todavía sos el único en tu equipo</h3>
          <p className="text-slate-600 max-w-md mx-auto">Cuando se sumen compañeros, vas a ver sus perfiles, cómo comunicarte con cada uno y vas a poder reconocerlos.</p>
        </div>
      ) : (
        <>
          {/* ── Compañeros: comunicación + conflictos + reconocer ── */}
          <div id="tour-emp-team-list" className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-1">Cómo trabajar con cada compañero</h2>
            <p className="text-sm text-slate-500 mb-4">Consejos según el eneatipo de cada persona</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {teammates.map((tm) => {
                const badge = tm.enneagramType ? getEnneagramBadge(tm.enneagramType) : null;
                const wp = tm.enneagramType ? WORK_PROFILES[tm.enneagramType] : null;
                const ct = tm.enneagramType ? ENNEAGRAM_TYPES[tm.enneagramType] : null;
                const conflict = tm.enneagramType ? CONFLICT_GUIDANCE[tm.enneagramType] : null;
                const score = myType && tm.enneagramType ? getCompatibilityScore(myType, tm.enneagramType) : null;
                const isOpen = expandedConflict === tm.id;

                return (
                  <div key={tm.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ background: ct ? `linear-gradient(135deg, ${ct.color}, ${ct.color}cc)` : 'linear-gradient(135deg,#94a3b8,#64748b)' }}>
                        {tm.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{tm.name}</h4>
                        {badge ? <span className="text-xs font-medium" style={{ color: badge.text }}>Tipo {tm.enneagramType}: {ct?.name}</span>
                          : <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={11} /> Pendiente de test</span>}
                      </div>
                      {score !== null && (
                        <span className={`text-sm font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-orange-600'}`} title="Compatibilidad">{score}%</span>
                      )}
                    </div>

                    {wp ? (
                      <>
                        <div className="bg-indigo-50/60 rounded-lg p-4 mb-3">
                          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2 flex items-center gap-1.5"><MessageCircle size={13} /> Cómo comunicarte</p>
                          <ul className="space-y-1.5">
                            {wp.howToCommunicate.slice(0, 3).map((tip, i) => (
                              <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span> {tip}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Resolución de conflictos (colapsable) */}
                        {conflict && (
                          <button onClick={() => setExpandedConflict(isOpen ? null : tm.id)}
                            className="w-full text-left text-xs font-medium text-amber-700 flex items-center gap-1.5 mb-2 hover:text-amber-800">
                            <ShieldAlert size={13} /> {isOpen ? 'Ocultar' : 'Si hay un conflicto con ' + tm.name.split(' ')[0]}
                          </button>
                        )}
                        {isOpen && conflict && (
                          <div className="bg-amber-50 rounded-lg p-3 mb-3 text-sm">
                            <p className="text-slate-700 mb-1"><strong className="text-amber-800">Qué lo dispara:</strong> {conflict.trigger}</p>
                            <p className="text-slate-700"><strong className="text-amber-800">Cómo resolverlo:</strong> {conflict.howToResolve}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-slate-400 italic bg-slate-50 rounded-lg p-4 mb-3">
                        Cuando complete su test, vas a ver cómo comunicarte mejor con {tm.name.split(' ')[0]}.
                      </p>
                    )}

                    {/* Reconocer */}
                    <button onClick={() => setKudoTarget(tm)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
                      <Award size={15} /> Reconocer a {tm.name.split(' ')[0]}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Dinámica + compatibilidad ── */}
          {profiled.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div id="tour-emp-team-dynamics" className="bg-gradient-to-br from-[#FCF1EC] to-[#EEF3EE] border border-[#F8DDD2] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-600" /> Dinámica del Equipo</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-slate-700">Diversidad de perfiles</span><span className="text-lg font-bold text-purple-600">{teamDynamics.diversity}%</span></div>
                    <div className="w-full bg-slate-200 rounded-full h-2"><div className="bg-gradient-to-r from-[#E07A5F] to-[#E89B82] h-2 rounded-full" style={{ width: `${teamDynamics.diversity}%` }} /></div>
                  </div>
                  {teamDynamics.strengths.length > 0 && (
                    <div><h4 className="text-sm font-semibold text-green-700 mb-2">Fortalezas:</h4><ul className="space-y-1">{teamDynamics.strengths.map((s, i) => <li key={i} className="text-sm text-slate-700 flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span>{s}</li>)}</ul></div>
                  )}
                  {teamDynamics.recommendations.length > 0 && (
                    <div><h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1"><Lightbulb className="w-4 h-4" /> Recomendaciones:</h4><ul className="space-y-1">{teamDynamics.recommendations.slice(0, 3).map((r, i) => <li key={i} className="text-sm text-slate-700">• {r}</li>)}</ul></div>
                  )}
                </div>
              </div>

              {myType && (
                <div id="tour-emp-team-compatibility" className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-pink-600" /> Tu Compatibilidad</h3>
                  <div className="space-y-3">
                    {profiled.map((tm) => {
                      const score = getCompatibilityScore(myType, tm.enneagramType!);
                      return (
                        <div key={tm.id} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                          <div className="flex items-center justify-between mb-2"><span className="font-medium text-slate-900 text-sm">{tm.name}</span><span className={`text-sm font-semibold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>{score}%</span></div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`} style={{ width: `${score}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Modal de reconocimiento (kudo) ── */}
      {kudoTarget && (
        <KudoModal
          target={kudoTarget}
          companyId={user?.companyId || ''}
          onClose={() => setKudoTarget(null)}
          onSent={() => { setKudoTarget(null); load(); }}
        />
      )}
    </div>
  );
};

// ── Modal para enviar reconocimiento ──
const KudoModal: React.FC<{ target: Teammate; companyId: string; onClose: () => void; onSent: () => void }> = ({ target, companyId, onClose, onSent }) => {
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    const { error } = await sendKudo(companyId, target.id, category, message.trim());
    setSending(false);
    if (error) { setError('No se pudo enviar. Intentá de nuevo.'); return; }
    onSent();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Award className="text-amber-500" size={22} /> Reconocer a {target.name.split(' ')[0]}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
        </div>

        <p className="text-sm font-medium text-slate-700 mb-2">¿Por qué lo reconocés?</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {KUDOS_CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${category === c.value ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <span className="text-lg">{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>

        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
          placeholder={`Ej: Gracias por ayudarme con el proyecto, ${target.name.split(' ')[0]}. Tu aporte hizo la diferencia.`}
          className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none mb-2" />
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <button onClick={send} disabled={!message.trim() || sending}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50">
          {sending ? 'Enviando...' : <><Send size={16} /> Enviar reconocimiento</>}
        </button>
      </div>
    </div>
  );
};
