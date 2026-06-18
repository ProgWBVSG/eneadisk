import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ENNEAGRAM_TYPES } from '../../data/enneagramData';
import { LEADERSHIP_GUIDE } from '../../data/enneagramLeadership';
import { KUDOS_CATEGORIES } from '../../data/enneagramResources';
import { sendKudo } from '../../utils/employeeFeatures';
import {
  getSupervisedPeople, getSupervisedMood, getTeamMemberTasks, reviewTask, assignTask,
  type SupervisedPerson, type SupervisedMood, type SupervisedTask,
} from '../../utils/supervisorFeatures';
import {
  UserCog, Activity, Zap, Flame, Clock, ClipboardCheck, Plus, X,
  Check, AlertCircle, Award, Compass, Send, ListChecks,
} from 'lucide-react';

const RISK = {
  ok: { label: 'Estable', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  watch: { label: 'Atención', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  high: { label: 'En riesgo', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

export const SupervisorPanel: React.FC = () => {
  const { user } = useAuth();
  const [people, setPeople] = useState<SupervisedPerson[]>([]);
  const [mood, setMood] = useState<SupervisedMood | null>(null);
  const [tasks, setTasks] = useState<SupervisedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignTo, setAssignTo] = useState<SupervisedPerson | null>(null);
  const [kudoTo, setKudoTo] = useState<SupervisedPerson | null>(null);
  const [reviewing, setReviewing] = useState<SupervisedTask | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const ppl = await getSupervisedPeople();
    setPeople(ppl);
    const [m, tk] = await Promise.all([getSupervisedMood(), getTeamMemberTasks(ppl.map((p) => p.id))]);
    setMood(m);
    setTasks(tk);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <div className="p-8 flex flex-col items-center justify-center min-h-[400px]"><div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-4" /><p className="text-slate-500 text-sm">Cargando tu equipo a cargo...</p></div>;
  }

  const nameOf = (id: string) => people.find((p) => p.id === id)?.name || 'Alguien';
  const pendingReview = tasks.filter((t) => t.status === 'completed' && !t.reviewStatus);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3"><UserCog className="text-emerald-600" size={32} /> Mi Equipo a Cargo</h1>
        <p className="text-slate-600">Gestioná, acompañá y hacé seguimiento de tu gente</p>
      </div>

      {people.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <UserCog className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Todavía no tenés gente a cargo</h3>
          <p className="text-slate-600 max-w-md mx-auto">Cuando el administrador te asigne uno o más equipos, vas a ver acá a tu gente, sus tareas y su pulso de bienestar.</p>
        </div>
      ) : (
        <>
          {/* Pulso del equipo */}
          {mood && mood.checkinCount > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="text-indigo-600" size={22} />
                <h2 className="text-xl font-bold text-slate-900">Pulso de tu equipo</h2>
                <span className="text-xs text-slate-400 ml-auto">últimos 7 días · {mood.checkinCount} check-ins</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-1"><Zap size={16} className="text-blue-600" /><span className="text-xs font-medium text-blue-700">Energía</span></div>
                  <p className="text-2xl font-bold text-blue-900">{mood.avgEnergy.toFixed(1)}<span className="text-sm text-blue-500"> /5</span></p>
                  <div className="w-full bg-blue-100 rounded-full h-2 mt-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(mood.avgEnergy / 5) * 100}%` }} /></div>
                </div>
                <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                  <div className="flex items-center gap-2 mb-1"><Flame size={16} className="text-rose-600" /><span className="text-xs font-medium text-rose-700">Estrés</span></div>
                  <p className="text-2xl font-bold text-rose-900">{mood.avgStress.toFixed(1)}<span className="text-sm text-rose-500"> /5</span></p>
                  <div className="w-full bg-rose-100 rounded-full h-2 mt-2"><div className="bg-rose-500 h-2 rounded-full" style={{ width: `${(mood.avgStress / 5) * 100}%` }} /></div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3">Promedios anónimos de tu equipo. Respetamos la privacidad de cada check-in individual.</p>
            </div>
          )}

          {/* Mi gente */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><UserCog size={20} className="text-emerald-600" /> Mi gente ({people.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {people.map((p) => {
                const ct = p.enneagramType ? ENNEAGRAM_TYPES[p.enneagramType] : null;
                const lead = p.enneagramType ? LEADERSHIP_GUIDE[p.enneagramType] : null;
                const r = RISK[p.risk];
                return (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
                        style={{ background: ct ? `linear-gradient(135deg, ${ct.color}, ${ct.color}cc)` : 'linear-gradient(135deg,#94a3b8,#64748b)' }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{p.name}</h4>
                        {ct ? <p className="text-xs font-medium" style={{ color: ct.color }}>Tipo {p.enneagramType}: {ct.name}</p>
                          : <p className="text-xs text-slate-400 flex items-center gap-1"><Clock size={11} /> Test pendiente</p>}
                      </div>
                      {p.checkinCount > 0 && <span className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: r.bg, color: r.color, border: `1px solid ${r.border}` }}>{r.label}</span>}
                    </div>
                    {p.checkinCount > 0 && (
                      <div className="flex gap-4 mb-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Zap size={13} className="text-blue-500" /> {p.avgEnergy.toFixed(1)}</span>
                        <span className="flex items-center gap-1"><Flame size={13} className="text-rose-500" /> {p.avgStress.toFixed(1)}</span>
                      </div>
                    )}
                    {lead && (
                      <div className="bg-indigo-50/60 rounded-lg p-3 mb-3">
                        <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-1 flex items-center gap-1.5"><Compass size={12} /> Cómo liderarlo</p>
                        <p className="text-sm text-slate-700">{lead.motivate}</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => setAssignTo(p)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600"><Plus size={14} /> Tarea</button>
                      <button onClick={() => setKudoTo(p)} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600"><Award size={14} /> Reconocer</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revisión de tareas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <ListChecks className="text-purple-600" size={22} />
              <h2 className="text-xl font-bold text-slate-900">Tareas de tu equipo</h2>
              {pendingReview.length > 0 && <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium">{pendingReview.length} por revisar</span>}
            </div>
            <p className="text-sm text-slate-500 mb-4">Confirmá las completadas, marcá errores y dejá notas</p>
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Tu equipo todavía no tiene tareas.</p>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 20).map((t) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${t.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{t.title}</span>
                        {t.status === 'completed' && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">completada</span>}
                      </div>
                      <p className="text-xs text-slate-400">{nameOf(t.userId)}</p>
                      {t.reviewStatus && (
                        <p className={`text-xs mt-1 flex items-center gap-1 ${t.reviewStatus === 'confirmed' ? 'text-green-600' : 'text-amber-600'}`}>
                          {t.reviewStatus === 'confirmed' ? <Check size={12} /> : <AlertCircle size={12} />}
                          {t.reviewStatus === 'confirmed' ? 'Confirmada' : 'A corregir'}{t.reviewNote ? ': ' + t.reviewNote : ''}
                        </p>
                      )}
                    </div>
                    <button onClick={() => setReviewing(t)} className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-1 shrink-0">
                      <ClipboardCheck size={14} /> Revisar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {assignTo && <AssignTaskModal person={assignTo} onClose={() => setAssignTo(null)} onDone={() => { setAssignTo(null); load(); }} />}
      {kudoTo && <KudoModal person={kudoTo} companyId={user?.companyId || ''} onClose={() => setKudoTo(null)} onDone={() => { setKudoTo(null); }} />}
      {reviewing && <ReviewModal task={reviewing} onClose={() => setReviewing(null)} onDone={() => { setReviewing(null); load(); }} />}
    </div>
  );
};

// ── Modal: asignar tarea ──
const AssignTaskModal: React.FC<{ person: SupervisedPerson; onClose: () => void; onDone: () => void }> = ({ person, onClose, onDone }) => {
  const [title, setTitle] = useState(''); const [desc, setDesc] = useState(''); const [priority, setPriority] = useState('medium'); const [dueDate, setDueDate] = useState(''); const [saving, setSaving] = useState(false); const [err, setErr] = useState<string | null>(null);
  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const { error } = await assignTask(person.id, title.trim(), desc, priority, dueDate || undefined);
    setSaving(false);
    if (error) { setErr('No se pudo asignar. Intentá de nuevo.'); return; }
    onDone();
  };
  return (
    <Modal title={`Asignar tarea a ${person.name.split(' ')[0]}`} onClose={onClose}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la tarea" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Descripción (opcional)" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3 resize-none focus:ring-2 focus:ring-emerald-500 outline-none" />
      <div className="flex gap-2 mb-3">
        {[['low', 'Baja'], ['medium', 'Media'], ['high', 'Alta']].map(([v, l]) => (
          <button key={v} onClick={() => setPriority(v)} className={`flex-1 py-2 rounded-lg text-sm border ${priority === v ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}>{l}</button>
        ))}
      </div>
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
      {err && <p className="text-sm text-red-500 mb-2">{err}</p>}
      <button onClick={save} disabled={!title.trim() || saving} className="w-full py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"><Plus size={16} /> {saving ? 'Asignando...' : 'Asignar tarea'}</button>
    </Modal>
  );
};

// ── Modal: revisar tarea ──
const ReviewModal: React.FC<{ task: SupervisedTask; onClose: () => void; onDone: () => void }> = ({ task, onClose, onDone }) => {
  const [note, setNote] = useState(task.reviewNote || ''); const [saving, setSaving] = useState(false);
  const doReview = async (status: 'confirmed' | 'needs_fix') => {
    setSaving(true);
    await reviewTask(task.id, status, note);
    setSaving(false); onDone();
  };
  return (
    <Modal title="Revisar tarea" onClose={onClose}>
      <p className="text-sm font-medium text-slate-900 mb-1">{task.title}</p>
      {task.description && <p className="text-sm text-slate-500 mb-3">{task.description}</p>}
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Nota o feedback (opcional)" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-3 resize-none focus:ring-2 focus:ring-purple-500 outline-none" />
      <div className="flex gap-2">
        <button onClick={() => doReview('needs_fix')} disabled={saving} className="flex-1 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"><AlertCircle size={16} /> Marcar error</button>
        <button onClick={() => doReview('confirmed')} disabled={saving} className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"><Check size={16} /> Confirmar</button>
      </div>
    </Modal>
  );
};

// ── Modal: reconocer (kudo) ──
const KudoModal: React.FC<{ person: SupervisedPerson; companyId: string; onClose: () => void; onDone: () => void }> = ({ person, companyId, onClose, onDone }) => {
  const [category, setCategory] = useState('general'); const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false); const [err, setErr] = useState<string | null>(null);
  const send = async () => {
    if (!message.trim()) return;
    setSaving(true);
    const { error } = await sendKudo(companyId, person.id, category, message.trim());
    setSaving(false);
    if (error) { setErr('No se pudo enviar.'); return; }
    onDone();
  };
  return (
    <Modal title={`Reconocer a ${person.name.split(' ')[0]}`} onClose={onClose}>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {KUDOS_CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setCategory(c.value)} className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs ${category === c.value ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}><span className="text-lg">{c.emoji}</span>{c.label}</button>
        ))}
      </div>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Mensaje de reconocimiento..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-2 resize-none focus:ring-2 focus:ring-amber-500 outline-none" />
      {err && <p className="text-sm text-red-500 mb-2">{err}</p>}
      <button onClick={send} disabled={!message.trim() || saving} className="w-full py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"><Send size={16} /> {saving ? 'Enviando...' : 'Enviar'}</button>
    </Modal>
  );
};

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl max-w-md w-full p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
      </div>
      {children}
    </div>
  </div>
);
