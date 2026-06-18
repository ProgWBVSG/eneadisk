import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEnneagramResult } from '../../utils/calculateEnneagram';
import { ENNEAGRAM_TYPES, getAllEnneagramTypes } from '../../data/enneagramData';
import { WORK_PROFILES } from '../../data/enneagramWorkData';
import { JOURNAL_PROMPTS } from '../../data/enneagramResources';
import { getCheckIns, getCheckInsFromLastDays } from '../../utils/checkIns';
import { getTaskStats } from '../../utils/tasks';
import { computeInsights, computeAchievements, type Insight, type Achievement } from '../../utils/wellbeingInsights';
import {
  getGoals, addGoal, toggleGoal, deleteGoal,
  getJournalEntries, addJournalEntry, type Goal, type JournalEntry,
} from '../../utils/employeeFeatures';
import {
  Lock, TrendingUp, CheckCircle2, Heart, Flame, Plus, HelpCircle,
  Target, BookOpen, Trophy, Lightbulb, X, Check, Calendar,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmployeeProgressTutorial } from '../../components/tutorial/EmployeeProgressTutorial';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export const EmployeeProgress: React.FC = () => {
  const [forceRunTutorial, setForceRunTutorial] = useState(false);
  const { user } = useAuth();

  const localResult = user ? getEnneagramResult(user.id) : null;
  const typeId = user?.enneagramType ?? localResult?.primaryType ?? null;

  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const [taskStats, setTaskStats] = useState<any>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  // Forms
  const [newGoal, setNewGoal] = useState('');
  const [journalText, setJournalText] = useState('');
  const [activePrompt, setActivePrompt] = useState<string | undefined>(undefined);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [ci, rci, ts, g, j] = await Promise.all([
      getCheckIns(user.id),
      getCheckInsFromLastDays(user.id, 30),
      getTaskStats(user.id),
      getGoals(user.id),
      getJournalEntries(user.id),
    ]);
    setCheckIns(ci || []);
    setRecentCheckIns(rci || []);
    setTaskStats(ts || null);
    setGoals(g || []);
    setJournal(j || []);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  if (!typeId) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
          <Lock size={64} className="mx-auto text-purple-600 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Completá tu Perfil</h2>
          <p className="text-slate-600 mb-6">Para ver tu crecimiento, primero completá el cuestionario de Eneagrama.</p>
          <a href="/questionnaire" className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg">Completar Cuestionario</a>
        </div>
      </div>
    );
  }

  const t = ENNEAGRAM_TYPES[typeId];
  const wp = WORK_PROFILES[typeId];

  // Métricas
  const avgEnergy = recentCheckIns.length > 0 ? recentCheckIns.reduce((s, c) => s + c.energy, 0) / recentCheckIns.length : 0;
  const insights: Insight[] = computeInsights(recentCheckIns);
  const achievements: Achievement[] = computeAchievements(
    checkIns.length, taskStats?.completed || 0, goals.length, true
  );
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Resumen de esta semana
  const weekAgo = Date.now() - 7 * 86400000;
  const weekCheckins = checkIns.filter((c) => new Date(c.date).getTime() >= weekAgo);
  const weekTasksDone = taskStats?.recentlyCompleted || 0;

  // Radar (solo si hay scores en localStorage)
  const radarData = localResult?.scores
    ? getAllEnneagramTypes().map((tp) => ({ type: tp.id, score: localResult.scores[tp.id] || 0, color: tp.color }))
    : [];
  const maxScore = radarData.length ? Math.max(...radarData.map((d) => d.score)) || 1 : 1;

  // Metas sugeridas según áreas de crecimiento del eneatipo
  const suggestedGoals = t.growthAreas.filter((a) => !goals.some((g) => g.title.toLowerCase().includes(a.toLowerCase())));

  const handleAddGoal = async (title: string) => {
    if (!title.trim() || !user) return;
    await addGoal(user.id, title.trim(), t.name);
    setNewGoal('');
    loadData();
  };
  const handleToggleGoal = async (g: Goal) => { await toggleGoal(g.id, g.status !== 'done'); loadData(); };
  const handleDeleteGoal = async (id: string) => { await deleteGoal(id); loadData(); };
  const handleSaveJournal = async () => {
    if (!journalText.trim() || !user) return;
    await addJournalEntry(user.id, journalText.trim(), activePrompt);
    setJournalText(''); setActivePrompt(undefined);
    loadData();
  };

  const prompts = JOURNAL_PROMPTS[typeId] || [];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-slate-50 min-h-screen">
      <EmployeeProgressTutorial forceRun={forceRunTutorial} onResetComplete={() => setForceRunTutorial(false)} />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1 flex items-center gap-3">
            <TrendingUp className="text-purple-600" size={36} /> Mi Crecimiento
          </h1>
          <p className="text-slate-600">Tu evolución personal, paso a paso</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setForceRunTutorial(true)} className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-600">
            <HelpCircle size={14} /> Tutorial
          </button>
          <Button onClick={() => (window.location.href = '/dashboard/employee/checkins')} className="bg-gradient-to-r from-purple-600 to-blue-600">
            <Plus className="mr-2 h-4 w-4" /> Check-in
          </Button>
        </div>
      </div>

      {/* Resumen de la semana */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} /> <h2 className="text-lg font-bold">Tu semana en resumen</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div><p className="text-3xl font-bold">{weekCheckins.length}</p><p className="text-sm opacity-80">check-ins</p></div>
          <div><p className="text-3xl font-bold">{weekTasksDone}</p><p className="text-sm opacity-80">tareas hechas</p></div>
          <div><p className="text-3xl font-bold">{avgEnergy.toFixed(1)}</p><p className="text-sm opacity-80">energía prom.</p></div>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={<Heart className="text-pink-500" size={22} />} value={checkIns.length} label="Check-ins totales" />
        <MetricCard icon={<CheckCircle2 className="text-green-500" size={22} />} value={taskStats?.completed || 0} label="Tareas completadas" />
        <MetricCard icon={<Trophy className="text-amber-500" size={22} />} value={`${unlockedCount}/${achievements.length}`} label="Logros" />
        <MetricCard icon={<Target className="text-blue-500" size={22} />} value={goals.filter((g) => g.status === 'active').length} label="Metas activas" />
      </div>

      {/* Insights de bienestar */}
      <Section icon={<Lightbulb className="text-amber-500" size={22} />} title="Insights de tu bienestar" subtitle="Patrones detectados en tus check-ins">
        <div className="grid sm:grid-cols-2 gap-4">
          {insights.map((ins, i) => (
            <div key={i} className={`rounded-xl p-4 border ${ins.tone === 'good' ? 'bg-green-50 border-green-200' : ins.tone === 'warn' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{ins.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900 text-sm mb-0.5">{ins.title}</p>
                  <p className="text-xs text-slate-600">{ins.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Logros */}
      <Section icon={<Trophy className="text-amber-500" size={22} />} title="Tus logros" subtitle={`${unlockedCount} de ${achievements.length} desbloqueados`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map((a, i) => (
            <div key={i} className={`rounded-xl p-4 text-center border transition-all ${a.unlocked ? 'bg-white border-amber-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
              <div className="text-3xl mb-2" style={{ filter: a.unlocked ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
              <p className="text-xs font-semibold text-slate-900">{a.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{a.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Metas de desarrollo */}
      <Section icon={<Target className="text-blue-600" size={22} />} title="Mis metas de desarrollo" subtitle="Objetivos personales según tu eneatipo">
        {/* Sugerencias */}
        {suggestedGoals.length > 0 && goals.length < 3 && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Sugeridas para Tipo {typeId}:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedGoals.slice(0, 4).map((s, i) => (
                <button key={i} onClick={() => handleAddGoal(`Trabajar mi ${s.toLowerCase()}`)}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 hover:bg-blue-100">
                  + {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Input nueva meta */}
        <div className="flex gap-2 mb-4">
          <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddGoal(newGoal)}
            placeholder="Ej: Practicar escucha activa esta semana"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          <button onClick={() => handleAddGoal(newGoal)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Agregar</button>
        </div>
        {/* Lista de metas */}
        {goals.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Todavía no tenés metas. Agregá una arriba o elegí una sugerida.</p>
        ) : (
          <div className="space-y-2">
            {goals.map((g) => (
              <div key={g.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <button onClick={() => handleToggleGoal(g)}>
                  {g.status === 'done' ? <CheckCircle2 className="text-green-600" size={22} /> : <div className="w-[22px] h-[22px] rounded-full border-2 border-slate-300" />}
                </button>
                <span className={`flex-1 text-sm ${g.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>{g.title}</span>
                <button onClick={() => handleDeleteGoal(g.id)} className="text-slate-300 hover:text-red-500"><X size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Diario de crecimiento */}
      <Section icon={<BookOpen className="text-purple-600" size={22} />} title="Diario de crecimiento" subtitle="Reflexioná con preguntas pensadas para tu tipo">
        {prompts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {prompts.map((p, i) => (
              <button key={i} onClick={() => { setActivePrompt(p); setJournalText(p + '\n\n'); }}
                className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full border border-purple-200 hover:bg-purple-100 text-left">
                💭 {p}
              </button>
            ))}
          </div>
        )}
        <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} rows={3}
          placeholder="Escribí lo que quieras reflexionar hoy..."
          className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-2" />
        <div className="flex justify-end mb-4">
          <button onClick={handleSaveJournal} disabled={!journalText.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
            <Check size={15} className="inline mr-1" /> Guardar entrada
          </button>
        </div>
        {journal.length > 0 && (
          <div className="space-y-2">
            {journal.slice(0, 5).map((j) => (
              <div key={j.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-[11px] text-slate-400 mb-1">{new Date(j.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">{j.content}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Radar (solo si hay datos del test en este dispositivo) */}
      {radarData.length > 0 && (
        <Section icon={<Flame className="text-rose-500" size={22} />} title="Tu perfil completo" subtitle="Tu distribución a través de los 9 tipos">
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="type" tick={(props: any) => {
                  const { payload, x, y } = props;
                  const d = radarData.find((r) => r.type === payload.value);
                  return (<g><circle cx={x} cy={y} r="13" fill={d?.color || '#94a3b8'} /><text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontWeight="bold">{payload.value}</text></g>);
                }} />
                <PolarRadiusAxis angle={90} domain={[0, maxScore]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke={t.color} strokeWidth={2} fill={t.color} fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      )}

      {wp && (
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-5 mt-2">
          <p className="text-sm text-slate-700"><Heart size={16} className="inline text-teal-600 mr-1" /> <strong>Recordá:</strong> {wp.selfCareTip}</p>
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode; value: React.ReactNode; label: string }> = ({ icon, value, label }) => (
  <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-slate-100">
    <div className="mb-2">{icon}</div>
    <p className="text-2xl md:text-3xl font-bold text-slate-900">{value}</p>
    <p className="text-xs text-slate-500">{label}</p>
  </div>
);

const Section: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }> = ({ icon, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
    <div className="flex items-center gap-3 mb-1">{icon}<h2 className="text-xl font-bold text-slate-900">{title}</h2></div>
    {subtitle && <p className="text-sm text-slate-500 mb-4">{subtitle}</p>}
    {!subtitle && <div className="mb-4" />}
    {children}
  </div>
);
