import React, { useState } from 'react';
import { getAllEnneagramTypes } from '../../data/enneagramData';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const EnneagramLibrary: React.FC = () => {
    const [expandedType, setExpandedType] = useState<number | null>(null);
    const types = getAllEnneagramTypes();

    const toggleType = (typeId: number) => {
        setExpandedType(expandedType === typeId ? null : typeId);
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Biblioteca de Eneatipos</h1>
                <p className="text-slate-600">Conoce los 9 tipos de personalidad del Eneagrama</p>
            </div>

            <div className="space-y-4">
                {types.map((type) => (
                    <div
                        key={type.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-transparent hover:border-purple-200 transition-all"
                    >
                        {/* Header */}
                        <button
                            onClick={() => toggleType(type.id)}
                            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                                    style={{ backgroundColor: type.color }}
                                >
                                    {type.id}
                                </div>
                                <div className="text-left">
                                    <h3 className="text-xl font-bold text-slate-900">Tipo {type.id}: {type.name}</h3>
                                    <p className="text-sm text-slate-600">{type.description}</p>
                                </div>
                            </div>
                            {expandedType === type.id ? (
                                <ChevronUp className="text-slate-400" size={24} />
                            ) : (
                                <ChevronDown className="text-slate-400" size={24} />
                            )}
                        </button>

                        {/* Expanded Content */}
                        {expandedType === type.id && (
                            <div className="px-6 pb-6 border-t border-slate-100">
                                <div className="grid md:grid-cols-2 gap-6 mt-6">
                                    {/* Motivación */}
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <h4 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                            </svg>
                                            Motivación Principal
                                        </h4>
                                        <p className="text-sm text-green-800">{type.motivation}</p>
                                    </div>

                                    {/* Miedo */}
                                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                        <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            Miedo Básico
                                        </h4>
                                        <p className="text-sm text-red-800">{type.fear}</p>
                                    </div>
                                </div>

                                {/* Fortalezas */}
                                <div className="mt-4">
                                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Fortalezas
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {type.strengths.map((strength, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
                                            >
                                                {strength}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Áreas de Desarrollo */}
                                <div className="mt-4">
                                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        Áreas de Desarrollo
                                    </h4>
                                    <ul className="space-y-2">
                                        {type.growthAreas.map((area, index) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-slate-700">
                                                <span className="text-amber-500">→</span>
                                                <span>{area}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Mejor compatibilidad */}
                                <div className="mt-4">
                                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        Mejor compatibilidad con
                                    </h4>
                                    <div className="flex gap-2">
                                        {type.compatibleWith.map((compatibleId) => {
                                            const compatibleType = types.find(t => t.id === compatibleId);
                                            return compatibleType ? (
                                                <div
                                                    key={compatibleId}
                                                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                                                >
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                                        style={{ backgroundColor: compatibleType.color }}
                                                    >
                                                        {compatibleId}
                                                    </div>
                                                    <span className="text-sm text-slate-700">{compatibleType.name}</span>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
