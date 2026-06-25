import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { saveCheckIn, MOOD_CONFIG, type CheckIn } from '../utils/checkIns';

type Mood = CheckIn['mood'];

interface Props {
    userId: string;
    taskTitle: string;
    onClose: () => void;        // se llama al cerrar (guardado o saltado)
    onSaved?: () => void;       // se llama solo si guardó
}

const SCALE = [1, 2, 3, 4, 5];

/**
 * Mini check-in que aparece justo al COMPLETAR una tarea. Conecta el
 * tablero de tareas con el termómetro de clima: deja registro de cómo
 * se sintió la persona al cerrar ese trabajo (con el título como contexto).
 */
export const TaskCheckInModal: React.FC<Props> = ({ userId, taskTitle, onClose, onSaved }) => {
    const [mood, setMood] = useState<Mood>('good');
    const [energy, setEnergy] = useState(3);
    const [stress, setStress] = useState(3);
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await saveCheckIn({
                userId,
                date: new Date().toISOString(),
                mood,
                energy,
                stress,
                notes: `Al cerrar: ${taskTitle}`.slice(0, 200),
            });
            onSaved?.();
            onClose();
        } catch (e) {
            console.error('[TaskCheckIn] guardar:', e);
            setSaving(false);
        }
    };

    const Scale: React.FC<{ value: number; onChange: (n: number) => void; activeColor: string }> = ({ value, onChange, activeColor }) => (
        <div className="flex gap-2">
            {SCALE.map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    className={`h-10 flex-1 rounded-lg border text-sm font-medium transition-all ${
                        value === n ? 'text-white border-transparent' : 'text-[#8A8079] border-[#ECE3D8] hover:bg-[#FAF6F1]'
                    }`}
                    style={value === n ? { backgroundColor: activeColor } : undefined}
                >
                    {n}
                </button>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
                <div className="flex items-center justify-between p-5 border-b border-[#ECE3D8]">
                    <div>
                        <h3 className="text-lg font-display font-bold text-[#3A332E]">¡Tarea completada! 🎉</h3>
                        <p className="text-xs text-[#8A8079] mt-0.5">¿Cómo te fue con esta tarea?</p>
                    </div>
                    <button onClick={onClose} className="text-[#8A8079] hover:text-[#3A332E]"><X size={20} /></button>
                </div>

                <div className="p-5 space-y-5">
                    <p className="text-sm text-[#3A332E] bg-[#FAF6F1] border border-[#ECE3D8] rounded-lg px-3 py-2 truncate">
                        {taskTitle}
                    </p>

                    {/* Ánimo */}
                    <div>
                        <p className="text-sm font-medium text-[#3A332E] mb-2">Tu ánimo</p>
                        <div className="flex justify-between gap-1">
                            {(Object.keys(MOOD_CONFIG) as Mood[]).map((m) => {
                                const cfg = MOOD_CONFIG[m];
                                const active = mood === m;
                                return (
                                    <button
                                        key={m}
                                        type="button"
                                        onClick={() => setMood(m)}
                                        title={cfg.label}
                                        className={`flex-1 rounded-lg py-2 text-2xl transition-all ${active ? 'bg-[#FCF1EC] scale-110' : 'opacity-50 hover:opacity-100'}`}
                                    >
                                        {cfg.emoji}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Energía */}
                    <div>
                        <p className="text-sm font-medium text-[#3A332E] mb-2">Energía <span className="text-[#8A8079] font-normal">(1 baja · 5 alta)</span></p>
                        <Scale value={energy} onChange={setEnergy} activeColor="#3b82f6" />
                    </div>

                    {/* Estrés */}
                    <div>
                        <p className="text-sm font-medium text-[#3A332E] mb-2">Estrés <span className="text-[#8A8079] font-normal">(1 bajo · 5 alto)</span></p>
                        <Scale value={stress} onChange={setStress} activeColor="#E07A5F" />
                    </div>
                </div>

                <div className="flex gap-3 p-5 border-t border-[#ECE3D8]">
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#ECE3D8] text-[#8A8079] hover:bg-[#FAF6F1] text-sm">
                        Ahora no
                    </button>
                    <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-[#E07A5F] text-white font-medium hover:bg-[#C9624A] disabled:opacity-50 text-sm flex items-center justify-center gap-1">
                        <Check size={16} /> {saving ? 'Guardando...' : 'Registrar'}
                    </button>
                </div>
            </div>
        </div>
    );
};
