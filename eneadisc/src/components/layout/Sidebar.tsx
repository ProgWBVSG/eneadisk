import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, TrendingUp, Bot, CheckSquare, Users, ClipboardCheck, BarChart3, BookOpen, CreditCard, LogOut, Menu, X } from 'lucide-react';

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const isEmployee = user?.role === 'employee';

    const employeeItems = [
        { icon: Home, label: 'Mi Perfil ENEADISC', path: '/dashboard/employee' },
        { icon: TrendingUp, label: 'Mi Progreso', path: '/dashboard/employee/progreso' },
        { icon: Bot, label: 'Mi Asistente Personal', path: '/dashboard/employee/asistente' },
        { icon: CheckSquare, label: 'Mis Tareas', path: '/dashboard/employee/tareas' },
        { icon: Users, label: 'Mi Equipo', path: '/dashboard/employee/equipo' },
        { icon: ClipboardCheck, label: 'Check-ins', path: '/dashboard/employee/checkins' },
    ];

    const adminItems = [
        { icon: Home, label: 'Panel Principal', path: '/dashboard/company' },
        { icon: Users, label: 'Gestión de Equipos', path: '/dashboard/company/equipos' },
        { icon: BarChart3, label: 'Análisis y Gráficos', path: '/dashboard/company/analisis' },
        { icon: Bot, label: 'Asistente IA', path: '/dashboard/company/asistente' },
        { icon: BookOpen, label: 'Biblioteca Eneatipos', path: '/dashboard/company/biblioteca' },
        { icon: TrendingUp, label: 'Seguimiento', path: '/dashboard/company/seguimiento' },
        { icon: CreditCard, label: 'Suscripción', path: '/dashboard/company/suscripcion' },
    ];

    const menuItems = isEmployee ? employeeItems : adminItems;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobile}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
            >
                {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300`}
            >
                {/* Logo */}
                <div className="p-6 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-purple-600">ENEADISC</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        {isEmployee ? 'Panel del Colaborador' : 'Panel de Administrador'}
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <li key={item.path}>
                                    <button
                                        onClick={() => {
                                            navigate(item.path);
                                            setIsMobileOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                                ? 'bg-purple-50 text-purple-600 font-medium'
                                                : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="text-sm">{item.label}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-bold text-lg">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'Usuario'}</p>
                            <p className="text-xs text-slate-500 truncate">{isEmployee ? 'Colaborador' : 'Administrador'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    onClick={toggleMobile}
                    className="md:hidden fixed inset-0 bg-black/50 z-30"
                />
            )}
        </>
    );
};
