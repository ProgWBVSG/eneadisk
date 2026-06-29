import React, { useEffect, useState, useCallback } from 'react';
import { CalendarDays, Plus, X, MapPin, CheckSquare, Clock, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getEvents, createEvent, deleteEvent, getMyDueTasks, buildAgenda, getIcsUrl, type AgendaItem,
} from '../../utils/calendar';
import { Link2, Copy, Check } from 'lucide-react';
import { connectGoogleCalendar, captureGoogleToken, pushToGoogle } from '../../utils/gcal';

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
  const [showSub, setShowSub] = useState(false);
  const [gcalToken, setGcalToken] = useState<string | null>(null);
  const [gcalMsg, setGcalMsg] = useState<string | null>(null);
  const [monthDate, setMonthDate] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [events, tasks] = await Promise.all([getEvents(), getMyDueTasks(user.id)]);
      setItems(buildAgenda(events, tasks, user.id));
    } catch (e) { console.error('[Calendar]', e); }
    finally { setLoading(false); }
  }, [user]);
  useEffect(() => { load(); }, [load]);

  // Al volver del OAuth de Google, capturamos el token de calendario
  useEffect(() => { captureGoogleToken().then(setGcalToken).catch(() => {}); }, []);

  const removeEvent = async (rawId: string) => {
    await deleteEvent(rawId);
    load();
  };

  const syncGoogle = async () => {
    if (!gcalToken) {
      try { await connectGoogleCalendar(); } catch { setGcalMsg('No se pudo conectar con Google.'); }
      return;
    }
    setGcalMsg('Enviando a Google Calendar...');
    const from = new Date(); from.setHours(0, 0, 0, 0);
    const up = items.filter((i) => new Date(i.at) >= from).map((i) => ({ rawId: i.rawId, kind: i.kind, title: i.title, at: i.at, subtitle: i.subtitle }));
    const r = await pushToGoogle(gcalToken, up);
    if (r.expired) { sessionStorage.removeItem('gcal_token'); setGcalToken(null); setGcalMsg('La conexión con Google expiró: tocá de nuevo para reconectar.'); }
    else setGcalMsg(`✓ ${r.added} evento(s) enviados a tu Google Calendar.`);
  };

  // Items por día (para marcadores de la grilla)
  const byDay: Record<string, AgendaItem[]> = {};
  items.forEach((it) => { const k = dayKey(it.at); (byDay[k] ||= []).push(it); });

  // Qué mostramos en la agenda: el día seleccionado, o desde hoy en adelante
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const visible = selectedDay
    ? (byDay[selectedDay] || [])
    : items.filter((i) => new Date(i.at) >= todayStart);

  // agrupar por día
  const groups: { key: string; label: string; items: AgendaItem[] }[] = [];
  visible.forEach((it) => {
    const k = dayKey(it.at);
    let g = groups.find((x) => x.key === k);
    if (!g) { g = { key: k, label: dayLabel(it.at), items: [] }; groups.push(g); }
    g.items.push(it);
  });

  // Grilla del mes
  const year = monthDate.getFullYear(), month = monthDate.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // lunes=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = monthDate.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const todayKey = new Date().toDateString();

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold text-[#3A332E] flex items-center gap-3">
          <CalendarDays className="text-[#C9624A]" size={30} /> Calendario
        </h1>
        <div className="flex gap-2 flex-wrap justify-end">
          <button onClick={syncGoogle}
            className="flex items-center gap-1.5 border border-[#ECE3D8] text-[#3A332E] hover:bg-[#FAF6F1] px-3 py-2 rounded-xl text-sm font-medium">
            <CalendarDays size={16} /> {gcalToken ? 'Enviar a Google' : 'Conectar Google'}
          </button>
          <button onClick={() => setShowSub(true)}
            className="flex items-center gap-1.5 border border-[#ECE3D8] text-[#3A332E] hover:bg-[#FAF6F1] px-3 py-2 rounded-xl text-sm font-medium">
            <Link2 size={16} /> Suscribir
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-[#E07A5F] hover:bg-[#C9624A] text-white px-4 py-2 rounded-xl text-sm font-medium">
            <Plus size={16} /> Nuevo evento
          </button>
        </div>
      </div>
      {showSub && <SubscribeModal onClose={() => setShowSub(false)} />}
      {gcalMsg && <p className="text-xs text-[#8A8079] -mt-3 mb-4 text-right">{gcalMsg}</p>}

      {/* Grilla del mes */}
      <div className="bg-white rounded-2xl border border-[#ECE3D8] p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setMonthDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-[#FAF6F1] text-[#8A8079]"><ChevronLeft size={18} /></button>
          <span className="font-display font-semibold text-[#3A332E] capitalize">{monthLabel}</span>
          <button onClick={() => setMonthDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-[#FAF6F1] text-[#8A8079]"><ChevronRight size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-[#8A8079] mb-1">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} />;
            const date = new Date(year, month, day);
            const k = date.toDateString();
            const dayItems = byDay[k] || [];
            const isToday = k === todayKey;
            const isSel = selectedDay === k;
            return (
              <button key={i} onClick={() => setSelectedDay(isSel ? null : k)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-colors ${
                  isSel ? 'bg-[#E07A5F] text-white' : isToday ? 'bg-[#FCF1EC] text-[#C9624A] font-semibold' : 'hover:bg-[#FAF6F1] text-[#3A332E]'
                }`}>
                {day}
                {dayItems.length > 0 && (
                  <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${isSel ? 'bg-white' : 'bg-[#E07A5F]'}`} />
                )}
              </button>
            );
          })}
        </div>
        {selectedDay && (
          <button onClick={() => setSelectedDay(null)} className="mt-3 text-xs text-[#C9624A] hover:text-[#A84C37] font-medium">
            ← Ver todo lo próximo
          </button>
        )}
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

const SubscribeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getIcsUrl().then((u) => { setUrl(u); setLoading(false); }).catch((e) => { console.error('[ics]', e); setLoading(false); });
  }, []);

  const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-[#ECE3D8]">
          <h3 className="text-lg font-display font-bold text-[#3A332E] flex items-center gap-2"><Link2 className="text-[#C9624A]" size={20} /> Sincronizar con tu calendario</h3>
          <button onClick={onClose} className="text-[#8A8079] hover:text-[#3A332E]"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-[#8A8079]">Copiá este link y suscribilo en tu calendario (Google, Outlook o Apple). Tus tareas y reuniones de EneaTeams van a aparecer ahí y se actualizan solas.</p>
          {loading ? (
            <div className="py-4 flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[#E07A5F] border-t-transparent" /></div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-[#ECE3D8] bg-[#FAF6F1] px-3 py-2">
              <span className="flex-1 text-xs text-[#3A332E] truncate font-mono">{url}</span>
              <button onClick={copy} className="text-[#C9624A] hover:text-[#A84C37] shrink-0 flex items-center gap-1 text-xs font-medium">
                {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
              </button>
            </div>
          )}
          <div className="text-xs text-[#8A8079] space-y-1">
            <p className="font-medium text-[#3A332E]">Cómo agregarlo en Google Calendar:</p>
            <p>1. Abrí calendar.google.com → engranaje → "Configuración"</p>
            <p>2. "Añadir calendario" → "Desde URL" → pegá el link → "Añadir"</p>
            <p className="text-[#C9624A]">⚠️ Es un link privado y tuyo: no lo compartas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
