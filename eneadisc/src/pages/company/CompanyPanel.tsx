import React, { useState, useEffect } from 'react';
import { Users, Mail, CheckCircle, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

export const CompanyPanel: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [employeeCount, setEmployeeCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const inviteCode = localStorage.getItem('company_invite_code') || 'ENEA-1234';

    // Calculate employee count
    useEffect(() => {
        if (user?.companyId) {
            // Get all teams for this company
            const teamsJson = localStorage.getItem(`teams_${user.companyId}`);
            if (teamsJson) {
                const teams = JSON.parse(teamsJson);
                // Count unique employee IDs across all teams
                const allMemberIds = new Set<string>();
                teams.forEach((team: any) => {
                    team.memberIds?.forEach((id: string) => allMemberIds.add(id));
                });
                setEmployeeCount(allMemberIds.size);
            }
        }
    }, [user]);

    const handleInvite = () => {
        // Generate invite link
        const baseUrl = window.location.origin;
        const inviteLink = `${baseUrl}/auth/employee/signup?code=${inviteCode}`;

        // Copy to clipboard
        navigator.clipboard.writeText(inviteLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleGoToLibrary = () => {
        navigate('/dashboard/company/biblioteca');
    };

    // Calculate completion percentage
    const completionPercentage = employeeCount > 0 ? Math.round((employeeCount / employeeCount) * 100) : 0;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Panel de Administración</h1>
                <p className="text-lg opacity-90">Gestiona tu equipo, visualiza métricas y toma decisiones informadas basadas en el Eneagrama</p>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{completionPercentage}%</p>
                    <p className="text-xs text-slate-500 mt-1">Porcentaje de completitud</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-slate-500 text-sm font-medium">Código de Invitación</h3>
                        <Mail className="text-purple-600" size={24} />
                    </div>
                    <p className="text-2xl font-bold text-purple-600 font-mono">{inviteCode}</p>
                    <p className="text-xs text-slate-500 mt-1">Comparte con tu equipo</p>
                </div>
            </div>

            {/* Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Comienza Ahora</h3>
                    <p className="text-slate-600 mb-4">Invita a tu equipo para descubrir sus eneatipos y mejorar la dinámica laboral.</p>
                    <Button
                        onClick={handleInvite}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {copied ? (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" /> Link Copiado
                            </>
                        ) : (
                            <>
                                <Copy className="mr-2 h-4 w-4" /> Generar Link de Invitación
                            </>
                        )}
                    </Button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Explora la Biblioteca</h3>
                    <p className="text-slate-600 mb-4">Aprende sobre los 9 eneatipos y cómo aplicarlos en tu organización.</p>
                    <Button
                        onClick={handleGoToLibrary}
                        variant="outline"
                        className="w-full"
                    >
                        Ver Biblioteca de Eneatipos
                    </Button>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">¿Cómo funciona ENEADISC?</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl mb-3">1</div>
                        <h4 className="font-bold text-slate-900 mb-2">Invita a tu Equipo</h4>
                        <p className="text-sm text-slate-600">Comparte el código de invitación con los miembros de tu organización.</p>
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
