import React, { useEffect, useState, useCallback } from 'react';
import { CalendarDays, Plus, X, MapPin, CheckSquare, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getEvents, createEvent, deleteEvent, getMyDueTasks, buildAgenda, type AgendaItem,
} from '../../utils/calendar';

const dayKey = (iso: string) => new Date(iso).toDateString();
const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date(); const tom = new Date(); tom.setDate(tom.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === tom.toDateString()) return 'Mañana';
  return d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
};
const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

export const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [events, tasks] = await Promise.all([getEvents(), getMyDueTasks(user.id)]);
      // desde el inicio de hoy en adelante
      const from = new Date(); from.setHours(0, 0, 0, 0);
      const all = buildAgenda(events, tasks, user.id).filter((i) => new Date(i.at) >= from);
      setItems(all);
    } catch (e) { console.error('[Calendar]', e); }
    finally { setLoading(false); }
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const removeEvent = async (rawId: string) => {
    await deleteEvent(rawId);
    load();
  };

  // agrupar por día
  const groups: { key: string; label: string; items: AgendaItem[] }[] = [];
  items.forEach((it) => {
    const k = dayKey(it.at);
    let g = groups.find((x) => x.key === k);
    if (!g) { g = { key: k, label: dayLabel(it.at), items: [] }; groups.push(g); }
    g.items.push(it);
  });

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold text-[#3A332E] flex items-center gap-3">
          <CalendarDays className="text-[#C9624A]" size={30} /> Calendario
        </h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-[#E07A5F] hover:bg-[#C9624A] text-white px-4 py-2 rounded-xl text-sm font-medium">
          <Plus size={16} /> Nuevo evento
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E07A5F] border-t-transparent" /></div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#ECE3D8]">
          <CalendarDays className="mx-auto mb-3 text-[#ECE3D8]" size={44} />
          <p className="text-[#8A8079]">No tenés nada próximo. Creá un evento o ponele fecha a tus tareas.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.key}>
              <h2 className="text-sm font-semibold text-[#C9624A] uppercase tracking-wide mb-2 capitalize">{g.label}</h2>
              <div className="space-y-2">
                {g.items.map((it) => (
                  <div key={it.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-[#ECE3D8]">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${it.kind === 'task' ? 'bg-[#EEF3EE] text-[#5F7A68]' : 'bg-[#FCF1EC] text-[#C9624A]'}`}>
                      {it.kind === 'task' ? <CheckSquare size={18} /> : <Clock size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-[#3A332E] truncate ${it.done ? 'line-through text-[#8A8079]' : ''}`}>{it.title}</p>
                      <p className="text-xs text-[#8A8079] flex items-center gap-2">
                        <span>{timeLabel(it.at)}</span>
                        {it.subtitle && <span className="flex items-center gap-1 truncate">{it.kind === 'event' && it.subtitle !== 'Tarea' && <MapPin size={11} />}{it.subtitle}</span>}
                      </p>
                    </div>
                    {it.kind === 'event' && it.ownEvent && (
                      <button onClick={() => removeEvent(it.rawId)} className="text-[#8A8079] hover:text-red-500 shrink-0" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && user && (
        <EventForm
          companyId={user.companyId} userId={user.id}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
};

const EventForm: React.FC<{
  companyId: string; userId: string; onClose: () => void; onSaved: () => void;
}> = ({ companyId, userId, onClose, onSaved }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [location, setLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!title.trim()) { setErr('Poné un título'); return; }
    if (!date) { setErr('Elegí una fecha'); return; }
    setBusy(true); setErr('');
    try {
      const startAt = new Date(`${date}T${time || '09:00'}`).toISOString();
      await createEvent({ companyId, createdBy: userId, title, startAt, location });
      onSaved();
    } catch (e: any) { setErr(e?.message || 'No se pudo crear'); setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="flex items-center justify-between p-5 border-b border-[#ECE3D8]">
          <h3 className="text-lg font-display font-bold text-[#3A332E]">Nuevo evento</h3>
          <button onClick={onClose} className="text-[#8A8079] hover:text-[#3A332E]"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (ej: Reunión de equipo)" maxLength={120}
            className="w-full rounded-lg border border-[#ECE3D8] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/40" />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-[#ECE3D8] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/40" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="rounded-lg border border-[#ECE3D8] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/40" />
          </div>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lugar o link (opcional)" maxLength={200}
            className="w-full rounded-lg border border-[#ECE3D8] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/40" />
          {err && <p className="text-sm text-red-500">{err}</p>}
        </div>
        <div className="flex gap-3 p-5 border-t border-[#ECE3D8]">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#ECE3D8] text-[#8A8079] hover:bg-[#FAF6F1] text-sm">Cancelar</button>
          <button onClick={submit} disabled={busy} className="flex-1 py-2.5 rounded-xl bg-[#E07A5F] text-white font-medium hover:bg-[#C9624A] disabled:opacity-50 text-sm">
            {busy ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
