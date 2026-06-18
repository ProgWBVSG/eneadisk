import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ENNEAGRAM_TYPES } from '../../data/enneagramData';
import { WORK_PROFILES } from '../../data/enneagramWorkData';
import { LEADERSHIP_GUIDE } from '../../data/enneagramLeadership';
import { MOOD_CONFIG } from '../../utils/checkIns';
import {
  getEmployeesOverview, getEmployeeCheckins, getOneOnOneNotes, addOneOnOneNote, deleteOneOnOneNote,
  type EmployeeOverview, type EmpCheckin, type OneOnOneNote,
} from '../../utils/adminFeatures';
import {
  Users, ArrowLeft, AlertTriangle, Clock, Compass, MessageCircle, Zap, Flame,
  Heart, Activity, Plus, Trash2, MessageSquareReply, Search,
} from 'lucide-react';

const RISK_CONFIG = {
  ok: { label: 'Estable', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  watch: { label: 'Atención', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  high: { label: 'En riesgo', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

export const AdminPeople: React.FC = () => {
  const { user } = useAuth();
  const [people, setPeople] = useState<EmployeeOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EmployeeOverview | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setPeople(await getEmployeesOverview());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="p-8 flex flex-col items-center justify-center min-h-[400px]"><div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mb-4" /><p className="text-slate-500 text-sm">Cargando tu equipo...</p></div>;
  }

  if (selected) {
    return <PersonDetail person={selected} companyId={user?.companyId || ''} onBack={() => { setSelected(null); load(); }} />;
  }

  const filtered = people.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const atRisk = people.filter((p) => p.risk === 'high').length;
  const pending = people.filter((p) => !p.questionnaireCompleted).length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3"><Users className="text-purple-600" size={32} /> Personas</h1>
        <p className="text-slate-600">Gestioná a cada persona de tu equipo de forma individual</p>
      </div>

      {/* Alertas */}
      {(atRisk > 0 || pending > 0) && (
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {atRisk > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="text-red-600 shrink-0" size={22} />
              <p className="text-sm text-red-800"><strong>{atRisk}</strong> {atRisk === 1 ? 'persona' : 'personas'} con señales de estrés alto. Revisá su ficha.</p>
            </div>
          )}
          {pending > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <Clock className="text-amber-600 shrink-0" size={22} />
              <p className="text-sm text-amber-800"><strong>{pending}</strong> {pending === 1 ? 'persona' : 'personas'} sin completar el test de eneagrama.</p>
            </div>
          )}
        </div>
      )}

      {/* Buscador */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar persona..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
      </div>

      {people.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Todavía no hay empleados</h3>
          <p className="text-slate-600">Compartí tu código de invitación para que se sumen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => {
            const ct = p.enneagramType ? ENNEAGRAM_TYPES[p.enneagramType] : null;
            const risk = RISK_CONFIG[p.risk];
            return (
              <button key={p.id} onClick={() => setSelected(p)}
                className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:shadow-md hover:border-purple-300 transition-all">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={{ background: ct ? `linear-gradient(135deg, ${ct.color}, ${ct.color}cc)` : 'linear-gradient(135deg,#94a3b8,#64748b)' }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate">{p.name}</h4>
                    {ct ? <p className="text-xs font-medium" style={{ color: ct.color }}>Tipo {p.enneagramType}: {ct.name}</p>
                      : <p className="text-xs text-slate-400 flex items-center gap-1"><Clock size={11} /> Test pendiente</p>}
                  </div>
                  {p.checkinCount > 0 && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: risk.bg, color: risk.color, border: `1px solid ${risk.border}` }}>{risk.label}</span>
                  )}
                </div>
                {p.checkinCount > 0 && (
                  <div className="flex gap-4 mt-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Zap size={13} className="text-blue-500" /> Energía {p.avgEnergy.toFixed(1)}</span>
                    <span className="flex items-center gap-1"><Flame size={13} className="text-rose-500" /> Estrés {p.avgStress.toFixed(1)}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ════════════════ FICHA 360 DEL EMPLEADO ════════════════
const PersonDetail: React.FC<{ person: EmployeeOverview; companyId: string; onBack: () => void }> = ({ person, companyId, onBack }) => {
  const [checkins, setCheckins] = useState<EmpCheckin[]>([]);
  const [notes, setNotes] = useState<OneOnOneNote[]>([]);
  const [newNote, setNewNote] = useState('');

  const loadDetail = useCallback(async () => {
    const [ci, ns] = await Promise.all([getEmployeeCheckins(person.id), getOneOnOneNotes(person.id)]);
    setCheckins(ci); setNotes(ns);
  }, [person.id]);
  useEffect(() => { loadDetail(); }, [loadDetail]);

  const ct = person.enneagramType ? ENNEAGRAM_TYPES[person.enneagramType] : null;
  const wp = person.enneagramType ? WORK_PROFILES[person.enneagramType] : null;
  const lead = person.enneagramType ? LEADERSHIP_GUIDE[person.enneagramType] : null;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await addOneOnOneNote(companyId, person.id, newNote.trim());
    setNewNote(''); loadDetail();
  };
  const handleDeleteNote = async (id: string) => { await deleteOneOnOneNote(id); loadDetail(); };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 text-sm"><ArrowLeft size={16} /> Volver a Personas</button>

      {/* Header */}
      <div className="rounded-2xl p-6 md:p-8 mb-6 text-white shadow-xl"
        style={{ background: ct ? `linear-gradient(135deg, ${ct.color}, ${ct.color}dd)` : 'linear-gradient(135deg,#64748b,#475569)' }}>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30 text-3xl font-bold shrink-0">{person.name.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{person.name}</h1>
            {ct ? <p className="opacity-90">Tipo {person.enneagramType}: {ct.name}</p> : <p className="opacity-90">Test de eneagrama pendiente</p>}
            <p className="text-sm opacity-75 mt-1">{person.email}</p>
          </div>
        </div>
      </div>

      {!ct ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center mb-6">
          <Clock className="mx-auto text-amber-500 mb-3" size={40} />
          <p className="text-amber-800">{person.name.split(' ')[0]} todavía no completó el test de eneagrama. Cuando lo haga, vas a ver acá su perfil completo y cómo liderarlo mejor.</p>
        </div>
      ) : (
        <>
          {/* Cómo liderar */}
          {lead && (
            <Card icon={<Compass className="text-indigo-600" size={22} />} title={`Cómo liderar a ${person.name.split(' ')[0]}`}>
              <div className="grid sm:grid-cols-2 gap-4">
                <LeadBlock color="indigo" label="Estilo de liderazgo" text={lead.howToLead} />
                <LeadBlock color="blue" label="Cómo asignarle trabajo" text={lead.assignWork} />
                <LeadBlock color="emerald" label="Cómo motivarlo" text={lead.motivate} />
                <LeadBlock color="amber" label="Señal a vigilar" text={lead.watchFor} />
              </div>
            </Card>
          )}

          {/* Comunicación + feedback (del manual de usuario) */}
          {wp && (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card icon={<MessageCircle className="text-blue-600" size={22} />} title="Cómo comunicarte" compact>
                <ul className="space-y-2">{wp.howToCommunicate.slice(0, 3).map((x, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-blue-400 mt-1">•</span>{x}</li>)}</ul>
              </Card>
              <Card icon={<MessageSquareReply className="text-green-600" size={22} />} title="Cómo darle feedback" compact>
                <ul className="space-y-2">{wp.feedbackTips.slice(0, 3).map((x, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-green-500 mt-1">✓</span>{x}</li>)}</ul>
              </Card>
            </div>
          )}

          {/* Motivadores y estresores */}
          {wp && (
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card icon={<Zap className="text-emerald-600" size={22} />} title="Qué lo motiva" compact>
                <div className="flex flex-wrap gap-2">{wp.motivators.map((m, i) => <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm border border-emerald-200">{m}</span>)}</div>
              </Card>
              <Card icon={<Flame className="text-rose-600" size={22} />} title="Qué lo frustra" compact>
                <div className="flex flex-wrap gap-2">{wp.stressors.map((s, i) => <span key={i} className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-sm border border-rose-200">{s}</span>)}</div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Bienestar reciente */}
      <Card icon={<Activity className="text-indigo-600" size={22} />} title="Bienestar reciente" subtitle="Últimos check-ins (privado para vos como manager)">
        {checkins.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">{person.name.split(' ')[0]} todavía no registró check-ins.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100"><p className="text-xs text-blue-700">Energía prom.</p><p className="text-2xl font-bold text-blue-900">{person.avgEnergy.toFixed(1)}<span className="text-sm text-blue-500"> /5</span></p></div>
              <div className="bg-rose-50 rounded-lg p-3 border border-rose-100"><p className="text-xs text-rose-700">Estrés prom.</p><p className="text-2xl font-bold text-rose-900">{person.avgStress.toFixed(1)}<span className="text-sm text-rose-500"> /5</span></p></div>
            </div>
            <div className="space-y-2">
              {checkins.slice(0, 7).map((c) => {
                const mc = MOOD_CONFIG[c.mood as keyof typeof MOOD_CONFIG];
                return (
                  <div key={c.id} className="flex items-center gap-3 text-sm">
                    <span className="text-xl">{mc?.emoji || '😐'}</span>
                    <span className="text-slate-500 w-24">{new Date(c.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
                    <span className="text-blue-600">Energía {c.energy}</span>
                    <span className="text-rose-600">Estrés {c.stress}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Notas de 1-on-1 */}
      <Card icon={<Heart className="text-purple-600" size={22} />} title="Notas de 1-on-1" subtitle="Registrá tus reuniones y seguimiento con esta persona">
        <div className="flex gap-2 mb-4">
          <input value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
            placeholder="Ej: Hablamos de su carga de trabajo, quiere más proyectos creativos..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
          <button onClick={handleAddNote} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-1"><Plus size={16} /> Agregar</button>
        </div>
        {notes.length === 0 ? <p className="text-sm text-slate-400 text-center py-2">Sin notas todavía.</p> : (
          <div className="space-y-2">
            {notes.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex-1"><p className="text-[11px] text-slate-400 mb-1">{new Date(n.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</p><p className="text-sm text-slate-700">{n.note}</p></div>
                <button onClick={() => handleDeleteNote(n.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const Card: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; compact?: boolean; children: React.ReactNode }> = ({ icon, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
    <div className="flex items-center gap-3 mb-1">{icon}<h2 className="text-lg font-bold text-slate-900">{title}</h2></div>
    {subtitle ? <p className="text-sm text-slate-500 mb-4">{subtitle}</p> : <div className="mb-3" />}
    {children}
  </div>
);

const LeadBlock: React.FC<{ color: string; label: string; text: string }> = ({ color, label, text }) => {
  const map: Record<string, string> = { indigo: 'bg-indigo-50 text-indigo-700', blue: 'bg-blue-50 text-blue-700', emerald: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700' };
  return (
    <div className={`rounded-lg p-4 ${map[color].split(' ')[0]}`}>
      <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${map[color].split(' ')[1]}`}>{label}</p>
      <p className="text-sm text-slate-700">{text}</p>
    </div>
  );
};
