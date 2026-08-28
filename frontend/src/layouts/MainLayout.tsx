import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>

        {/* Global Footer with Medical Disclaimer */}
        <footer className="border-t border-slate-800/80 bg-slate-900/40 p-6 mt-12">
          <div className="max-w-7xl mx-auto space-y-4">
            <MedicalDisclaimer compact={false} />
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60">
              <p>© 2025 NutriFit AI • AI-Powered Personalized Diet & Workout Recommendation System</p>
              <p className="mt-2 sm:mt-0 font-mono">Final Year Demonstration Build v1.0</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
