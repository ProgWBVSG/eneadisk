import React, { useState, useEffect, useCallback } from 'react';
import { Users, Mail, CheckCircle, Copy, HelpCircle, Bell, UserCheck, UserX, Activity, Zap, Flame, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { AdminTutorial } from '../../components/tutorial/AdminTutorial';
import { supabase } from '../../lib/supabase';
import { getTeamMood, type TeamMood } from '../../utils/employeeFeatures';
import { getEmployeesOverview } from '../../utils/adminFeatures';

interface JoinRequest {
    id: string;
    user_id: string;
    created_at: string;
    profiles: {
        full_name: string | null;
        email: string;
    } | null;
}

export const CompanyPanel: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [employeeCount, setEmployeeCount] = useState(0);
    const [completedTests, setCompletedTests] = useState(0);
    const [copied, setCopied] = useState(false);
    const [runTutorial, setRunTutorial] = useState(false);
    const [inviteCode, setInviteCode] = useState<string>('');
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [mood, setMood] = useState<TeamMood | null>(null);
    const [atRisk, setAtRisk] = useState(0);
    const [pendingTest, setPendingTest] = useState(0);

    // ── Fetch invite code + employee count from Supabase ──────────────────
    const fetchCompanyData = useCallback(async () => {
        if (!user?.companyId) return;

        const { data } = await supabase
            .from('companies')
            .select('invite_code')
            .eq('id', user.companyId)
            .single();

        if (data?.invite_code) setInviteCode(data.invite_code);

        // Contar empleados
        const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', user.companyId)
            .eq('role', 'employee');
        setEmployeeCount(count ?? 0);

        // Contar tests completados
        const { count: doneCount } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', user.companyId)
            .eq('role', 'employee')
            .eq('questionnaire_completed', true);
        setCompletedTests(doneCount ?? 0);
    }, [user?.companyId]);

    // ── Fetch pending join requests ────────────────────────────────────────
    const fetchJoinRequests = useCallback(async () => {
        if (!user?.companyId) return;

        const { data, error } = await supabase
            .from('join_requests')
            .select('id, user_id, created_at, profiles(full_name, email)')
            .eq('company_id', user.companyId)
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (!error && data) {
            setJoinRequests(data as unknown as JoinRequest[]);
        }
    }, [user?.companyId]);

    // ── Pulso del equipo: termómetro + alertas ────────────────────────────
    const fetchPulse = useCallback(async () => {
        if (!user?.companyId) return;
        const [tm, overview] = await Promise.all([getTeamMood(), getEmployeesOverview()]);
        setMood(tm);
        setAtRisk(overview.filter((e) => e.risk === 'high').length);
        setPendingTest(overview.filter((e) => !e.questionnaireCompleted).length);
    }, [user?.companyId]);

    useEffect(() => {
        fetchCompanyData();
        fetchJoinRequests();
        fetchPulse();
    }, [fetchCompanyData, fetchJoinRequests, fetchPulse]);

    // ── Approve a request ─────────────────────────────────────────────────
    const handleApprove = async (req: JoinRequest) => {
        setProcessingId(req.id);

        // 1. Update request status
        await supabase
            .from('join_requests')
            .update({ status: 'approved' })
            .eq('id', req.id);

        // 2. Assign the user to this company
        await supabase
            .from('profiles')
            .update({ company_id: user!.companyId, role: 'employee' })
            .eq('id', req.user_id);

        setProcessingId(null);
        fetchJoinRequests();
        fetchCompanyData();
    };

    // ── Reject a request ──────────────────────────────────────────────────
    const handleReject = async (reqId: string) => {
        setProcessingId(reqId);

        await supabase
            .from('join_requests')
            .update({ status: 'rejected' })
            .eq('id', reqId);

        setProcessingId(null);
        fetchJoinRequests();
    };

    // ── Recomendaciones proactivas (derivadas de los datos) ───────────────
    const recommendations: { icon: string; text: string; action?: string; path?: string }[] = [];
    if (atRisk > 0) recommendations.push({ icon: '🚨', text: `Hay ${atRisk} ${atRisk === 1 ? 'persona' : 'personas'} con señales de estrés alto. Agendá un 1-on-1 esta semana.`, action: 'Ver personas', path: '/dashboard/company/personas' });
    if (pendingTest > 0) recommendations.push({ icon: '📋', text: `${pendingTest} ${pendingTest === 1 ? 'persona' : 'personas'} sin completar el test. Recordáselos para personalizar su experiencia.`, action: 'Ver personas', path: '/dashboard/company/personas' });
    if (mood && mood.avgStress >= 3.5) recommendations.push({ icon: '🧘', text: 'El estrés promedio del equipo está elevado. Considerá aliviar la carga o proponer una pausa.' });
    if (mood && mood.avgEnergy >= 4 && mood.avgStress < 3) recommendations.push({ icon: '🚀', text: '¡Tu equipo está con buena energía! Buen momento para encarar proyectos ambiciosos.' });
    if (employeeCount > 0 && recommendations.length === 0) recommendations.push({ icon: '💛', text: 'Tu equipo está estable. Reconocé el buen trabajo para mantener la motivación alta.', action: 'Dar reconocimiento', path: '/dashboard/company/reconocimientos' });

    // ── Generate & copy invite link ───────────────────────────────────────
    const handleInvite = () => {
        if (!inviteCode) return;
        const link = `${window.location.origin}/join?code=${inviteCode}`;
        navigator.clipboard.writeText(link).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <AdminTutorial forceRun={runTutorial} onResetComplete={() => setRunTutorial(false)} />

            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-[#E07A5F] to-[#C9624A] rounded-2xl p-8 text-white mb-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">Panel de Administración</h1>
                    <p className="text-lg opacity-90">Gestiona tu equipo, visualiza métricas y toma decisiones informadas basadas en el Eneagrama</p>
                </div>
                <button
                    onClick={() => setRunTutorial(true)}
                    className="flex items-center gap-2 whitespace-nowrap bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/30"
                >
                    <HelpCircle size={18} />
                    Repetir Tutorial
                </button>
            </div>

            {/* ── Pending Join Requests ── */}
            {joinRequests.length > 0 && (
                <div className="mb-8 bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                            <Bell size={22} className="text-amber-600" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                {joinRequests.length}
                            </span>
                        </div>
                        <h2 className="text-lg font-semibold text-amber-900">
                            Solicitudes de Acceso Pendientes
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {joinRequests.map((req) => {
                            const name = req.profiles?.full_name || 'Sin nombre';
                            const email = req.profiles?.email || '';
                            const isProcessing = processingId === req.id;

                            return (
                                <div
                                    key={req.id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-lg p-4 border border-amber-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{name}</p>
                                            <p className="text-xs text-slate-500">{email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button
                                            size="sm"
                                            className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 gap-1"
                                            isLoading={isProcessing}
                                            onClick={() => handleApprove(req)}
                                        >
                                            <UserCheck size={15} /> Aprobar
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50 gap-1"
                                            isLoading={isProcessing}
                                            onClick={() => handleReject(req.id)}
                                        >
                                            <UserX size={15} /> Rechazar
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Stats */}
            <div id="tour-stats" className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-500 text-sm font-medium">Total Empleados</h3>
                        <Users className="text-blue-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{employeeCount}</p>
                    <p className="text-xs text-slate-500 mt-1">
                        {employeeCount === 0 ? 'Invita a tu equipo para comenzar' : `${employeeCount} miembro${employeeCount !== 1 ? 's' : ''} activo${employeeCount !== 1 ? 's' : ''}`}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-500 text-sm font-medium">Tests Completados</h3>
                        <CheckCircle className="text-green-600" size={24} />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{completedTests}</p>
                    <p className="text-xs text-slate-500 mt-1">
                        {employeeCount > 0
                            ? `${Math.round((completedTests / employeeCount) * 100)}% del equipo perfilado`
                            : 'Invita empleados para comenzar'}
                    </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-500 text-sm font-medium">Código de Invitación</h3>
                        <Mail className="text-purple-600" size={24} />
                    </div>
                    <p className="text-xl font-bold text-purple-600 font-mono tracking-wider">
                        {inviteCode || '—'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Comparte con tu equipo</p>
                </div>
            </div>

            {/* Pulso del equipo: termómetro + alertas */}
            {(mood?.checkinCount || atRisk > 0 || pendingTest > 0) && (
                <div className="bg-white rounded-2xl p-6 shadow-md mb-8 border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="text-indigo-600" size={22} />
                        <h2 className="text-xl font-bold text-slate-900">Pulso del equipo</h2>
                        <button onClick={() => navigate('/dashboard/company/personas')} className="ml-auto text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1">
                            Ver personas <ArrowRight size={14} />
                        </button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {mood && mood.checkinCount > 0 && (
                            <>
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-1"><Zap size={16} className="text-blue-600" /><span className="text-xs font-medium text-blue-700">Energía</span></div>
                                    <p className="text-2xl font-bold text-blue-900">{mood.avgEnergy.toFixed(1)}<span className="text-sm text-blue-500"> /5</span></p>
                                </div>
                                <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                                    <div className="flex items-center gap-2 mb-1"><Flame size={16} className="text-rose-600" /><span className="text-xs font-medium text-rose-700">Estrés</span></div>
                                    <p className="text-2xl font-bold text-rose-900">{mood.avgStress.toFixed(1)}<span className="text-sm text-rose-500"> /5</span></p>
                                </div>
                            </>
                        )}
                        <button onClick={() => navigate('/dashboard/company/personas')} className={`rounded-xl p-4 border text-left transition-all hover:shadow-sm ${atRisk > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-2 mb-1"><AlertTriangle size={16} className={atRisk > 0 ? 'text-red-600' : 'text-slate-400'} /><span className={`text-xs font-medium ${atRisk > 0 ? 'text-red-700' : 'text-slate-500'}`}>En riesgo</span></div>
                            <p className={`text-2xl font-bold ${atRisk > 0 ? 'text-red-900' : 'text-slate-700'}`}>{atRisk}</p>
                        </button>
                        <button onClick={() => navigate('/dashboard/company/personas')} className={`rounded-xl p-4 border text-left transition-all hover:shadow-sm ${pendingTest > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-2 mb-1"><Clock size={16} className={pendingTest > 0 ? 'text-amber-600' : 'text-slate-400'} /><span className={`text-xs font-medium ${pendingTest > 0 ? 'text-amber-700' : 'text-slate-500'}`}>Test pendiente</span></div>
                            <p className={`text-2xl font-bold ${pendingTest > 0 ? 'text-amber-900' : 'text-slate-700'}`}>{pendingTest}</p>
                        </button>
                    </div>
                    {mood && mood.checkinCount === 0 && (
                        <p className="text-xs text-slate-400 mt-3">Cuando tu equipo registre check-ins, vas a ver acá el pulso de energía y estrés.</p>
                    )}
                </div>
            )}

            {/* Recomendaciones proactivas */}
            {recommendations.length > 0 && (
                <div className="bg-gradient-to-br from-[#FCF1EC] to-[#EEF3EE] rounded-2xl p-6 mb-8 border border-purple-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="text-purple-600" size={20} />
                        <h2 className="text-lg font-bold text-slate-900">Recomendaciones para vos</h2>
                    </div>
                    <div className="space-y-3">
                        {recommendations.map((rec, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 border border-purple-100 flex items-center gap-3">
                                <span className="text-xl shrink-0">{rec.icon}</span>
                                <p className="text-sm text-slate-700 flex-1">{rec.text}</p>
                                {rec.action && rec.path && (
                                    <button onClick={() => navigate(rec.path!)} className="text-sm text-purple-600 hover:text-purple-800 font-medium whitespace-nowrap flex items-center gap-1 shrink-0">
                                        {rec.action} <ArrowRight size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Invita a tu Equipo</h3>
                    <p className="text-slate-500 text-sm mb-1 font-mono bg-slate-50 rounded px-2 py-1 break-all">
                        {inviteCode ? `${window.location.origin}/join?code=${inviteCode}` : 'Cargando...'}
                    </p>
                    <p className="text-slate-600 text-sm mb-4">Copia el link y compártelo directamente con los integrantes de tu empresa.</p>
                    <Button
                        id="tour-invite-btn"
                        onClick={handleInvite}
                        disabled={!inviteCode}
                        className="w-full bg-blue-600 hover:bg-[#C9624A]"
                    >
                        {copied ? (
                            <><CheckCircle className="mr-2 h-4 w-4" /> ¡Link Copiado!</>
                        ) : (
                            <><Copy className="mr-2 h-4 w-4" /> Copiar Link de Invitación</>
                        )}
                    </Button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Explora la Biblioteca</h3>
                    <p className="text-slate-600 mb-4">Aprende sobre los 9 eneatipos y cómo aplicarlos en tu organización.</p>
                    <Button
                        id="tour-library-btn"
                        onClick={() => navigate('/dashboard/company/biblioteca')}
                        variant="outline"
                        className="w-full"
                    >
                        Ver Biblioteca de Eneatipos
                    </Button>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-gradient-to-br from-[#FCF1EC] to-[#EEF3EE] rounded-xl p-8 border border-purple-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">¿Cómo funciona ENEATEAMS?</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <div className="w-12 h-12 bg-[#E07A5F] rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">1</div>
                        <h4 className="font-bold text-slate-900 mb-2">Invita a tu Equipo</h4>
                        <p className="text-sm text-slate-600">Comparte el link de invitación con los miembros de tu organización.</p>
                    </div>
                    <div>
                        <div className="w-12 h-12 bg-[#E07A5F] rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">2</div>
                        <h4 className="font-bold text-slate-900 mb-2">Test de Eneagrama</h4>
                        <p className="text-sm text-slate-600">Cada miembro completa un cuestionario rápido para descubrir su eneatipo.</p>
                    </div>
                    <div>
                        <div className="w-12 h-12 bg-[#E07A5F] rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">3</div>
                        <h4 className="font-bold text-slate-900 mb-2">Insights y Reportes</h4>
                        <p className="text-sm text-slate-600">Accede a análisis detallados sobre la dinámica de tu equipo.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
