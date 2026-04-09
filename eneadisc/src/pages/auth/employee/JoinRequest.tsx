import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/Button';
import { Users, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export const JoinRequest: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    // Estados separados: verificación del código (inmediata) vs acción del usuario (post-auth)
    const [codeStatus, setCodeStatus] = useState<'verifying' | 'valid' | 'invalid'>('verifying');
    const [company, setCompany] = useState<{ id: string; name: string } | null>(null);
    const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [actionMessage, setActionMessage] = useState('');

    const code = searchParams.get('code')?.toUpperCase() || '';

    // ── Paso 1: verificar el código INMEDIATAMENTE sin esperar auth ──
    useEffect(() => {
        if (!code) {
            setCodeStatus('invalid');
            return;
        }

        const verifyCode = async () => {
            const { data, error } = await supabase
                .from('companies')
                .select('id, name')
                .eq('invite_code', code)
                .maybeSingle();

            if (error || !data) {
                setCodeStatus('invalid');
            } else {
                setCompany(data);
                setCodeStatus('valid');
            }
        };

        verifyCode();
    }, [code]);

    // ── Paso 2: una vez que el código es válido Y la auth resolvió, decidir qué hacer ──
    useEffect(() => {
        if (codeStatus !== 'valid' || authLoading || !company) return;

        // No autenticado → redirigir al signup con el código
        if (!isAuthenticated) {
            navigate(`/auth/employee/signup?code=${code}`);
            return;
        }

        // Ya pertenece a una empresa
        if (user?.companyId) {
            if (user.companyId === company.id) {
                setActionStatus('error');
                setActionMessage('Ya perteneces a esta empresa.');
            } else {
                setActionStatus('error');
                setActionMessage('Ya perteneces a otra empresa. No podés unirte a varias a la vez.');
            }
            return;
        }

        // Verificar solicitud existente
        const checkExistingRequest = async () => {
            if (!user?.id) return;

            const { data: req } = await supabase
                .from('join_requests')
                .select('status')
                .eq('user_id', user.id)
                .eq('company_id', company.id)
                .single();

            if (req) {
                if (req.status === 'pending') {
                    setActionStatus('success');
                    setActionMessage('Ya tenés una solicitud pendiente. Aguardá la aprobación del administrador.');
                } else if (req.status === 'approved') {
                    setActionStatus('error');
                    setActionMessage('Tu solicitud está aprobada. Reiniciá sesión para ver los cambios.');
                } else {
                    setActionStatus('error');
                    setActionMessage('Tu solicitud previa fue rechazada.');
                }
                return;
            }

            // Listo para enviar solicitud
            setActionStatus('idle');
        };

        checkExistingRequest();
    }, [codeStatus, authLoading, isAuthenticated, user, company, code, navigate]);

    const handleRequestAccess = async () => {
        if (!user || !company) return;

        setActionStatus('loading');

        const { error } = await supabase
            .from('join_requests')
            .insert({ company_id: company.id, user_id: user.id });

        if (error) {
            setActionStatus('error');
            setActionMessage('Error al enviar la solicitud. Intentá más tarde.');
        } else {
            setActionStatus('success');
            setActionMessage('¡Solicitud enviada! El administrador te dará acceso pronto.');
        }
    };

    // ────────────────────────────────────────────────────────────
    // RENDERS
    // ────────────────────────────────────────────────────────────

    // Verificando el código de invitación (instantáneo desde Supabase)
    if (codeStatus === 'verifying') {
        return (
            <div className="flex h-screen items-center justify-center p-4 bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    <p className="text-sm text-slate-500 font-medium">Verificando código de invitación...</p>
                </div>
            </div>
        );
    }

    // Código inválido
    if (codeStatus === 'invalid') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <AlertTriangle size={32} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Código no válido</h1>
                    <p className="text-slate-500 mb-8">
                        El código de invitación <strong className="font-mono text-slate-700">{code}</strong> no existe o expiró.
                        Pedile un nuevo link al administrador de tu empresa.
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                        Volver al Inicio
                    </Button>
                </div>
            </div>
        );
    }

    // Código válido — esperando que la auth resuelva
    if (codeStatus === 'valid' && authLoading) {
        return (
            <div className="flex h-screen items-center justify-center p-4 bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="text-blue-600" size={28} />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-slate-800 mb-1">Invitación a <strong>{company?.name}</strong></p>
                        <p className="text-sm text-slate-500 flex items-center gap-2 justify-center">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Preparando tu acceso...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Código válido — pantalla principal
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">

                {/* Éxito */}
                {actionStatus === 'success' && (
                    <>
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <CheckCircle size={32} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 mb-2">¡Listo!</h1>
                        <p className="text-slate-500 mb-8">{actionMessage}</p>
                        <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/employee')}>
                            Ir al Panel
                        </Button>
                    </>
                )}

                {/* Error */}
                {actionStatus === 'error' && (
                    <>
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 mb-2">Aviso</h1>
                        <p className="text-slate-500 mb-8">{actionMessage}</p>
                        <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                            Volver al Inicio
                        </Button>
                    </>
                )}

                {/* Confirmar unirse (usuario autenticado sin empresa) */}
                {actionStatus === 'idle' && (
                    <>
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Users size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Unirte a <span className="text-blue-600">{company?.name}</span>
                        </h1>
                        <p className="text-slate-500 mb-8">
                            Fuiste invitado a esta empresa. Enviá una solicitud para que el administrador te dé acceso.
                        </p>
                        <Button
                            size="lg"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={handleRequestAccess}
                        >
                            Enviar Solicitud de Acceso
                        </Button>
                    </>
                )}

                {/* Loading la acción */}
                {actionStatus === 'loading' && (
                    <div className="py-8 flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <p className="text-sm text-slate-500">Enviando solicitud...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
