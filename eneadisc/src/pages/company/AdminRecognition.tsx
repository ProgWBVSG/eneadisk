import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KUDOS_CATEGORIES } from '../../data/enneagramResources';
import {
  getAdminKudos, sendAdminKudo, getKudosRanking, getEmployeesOverview,
  type AdminKudo, type KudoRank,
} from '../../utils/adminFeatures';
import { Award, Trophy, Plus, Send, X, Medal } from 'lucide-react';

export const AdminRecognition: React.FC = () => {
  const { user } = useAuth();
  const [kudos, setKudos] = useState<AdminKudo[]>([]);
  const [ranking, setRanking] = useState<KudoRank[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    if (!user?.companyId) return;
    setLoading(true);
    const [k, r, emps] = await Promise.all([
      getAdminKudos(user.companyId),
      getKudosRanking(user.companyId),
      getEmployeesOverview(),
    ]);
    setKudos(k); setRanking(r);
    setEmployees(emps.map((e) => ({ id: e.id, name: e.name })));
    setLoading(false);
  }, [user?.companyId]);
  useEffect(() => { load(); }, [load]);

  const catEmoji = (c: string) => KUDOS_CATEGORIES.find((k) => k.value === c)?.emoji || '⭐';
  const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`);

  if (loading) {
    return <div className="p-8 flex flex-col items-center justify-center min-h-[400px]"><div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mb-4" /><p className="text-slate-500 text-sm">Cargando reconocimientos...</p></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-3"><Award className="text-amber-500" size={32} /> Reconocimientos</h1>
          <p className="text-slate-600">Celebrá y motivá a tu equipo</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600">
          <Plus size={18} /> Dar reconocimiento
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ranking de colaboración */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 sticky top-4">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Trophy className="text-amber-600" size={20} /> Más reconocidos</h2>
            {ranking.length === 0 ? (
              <p className="text-sm text-slate-500">Todavía no hay reconocimientos. ¡Empezá vos!</p>
            ) : (
              <div className="space-y-2">
                {ranking.slice(0, 8).map((r, i) => (
                  <div key={r.userId} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-amber-100">
                    <span className="text-lg w-7 text-center shrink-0">{medal(i)}</span>
                    <span className="flex-1 text-sm font-medium text-slate-800 truncate">{r.name}</span>
                    <span className="text-sm font-bold text-amber-600 flex items-center gap-1"><Medal size={14} /> {r.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Muro de reconocimientos */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Muro del equipo</h2>
          {kudos.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
              <Award className="w-14 h-14 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-700 mb-1">Sin reconocimientos aún</h3>
              <p className="text-slate-500 text-sm">Dar el primer reconocimiento marca el tono de la cultura del equipo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {kudos.map((k) => (
                <div key={k.id} className="bg-white rounded-xl p-4 border border-slate-200 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl shrink-0">{catEmoji(k.category)}</div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold text-slate-900">{k.fromName}</span>
                      <span className="text-slate-500"> reconoció a </span>
                      <span className="font-semibold text-slate-900">{k.toName}</span>
                    </p>
                    <p className="text-slate-600 italic mt-1">"{k.message}"</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(k.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <GiveKudoModal employees={employees} companyId={user?.companyId || ''} onClose={() => setShowModal(false)} onSent={() => { setShowModal(false); load(); }} />
      )}
    </div>
  );
};

const GiveKudoModal: React.FC<{ employees: { id: string; name: string }[]; companyId: string; onClose: () => void; onSent: () => void }> = ({ employees, companyId, onClose, onSent }) => {
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('general');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!target || !message.trim()) { setError('Elegí una persona y escribí un mensaje.'); return; }
    setSending(true);
    const { error } = await sendAdminKudo(companyId, target, category, message.trim());
    setSending(false);
    if (error) { setError('No se pudo enviar. Intentá de nuevo.'); return; }
    onSent();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Award className="text-amber-500" size={22} /> Dar reconocimiento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-1">¿A quién?</label>
        <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-4 focus:ring-2 focus:ring-amber-500 outline-none">
          <option value="">Elegí una persona...</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <p className="text-sm font-medium text-slate-700 mb-2">¿Por qué?</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {KUDOS_CATEGORIES.map((c) => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all ${category === c.value ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:bg-slate-50'}`}>
              <span className="text-lg">{c.emoji}</span>{c.label}
            </button>
          ))}
        </div>

        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Escribí un mensaje genuino de reconocimiento..."
          className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none mb-2" />
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <button onClick={send} disabled={sending} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50">
          {sending ? 'Enviando...' : <><Send size={16} /> Enviar reconocimiento</>}
        </button>
      </div>
    </div>
  );
};
