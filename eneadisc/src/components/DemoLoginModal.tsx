import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, X } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { getDemoUser, initializeDemoData } from '../utils/demoData';

interface DemoLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DemoLoginModal: React.FC<DemoLoginModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { login } = useAuth();

    if (!isOpen) return null;

    const handleDemoLogin = (role: 'owner' | 'employee') => {
        // Initialize demo data in localStorage
        initializeDemoData();

        // Get demo user
        const demoUser = getDemoUser(role);

        // Login with demo user
        login(demoUser);

        // Redirect to appropriate dashboard
        if (role === 'owner') {
            navigate('/dashboard/company');
        } else {
            navigate('/dashboard/employee');
        }

        // Close modal
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 animate-in fade-in zoom-in duration-300">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                    aria-label="Cerrar"
                >
                    <X size={24} className="text-slate-600" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">🧪</div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                        Sesión de Prueba
                    </h2>
                    <p className="text-slate-600">
                        Probá la aplicación sin necesidad de registrarte. Elegí tu rol:
                    </p>
                </div>

                {/* Role selection cards */}
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                    {/* Owner card */}
                    <div
                        onClick={() => handleDemoLogin('owner')}
                        className="group cursor-pointer bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Building2 size={32} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    Probar como Dueño
                                </h3>
                                <p className="text-sm text-slate-600 mb-3">
                                    María González
                                </p>
                                <p className="text-xs text-slate-500">
                                    Administra equipos, ve análisis y gestiona tu empresa
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDemoLogin('owner');
                                }}
                            >
                                Iniciar como Dueño
                            </Button>
                        </div>
                    </div>

                    {/* Employee card */}
                    <div
                        onClick={() => handleDemoLogin('employee')}
                        className="group cursor-pointer bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 hover:border-amber-400 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <User size={32} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    Probar como Empleado
                                </h3>
                                <p className="text-sm text-slate-600 mb-3">
                                    Juan Pérez
                                </p>
                                <p className="text-xs text-slate-500">
                                    Ve tu progreso, tareas y colabora con tu equipo
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                className="w-full bg-amber-600 hover:bg-amber-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDemoLogin('employee');
                                }}
                            >
                                Iniciar como Empleado
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Info footer */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-slate-700 text-center">
                        💡 <strong>Tip:</strong> El empleado Juan Pérez ya está integrado al equipo "Equipo Marketing" de María González.
                        Probá ambos roles para ver la conexión.
                    </p>
                </div>
            </div>
        </div>
    );
};
