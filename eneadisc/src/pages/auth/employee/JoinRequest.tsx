import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../../components/ui/Button';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';

export const JoinRequest: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    
    const [status, setStatus] = useState<'loading' | 'confirming' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const [companyDetails, setCompanyDetails] = useState<{id: string, name: string} | null>(null);
    
    const code = searchParams.get('code');

    useEffect(() => {
        if (authLoading) return; // Wait for auth to resolve first
        if (!code) {
            setStatus('error');
            setMessage('Código de invitación no válido.');
            return;
        }

        const checkCode = async () => {
            const { data, error } = await supabase
                .from('companies')
                .select('id, name')
                .eq('invite_code', code.toUpperCase())
                .single();
                
            if (error || !data) {
                setStatus('error');
                setMessage('El código de invitación no existe o expiró.');
                return;
            }
            
            setCompanyDetails(data);
            
            if (!isAuthenticated) {
                // Not authenticated -> redirect to signup with code
                navigate(`/auth/employee/signup?code=${code}`);
                return;
            }
            
            // They are authenticated
            if (user?.companyId) {
                if (user.companyId === data.id) {
                    setStatus('error');
                    setMessage('Ya perteneces a esta empresa.');
                } else {
                    setStatus('error');
                    setMessage('Ya perteneces a otra empresa. No puedes unirte a múltiples empresas a la vez.');
                }
                return;
            }
            
            // Check if there is already a pending request
            if (user?.id) {
                const { data: reqData } = await supabase
                   .from('join_requests')
                   .select('status')
                   .eq('user_id', user.id)
                   .eq('company_id', data.id)
                   .single();
                   
                if (reqData) {
                    if (reqData.status === 'pending') {
                        setStatus('success');
                        setMessage('Ya tienes una solicitud pendiente para esta empresa. Espera a que el administrador la apruebe.');
                    } else if (reqData.status === 'approved') {
                        setStatus('error');
                        setMessage('Tu solicitud ya fue aprobada. Por favor reinicia sesión para ver los cambios.');
                    } else {
                        setStatus('error');
                        setMessage('Tu solicitud previa fue rechazada.');
                    }
                    return;
                }
            }
            
            setStatus('confirming');
        };

        checkCode();
    }, [code, isAuthenticated, authLoading, user, navigate]);

    const handleRequestAccess = async () => {
        if (!user || !companyDetails) return;
        
        setStatus('loading');
        
        const { error } = await supabase
            .from('join_requests')
            .insert({
                company_id: companyDetails.id,
                user_id: user.id
            });
            
        if (error) {
            setStatus('error');
            setMessage('Error al enviar la solicitud. Intenta más tarde.');
        } else {
            setStatus('success');
            setMessage('¡Solicitud enviada exitosamente! El administrador de la empresa recibirá una notificación para darte acceso.');
        }
    };

    if (status === 'loading' || authLoading) {
        return (
            <div className="flex h-screen items-center justify-center p-4">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="text-sm text-slate-500">Verificando invitación...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">
                {status === 'confirming' && (
                    <>
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Users size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">Unirte a {companyDetails?.name}</h1>
                        <p className="text-slate-500 mb-8">Has sido invitado a formar parte de esta empresa. Solicita acceso para continuar.</p>
                        <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleRequestAccess}>
                            Enviar Solicitud de Acceso
                        </Button>
                    </>
                )}
                
                {status === 'success' && (
                    <>
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <CheckCircle size={32} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 mb-2">Solicitud Pendiente</h1>
                        <p className="text-slate-500 mb-8">{message}</p>
                        <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/employee')}>
                            Ir al Panel
                        </Button>
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 mb-2">Aviso</h1>
                        <p className="text-slate-500 mb-8">{message}</p>
                        <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                            Volver al Inicio
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};
