import React, { useState } from 'react';
import {
  Package,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
} from 'lucide-react';
import { InventarisBarang, PeminjamanBarang, UserRole } from '../../lib/types';
import { AppStorage } from '../../lib/storage';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';

export interface InventarisViewProps {
  currentRole: UserRole;
}

export const InventarisView: React.FC<InventarisViewProps> = ({ currentRole }) => {
  const [activeTab, setActiveTab] = useState<'daftar' | 'peminjaman'>('daftar');
  const [barangList, setBarangList] = useState<InventarisBarang[]>(() => AppStorage.getInventaris());
  const [peminjamanList, setPeminjamanList] = useState<PeminjamanBarang[]>(() => AppStorage.getPeminjaman());

  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState('semua');

  // Add Item Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formKode, setFormKode] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formKategori, setFormKategori] = useState<InventarisBarang['kategori']>('Peralatan Kantor');
  const [formJumlah, setFormJumlah] = useState(1);
  const [formKondisi, setFormKondisi] = useState<InventarisBarang['kondisi']>('Baik');
  const [formLokasi, setFormLokasi] = useState('Lab Kearsipan Digital');
  const [formKet, setFormKet] = useState('');

  // Pinjam Modal
  const [isPinjamOpen, setIsPinjamOpen] = useState(false);
  const [pinjamBarangId, setPinjamBarangId] = useState(barangList[0]?.id || '');
  const [pinjamNama, setPinjamNama] = useState('');
  const [pinjamRole, setPinjamRole] = useState<'Siswa' | 'Guru'>('Siswa');
  const [pinjamKelas, setPinjamKelas] = useState('XI MPLB 1');
  const [pinjamJumlah, setPinjamJumlah] = useState(1);
  const [pinjamKembaliRencana, setPinjamKembaliRencana] = useState(
    new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [pinjamKeperluan, setPinjamKeperluan] = useState('');
  const [pinjamError, setPinjamError] = useState<string | null>(null);

  const refreshData = () => {
    setBarangList(AppStorage.getInventaris());
    setPeminjamanList(AppStorage.getPeminjaman());
  };

  // Submit Add Item
  const handleSaveBarang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formKode.trim()) return;

    AppStorage.saveInventaris({
      id: 'inv-' + Date.now(),
      kodeBarang: formKode.trim(),
      namaBarang: formNama.trim(),
      kategori: formKategori,
      jumlah: Number(formJumlah),
      tersedia: Number(formJumlah),
      kondisi: formKondisi,
      lokasi: formLokasi.trim(),
      tglPengadaan: new Date().toISOString().split('T')[0],
      keterangan: formKet.trim() || 'Peralatan operasional praktikum perkantoran.',
    });

    setIsAddOpen(false);
    refreshData();
  };

  // Submit Pinjam
  const handleConfirmPinjam = (e: React.FormEvent) => {
    e.preventDefault();
    setPinjamError(null);

    const target = barangList.find((b) => b.id === pinjamBarangId);
    if (!target) return;

    if (pinjamJumlah > target.tersedia) {
      setPinjamError(`Stok tidak mencukupi. Hanya tersedia ${target.tersedia} unit.`);
      return;
    }

    try {
      AppStorage.pinjamBarang({
        barangId: target.id,
        namaBarang: target.namaBarang,
        peminjamNama: pinjamNama.trim(),
        peminjamRole: pinjamRole,
        peminjamKelas: pinjamRole === 'Siswa' ? pinjamKelas : undefined,
        jumlah: pinjamJumlah,
        tglPinjam: new Date().toISOString().split('T')[0],
        tglKembaliRencana: pinjamKembaliRencana,
        keperluan: pinjamKeperluan.trim() || 'Praktikum kejuruan',
      });
      setIsPinjamOpen(false);
      refreshData();
    } catch (err: any) {
      setPinjamError(err.message || 'Gagal meminjam barang.');
    }
  };

  // Kembalikan Barang
  const handleKembalikan = (pinjamId: string) => {
    AppStorage.kembalikanBarang(pinjamId);
    refreshData();
  };

  // Filtered Barang
  const filteredBarang = barangList.filter((b) => {
    const matchSearch =
      b.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.kodeBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.lokasi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === 'semua' || b.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  const columnsBarang: ColumnDef<InventarisBarang>[] = [
    { key: 'row_num', header: 'No', type: 'row-number' },
    {
      key: 'kodeBarang',
      header: 'Kode Sarpras',
      type: 'short-text',
      render: (b) => <span className="font-bold text-xs text-[#2D2640]">{b.kodeBarang}</span>,
    },
    {
      key: 'namaBarang',
      header: 'Nama Barang & Spesifikasi',
      type: 'main-text',
      render: (b) => (
        <div>
          <div className="font-medium text-xs text-[#2D2640] truncate max-w-[280px]">{b.namaBarang}</div>
          <div className="text-[11px] text-[#6B6480]">Lokasi: {b.lokasi}</div>
        </div>
      ),
    },
    {
      key: 'kategori',
      header: 'Kategori',
      type: 'short-text',
      render: (b) => <span className="text-xs text-[#6B6480]">{b.kategori}</span>,
    },
    {
      key: 'jumlah',
      header: 'Tersedia / Total',
      type: 'amount',
      render: (b) => (
        <span className="font-bold tabular-nums text-xs">
          <span className={b.tersedia > 0 ? 'text-[#1F7A4D]' : 'text-[#B4303C]'}>{b.tersedia}</span> / {b.jumlah} Unit
        </span>
      ),
    },
    {
      key: 'kondisi',
      header: 'Kondisi',
      type: 'status',
      render: (b) => (
        <Badge variant={b.kondisi === 'Baik' ? 'success' : b.kondisi === 'Rusak Ringan' ? 'warning' : 'danger'}>
          {b.kondisi.toUpperCase()}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Inventarisasi Barang & Sarana Lab MPLB"
        description="Pencatatan sarana prasarana laboratorium perkantoran, peminjaman peralatan praktikum, dan status kondisi alat."
        action={
          currentRole !== 'guest' ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPinjamNama(currentRole === 'siswa' ? 'Anisa Rahmawati' : 'Hendra Gunawan, S.Pd.');
                  setIsPinjamOpen(true);
                }}
                icon={<ArrowRightLeft className="w-3.5 h-3.5" strokeWidth={1.5} />}
              >
                Pinjam Peralatan
              </Button>
              {currentRole === 'admin' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setFormKode(`MPLB-EQ-${Math.floor(100 + Math.random() * 900)}`);
                    setIsAddOpen(true);
                  }}
                  icon={<Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
                >
                  Tambah Barang
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="w-full overflow-x-auto pb-1">
        <div className="inline-flex items-center gap-1 p-1 bg-white border border-[#E6DFF1] rounded-[8px] min-w-max">
          <button
            onClick={() => setActiveTab('daftar')}
            className={`px-4 py-1.5 text-sm font-medium rounded-[6px] transition-colors cursor-pointer ${
              activeTab === 'daftar'
                ? 'bg-[#EEE4FA] text-[#6D3FA6] font-semibold'
                : 'text-[#6B6480] hover:text-[#2D2640]'
            }`}
          >
            Daftar Sarana Prasarana
          </button>
          <button
            onClick={() => setActiveTab('peminjaman')}
            className={`px-4 py-1.5 text-sm font-medium rounded-[6px] transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'peminjaman'
                ? 'bg-[#EEE4FA] text-[#6D3FA6] font-semibold'
                : 'text-[#6B6480] hover:text-[#2D2640]'
            }`}
          >
            <span>Riwayat Peminjaman</span>
            {peminjamanList.filter((p) => p.status === 'Dipinjam').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#8650C4] text-white text-xs flex items-center justify-center font-bold">
                {peminjamanList.filter((p) => p.status === 'Dipinjam').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'daftar' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#6B6480] absolute left-3 top-3 pointer-events-none" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Cari nama barang, kode, atau lokasi ruangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[40px] pl-9 pr-3 text-sm bg-white border border-[#E6DFF1] rounded-[6px] focus:ring-2 focus:ring-[#8650C4]"
              />
            </div>

            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              aria-label="Filter kategori sarpras"
              className="h-[40px] px-3 text-sm bg-white border border-[#E6DFF1] rounded-[6px] text-[#2D2640]"
            >
              <option value="semua">Semua Kategori</option>
              <option value="Peralatan Kantor">Peralatan Kantor</option>
              <option value="Komputer & IT">Komputer & IT</option>
              <option value="Perabot Kantor">Perabot Kantor</option>
            </select>
          </div>

          <DataTable
            data={filteredBarang}
            columns={columnsBarang}
            rowKey={(b) => b.id}
            emptyMessage="Data barang inventaris tidak ditemukan"
          />
        </div>
      )}

      {activeTab === 'peminjaman' && (
        <div className="divide-y divide-[#E6DFF1] bg-white border border-[#E6DFF1] rounded-[8px]">
          {peminjamanList.map((p) => (
            <div key={p.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#2D2640]">{p.namaBarang}</span>
                  <Badge variant={p.status === 'Dipinjam' ? 'warning' : 'success'}>
                    {p.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-[#6B6480] tabular-nums">({p.jumlah} Unit)</span>
                </div>
                <p className="text-xs text-[#2D2640]">
                  Peminjam: <strong>{p.peminjamNama}</strong> ({p.peminjamRole} {p.peminjamKelas && `· ${p.peminjamKelas}`})
                </p>
                <p className="text-xs text-[#6B6480]">
                  Tgl Pinjam: {p.tglPinjam} · Rencana Kembali: {p.tglKembaliRencana}
                  {p.tglKembaliAktual && ` · Dikembalikan: ${p.tglKembaliAktual}`}
                </p>
                <p className="text-xs text-[#6B6480] italic">Keperluan: {p.keperluan}</p>
              </div>

              {p.status === 'Dipinjam' && currentRole !== 'guest' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleKembalikan(p.id)}
                  icon={<RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />}
                >
                  Konfirmasi Kembali
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Tambah Barang Inventaris Lab MPLB"
        description="Input spesifikasi alat kantor atau sarana prasarana laboratorium baru."
        maxWidth="md"
      >
        <form onSubmit={handleSaveBarang} className="space-y-4">
          <Input
            label="Kode Sarpras"
            required
            value={formKode}
            onChange={(e) => setFormKode(e.target.value)}
          />
          <Input
            label="Nama Barang & Merk / Tipe"
            required
            value={formNama}
            onChange={(e) => setFormNama(e.target.value)}
            placeholder="Contoh: Mesin Penghancur Kertas Fellowes 79Ci"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Kategori"
              value={formKategori}
              onChange={(e) => setFormKategori(e.target.value as any)}
            >
              <option value="Peralatan Kantor">Peralatan Kantor</option>
              <option value="Komputer & IT">Komputer & IT</option>
              <option value="Perabot Kantor">Perabot Kantor</option>
            </Select>

            <Input
              type="number"
              label="Jumlah Unit"
              required
              min={1}
              value={formJumlah}
              onChange={(e) => setFormJumlah(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Kondisi"
              value={formKondisi}
              onChange={(e) => setFormKondisi(e.target.value as any)}
            >
              <option value="Baik">Baik</option>
              <option value="Rusak Ringan">Rusak Ringan</option>
              <option value="Rusak Berat">Rusak Berat</option>
            </Select>

            <Input
              label="Lokasi Ruangan"
              required
              value={formLokasi}
              onChange={(e) => setFormLokasi(e.target.value)}
              placeholder="Contoh: Lab Kearsipan 1"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6DFF1]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Barang
            </Button>
          </div>
        </form>
      </Modal>

      {/* Pinjam Modal */}
      <Modal
        isOpen={isPinjamOpen}
        onClose={() => setIsPinjamOpen(false)}
        title="Form Peminjaman Sarpras Lab MPLB"
        description="Peminjaman sarana untuk praktikum simulasi perkantoran atau tugas kearsipan."
        maxWidth="md"
      >
        <form onSubmit={handleConfirmPinjam} className="space-y-4">
          {pinjamError && (
            <div className="p-3 bg-[#FDE7E9] text-[#B4303C] text-xs rounded border border-[#B4303C]/20">
              {pinjamError}
            </div>
          )}

          <Select
            label="Pilih Peralatan"
            required
            value={pinjamBarangId}
            onChange={(e) => setPinjamBarangId(e.target.value)}
          >
            {barangList.map((b) => (
              <option key={b.id} value={b.id} disabled={b.tersedia === 0}>
                {b.namaBarang} (Tersedia: {b.tersedia} Unit)
              </option>
            ))}
          </Select>

          <Input
            label="Nama Peminjam"
            required
            value={pinjamNama}
            onChange={(e) => setPinjamNama(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Peran Peminjam"
              value={pinjamRole}
              onChange={(e) => setPinjamRole(e.target.value as any)}
            >
              <option value="Siswa">Siswa</option>
              <option value="Guru">Guru / Pegawai</option>
            </Select>

            <Input
              type="number"
              label="Jumlah Pinjam"
              required
              min={1}
              value={pinjamJumlah}
              onChange={(e) => setPinjamJumlah(Number(e.target.value))}
            />
          </div>

          <Input
            type="date"
            label="Rencana Tanggal Pengembalian"
            required
            value={pinjamKembaliRencana}
            onChange={(e) => setPinjamKembaliRencana(e.target.value)}
          />

          <Input
            label="Keperluan Praktikum / Tugas"
            required
            value={pinjamKeperluan}
            onChange={(e) => setPinjamKeperluan(e.target.value)}
            placeholder="Contoh: Praktikum digitalisasi arsip faktur penjualan"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6DFF1]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsPinjamOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Konfirmasi Pinjam
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
