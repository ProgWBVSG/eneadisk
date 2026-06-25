import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QUICK_QUESTIONS, DEEP_QUESTIONS } from '../data/questionnaireData';
import {
    calculateEnneagram, persistEnneagramType, saveLocalResult,
    type QuestionnaireResponse, type EnneagramResult,
} from '../utils/calculateEnneagram';
import { ENNEAGRAM_TYPES } from '../data/enneagramData';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight, Check, RotateCcw, Sparkles } from 'lucide-react';

export const QuestionnaireFlow: React.FC = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [mode, setMode] = useState<'quick' | 'deep'>('quick');
    const [phase, setPhase] = useState<'quiz' | 'result'>('quiz');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [result, setResult] = useState<EnneagramResult | null>(null);
    const [chosenType, setChosenType] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const questions = mode === 'deep' ? DEEP_QUESTIONS : QUICK_QUESTIONS;
    const question = questions[currentIndex];
    const selectedType = answers[question.id] ?? null;
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isLast = currentIndex === questions.length - 1;

    const pick = (type: number) => setAnswers((prev) => ({ ...prev, [question.id]: type }));

    const handleNext = () => {
        if (selectedType === null) return;
        if (!isLast) {
            setCurrentIndex((i) => i + 1);
            return;
        }
        // Finalizar → calcular
        const responses: QuestionnaireResponse[] = questions.map((q) => ({
            questionId: q.id,
            selectedType: answers[q.id],
            weight: q.weight,
        }));
        const res = calculateEnneagram(responses);
        if (user) saveLocalResult(user.id, res);
        setResult(res);
        setChosenType(res.primaryType);
        setPhase('result');
    };

    const handleBack = () => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    };

    // Rehacer: si venías del test rápido, pasás al PROFUNDO (20) para más
    // certeza; si ya estabas en el profundo, lo repetís.
    const restart = (nextMode: 'quick' | 'deep') => {
        setMode(nextMode);
        setAnswers({});
        setCurrentIndex(0);
        setResult(null);
        setChosenType(null);
        setSaveError(null);
        setPhase('quiz');
    };

    const confirm = async () => {
        if (!user || chosenType === null) return;
        setSaving(true);
        setSaveError(null);
        const { error } = await persistEnneagramType(user.id, chosenType);
        if (error) {
            setSaveError('No se pudo guardar tu resultado. Intentá de nuevo.');
            setSaving(false);
            return;
        }
        await refreshUser();
        navigate(user.role === 'employee' ? '/dashboard/employee' : '/dashboard/company');
    };

    // ── Pantalla de resultado ──────────────────────────────
    if (phase === 'result' && result && chosenType !== null) {
        const candidates = result.ranking.slice(0, 3).map((r) => r.type);
        const chosen = ENNEAGRAM_TYPES[chosenType];
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FCF1EC] to-[#EEF3EE] flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                        <div className="text-center mb-6">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#FCF1EC]">
                                <Sparkles className="text-[#C9624A]" size={26} />
                            </div>
                            <p className="text-sm text-[#8A8079]">Tu resultado</p>
                            <h1 className="text-3xl font-display font-bold text-[#3A332E]">
                                Tipo {chosen.id} · {chosen.name}
                            </h1>
                        </div>

                        <div className="rounded-xl bg-[#FAF6F1] border border-[#ECE3D8] p-5 mb-6">
                            <p className="text-[#3A332E]">{chosen.description}</p>
                            <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
                                <div>
                                    <p className="font-semibold text-[#C9624A]">Motivación central</p>
                                    <p className="text-[#8A8079]">{chosen.motivation}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-[#C9624A]">Miedo central</p>
                                    <p className="text-[#8A8079]">{chosen.fear}</p>
                                </div>
                            </div>
                        </div>

                        {/* Alternativas: el test sugiere, la persona confirma */}
                        <div className="mb-6">
                            <p className="text-sm font-medium text-[#3A332E] mb-2">
                                {result.ambiguous
                                    ? 'Tu resultado quedó entre varios tipos cercanos. ¿Con cuál te identificás más?'
                                    : '¿Te sentís identificado/a? Si no, mirá los más cercanos:'}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {candidates.map((t) => {
                                    const et = ENNEAGRAM_TYPES[t];
                                    const active = t === chosenType;
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => setChosenType(t)}
                                            className={`text-left rounded-xl border-2 p-3 transition-all ${
                                                active
                                                    ? 'border-[#E07A5F] bg-[#FCF1EC]'
                                                    : 'border-[#ECE3D8] hover:border-[#EFA98F] bg-white'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-[#C9624A]">Tipo {t}</span>
                                                {active && <Check size={15} className="text-[#E07A5F]" />}
                                            </div>
                                            <p className="text-sm font-medium text-[#3A332E] leading-tight mt-0.5">{et.name}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {saveError && <p className="text-sm text-red-500 text-center mb-3">{saveError}</p>}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                variant="outline"
                                onClick={() => restart('deep')}
                                className="sm:flex-1"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                {mode === 'quick' ? 'No me identifico · test completo (20)' : 'Rehacer test completo'}
                            </Button>
                            <Button
                                onClick={confirm}
                                isLoading={saving}
                                className="sm:flex-1 bg-gradient-to-r from-[#E07A5F] to-[#C9624A]"
                            >
                                <Check className="mr-2 h-4 w-4" /> Sí, soy Tipo {chosenType}
                            </Button>
                        </div>
                    </div>
                    <p className="text-center text-sm text-[#8A8079] mt-5">
                        El test es una guía. Vos confirmás con cuál te sentís más identificado/a.
                    </p>
                </div>
            </div>
        );
    }

    // ── Pantalla del cuestionario ──────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FCF1EC] to-[#EEF3EE] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progreso */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-medium text-[#8A8079]">
                            {mode === 'deep' ? 'Test completo · Eneatipo' : 'Descubrí tu Eneatipo'}
                        </h2>
                        <span className="text-sm text-[#8A8079]">{currentIndex + 1} de {questions.length}</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-[#E07A5F] to-[#E89B82] transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Pregunta */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-[#3A332E] mb-8 text-center">
                        {question.text}
                    </h1>

                    <div className="space-y-3 mb-8">
                        {question.options.map((option) => (
                            <button
                                key={option.type}
                                onClick={() => pick(option.type)}
                                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                                    selectedType === option.type
                                        ? 'border-[#E07A5F] bg-[#FCF1EC] shadow-md'
                                        : 'border-[#ECE3D8] hover:border-[#EFA98F] hover:bg-[#FAF6F1]'
                                }`}
                            >
                                <span className="text-[#3A332E] font-medium">{option.text}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4">
                        {currentIndex > 0 && (
                            <Button variant="outline" onClick={handleBack} className="flex-1">
                                <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            disabled={selectedType === null}
                            className={`${currentIndex === 0 ? 'w-full' : 'flex-1'} bg-gradient-to-r from-[#E07A5F] to-[#C9624A]`}
                        >
                            {isLast ? 'Ver mi resultado' : 'Siguiente'}
                            {!isLast && <ChevronRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <p className="text-center text-sm text-[#8A8079] mt-6">
                    Respondé con sinceridad. No hay respuestas correctas ni incorrectas.
                </p>
            </div>
        </div>
    );
};
