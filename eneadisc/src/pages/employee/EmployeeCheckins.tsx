import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MOOD_CONFIG, getCheckIns, saveCheckIn, type CheckIn } from '../../utils/checkIns';
import { CheckCircle2, Calendar, AlertCircle, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const EmployeeCheckins: React.FC = () => {
    const { user } = useAuth();
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [mood, setMood] = useState<CheckIn['mood']>('neutral');
    const [energy, setEnergy] = useState<number>(3);
    const [stress, setStress] = useState<number>(3);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (user) {
            setCheckIns(getCheckIns(user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
    }, [user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const newCheckIn: CheckIn = {
            id: `chk-${Date.now()}`,
            userId: user.id,
            date: new Date().toISOString(),
            mood,
            energy,
            stress,
            notes: notes.trim() || undefined
        };

        saveCheckIn(newCheckIn);
        setCheckIns(getCheckIns(user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setShowForm(false);
        setNotes('');
        setMood('neutral');
        setEnergy(3);
        setStress(3);
    };

    const hasCheckedInToday = checkIns.length > 0 && 
        new Date(checkIns[0].date).toDateString() === new Date().toDateString();

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Check-ins Emocionales</h1>
                    <p className="text-slate-600">Registra tu estado de ánimo para personalizar tu experiencia.</p>
                </div>
                {!showForm && (
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-md"
                        disabled={hasCheckedInToday}
                    >
                        {hasCheckedInToday ? (
                            <><CheckCircle2 className="w-5 h-5 mr-2" /> Registrado hoy</>
                        ) : (
                            <><Plus className="w-5 h-5 mr-2" /> Nuevo Check-in</>
                        )}
                    </Button>
                )}
            </div>

            {/* Check-in Form */}
            {showForm && (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-100 mb-10 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">¿Cómo te sientes hoy?</h2>
                        <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                            Cancelar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Mood Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-4">Estado de ánimo general</label>
                            <div className="flex flex-wrap gap-4">
                                {(Object.keys(MOOD_CONFIG) as Array<keyof typeof MOOD_CONFIG>).map((moodKey) => {
                                    const config = MOOD_CONFIG[moodKey];
                                    return (
                                        <button
                                            key={moodKey}
                                            type="button"
                                            onClick={() => setMood(moodKey)}
                                            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all min-w-[80px] ${
                                                mood === moodKey 
                                                ? 'border-purple-600 bg-purple-50 scale-105' 
                                                : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                        >
                                            <span className="text-4xl mb-2">{config.emoji}</span>
                                            <span className="text-xs font-medium text-slate-600">{config.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Energy Level */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-slate-700">Nivel de Energía</label>
                                    <span className="text-sm font-bold text-blue-600">{energy} / 5</span>
                                </div>
                                <input 
                                    type="range" min="1" max="5" step="1"
                                    value={energy}
                                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                                    className="w-full accent-blue-600"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>Agotado</span>
                                    <span>Lleno de energía</span>
                                </div>
                            </div>

                            {/* Stress Level */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-slate-700">Nivel de Estrés</label>
                                    <span className="text-sm font-bold text-red-600">{stress} / 5</span>
                                </div>
                                <input 
                                    type="range" min="1" max="5" step="1"
                                    value={stress}
                                    onChange={(e) => setStress(parseInt(e.target.value))}
                                    className="w-full accent-red-600"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>Tranquilo</span>
                                    <span>Muy estresado</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Notas (Opcional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="¿Por qué te sientes así hoy? o ¿Hay algún evento importante?"
                                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none resize-none h-24"
                            />
                        </div>

                        <Button type="submit" className="w-full text-lg py-4 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg hover:shadow-xl">
                            Guardar Check-in
                        </Button>
                    </form>
                </div>
            )}

            {/* History */}
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Historial Semanal
            </h2>

            {checkIns.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-slate-200">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No hay check-ins aún</h3>
                    <p className="text-slate-500 mb-6">Comienza a registrar tu estado de ánimo para obtener métricas y consejos.</p>
                    <Button onClick={() => setShowForm(true)}>Hacer primer Check-in</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {checkIns.map(checkIn => {
                        const date = new Date(checkIn.date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const config = MOOD_CONFIG[checkIn.mood];
                        
                        return (
                            <div key={checkIn.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                <div className="flex items-center gap-4 min-w-[200px]">
                                    <div className="w-12 h-12 flex items-center justify-center text-2xl bg-slate-50 rounded-full border border-slate-100">
                                        {config.emoji}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900">
                                            {isToday ? 'Hoy' : date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </div>
                                        <div className="text-sm font-medium" style={{ color: config.color }}>
                                            {config.label}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex flex-wrap gap-4 md:px-6 md:border-l border-slate-100">
                                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        Energía: {checkIn.energy}/5
                                    </div>
                                    <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        Estrés: {checkIn.stress}/5
                                    </div>
                                </div>

                                {checkIn.notes && (
                                    <div className="w-full md:w-auto bg-slate-50 p-3 rounded-lg text-sm text-slate-600 flex-1 md:max-w-xs italic">
                                        "{checkIn.notes}"
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
