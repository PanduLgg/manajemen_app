import React, { useState } from 'react';
import { UserRole } from './lib/types';
import { AppStorage } from './lib/storage';
import { Sidebar, NavTabId } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DashboardView } from './components/views/DashboardView';
import { SiswaView } from './components/views/SiswaView';
import { GuruView } from './components/views/GuruView';
import { AbsensiView } from './components/views/AbsensiView';
import { PklView } from './components/views/PklView';
import { SuratWorkflowView } from './components/views/SuratWorkflowView';
import { ArsipDigitalView } from './components/views/ArsipDigitalView';
import { InventarisView } from './components/views/InventarisView';
import { PerjalananDinasView } from './components/views/PerjalananDinasView';
import { PettyCashView } from './components/views/PettyCashView';
import { LogsView } from './components/views/LogsView';
import { ConfirmModal } from './components/ui/Modal';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => AppStorage.getCurrentRole());
  const [currentTab, setCurrentTab] = useState<NavTabId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Handle role switch
  const handleRoleChange = (role: UserRole) => {
    AppStorage.setCurrentRole(role);
    setCurrentRole(role);
  };

  // Handle demo data reset
  const handleResetData = () => {
    AppStorage.resetAllData();
    window.location.reload();
  };

  // Render current tab view
  const renderCurrentView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentTab} currentRole={currentRole} />;
      case 'siswa':
        return <SiswaView currentRole={currentRole} />;
      case 'guru':
        return <GuruView currentRole={currentRole} />;
      case 'absensi':
        return <AbsensiView currentRole={currentRole} />;
      case 'pkl':
        return <PklView currentRole={currentRole} />;
      case 'surat':
        return <SuratWorkflowView currentRole={currentRole} onViewArsip={() => setCurrentTab('arsip')} />;
      case 'arsip':
        return <ArsipDigitalView currentRole={currentRole} />;
      case 'inventaris':
        return <InventarisView currentRole={currentRole} />;
      case 'sppd':
        return <PerjalananDinasView currentRole={currentRole} />;
      case 'petty-cash':
        return <PettyCashView currentRole={currentRole} />;
      case 'logs':
        return <LogsView />;
      default:
        return <DashboardView onNavigate={setCurrentTab} currentRole={currentRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FD] flex flex-col font-sans text-[#2D2640]">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentRole={currentRole}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area (offset by 256px on lg screens) */}
      <div className="lg:pl-[256px] flex flex-col flex-1 min-h-screen min-w-0 overflow-x-hidden">
        {/* Top Header Bar */}
        <TopBar
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          onResetData={() => setIsResetConfirmOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto min-w-0">
          {renderCurrentView()}
        </main>

        {/* Quiet Footer */}
        <footer className="h-12 border-t border-[#E6DFF1] bg-white px-6 flex items-center justify-between text-xs text-[#6B6480] mt-auto">
          <span>SMKS Ekonomika Depok · Jurusan MPLB</span>
          <span className="hidden sm:inline">Sistem Digitalisasi Pembelajaran & Administrasi Perkantoran</span>
        </footer>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetData}
        title="Reset Data Sampel"
        message="Apakah Anda yakin ingin mengatur ulang semua data ke sampel awal? Perubahan lokal Anda pada data siswa, surat, dan kas kecil akan dikembalikan ke kondisi default."
        confirmLabel="Reset Sekarang"
        isDestructive
      />
    </div>
  );
}
