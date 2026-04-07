import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, User, Settings, Shield, MessageSquare, HelpCircle, FileText, Moon, Sun, Camera, Lock } from 'lucide-react';
import { Button } from '../ui/Button';

interface UserSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'account' | 'preferences' | 'help' | 'legal';

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('account');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden">
                {/* Close Button Mobile */}
                <button 
                    onClick={onClose}
                    className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full"
                >
                    <X size={20} />
                </button>

                {/* Sidebar Menus */}
                <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">Configuración</h2>
                    
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'account' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-200/50'
                            }`}
                        >
                            <User size={18} />
                            Mi Cuenta
                        </button>
                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'preferences' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-200/50'
                            }`}
                        >
                            <Settings size={18} />
                            Preferencias
                        </button>
                        <div className="pt-4 pb-2">
                            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Soporte</p>
                        </div>
                        <button
                            onClick={() => setActiveTab('help')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'help' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-200/50'
                            }`}
                        >
                            <HelpCircle size={18} />
                            Ayuda y Feedback
                        </button>
                        <button
                            onClick={() => setActiveTab('legal')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'legal' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-200/50'
                            }`}
                        >
                            <Shield size={18} />
                            Términos y Privacidad
                        </button>
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto relative">
                    {/* Close Button Desktop */}
                    <button 
                        onClick={onClose}
                        className="hidden md:block absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="max-w-2xl mx-auto mt-4 md:mt-0">
                        {/* Tab: Cuenta */}
                        {activeTab === 'account' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Perfil Público</h3>
                                    <p className="text-slate-500 text-sm">Gestiona cómo te ven los demás miembros de tu equipo.</p>
                                </div>
                                
                                <div className="flex items-center gap-6 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                                    <div className="relative group">
                                        <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-3xl font-bold text-purple-600 overflow-hidden">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <button className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer">
                                            <Camera className="text-white mb-1" size={20} />
                                            <span className="text-white text-xs font-medium">Cambiar</span>
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                                        <input 
                                            type="text" 
                                            defaultValue={user?.name || ''} 
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <h4 className="flex items-center gap-2 text-lg font-semibold text-slate-800 mb-4">
                                        <Lock size={20} className="text-slate-400" />
                                        Seguridad
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Actual</label>
                                            <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                                            <input type="password" placeholder="Mínimo 8 caracteres" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <Button variant="primary">Actualizar Contraseña</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Preferencias */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Preferencias de Aplicación</h3>
                                    <p className="text-slate-500 text-sm">Personaliza tu experiencia dentro de EneaTeams.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                                        <div>
                                            <h4 className="font-semibold text-slate-800">Tema Visual</h4>
                                            <p className="text-sm text-slate-500">Alterna entre modo claro y oscuro.</p>
                                        </div>
                                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                                            <button 
                                                onClick={() => setTheme('light')}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'light' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                <Sun size={16} /> Claro
                                            </button>
                                            <button 
                                                onClick={() => setTheme('dark')}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'dark' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                            >
                                                <Moon size={16} /> Oscuro
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                                        <div>
                                            <h4 className="font-semibold text-slate-800">Notificaciones por Correo</h4>
                                            <p className="text-sm text-slate-500">Recibe resúmenes de tu equipo y check-ins pendientes.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Ayuda y Feedback */}
                        {activeTab === 'help' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Ayuda y Sugerencias</h3>
                                    <p className="text-slate-500 text-sm">Tu opinión nos ayuda a mejorar la plataforma.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-5 bg-purple-50 border border-purple-100 rounded-xl flex items-start gap-4">
                                        <MessageSquare className="text-purple-600 mt-1" size={24} />
                                        <div>
                                            <h4 className="font-semibold text-purple-900 mb-1">Danos tu Feedback</h4>
                                            <p className="text-sm text-purple-700 mb-3">¿Viste un error o tienes una idea para una nueva funcionalidad? Déjanos tu comentario.</p>
                                            <textarea 
                                                rows={4}
                                                placeholder="Ej. Me gustaría poder exportar mi informe en PDF..."
                                                className="w-full p-3 rounded-lg border border-purple-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm resize-none"
                                            ></textarea>
                                            <div className="mt-3 flex justify-end">
                                                <Button variant="primary">Enviar Feedback</Button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                                        <button className="p-4 border border-slate-200 rounded-xl text-left hover:border-purple-300 hover:shadow-md transition-all group">
                                            <FileText className="text-slate-400 group-hover:text-purple-500 mb-2" size={24} />
                                            <h4 className="font-semibold text-slate-800">Centro de Ayuda</h4>
                                            <p className="text-xs text-slate-500 mt-1">Lee nuestros tutoriales y artículos sobre el Eneagrama.</p>
                                        </button>
                                        <button className="p-4 border border-slate-200 rounded-xl text-left hover:border-purple-300 hover:shadow-md transition-all group">
                                            <MessageSquare className="text-slate-400 group-hover:text-purple-500 mb-2" size={24} />
                                            <h4 className="font-semibold text-slate-800">Contactar Soporte</h4>
                                            <p className="text-xs text-slate-500 mt-1">Escríbenos directamente si tienes problemas con tu cuenta.</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Legal */}
                        {activeTab === 'legal' && (
                            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Términos y Condiciones</h3>
                                    <p className="text-slate-500 text-sm">Información legal y privacidad.</p>
                                </div>

                                <div className="prose prose-sm prose-slate max-w-none p-6 border border-slate-200 rounded-xl bg-slate-50 max-h-[60vh] overflow-y-auto">
                                    <h4>1. Recopilación de Datos</h4>
                                    <p>EneaTeams guarda los resultados del test de Eneagrama y check-ins emocionales para el propósito exclusivo de mapear la dinámica de tu equipo. Estos datos son confidenciales y están protegidos.</p>
                                    
                                    <h4>2. Uso de la Inteligencia Artificial</h4>
                                    <p>Las interacciones con la IA de EneaTeams se procesan mediante modelos de lenguaje avanzados. EneaTeams no entrena sus modelos directamente usando tu información personal específica de forma rastreable.</p>
                                    
                                    <h4>3. Privacidad en Equipos</h4>
                                    <p>Tu administrador puede ver tus estadísticas globales. Sin embargo, conversaciones privadas con la IA y check-ins individuales altamente sensibles están restringidos. EneaTeams es una herramienta de crecimiento profesional, no de evaluación punitiva.</p>
                                    
                                    <h4>4. Consentimiento</h4>
                                    <p>Al utilizar este software, accedes a que almacenemos tu estado anímico, tipos de Eneagrama deducidos, y métricas de desempeño auto-reportadas como fue explicitado anteriormente.</p>
                                </div>
                                <div className="flex gap-4 items-center bg-slate-100 p-4 rounded-lg text-sm text-slate-600">
                                    <Shield size={20} className="text-green-600" />
                                    <span>Tus datos están anonimizados y encriptados en tránsito (SSL/TLS).</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
