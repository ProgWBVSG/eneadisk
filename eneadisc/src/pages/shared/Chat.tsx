import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MessageSquare, Send, Plus, Search, ArrowLeft, ClipboardList, X,
  CheckCircle2, AlertTriangle, Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getDirectory, getConversations, openDirect, getMessages, sendText, sendTask,
  reviewTaskInChat, markRead, subscribeToConversation, subscribeToPresence,
  getChatTeams, openTeamConversation,
  type DirectoryPerson, type Conversation, type ChatMessage, type ChatTeam,
} from '../../utils/chat';

const ROLE_LABEL: Record<string, string> = {
  company_admin: 'Admin',
  supervisor: 'Supervisor',
  employee: 'Colaborador',
  group: 'Canal de equipo',
};

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'U';

const fmtTime = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  return sameDay
    ? d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('es', { day: '2-digit', month: '2-digit' });
};

const previewText = (c: Conversation) => {
  if (!c.lastBody && c.lastKind === 'task') return '📋 Tarea asignada';
  if (c.lastKind === 'task') return `📋 ${c.lastBody}`;
  if (c.lastKind === 'task_review') return '✔️ Corrección de tarea';
  return c.lastBody || 'Sin mensajes todavía';
};

// ════════════════════════════════════════════════════════════
export const Chat: React.FC = () => {
  const { user } = useAuth();
  const myId = user?.id || '';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeOther, setActiveOther] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [showDirectory, setShowDirectory] = useState(false);
  const [online, setOnline] = useState<Set<string>>(new Set());

  // Presencia "en línea" (scopeada por empresa)
  useEffect(() => {
    if (!user?.companyId || !myId) return;
    const unsub = subscribeToPresence(user.companyId, myId, setOnline);
    return unsub;
  }, [user?.companyId, myId]);

  const loadConversations = useCallback(async () => {
    try {
      const list = await getConversations();
      setConversations(list);
    } catch (e) {
      console.error('[Chat] conversaciones:', e);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Abrir una conversación
  const openConversation = useCallback(async (conv: Conversation) => {
    setActiveId(conv.conversationId);
    setActiveOther(conv);
    setShowDirectory(false);
    const msgs = await getMessages(conv.conversationId);
    setMessages(msgs);
    await markRead(conv.conversationId);
    setConversations((prev) =>
      prev.map((c) => (c.conversationId === conv.conversationId ? { ...c, unread: 0 } : c))
    );
  }, []);

  // Realtime: mensajes nuevos en la conversación abierta
  useEffect(() => {
    if (!activeId) return;
    const unsub = subscribeToConversation(activeId, (m) => {
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      // si el mensaje es del otro, marcar leído y refrescar preview
      if (m.senderId !== myId) markRead(activeId);
      loadConversations();
    });
    return unsub;
  }, [activeId, myId, loadConversations]);

  // Iniciar chat desde el directorio
  const startChatWith = useCallback(async (person: DirectoryPerson) => {
    try {
      const convId = await openDirect(person.id);
      const existing = conversations.find((c) => c.conversationId === convId);
      const conv: Conversation = existing || {
        conversationId: convId, otherId: person.id, otherName: person.fullName,
        otherRole: person.role, otherEnneagram: person.enneagramType,
        lastBody: null, lastKind: null, lastAt: null, unread: 0, isGroup: false,
      };
      if (!existing) setConversations((prev) => [conv, ...prev]);
      await openConversation(conv);
    } catch (e) {
      console.error('[Chat] abrir DM:', e);
    }
  }, [conversations, openConversation]);

  // Iniciar / abrir el canal de un equipo
  const startTeamChat = useCallback(async (team: ChatTeam) => {
    try {
      const convId = await openTeamConversation(team.teamId);
      const existing = conversations.find((c) => c.conversationId === convId);
      const conv: Conversation = existing || {
        conversationId: convId, otherId: '', otherName: team.name,
        otherRole: 'group', otherEnneagram: null,
        lastBody: null, lastKind: null, lastAt: null, unread: 0, isGroup: true,
      };
      if (!existing) setConversations((prev) => [conv, ...prev]);
      await openConversation(conv);
    } catch (e) {
      console.error('[Chat] abrir canal de equipo:', e);
    }
  }, [conversations, openConversation]);

  const handleLocalSend = (m: ChatMessage) => {
    setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    loadConversations();
  };

  const afterTaskAction = async () => {
    if (!activeId) return;
    const msgs = await getMessages(activeId);
    setMessages(msgs);
    loadConversations();
  };

  return (
    <div className="h-full flex bg-[#FAF6F1]">
      {/* ── Lista de conversaciones ── */}
      <aside
        className={`${activeId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-[#ECE3D8] bg-white shrink-0`}
      >
        <div className="p-4 border-b border-[#ECE3D8] flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-[#3A332E] flex items-center gap-2">
            <MessageSquare className="text-[#C9624A]" size={22} /> Mensajes
          </h1>
          <button
            onClick={() => setShowDirectory(true)}
            className="flex items-center gap-1 text-sm font-medium text-white bg-[#E07A5F] hover:bg-[#C9624A] px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Nuevo
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="p-8 flex justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#E07A5F] border-t-transparent" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#8A8079]">
              <MessageSquare className="mx-auto mb-3 text-[#ECE3D8]" size={40} />
              Todavía no tenés conversaciones.<br />Tocá <strong>Nuevo</strong> para escribirle a un compañero.
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.conversationId}
                onClick={() => openConversation(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-[#F2EAE0] transition-colors ${
                  activeId === c.conversationId ? 'bg-[#FCF1EC]' : 'hover:bg-[#FAF6F1]'
                }`}
              >
                <Avatar name={c.otherName} isGroup={c.isGroup} online={c.isGroup ? undefined : online.has(c.otherId)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-[#3A332E] truncate">{c.otherName}</span>
                    <span className="text-[11px] text-[#8A8079] shrink-0">{fmtTime(c.lastAt)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-[#8A8079] truncate">{previewText(c)}</span>
                    {c.unread > 0 && (
                      <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-[#E07A5F] text-white text-[11px] font-bold flex items-center justify-center">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Hilo de conversación ── */}
      <section className={`${activeId ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
        {activeId && activeOther ? (
          <ChatThread
            key={activeId}
            myId={myId}
            conversation={activeOther}
            online={online.has(activeOther.otherId)}
            messages={messages}
            onBack={() => { setActiveId(null); setActiveOther(null); }}
            onLocalSend={handleLocalSend}
            onTaskAction={afterTaskAction}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-[#8A8079] p-8">
            <div className="h-20 w-20 rounded-full bg-[#FCF1EC] flex items-center justify-center mb-4">
              <MessageSquare className="text-[#E07A5F]" size={36} />
            </div>
            <h2 className="text-lg font-display font-semibold text-[#3A332E] mb-1">Tu chat de equipo</h2>
            <p className="max-w-xs text-sm">
              Hablá con tus compañeros, enviales tareas y corregí su trabajo, todo en un solo lugar.
            </p>
          </div>
        )}
      </section>

      {/* ── Modal de directorio (nuevo chat) ── */}
      {showDirectory && (
        <DirectoryModal online={online} onClose={() => setShowDirectory(false)} onPick={startChatWith} onPickTeam={startTeamChat} />
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
const Avatar: React.FC<{ name: string; size?: number; online?: boolean; isGroup?: boolean }> = ({ name, size = 44, online, isGroup }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <div
      className={`rounded-full font-bold flex items-center justify-center w-full h-full ${isGroup ? 'bg-[#EEF3EE] text-[#5F7A68]' : 'bg-[#FCF1EC] text-[#C9624A]'}`}
      style={{ fontSize: size * 0.36 }}
    >
      {isGroup ? <Users size={size * 0.5} /> : initials(name)}
    </div>
    {online !== undefined && (
      <span
        title={online ? 'En línea' : 'Desconectado'}
        className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white ${online ? 'bg-[#5FBF77]' : 'bg-slate-300'}`}
        style={{ width: size * 0.28, height: size * 0.28 }}
      />
    )}
  </div>
);

// ════════════════════════════════════════════════════════════
const ChatThread: React.FC<{
  myId: string;
  conversation: Conversation;
  online: boolean;
  messages: ChatMessage[];
  onBack: () => void;
  onLocalSend: (m: ChatMessage) => void;
  onTaskAction: () => void;
}> = ({ myId, conversation, online, messages, onBack, onLocalSend, onTaskAction }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText('');
    try {
      const msg = await sendText(conversation.conversationId, body, myId);
      onLocalSend(msg);
    } catch (e) {
      console.error('[Chat] enviar:', e);
      setText(body); // restaurar si falló
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ECE3D8] bg-white shrink-0">
        <button onClick={onBack} className="md:hidden text-[#8A8079] hover:text-[#3A332E]">
          <ArrowLeft size={22} />
        </button>
        <Avatar name={conversation.otherName} size={40} isGroup={conversation.isGroup} online={conversation.isGroup ? undefined : online} />
        <div className="min-w-0">
          <p className="font-medium text-[#3A332E] truncate">{conversation.otherName}</p>
          <p className="text-xs text-[#8A8079]">
            {conversation.isGroup
              ? 'Canal de equipo'
              : online ? <span className="text-[#5FBF77] font-medium">● En línea</span> : ROLE_LABEL[conversation.otherRole] || 'Colaborador'}
          </p>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-[#8A8079] mt-8">
            Escribí el primer mensaje 👋
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            mine={m.senderId === myId}
            conversationId={conversation.conversationId}
            onReviewed={onTaskAction}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-[#ECE3D8] bg-white p-3 shrink-0">
        <div className="flex items-end gap-2">
          {!conversation.isGroup && (
            <button
              onClick={() => setShowTaskForm(true)}
              title="Enviar una tarea"
              className="shrink-0 h-11 w-11 flex items-center justify-center rounded-xl border border-[#ECE3D8] text-[#C9624A] hover:bg-[#FCF1EC] transition-colors"
            >
              <ClipboardList size={20} />
            </button>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            rows={1}
            placeholder="Escribí un mensaje..."
            className="flex-1 resize-none max-h-32 rounded-xl border border-[#ECE3D8] px-4 py-2.5 text-[#3A332E] focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/40 focus:border-[#E07A5F]"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="shrink-0 h-11 w-11 flex items-center justify-center rounded-xl bg-[#E07A5F] text-white hover:bg-[#C9624A] disabled:opacity-40 transition-colors active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {showTaskForm && (
        <TaskFormModal
          recipientName={conversation.otherName}
          onClose={() => setShowTaskForm(false)}
          onSubmit={async (title, desc, priority, due) => {
            await sendTask(conversation.conversationId, conversation.otherId, title, desc, priority, due);
            setShowTaskForm(false);
            onTaskAction();
          }}
        />
      )}
    </>
  );
};

// ════════════════════════════════════════════════════════════
const PRIORITY_BADGE: Record<string, { label: string; cls: string }> = {
  low: { label: 'Baja', cls: 'bg-blue-50 text-blue-700' },
  medium: { label: 'Media', cls: 'bg-amber-50 text-amber-700' },
  high: { label: 'Alta', cls: 'bg-red-50 text-red-700' },
};

const MessageBubble: React.FC<{
  message: ChatMessage;
  mine: boolean;
  conversationId: string;
  onReviewed: () => void;
}> = ({ message, mine, conversationId, onReviewed }) => {
  const [reviewing, setReviewing] = useState<null | 'confirmed' | 'needs_fix'>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  // ── Tarea ──
  if (message.kind === 'task') {
    const meta = message.meta || {};
    const pr = PRIORITY_BADGE[meta.priority || 'medium'] || PRIORITY_BADGE.medium;
    const submitReview = async (status: 'confirmed' | 'needs_fix') => {
      if (!message.taskId) return;
      setBusy(true);
      try {
        await reviewTaskInChat(conversationId, message.taskId, status, note);
        setReviewing(null); setNote('');
        onReviewed();
      } catch (e) { console.error('[Chat] revisar:', e); }
      finally { setBusy(false); }
    };
    return (
      <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-[85%] sm:max-w-md w-full rounded-2xl border border-[#E89B82]/40 bg-white shadow-sm overflow-hidden">
          <div className="bg-[#FCF1EC] px-4 py-2 flex items-center gap-2 border-b border-[#F2D9CE]">
            <ClipboardList size={16} className="text-[#C9624A]" />
            <span className="text-xs font-semibold text-[#C9624A] uppercase tracking-wide">
              {mine ? 'Tarea que enviaste' : 'Nueva tarea para vos'}
            </span>
            <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full ${pr.cls}`}>{pr.label}</span>
          </div>
          <div className="px-4 py-3">
            <p className="font-medium text-[#3A332E]">{meta.title || message.body}</p>
            {meta.description && <p className="text-sm text-[#8A8079] mt-1">{meta.description}</p>}
            {meta.due && <p className="text-xs text-[#8A8079] mt-2">📅 Vence: {new Date(meta.due).toLocaleDateString('es')}</p>}

            {/* Controles de corrección (solo quien la envió) */}
            {mine && (
              <div className="mt-3 pt-3 border-t border-[#F2EAE0]">
                {reviewing ? (
                  <div className="space-y-2">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={2}
                      placeholder={reviewing === 'confirmed' ? 'Nota (opcional)...' : '¿Qué hay que corregir?'}
                      className="w-full resize-none rounded-lg border border-[#ECE3D8] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/40"
                    />
                    <div className="flex gap-2">
                      <button disabled={busy} onClick={() => submitReview(reviewing)}
                        className="flex-1 text-sm font-medium text-white bg-[#7C9885] hover:bg-[#5F7A68] rounded-lg py-1.5 disabled:opacity-50">
                        Enviar
                      </button>
                      <button onClick={() => { setReviewing(null); setNote(''); }}
                        className="px-3 text-sm text-[#8A8079] hover:text-[#3A332E]">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setReviewing('confirmed')}
                      className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-[#5F7A68] bg-[#EEF3EE] hover:bg-[#D7E3D8] rounded-lg py-1.5">
                      <CheckCircle2 size={15} /> Confirmar
                    </button>
                    <button onClick={() => setReviewing('needs_fix')}
                      className="flex-1 flex items-center justify-center gap-1 text-sm font-medium text-[#A84C37] bg-[#FCF1EC] hover:bg-[#F8DDD2] rounded-lg py-1.5">
                      <AlertTriangle size={15} /> Marcar error
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Corrección de tarea ──
  if (message.kind === 'task_review') {
    const ok = message.meta?.status === 'confirmed';
    return (
      <div className="flex justify-center">
        <div className={`max-w-[90%] rounded-xl px-4 py-2.5 text-sm border ${
          ok ? 'bg-[#EEF3EE] border-[#D7E3D8] text-[#465C4E]' : 'bg-[#FCF1EC] border-[#F8DDD2] text-[#A84C37]'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            {ok ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            {ok ? 'Tarea confirmada' : 'Tarea para corregir'}
            {message.meta?.title && <span className="font-normal opacity-80">· {message.meta.title}</span>}
          </div>
          {message.body && <p className="mt-1 opacity-90">{message.body}</p>}
        </div>
      </div>
    );
  }

  // ── Texto ──
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
        mine ? 'bg-[#E07A5F] text-white rounded-br-sm' : 'bg-white text-[#3A332E] border border-[#ECE3D8] rounded-bl-sm'
      }`}>
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p className={`text-[10px] mt-1 text-right ${mine ? 'text-white/70' : 'text-[#8A8079]'}`}>
          {fmtTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
const TaskFormModal: React.FC<{
  recipientName: string;
  onClose: () => void;
  onSubmit: (title: string, desc: string, priority: 'low' | 'medium' | 'high', due?: string) => Promise<void>;
}> = ({ recipientName, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!title.trim()) { setErr('Poné un título a la tarea'); return; }
    setBusy(true); setErr('');
    try {
      await onSubmit(title.trim(), desc.trim(), priority, due || undefined);
    } catch (e: any) {
      setErr(e?.message || 'No se pudo enviar la tarea');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-5 border-b border-[#ECE3D8]">
          <h3 className="text-lg font-display font-bold text-[#3A332E] flex items-center gap-2">
            <ClipboardList className="text-[#C9624A]" size={20} /> Enviar tarea
          </h3>
          <button onClick={onClose} className="text-[#8A8079] hover:text-[#3A332E]"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-[#8A8079]">Para <strong className="text-[#3A332E]">{recipientName}</strong></p>
          <div>
            <label className="block text-sm font-medium text-[#3A332E] mb-1">Título *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
              placeholder="Ej: Revisar informe de ventas"
              className="w-full rounded-lg border border-[#ECE3D8] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/40" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#3A332E] mb-1">Detalle (opcional)</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} maxLength={500}
              placeholder="Aclaraciones, contexto, enlaces..."
              className="w-full resize-none rounded-lg border border-[#ECE3D8] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#3A332E] mb-1">Prioridad</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-lg border border-[#ECE3D8] px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/40">
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#3A332E] mb-1">Vence (opcional)</label>
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)}
                className="w-full rounded-lg border border-[#ECE3D8] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E07A5F]/40" />
            </div>
          </div>
          {err && <p className="text-sm text-red-500">{err}</p>}
        </div>
        <div className="flex gap-3 p-5 border-t border-[#ECE3D8]">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#ECE3D8] text-[#3A332E] hover:bg-[#FAF6F1]">
            Cancelar
          </button>
          <button onClick={submit} disabled={busy}
            className="flex-1 py-2.5 rounded-xl bg-[#E07A5F] text-white font-medium hover:bg-[#C9624A] disabled:opacity-50">
            {busy ? 'Enviando...' : 'Enviar tarea'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
const DirectoryModal: React.FC<{
  online: Set<string>;
  onClose: () => void;
  onPick: (p: DirectoryPerson) => void;
  onPickTeam: (t: ChatTeam) => void;
}> = ({ online, onClose, onPick, onPickTeam }) => {
  const [people, setPeople] = useState<DirectoryPerson[]>([]);
  const [teams, setTeams] = useState<ChatTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    Promise.all([getDirectory(), getChatTeams().catch(() => [])])
      .then(([p, t]) => { setPeople(p); setTeams(t); setLoading(false); })
      .catch((e) => { console.error('[Chat] directorio:', e); setLoading(false); });
  }, []);

  const filtered = people.filter((p) => p.fullName.toLowerCase().includes(q.toLowerCase()));
  const filteredTeams = teams.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#ECE3D8]">
          <h3 className="text-lg font-display font-bold text-[#3A332E]">Nuevo mensaje</h3>
          <button onClick={onClose} className="text-[#8A8079] hover:text-[#3A332E]"><X size={20} /></button>
        </div>
        <div className="p-4 border-b border-[#ECE3D8]">
          <div className="flex items-center gap-2 rounded-lg border border-[#ECE3D8] px-3">
            <Search size={16} className="text-[#8A8079]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus
              placeholder="Buscar compañero..."
              className="flex-1 py-2 focus:outline-none text-[#3A332E]" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#E07A5F] border-t-transparent" />
            </div>
          ) : (filtered.length === 0 && filteredTeams.length === 0) ? (
            <p className="p-8 text-center text-sm text-[#8A8079]">No hay compañeros ni equipos para mostrar.</p>
          ) : (
            <>
            {filteredTeams.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-[#8A8079] uppercase tracking-wide">Canales de equipo</p>
                {filteredTeams.map((t) => (
                  <button key={t.teamId} onClick={() => onPickTeam(t)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FAF6F1] border-b border-[#F2EAE0]">
                    <Avatar name={t.name} size={40} isGroup />
                    <div className="min-w-0">
                      <p className="font-medium text-[#3A332E] truncate">{t.name}</p>
                      <p className="text-xs text-[#8A8079]">{t.memberCount} miembro{t.memberCount !== 1 ? 's' : ''}</p>
                    </div>
                  </button>
                ))}
                {filtered.length > 0 && <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-[#8A8079] uppercase tracking-wide">Compañeros</p>}
              </>
            )}
            {filtered.map((p) => (
              <button key={p.id} onClick={() => onPick(p)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FAF6F1] border-b border-[#F2EAE0]">
                <Avatar name={p.fullName} size={40} online={online.has(p.id)} />
                <div className="min-w-0">
                  <p className="font-medium text-[#3A332E] truncate">{p.fullName}</p>
                  <p className="text-xs text-[#8A8079]">{ROLE_LABEL[p.role] || 'Colaborador'}</p>
                </div>
              </button>
            ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
