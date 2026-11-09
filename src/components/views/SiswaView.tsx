import React, { useState } from 'react';
import {
  Plus,
  FileSpreadsheet,
  Download,
  Trash2,
  Edit2,
  Search,
  UploadCloud,
  CheckCircle2,
} from 'lucide-react';
import { Siswa, UserRole, StatusSiswa, TingkatKelas } from '../../lib/types';
import { AppStorage } from '../../lib/storage';
import { maskSensitiveData } from '../../lib/calculations';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { Modal, ConfirmModal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';

export interface SiswaViewProps {
  currentRole: UserRole;
}

export const SiswaView: React.FC<SiswaViewProps> = ({ currentRole }) => {
  const [siswaList, setSiswaList] = useState<Siswa[]>(() => AppStorage.getSiswa());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState<Siswa | null>(null);
  const [isMassDeleteConfirmOpen, setIsMassDeleteConfirmOpen] = useState(false);
  const [isSingleDeleteConfirmOpen, setIsSingleDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Form State
  const [formNis, setFormNis] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formJk, setFormJk] = useState<'L' | 'P'>('P');
  const [formKelas, setFormKelas] = useState('XI MPLB 1');
  const [formTingkat, setFormTingkat] = useState<TingkatKelas>(11);
  const [formHp, setFormHp] = useState('');
  const [formHpOrtu, setFormHpOrtu] = useState('');
  const [formStatus, setFormStatus] = useState<StatusSiswa>('aktif');

  const refreshData = () => {
    setSiswaList(AppStorage.getSiswa());
    setSelectedIds([]);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingSiswa(null);
    setFormNis(`2024${Math.floor(10000 + Math.random() * 90000)}`);
    setFormNisn(`008${Math.floor(1000000 + Math.random() * 9000000)}`);
    setFormNama('');
    setFormJk('P');
    setFormKelas('XI MPLB 1');
    setFormTingkat(11);
    setFormHp('0812');
    setFormHpOrtu('0813');
    setFormStatus('aktif');
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (siswa: Siswa) => {
    setEditingSiswa(siswa);
    setFormNis(siswa.nis);
    setFormNisn(siswa.nisn);
    setFormNama(siswa.nama);
    setFormJk(siswa.jenisKelamin);
    setFormKelas(siswa.kelas);
    setFormTingkat(siswa.tingkat);
    setFormHp(siswa.hp);
    setFormHpOrtu(siswa.hpOrtu);
    setFormStatus(siswa.status);
    setIsAddEditOpen(true);
  };

  // Submit Save
  const handleSaveSiswa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formNis.trim()) return;

    const newSiswa: Siswa = {
      id: editingSiswa ? editingSiswa.id : 's-' + Date.now(),
      nis: formNis.trim(),
      nisn: formNisn.trim(),
      nama: formNama.trim(),
      jenisKelamin: formJk,
      kelas: formKelas,
      tingkat: Number(formTingkat) as TingkatKelas,
      hp: formHp.trim(),
      hpOrtu: formHpOrtu.trim(),
      fotoUrl: editingSiswa?.fotoUrl || '',
      status: formStatus,
      tahunMasuk: editingSiswa ? editingSiswa.tahunMasuk : 2024,
    };

    AppStorage.saveSiswa(newSiswa);
    setIsAddEditOpen(false);
    refreshData();
  };

  // Delete Handlers
  const handleConfirmSingleDelete = () => {
    if (deleteTargetId) {
      AppStorage.deleteSiswa(deleteTargetId);
      refreshData();
      setDeleteTargetId(null);
    }
  };

  const handleConfirmMassDelete = () => {
    if (selectedIds.length > 0) {
      AppStorage.massDeleteSiswa(selectedIds);
      refreshData();
    }
  };

  // Quick Export to CSV
  const handleExportCsv = () => {
    const headers = ['No', 'NIS', 'NISN', 'Nama Siswa', 'JK', 'Kelas', 'Tingkat', 'No HP', 'Status'];
    const rows = filteredData.map((s, idx) => [
      idx + 1,
      s.nis,
      s.nisn,
      `"${s.nama}"`,
      s.jenisKelamin,
      `"${s.kelas}"`,
      s.tingkat,
      currentRole === 'guest' ? maskSensitiveData(s.hp) : s.hp,
      s.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Database_Siswa_MPLB_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sample batch import
  const handleSimulateImport = () => {
    const sampleBatch: Siswa[] = [
      {
        id: 'imp-' + Date.now() + '-1',
        nis: '202510091',
        nisn: '0081234591',
        nama: 'Lestari Indah Permata',
        jenisKelamin: 'P',
        kelas: 'X MPLB 1',
        tingkat: 10,
        hp: '081289998811',
        hpOrtu: '081399887711',
        fotoUrl: '',
        status: 'aktif',
        tahunMasuk: 2025,
      },
      {
        id: 'imp-' + Date.now() + '-2',
        nis: '202510092',
        nisn: '0081234592',
        nama: 'Muhammad Farhan',
        jenisKelamin: 'L',
        kelas: 'X MPLB 1',
        tingkat: 10,
        hp: '081289998812',
        hpOrtu: '081399887712',
        fotoUrl: '',
        status: 'aktif',
        tahunMasuk: 2025,
      },
    ];

    const result = AppStorage.importSiswaBatch(sampleBatch);
    setImportNotification(`Berhasil mengimpor ${result.success} siswa baru ke database MPLB.`);
    setTimeout(() => {
      setIsImportModalOpen(false);
      setImportNotification(null);
      refreshData();
    }, 1200);
  };

  // Filtered List
  const filteredData = siswaList.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery) ||
      s.nisn.includes(searchQuery);

    const matchKelas = filterKelas === 'semua' || s.kelas === filterKelas;
    const matchStatus = filterStatus === 'semua' || s.status === filterStatus;

    return matchSearch && matchKelas && matchStatus;
  });

  // Table Column Definitions
  const columns: ColumnDef<Siswa>[] = [
    {
      key: 'row_num',
      header: 'No',
      type: 'row-number',
    },
    {
      key: 'nis',
      header: 'NIS / NISN',
      type: 'short-text',
      render: (s) => (
        <div>
          <div className="font-medium text-[#2D2640]">{s.nis}</div>
          <div className="text-xs text-[#6B6480]">
            {currentRole === 'guest' ? maskSensitiveData(s.nisn) : s.nisn}
          </div>
        </div>
      ),
    },
    {
      key: 'nama',
      header: 'Nama Siswa',
      type: 'main-text',
      render: (s) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#EEE4FA] text-[#8650C4] flex items-center justify-center text-xs font-semibold shrink-0">
            {s.nama.slice(0, 1)}
          </div>
          <div>
            <div className="font-medium text-[#2D2640] truncate max-w-[240px]">{s.nama}</div>
            <div className="text-xs text-[#6B6480]">JK: {s.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-laki'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'kelas',
      header: 'Kelas / Tingkat',
      type: 'short-text',
      render: (s) => (
        <div>
          <div className="font-medium text-[#2D2640]">{s.kelas}</div>
          <div className="text-xs text-[#6B6480]">Tingkat {s.tingkat}</div>
        </div>
      ),
    },
    {
      key: 'hp',
      header: 'Kontak HP',
      type: 'short-text',
      render: (s) => (
        <div className="text-xs tabular-nums text-[#2D2640]">
          {currentRole === 'guest' ? maskSensitiveData(s.hp) : s.hp}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      type: 'status',
      render: (s) => {
        const variant =
          s.status === 'aktif' ? 'success' : s.status === 'lulus' ? 'info' : 'warning';
        return <Badge variant={variant}>{s.status.toUpperCase()}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Aksi',
      type: 'actions',
      render: (s) => {
        if (currentRole === 'guest') {
          return <span className="text-xs text-[#A69FB8]">Read-only</span>;
        }
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => handleOpenEdit(s)}
              aria-label={`Ubah data ${s.nama}`}
              className="p-1.5 text-[#6B6480] hover:text-[#8650C4] hover:bg-[#FAF8FD] rounded"
              title="Ubah Siswa"
            >
              <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            {currentRole === 'admin' && (
              <button
                onClick={() => {
                  setDeleteTargetId(s.id);
                  setIsSingleDeleteConfirmOpen(true);
                }}
                aria-label={`Hapus data ${s.nama}`}
                className="p-1.5 text-[#6B6480] hover:text-[#B4303C] hover:bg-[#FAF8FD] rounded"
                title="Hapus Siswa"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Database Siswa MPLB"
        description="Kelola data siswa jurusan Manajemen Perkantoran dan Layanan Bisnis SMKS Ekonomika Depok."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              icon={<Download className="w-4 h-4" strokeWidth={1.5} />}
            >
              Export CSV
            </Button>
            {currentRole === 'admin' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImportModalOpen(true)}
                  icon={<FileSpreadsheet className="w-4 h-4" strokeWidth={1.5} />}
                >
                  Import Excel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAdd}
                  icon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
                >
                  Tambah Siswa
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Filters Bar */}
      <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B6480] absolute left-3 top-3 pointer-events-none" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Cari nama, NIS, atau NISN siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[40px] pl-9 pr-3 text-sm bg-white border border-[#E6DFF1] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#8650C4]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3">
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            aria-label="Filter berdasarkan kelas"
            className="h-[40px] px-3 text-sm bg-white border border-[#E6DFF1] rounded-[6px] text-[#2D2640] focus:ring-2 focus:ring-[#8650C4]"
          >
            <option value="semua">Semua Kelas</option>
            <option value="X MPLB 1">X MPLB 1</option>
            <option value="XI MPLB 1">XI MPLB 1</option>
            <option value="XI MPLB 2">XI MPLB 2</option>
            <option value="XII MPLB 1">XII MPLB 1</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter berdasarkan status siswa"
            className="h-[40px] px-3 text-sm bg-white border border-[#E6DFF1] rounded-[6px] text-[#2D2640] focus:ring-2 focus:ring-[#8650C4]"
          >
            <option value="semua">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="lulus">Lulus</option>
            <option value="pindah">Pindah</option>
            <option value="keluar">Keluar</option>
          </select>
        </div>
      </div>

      {/* Main DataTable with Mass Delete Bulk Action */}
      <DataTable
        data={filteredData}
        columns={columns}
        rowKey={(s) => s.id}
        selectedIds={selectedIds}
        onSelectRow={(id) => {
          setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
          );
        }}
        onSelectAll={(selectAll) => {
          setSelectedIds(selectAll ? filteredData.map((s) => s.id) : []);
        }}
        bulkActions={
          currentRole === 'admin' ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsMassDeleteConfirmOpen(true)}
              icon={<Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
            >
              Hapus Massal ({selectedIds.length})
            </Button>
          ) : undefined
        }
        emptyMessage="Tidak ada data siswa ditemukan"
        emptyActionLabel={currentRole === 'admin' ? 'Tambah Siswa Pertama' : undefined}
        onEmptyAction={currentRole === 'admin' ? handleOpenAdd : undefined}
      />

      {/* Add / Edit Siswa Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={editingSiswa ? 'Ubah Data Siswa MPLB' : 'Tambah Siswa Baru MPLB'}
        description="Pastikan data NIS dan identitas siswa sesuai dengan buku induk sekolah."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSiswa} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="NIS"
              required
              value={formNis}
              onChange={(e) => setFormNis(e.target.value)}
              placeholder="Contoh: 202410012"
            />
            <Input
              label="NISN"
              required
              value={formNisn}
              onChange={(e) => setFormNisn(e.target.value)}
              placeholder="Contoh: 0078129401"
            />
          </div>

          <Input
            label="Nama Lengkap Siswa"
            required
            value={formNama}
            onChange={(e) => setFormNama(e.target.value)}
            placeholder="Nama lengkap sesuai akta / ijazah"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Jenis Kelamin"
              required
              value={formJk}
              onChange={(e) => setFormJk(e.target.value as 'L' | 'P')}
            >
              <option value="P">Perempuan</option>
              <option value="L">Laki-laki</option>
            </Select>

            <Select
              label="Kelas"
              required
              value={formKelas}
              onChange={(e) => {
                const k = e.target.value;
                setFormKelas(k);
                setFormTingkat(k.startsWith('X ') ? 10 : k.startsWith('XI ') ? 11 : 12);
              }}
            >
              <option value="X MPLB 1">X MPLB 1</option>
              <option value="XI MPLB 1">XI MPLB 1</option>
              <option value="XI MPLB 2">XI MPLB 2</option>
              <option value="XII MPLB 1">XII MPLB 1</option>
            </Select>

            <Select
              label="Status Siswa"
              required
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as StatusSiswa)}
            >
              <option value="aktif">Aktif</option>
              <option value="lulus">Lulus</option>
              <option value="pindah">Pindah</option>
              <option value="keluar">Keluar</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nomor WhatsApp / HP Siswa"
              value={formHp}
              onChange={(e) => setFormHp(e.target.value)}
              placeholder="Contoh: 081289123411"
            />
            <Input
              label="Nomor HP Orang Tua / Wali"
              value={formHpOrtu}
              onChange={(e) => setFormHpOrtu(e.target.value)}
              placeholder="Contoh: 081399812400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6DFF1]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddEditOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Data Siswa
            </Button>
          </div>
        </form>
      </Modal>

      {/* Single Delete Confirmation */}
      <ConfirmModal
        isOpen={isSingleDeleteConfirmOpen}
        onClose={() => setIsSingleDeleteConfirmOpen(false)}
        onConfirm={handleConfirmSingleDelete}
        title="Hapus Data Siswa"
        message="Apakah Anda yakin ingin menghapus data siswa ini? Data akan disimpan dalam arsip soft delete."
        isDestructive
        confirmLabel="Hapus Siswa"
      />

      {/* Mass Delete Confirmation */}
      <ConfirmModal
        isOpen={isMassDeleteConfirmOpen}
        onClose={() => setIsMassDeleteConfirmOpen(false)}
        onConfirm={handleConfirmMassDelete}
        title="Konfirmasi Hapus Massal"
        message={`Apakah Anda yakin ingin menghapus ${selectedIds.length} data siswa terpilih sekaligus? Tindakan ini akan mencatat aktivitas ke sistem log.`}
        isDestructive
        confirmLabel={`Hapus ${selectedIds.length} Siswa`}
      />

      {/* Import Wizard Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Data Siswa dari Excel / CSV"
        description="Unggah file data siswa dengan format kolom: NIS, NISN, Nama, JK, Kelas, HP."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-6 border-2 border-dashed border-[#DEC9F5] rounded-[8px] bg-[#FAF8FD] text-center flex flex-col items-center justify-center">
            <UploadCloud className="w-10 h-10 text-[#8650C4] mb-2" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[#2D2640]">Pilih berkas Excel (.xlsx / .csv)</p>
            <p className="text-xs text-[#6B6480] mt-1">Ukuran file maksimal 5 MB</p>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={handleSimulateImport}>
                Simulasikan Upload & Validasi Batch
              </Button>
            </div>
          </div>

          {importNotification && (
            <div className="p-3 bg-[#E3F6EC] border border-[#1F7A4D]/20 rounded-[6px] text-xs text-[#1F7A4D] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>{importNotification}</span>
            </div>
          )}

          <div className="text-xs text-[#6B6480] bg-white border border-[#E6DFF1] p-3 rounded-[6px]">
            <p className="font-semibold text-[#2D2640] mb-1">Panduan Format Template:</p>
            <p>1. NIS dan NISN tidak boleh duplikat dengan siswa aktif.</p>
            <p>2. Format kelas harus valid: X MPLB 1, XI MPLB 1, XI MPLB 2, atau XII MPLB 1.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
