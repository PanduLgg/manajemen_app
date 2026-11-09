import React, { useState } from 'react';
import { History, Shield, Search } from 'lucide-react';
import { ActivityLog } from '../../lib/types';
import { AppStorage } from '../../lib/storage';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { Badge } from '../ui/Badge';
import { PageHeader } from '../ui/PageHeader';

export const LogsView: React.FC = () => {
  const [logs] = useState<ActivityLog[]>(() => AppStorage.getLogs());
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = logs.filter(
    (l) =>
      l.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.entitas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.aksi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<ActivityLog>[] = [
    { key: 'row_num', header: 'No', type: 'row-number' },
    {
      key: 'waktu',
      header: 'Waktu Aksi',
      type: 'short-text',
      render: (l) => <span className="text-xs text-[#6B6480] tabular-nums">{l.waktu}</span>,
    },
    {
      key: 'userName',
      header: 'Pengguna & Peran',
      type: 'short-text',
      render: (l) => (
        <div>
          <div className="font-semibold text-xs text-[#2D2640]">{l.userName}</div>
          <div className="text-[11px] text-[#8650C4] uppercase font-bold">{l.role}</div>
        </div>
      ),
    },
    {
      key: 'aksi',
      header: 'Tindakan',
      type: 'status',
      render: (l) => {
        const variant =
          l.aksi === 'delete'
            ? 'danger'
            : l.aksi === 'create'
            ? 'success'
            : l.aksi === 'verify' || l.aksi === 'disposisi'
            ? 'primary'
            : 'neutral';
        return <Badge variant={variant}>{l.aksi.toUpperCase()}</Badge>;
      },
    },
    {
      key: 'entitas',
      header: 'Modul / Entitas',
      type: 'short-text',
      render: (l) => <span className="font-medium text-xs text-[#2D2640]">{l.entitas}</span>,
    },
    {
      key: 'deskripsi',
      header: 'Keterangan Audit Trail',
      type: 'main-text',
      render: (l) => <span className="text-xs text-[#6B6480]">{l.deskripsi}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Log Aktivitas & Audit Trail Sistem"
        description="Pencatatan kronologis seluruh operasi tulis, persetujuan disposisi, transaksi keuangan, dan perubahan data."
      />

      <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-4">
        <input
          type="text"
          placeholder="Cari dalam catatan log aktivitas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md h-[40px] px-3 text-sm bg-white border border-[#E6DFF1] rounded-[6px] focus:ring-2 focus:ring-[#8650C4]"
        />
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(l) => l.id}
        emptyMessage="Belum ada riwayat log aktivitas"
      />
    </div>
  );
};
