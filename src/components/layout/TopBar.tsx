import React from 'react';
import { UserRole, UserProfile } from '../../lib/types';
import { USERS_DATA } from '../../lib/mock-data';
import { RefreshCw, UserCheck, Shield, GraduationCap, Eye, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

export interface TopBarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetData: () => void;
  onToggleMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentRole,
  onRoleChange,
  onResetData,
  onToggleMobileMenu,
}) => {
  const profile: UserProfile = USERS_DATA[currentRole];

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3.5 h-3.5 text-[#8650C4]" strokeWidth={1.5} />;
      case 'guru':
        return <UserCheck className="w-3.5 h-3.5 text-[#1F7A4D]" strokeWidth={1.5} />;
      case 'siswa':
        return <GraduationCap className="w-3.5 h-3.5 text-[#2F5FB3]" strokeWidth={1.5} />;
      case 'guest':
        return <Eye className="w-3.5 h-3.5 text-[#6B6480]" strokeWidth={1.5} />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Kepala Program (Admin)';
      case 'guru':
        return 'Guru Produktif';
      case 'siswa':
        return 'Siswa MPLB';
      case 'guest':
        return 'Tamu (Read-Only)';
    }
  };

  return (
    <header className="h-[56px] bg-white border-b border-[#E6DFF1] px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Brand Context */}
      <div className="flex items-center gap-2 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-1.5 text-[#6B6480] hover:text-[#2D2640] hover:bg-[#FAF8FD] rounded-[6px] shrink-0"
            aria-label="Buka menu navigasi"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-sm text-[#2D2640] tracking-tight truncate">
            SMKS Ekonomika
          </span>
          <span className="px-1.5 py-0.5 text-[11px] font-semibold rounded bg-[#EEE4FA] text-[#6D3FA6] shrink-0">
            MPLB
          </span>
        </div>
      </div>

      {/* Right: Role Switcher & User Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Demo Reset for desktop */}
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetData}
            title="Reset database ke data sampel awal"
            className="text-xs shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Reset Sampel</span>
          </Button>
        </div>

        {/* Mobile Role Select Dropdown for < 640px */}
        <div className="sm:hidden">
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as UserRole)}
            aria-label="Pilih peran pengguna"
            className="h-[32px] px-2 text-xs font-semibold rounded-[6px] bg-[#FAF8FD] border border-[#DEC9F5] text-[#8650C4]"
          >
            <option value="admin">Admin</option>
            <option value="guru">Guru</option>
            <option value="siswa">Siswa</option>
            <option value="guest">Tamu</option>
          </select>
        </div>

        {/* Role Switcher Pill Bar for sm and above */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-[#FAF8FD] border border-[#E6DFF1] rounded-[6px]">
          <span className="text-xs text-[#6B6480] px-1 hidden md:inline font-medium">
            Peran:
          </span>
          {(['admin', 'guru', 'siswa', 'guest'] as UserRole[]).map((r) => {
            const isActive = currentRole === r;
            return (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                aria-pressed={isActive}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-[4px] transition-colors ${
                  isActive
                    ? 'bg-white text-[#8650C4] shadow-xs border border-[#DEC9F5]'
                    : 'text-[#6B6480] hover:text-[#2D2640] hover:bg-white/50'
                }`}
                title={`Ganti peran ke ${getRoleLabel(r)}`}
              >
                {getRoleIcon(r)}
                <span className="capitalize">{r}</span>
              </button>
            );
          })}
        </div>

        {/* Current User Label */}
        <div className="hidden xl:flex flex-col text-right pl-2 border-l border-[#E6DFF1]">
          <span className="text-xs font-semibold text-[#2D2640] truncate max-w-[160px]">
            {profile.name}
          </span>
          <span className="text-[11px] text-[#6B6480]">
            {profile.kelas || (profile.nipNik ? `NIP: ${profile.nipNik.slice(0, 8)}...` : 'Tamu Pengunjung')}
          </span>
        </div>
      </div>
    </header>
  );
};
