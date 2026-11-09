import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarCheck,
  Briefcase,
  FileText,
  Archive,
  Package,
  Plane,
  Receipt,
  History,
  X,
} from 'lucide-react';
import { UserRole } from '../../lib/types';

export type NavTabId =
  | 'dashboard'
  | 'siswa'
  | 'guru'
  | 'absensi'
  | 'pkl'
  | 'surat'
  | 'arsip'
  | 'inventaris'
  | 'sppd'
  | 'petty-cash'
  | 'logs';

export interface SidebarProps {
  currentTab: NavTabId;
  onTabChange: (tab: NavTabId) => void;
  currentRole: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface MenuItem {
  id: NavTabId;
  label: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentRole,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const employeeItems: MenuItem[] = [
    {
      id: 'siswa',
      label: 'Database Siswa',
      icon: <Users className="w-5 h-5 shrink-0" strokeWidth={1.5} />,
    },
    {
      id: 'guru',
      label: 'Data Guru & Pegawai',
      icon: <UserCheck className="w-5 h-5 shrink-0" strokeWidth={1.5} />,
      allowedRoles: ['admin', 'guru'],
    },
    {
      id: 'absensi',
      label: 'Absensi & Izin',
      icon: <CalendarCheck className="w-5 h-5 shrink-0" strokeWidth={1.5} />,
    },
    {
      id: 'pkl',
      label: 'Monitoring PKL',
      icon: <Briefcase className="w-5 h-5 shrink-0" strokeWidth={1.5} />,
    },
  ];

  const pembelajaranItems: MenuItem[] = [
    {
      id: 'surat',
      label: 'Dokumen & Surat Alur',
      icon: <FileText className="w-5 h-5 shrink-0" strokeWidth={1.5} />,
    },
    {
      id: 'arsip',
      label: 'Arsip Digital',
      icon: <Archive className="w-5 h-5 shrink-0" strokeWidth={1.5} />,
    },
    {
      id: 'inventaris',
      label: 'Inventarisasi Barang',
      icon: <Package className="w-5 h-5 shrink-0" strokeWidth={1.5} />,
    },
    {
      id: 'sppd',
      label: 'Perjalanan Dinas',
      icon: <Plane className="w-5 h-5 shrink-0" strokeWidth={1.5} />,
      allowedRoles: ['admin', 'guru'],
    },
    {
      id: 'petty-cash',
      label: 'Kas Kecil (Petty Cash)',
      icon: <Receipt className="w-5 h-5 shrink-0" strokeWidth={1.5} />,
      allowedRoles: ['admin', 'guru', 'guest'],
    },
    {
      id: 'logs',
      label: 'Log Aktivitas',
      icon: <History className="w-5 h-5 shrink-0" strokeWidth={1.5} />,
      allowedRoles: ['admin'],
    },
  ];

  const filterItem = (item: MenuItem) => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(currentRole);
  };

  const renderNavButton = (item: MenuItem) => {
    const isActive = currentTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => {
          onTabChange(item.id);
          if (onCloseMobile) onCloseMobile();
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-[6px] transition-colors relative cursor-pointer ${
          isActive
            ? 'bg-[#EEE4FA] text-[#6D3FA6] font-semibold'
            : 'text-[#6B6480] hover:text-[#2D2640] hover:bg-[#FAF8FD]'
        }`}
      >
        {/* Left vertical active bar */}
        {isActive && (
          <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#8650C4] rounded-r" />
        )}
        {item.icon}
        <span className="truncate">{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#2D2640]/45 z-40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-[256px] bg-white border-r border-[#E6DFF1] flex flex-col z-40 transition-transform duration-200 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand in Sidebar */}
        <div className="h-[56px] px-4 flex items-center justify-between border-b border-[#E6DFF1]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#8650C4] text-white flex items-center justify-center font-bold text-xs">
              M
            </div>
            <div>
              <span className="font-semibold text-sm text-[#2D2640] block leading-tight">
                Portal MPLB
              </span>
              <span className="text-[11px] text-[#6B6480] block leading-tight">
                SMKS Ekonomika
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 text-[#6B6480] hover:text-[#2D2640]"
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Dashboard item */}
          <div className="space-y-1">
            {renderNavButton({
              id: 'dashboard',
              label: 'Dashboard Utama',
              icon: <LayoutDashboard className="w-5 h-5 shrink-0" strokeWidth={1.5} />,
            })}
          </div>

          {/* Section: EMPLOYEE (Administrasi) */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-[#6B6480] uppercase">
              EMPLOYEE
            </div>
            {employeeItems.filter(filterItem).map(renderNavButton)}
          </div>

          {/* Section: PEMBELAJARAN */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-[#6B6480] uppercase">
              PEMBELAJARAN
            </div>
            {pembelajaranItems.filter(filterItem).map(renderNavButton)}
          </div>
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 border-t border-[#E6DFF1] bg-[#FAF8FD] text-[11px] text-[#6B6480]">
          <p className="font-medium text-[#2D2640]">T.A. 2026/2027 · Ganjil</p>
          <p className="mt-0.5">Jurusan Manajemen Perkantoran</p>
        </div>
      </aside>
    </>
  );
};
