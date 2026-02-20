import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { getEnneagramResult, hasCompletedQuestionnaire } from '../../utils/calculateEnneagram';
import { ENNEAGRAM_TYPES } from '../../data/enneagramData';
import { Heart, AlertTriangle, TrendingUp, Target, Users, Lock } from 'lucide-react';

export const EmployeeProfile: React.FC = () => {
    const { user } = useAuth();
    const hasCompleted = user ? hasCompletedQuestionnaire(user.id) : false;
    const result = user ? getEnneagramResult(user.id) : null;

    if (!hasCompleted || !result) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg">
                    <Lock size={64} className="mx-auto text-purple-600 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Completa tu Perfil</h2>
                    <p className="text-slate-600 mb-6">
                        Para acceder a todas las funcionalidades del dashboard, primero debes completar el cuestionario de Eneagrama.
                    </p>
                    <a
                        href="/questionnaire"
                        className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                        Completar Cuestionario
                    </a>
                </div>
            </div>
        );
    }

    const enneagramType = ENNEAGRAM_TYPES[result.primaryType];

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto" style={{ backgroundColor: '#f8fafc' }}>
            {/* Header Card - Eneatipo Principal */}
            <div
                className="rounded-2xl p-8 mb-6 text-white shadow-xl"
                style={{ background: `linear-gradient(135deg, ${enneagramType.color} 0%, ${enneagramType.color}dd 100%)` }}
            >
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                        <span className="text-5xl font-bold">{result.primaryType}</span>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Tipo {result.primaryType}: {enneagramType.name}</h1>
                        <p className="text-lg opacity-90">{enneagramType.description}</p>
                    </div>
                </div>
            </div>

            {/* Motivación y Miedo */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-green-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Heart className="text-green-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Motivación Principal</h3>
                    </div>
                    <p className="text-slate-700">{enneagramType.motivation}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-md border-l-4 border-red-500">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Miedo Básico</h3>
                    </div>
                    <p className="text-slate-700">{enneagramType.fear}</p>
                </div>
            </div>

            {/* Fortalezas */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="text-blue-600" size={24} />
                    <h3 className="text-xl font-bold text-slate-900">Tus Fortalezas</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">Áreas donde naturalmente destacas</p>
                <div className="flex flex-wrap gap-2">
                    {enneagramType.strengths.map((strength, index) => (
                        <span
                            key={index}
                            className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                        >
                            ✓ {strength}
                        </span>
                    ))}
                </div>
            </div>

            {/* Áreas de Desarrollo */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Target className="text-amber-600" size={24} />
                    <h3 className="text-xl font-bold text-slate-900">Áreas de Desarrollo</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">Oportunidades para crecer</p>
                <ul className="space-y-2">
                    {enneagramType.growthAreas.map((area, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <span className="text-amber-500 mt-1">🌱</span>
                            <span className="text-slate-700">{area}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Trabajas Mejor Con */}
            <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Users className="text-purple-600" size={24} />
                    <h3 className="text-xl font-bold text-slate-900">Trabajas Mejor Con</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">Eneatipos con mayor compatibilidad</p>
                <div className="flex flex-wrap gap-3">
                    {enneagramType.compatibleWith.map((typeId) => {
                        const compatibleType = ENNEAGRAM_TYPES[typeId];
                        return (
                            <div
                                key={typeId}
                                className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200"
                            >
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                    style={{ backgroundColor: compatibleType.color }}
                                >
                                    {typeId}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">Tipo {typeId}</p>
                                    <p className="text-xs text-slate-500">{compatibleType.name}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mi Información */}
            <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Mi Información</h3>
                <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500">Nombre:</span>
                        <span className="font-medium text-slate-900">{user?.name || 'Usuario'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500">Área:</span>
                        <span className="font-medium text-slate-900">-</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                        <span className="text-slate-500">Email:</span>
                        <span className="font-medium text-slate-900">{user?.email || '-'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-slate-500">Último test:</span>
                        <span className="font-medium text-slate-900">
                            {new Date(result.completedAt).toLocaleDateString('es-AR')}
                        </span>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Consejo:</strong> Puedes repetir el test cada 6 meses para ver tu evolución
                    </p>
                </div>
            </div>
        </div>
    );
};
