import React, { useState, useEffect, useCallback } from 'react';
import { Users, Mail, CheckCircle, Copy, HelpCircle, Bell, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { AdminTutorial } from '../../components/tutorial/AdminTutorial';
import { supabase } from '../../lib/supabase';

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
    const [copied, setCopied] = useState(false);
    const [runTutorial, setRunTutorial] = useState(false);
    const [inviteCode, setInviteCode] = useState<string>('');
    const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // ── Fetch invite code + employee count from Supabase ──────────────────
    const fetchCompanyData = useCallback(async () => {
        if (!user?.companyId) return;

        const { data } = await supabase
            .from('companies')
            .select('invite_code')
            .eq('id', user.companyId)
            .single();

        if (data?.invite_code) setInviteCode(data.invite_code);

        // Count employees (profiles belonging to this company, excluding admin)
        const { count } = await supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', user.companyId)
            .eq('role', 'employee');

        setEmployeeCount(count ?? 0);
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

    useEffect(() => {
        fetchCompanyData();
        fetchJoinRequests();
    }, [fetchCompanyData, fetchJoinRequests]);

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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                    <p className="text-3xl font-bold text-slate-900">—</p>
                    <p className="text-xs text-slate-500 mt-1">Próximamente disponible</p>
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
                        className="w-full bg-blue-600 hover:bg-blue-700"
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
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">¿Cómo funciona ENEATEAMS?</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">1</div>
                        <h4 className="font-bold text-slate-900 mb-2">Invita a tu Equipo</h4>
                        <p className="text-sm text-slate-600">Comparte el link de invitación con los miembros de tu organización.</p>
                    </div>
                    <div>
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">2</div>
                        <h4 className="font-bold text-slate-900 mb-2">Test de Eneagrama</h4>
                        <p className="text-sm text-slate-600">Cada miembro completa un cuestionario rápido para descubrir su eneatipo.</p>
                    </div>
                    <div>
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">3</div>
                        <h4 className="font-bold text-slate-900 mb-2">Insights y Reportes</h4>
                        <p className="text-sm text-slate-600">Accede a análisis detallados sobre la dinámica de tu equipo.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
