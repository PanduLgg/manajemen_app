import React, { useState } from 'react';
import { Guru, UserRole } from '../../lib/types';
import { AppStorage } from '../../lib/storage';
import { maskSensitiveData } from '../../lib/calculations';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { PageHeader } from '../ui/PageHeader';

export interface GuruViewProps {
  currentRole: UserRole;
}

export const GuruView: React.FC<GuruViewProps> = ({ currentRole }) => {
  const [guruList] = useState<Guru[]>(() => AppStorage.getGuru());
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = guruList.filter(
    (g) =>
      g.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.mapel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.nik.includes(searchQuery)
  );

  const columns: ColumnDef<Guru>[] = [
    {
      key: 'row_num',
      header: 'No',
      type: 'row-number',
    },
    {
      key: 'nik',
      header: 'NIK / NIP',
      type: 'short-text',
      render: (g) => (
        <span className="font-medium text-[#2D2640] tabular-nums">
          {currentRole === 'guest' ? maskSensitiveData(g.nik) : g.nik}
        </span>
      ),
    },
    {
      key: 'nama',
      header: 'Nama Guru / Pegawai',
      type: 'main-text',
      render: (g) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#EEE4FA] text-[#8650C4] flex items-center justify-center text-xs font-semibold shrink-0">
            {g.nama.slice(0, 1)}
          </div>
          <div>
            <div className="font-medium text-[#2D2640] truncate max-w-[240px]">{g.nama}</div>
            <div className="text-xs text-[#6B6480]">
              {g.isWaliKelas ? `Wali Kelas: ${g.kelasWali}` : 'Guru Produktif'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'mapel',
      header: 'Mata Pelajaran Diampu',
      type: 'main-text',
      render: (g) => <span className="text-xs text-[#2D2640]">{g.mapel}</span>,
    },
    {
      key: 'hp',
      header: 'Kontak HP',
      type: 'short-text',
      render: (g) => (
        <span className="text-xs tabular-nums text-[#2D2640]">
          {currentRole === 'guest' ? maskSensitiveData(g.hp) : g.hp}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      type: 'status',
      render: (g) => (
        <Badge variant={g.isAktif ? 'success' : 'neutral'}>
          {g.isAktif ? 'AKTIF' : 'NONAKTIF'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Data Guru & Pegawai Produktif MPLB"
        description="Daftar tenaga pendidik kejuruan Manajemen Perkantoran dan Layanan Bisnis SMKS Ekonomika Depok."
      />

      <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-4">
        <input
          type="text"
          placeholder="Cari nama guru, NIP, atau mata pelajaran..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md h-[40px] px-3 text-sm bg-white border border-[#E6DFF1] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#8650C4]"
        />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(g) => g.id}
        emptyMessage="Data guru tidak ditemukan"
      />
    </div>
  );
};
