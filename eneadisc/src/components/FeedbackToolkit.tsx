import React, { useState } from 'react';
import { MessageSquareReply, Copy, Check, ThumbsUp, AlertTriangle, Ban, Users2 } from 'lucide-react';
import { FEEDBACK_GUIDE, ONE_ON_ONE_GUIDE } from '../data/enneagramLeadership';

interface Props {
    type: number;
    firstName: string;
}

const CopyLine: React.FC<{ text: string; icon: React.ReactNode; label: string; tone: string }> = ({ text, icon, label, tone }) => {
    const [copied, setCopied] = useState(false);
    const copy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };
    return (
        <div className="rounded-lg border border-[#ECE3D8] bg-white p-3">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: tone }}>{icon} {label}</span>
                <button onClick={copy} className="text-[#8A8079] hover:text-[#C9624A] flex items-center gap-1 text-xs">
                    {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
                </button>
            </div>
            <p className="text-sm text-[#3A332E] italic">"{text}"</p>
        </div>
    );
};

/**
 * Plantillas de feedback (positivo / de mejora / qué evitar) y guion de 1:1
 * por eneatipo. Pensado para que el líder copie y adapte ([tarea], [persona]).
 */
export const FeedbackToolkit: React.FC<Props> = ({ type, firstName }) => {
    const fb = FEEDBACK_GUIDE[type];
    const oo = ONE_ON_ONE_GUIDE[type];
    if (!fb || !oo) return null;

    return (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Plantillas de feedback */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#ECE3D8]">
                <div className="flex items-center gap-2 mb-3">
                    <MessageSquareReply className="text-[#C9624A]" size={20} />
                    <h3 className="font-display font-semibold text-[#3A332E]">Plantillas de feedback</h3>
                </div>
                <p className="text-xs text-[#8A8079] mb-3">Copiá y completá los corchetes. Adaptado al eneatipo de {firstName}.</p>
                <div className="space-y-2.5">
                    <CopyLine text={fb.positive} icon={<ThumbsUp size={13} />} label="Reconocimiento" tone="#5F7A68" />
                    <CopyLine text={fb.corrective} icon={<AlertTriangle size={13} />} label="De mejora" tone="#C9624A" />
                    <div className="rounded-lg bg-[#FAF6F1] border border-[#ECE3D8] p-3">
                        <span className="text-xs font-semibold text-[#8A8079] flex items-center gap-1.5 mb-1"><Ban size={13} /> Qué evitar</span>
                        <p className="text-sm text-[#3A332E]">{fb.avoid}</p>
                    </div>
                </div>
            </div>

            {/* Guion de 1:1 */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#ECE3D8]">
                <div className="flex items-center gap-2 mb-3">
                    <Users2 className="text-[#7C9885]" size={20} />
                    <h3 className="font-display font-semibold text-[#3A332E]">Guion para un 1:1</h3>
                </div>
                <p className="text-xs text-[#8A8079] mb-3">Estructura sugerida para tu reunión con {firstName}.</p>
                <ol className="space-y-3">
                    <li>
                        <p className="text-xs font-semibold text-[#7C9885]">1 · Para abrir</p>
                        <p className="text-sm text-[#3A332E]">{oo.opener}</p>
                    </li>
                    <li>
                        <p className="text-xs font-semibold text-[#7C9885]">2 · Dónde poner el foco</p>
                        <p className="text-sm text-[#3A332E]">{oo.focus}</p>
                    </li>
                    <li>
                        <p className="text-xs font-semibold text-[#7C9885]">3 · Para cerrar</p>
                        <p className="text-sm text-[#3A332E]">{oo.closer}</p>
                    </li>
                </ol>
            </div>
        </div>
    );
};
