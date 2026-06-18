import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';

export const DashboardLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-[#FAF6F1] overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
