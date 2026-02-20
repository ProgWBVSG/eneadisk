
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const EntryLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
