import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';

export const DashboardLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-[#FAF6F1] overflow-hidden">
            <Sidebar />
            {/* pt en móvil para que el contenido no quede debajo del botón de menú (☰) */}
            <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
                <Outlet />
            </main>
        </div>
    );
};
