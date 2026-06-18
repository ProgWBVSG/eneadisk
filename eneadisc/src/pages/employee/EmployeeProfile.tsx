import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEnneagramResult } from '../../utils/calculateEnneagram';
import { ENNEAGRAM_TYPES } from '../../data/enneagramData';
import { WORK_PROFILES, getDailyTip } from '../../data/enneagramWorkData';
import { RESOURCES } from '../../data/enneagramResources';
import {
  Heart, AlertTriangle, TrendingUp, Target, Users, Lock, HelpCircle,
  MessageCircle, MessageSquareReply, Sparkles, Flame, Zap, Sun, Share2, Check, UserCircle, BookOpen, Dumbbell,
} from 'lucide-react';
import { EmployeeTutorial } from '../../components/tutorial/EmployeeTutorial';

type Tab = 'identity' | 'manual';

export const EmployeeProfile: React.FC = () => {
  const [forceRunTutorial, setForceRunTutorial] = useState(false);
  const [tab, setTab] = useState<Tab>('identity');
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();

  // Prioridad: eneatipo guardado en Supabase (funciona en cualquier dispositivo).
  // Fallback: resultado en localStorage (compatibilidad con versiones viejas).
  const localResult = user ? getEnneagramResult(user.id) : null;
  const typeId = user?.enneagramType ?? localResult?.primaryType ?? null;

  if (!typeId) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
          <Lock size={64} className="mx-auto text-purple-600 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Completá tu Perfil</h2>
          <p className="text-slate-600 mb-6">
            Para acceder a todas las funcionalidades, primero completá el cuestionario de Eneagrama.
          </p>
          <a
            href="/questionnaire"
            className="inline-block bg-gradient-to-r from-[#E07A5F] to-[#C9624A] text-white px-6 py-3 rounded-lg hover:from-[#C9624A] hover:to-[#A84C37] transition-all"
          >
            Completar Cuestionario
          </a>
        </div>
      </div>
    );
  }

  const t = ENNEAGRAM_TYPES[typeId];
  const wp = WORK_PROFILES[typeId];
  const dailyTip = getDailyTip(typeId);
  const firstName = user?.name?.split(' ')[0] || 'vos';

  // Generar el "manual" en texto para compartir con el equipo
  const buildShareText = () => {
    if (!wp) return '';
    return [
      `📋 MANUAL DE USUARIO — ${user?.name || 'Mi perfil'}`,
      `Eneatipo ${typeId}: ${t.name} — ${wp.tagline}`,
      ``,
      `💬 CÓMO COMUNICARTE CONMIGO:`,
      ...wp.howToCommunicate.map((x) => `  • ${x}`),
      ``,
      `✅ CÓMO DARME FEEDBACK:`,
      ...wp.feedbackTips.map((x) => `  • ${x}`),
      ``,
      `⚡ QUÉ ME MOTIVA: ${wp.motivators.join(', ')}`,
      `🔥 QUÉ ME FRUSTRA: ${wp.stressors.join(', ')}`,
      ``,
      `Generado con EneaTeams`,
    ].join('\n');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(buildShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto" style={{ backgroundColor: '#f8fafc' }}>
      <EmployeeTutorial forceRun={forceRunTutorial} onResetComplete={() => setForceRunTutorial(false)} />

      <div className="flex justify-end mb-2">
        <button
          onClick={() => setForceRunTutorial(true)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-600 transition-colors"
        >
          <HelpCircle size={14} /> Ver tutorial
        </button>
      </div>

      {/* ── Header con eneatipo ── */}
      <div
        id="tour-emp-profile-header"
        className="rounded-2xl p-6 md:p-8 mb-6 text-white shadow-xl"
        style={{ background: `linear-gradient(135deg, ${t.color} 0%, ${t.color}dd 100%)` }}
      >
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shrink-0">
            <span className="text-5xl font-bold">{typeId}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-bold mb-1">Tipo {typeId}: {t.name}</h1>
            <p className="text-base md:text-lg opacity-90">{wp?.tagline || t.description}</p>
          </div>
        </div>
      </div>

      {/* ── Coaching del día (FASE C) ── */}
      {dailyTip && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
          <div className="p-2.5 bg-amber-400 rounded-xl text-white shrink-0">
            <Sun size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Tu consejo de hoy</p>
            <p className="text-slate-800 font-medium">{dailyTip}</p>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 w-full sm:w-fit">
        <button
          onClick={() => setTab('identity')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'identity' ? 'bg-[#E07A5F] text-white shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <UserCircle size={18} /> Quién soy
        </button>
        <button
          onClick={() => setTab('manual')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === 'manual' ? 'bg-[#E07A5F] text-white shadow' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BookOpen size={18} /> Cómo trabajar conmigo
        </button>
      </div>

      {/* ═══════════════ TAB: QUIÉN SOY ═══════════════ */}
      {tab === 'identity' && (
        <div className="space-y-6">
          {/* Motivación y Miedo */}
          <div id="tour-emp-profile-motivation" className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg"><Heart className="text-green-600" size={24} /></div>
                <h3 className="text-lg font-bold text-slate-900">Motivación Principal</h3>
              </div>
              <p className="text-slate-700">{t.motivation}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-red-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle className="text-red-600" size={24} /></div>
                <h3 className="text-lg font-bold text-slate-900">Miedo Básico</h3>
              </div>
              <p className="text-slate-700">{t.fear}</p>
            </div>
          </div>

          {/* Fortalezas */}
          <div id="tour-emp-profile-strengths" className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-blue-600" size={24} />
              <h3 className="text-xl font-bold text-slate-900">Tus Fortalezas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {t.strengths.map((s, i) => (
                <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">✓ {s}</span>
              ))}
            </div>
          </div>

          {/* En qué brillás */}
          {wp && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="text-purple-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Dónde Brillás</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Tareas y roles donde tu tipo destaca naturalmente</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {wp.shinesAt.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg text-sm text-purple-800">
                    <Sparkles size={14} className="text-purple-500 shrink-0" /> {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Áreas de desarrollo */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Target className="text-amber-600" size={24} />
              <h3 className="text-xl font-bold text-slate-900">Áreas de Desarrollo</h3>
            </div>
            <ul className="space-y-2">
              {t.growthAreas.map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-amber-500 mt-1">🌱</span>
                  <span className="text-slate-700">{a}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Auto-cuidado */}
          {wp && (
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="text-teal-600" size={22} />
                <h3 className="text-lg font-bold text-slate-900">Tu Auto-cuidado</h3>
              </div>
              <p className="text-slate-700 italic">{wp.selfCareTip}</p>
            </div>
          )}

          {/* Biblioteca de ejercicios según eneatipo */}
          {RESOURCES[typeId] && (
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center gap-3 mb-1">
                <Dumbbell className="text-purple-600" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Ejercicios para crecer</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Prácticas concretas pensadas para tu tipo</p>
              <div className="grid sm:grid-cols-3 gap-3">
                {RESOURCES[typeId].map((r, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-2xl mb-2">{r.icon}</div>
                    <p className="font-semibold text-slate-900 text-sm mb-1">{r.title}</p>
                    <p className="text-xs text-slate-600">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compatibilidad */}
          <div id="tour-emp-profile-compatibility" className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-purple-600" size={24} />
              <h3 className="text-xl font-bold text-slate-900">Trabajás Mejor Con</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {t.compatibleWith.map((cid) => {
                const ct = ENNEAGRAM_TYPES[cid];
                return (
                  <div key={cid} className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: ct.color }}>{cid}</div>
                    <div>
                      <p className="font-medium text-slate-900">Tipo {cid}</p>
                      <p className="text-xs text-slate-500">{ct.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ TAB: CÓMO TRABAJAR CONMIGO (Manual de Usuario) ═══════════════ */}
      {tab === 'manual' && wp && (
        <div className="space-y-6">
          {/* Intro + compartir */}
          <div className="bg-gradient-to-br from-[#FCF1EC] to-[#EEF3EE] border border-indigo-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">📋 Tu Manual de Usuario</h3>
              <p className="text-sm text-slate-600">Compartilo con tu equipo para que sepan cómo trabajar mejor con vos.</p>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shrink-0"
            >
              {copied ? <><Check size={16} /> ¡Copiado!</> : <><Share2 size={16} /> Compartir mi manual</>}
            </button>
          </div>

          {/* Cómo me comunico */}
          <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-blue-500">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="text-blue-600" size={24} />
              <h3 className="text-lg font-bold text-slate-900">Mi estilo de comunicación</h3>
            </div>
            <p className="text-slate-700">{wp.communicationStyle}</p>
          </div>

          {/* Cómo comunicarse conmigo */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="text-indigo-600" size={24} />
              <h3 className="text-lg font-bold text-slate-900">Cómo comunicarte conmigo</h3>
            </div>
            <ul className="space-y-2.5">
              {wp.howToCommunicate.map((x, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700">
                  <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                  {x}
                </li>
              ))}
            </ul>
          </div>

          {/* Cómo darme feedback */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquareReply className="text-green-600" size={24} />
              <h3 className="text-lg font-bold text-slate-900">Cómo darme feedback</h3>
            </div>
            <ul className="space-y-2.5">
              {wp.feedbackTips.map((x, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700">
                  <Check size={18} className="text-green-500 shrink-0 mt-0.5" /> {x}
                </li>
              ))}
            </ul>
          </div>

          {/* Deseos y Dolores */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-emerald-500">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-emerald-600" size={24} />
                <h3 className="text-lg font-bold text-slate-900">Qué me motiva</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {wp.motivators.map((m, i) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm border border-emerald-200">{m}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-rose-500">
              <div className="flex items-center gap-3 mb-4">
                <Flame className="text-rose-600" size={24} />
                <h3 className="text-lg font-bold text-slate-900">Qué me frustra</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {wp.stressors.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-full text-sm border border-rose-200">{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Bajo estrés */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-amber-600" size={24} />
              <h3 className="text-lg font-bold text-slate-900">Cuando estoy bajo estrés</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-amber-50 rounded-lg p-4">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Señales</p>
                <p className="text-sm text-slate-700">{wp.underStress.signs}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Qué ayuda</p>
                <p className="text-sm text-slate-700">{wp.underStress.whatHelps}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mi Información (siempre visible al fondo) ── */}
      <div className="bg-white rounded-xl p-6 shadow-md mt-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Mi Información</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Nombre:</span>
            <span className="font-medium text-slate-900">{user?.name || 'Usuario'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500">Email:</span>
            <span className="font-medium text-slate-900">{user?.email || '-'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-slate-500">Eneatipo:</span>
            <span className="font-medium text-slate-900">Tipo {typeId} — {t.name}</span>
          </div>
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Consejo:</strong> Compartí tu Manual de Usuario con {firstName === 'vos' ? 'tu equipo' : 'tus compañeros'} para mejorar la comunicación del equipo.
          </p>
        </div>
      </div>
    </div>
  );
};
