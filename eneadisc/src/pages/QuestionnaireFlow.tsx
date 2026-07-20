import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QUICK_QUESTIONS, DEEP_QUESTIONS } from '../data/questionnaireData';
import {
    calculateEnneagram, persistEnneagramType, saveLocalResult,
    type QuestionnaireResponse, type EnneagramResult,
} from '../utils/calculateEnneagram';
import { Button } from '../components/ui/Button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const QuestionnaireFlow: React.FC = () => {
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [mode] = useState<'quick' | 'deep'>('quick');
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

    const handleNext = async () => {
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
        // El resultado NO se muestra al operario (evita condicionamiento y
        // comparaciones). Se guarda en silencio; solo el admin lo ve.
        if (user) {
            setSaving(true);
            const { error } = await persistEnneagramType(user.id, res.primaryType);
            setSaving(false);
            if (error) { setSaveError('No se pudo guardar. Tocá "Finalizar" para reintentar.'); }
        }
        setPhase('result');
    };

    const handleBack = () => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1);
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

    // ── Pantalla de "completado" ───────────────────────────
    // El resultado NO se muestra (decisión metodológica: conocer el tipo
    // condiciona a la persona y fomenta comparaciones). Solo el admin lo ve.
    if (phase === 'result' && result && chosenType !== null) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FCF1EC] to-[#EEF3EE] flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF3EE]">
                            <Check className="text-[#5F7A68]" size={32} />
                        </div>
                        <h1 className="text-2xl font-display font-bold text-[#3A332E] mb-2">
                            ¡Test completado! 🎉
                        </h1>
                        <p className="text-[#8A8079] text-sm mb-6">
                            Gracias por responder con sinceridad. Tus respuestas quedaron
                            registradas y van a ayudar a que tu experiencia y la de tu
                            equipo sea cada vez mejor.
                        </p>
                        {saveError && <p className="text-sm text-red-500 mb-3">{saveError}</p>}
                        <Button
                            onClick={confirm}
                            isLoading={saving}
                            size="lg"
                            className="w-full bg-gradient-to-r from-[#E07A5F] to-[#C9624A]"
                        >
                            Finalizar
                        </Button>
                    </div>
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
                            {mode === 'deep' ? 'Test completo' : 'Test de autoconocimiento'}
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
