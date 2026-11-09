import React from 'react';
import {
  Users,
  CalendarCheck,
  Briefcase,
  FileText,
  Receipt,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderSync,
  Send,
  Building2,
  Package,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { NavTabId } from '../layout/Sidebar';
import { AppStorage } from '../../lib/storage';
import { formatRupiah } from '../../lib/calculations';
import { UserRole } from '../../lib/types';

export interface DashboardViewProps {
  onNavigate: (tab: NavTabId) => void;
  currentRole: UserRole;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, currentRole }) => {
  const siswaList = AppStorage.getSiswa();
  const absensiList = AppStorage.getAbsensi();
  const izinList = AppStorage.getIzin();
  const suratList = AppStorage.getSurat();
  const penempatanList = AppStorage.getPenempatan();
  const jurnalList = AppStorage.getJurnalPkl();
  const pettyCashList = AppStorage.getPettyCash();
  const inventarisList = AppStorage.getInventaris();

  // Metrics
  const totalSiswaAktif = siswaList.filter((s) => s.status === 'aktif').length;
  const pendingIzin = izinList.filter((i) => i.status === 'pending');
  const pendingSurat = suratList.filter((s) => s.status === 'verifikasi' || s.status === 'penerimaan');
  const pendingJurnal = jurnalList.filter((j) => j.statusVerifikasi === 'pending');

  // Petty cash balance
  const pemasukan = pettyCashList
    .filter((t) => t.tipe === 'kredit')
    .reduce((sum, t) => sum + t.nominal, 0);
  const pengeluaran = pettyCashList
    .filter((t) => t.tipe === 'debit')
    .reduce((sum, t) => sum + t.nominal, 0);
  const saldoKas = pemasukan - pengeluaran;

  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#EEE4FA] text-[#6D3FA6]">
              Portal Terpadu MPLB
            </span>
            <span className="text-xs text-[#6B6480]">Tahun Ajaran 2026/2027</span>
          </div>
          <h1 className="text-xl font-bold text-[#2D2640] mt-1 tracking-tight">
            Digitalisasi Pembelajaran & Administrasi Perkantoran
          </h1>
          <p className="text-sm text-[#6B6480] mt-0.5 max-w-2xl">
            Sistem terintegrasi Manajemen Perkantoran dan Layanan Bisnis SMKS Ekonomika Depok.
            Mengelola data siswa, absensi, monitoring PKL, disposisi dokumen otomatis, dan keuangan kas kecil.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentRole !== 'guest' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('surat')}
              icon={<Send className="w-4 h-4" strokeWidth={1.5} />}
            >
              Proses Dokumen Masuk
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('absensi')}
            icon={<CalendarCheck className="w-4 h-4" strokeWidth={1.5} />}
          >
            Absensi Hari Ini
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards (4 columns) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Siswa */}
        <div
          onClick={() => onNavigate('siswa')}
          className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 cursor-pointer hover:border-[#8650C4] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B6480]">Total Siswa Aktif</span>
            <div className="w-8 h-8 rounded-full bg-[#EEE4FA] text-[#8650C4] flex items-center justify-center">
              <Users className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D2640] mt-2 tabular-nums">
            {totalSiswaAktif} <span className="text-xs font-normal text-[#6B6480]">siswa</span>
          </div>
          <div className="text-xs text-[#1F7A4D] mt-1 flex items-center gap-1 font-medium">
            <span>Kelas X, XI, XII MPLB</span>
          </div>
        </div>

        {/* PKL */}
        <div
          onClick={() => onNavigate('pkl')}
          className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 cursor-pointer hover:border-[#8650C4] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B6480]">Penempatan PKL</span>
            <div className="w-8 h-8 rounded-full bg-[#E8F8F5] text-[#2BB5A0] flex items-center justify-center">
              <Briefcase className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D2640] mt-2 tabular-nums">
            {penempatanList.length} <span className="text-xs font-normal text-[#6B6480]">siswa</span>
          </div>
          <div className="text-xs text-[#6B6480] mt-1 truncate">
            {pendingJurnal.length} jurnal perlu verifikasi
          </div>
        </div>

        {/* Dokumen & Surat */}
        <div
          onClick={() => onNavigate('surat')}
          className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 cursor-pointer hover:border-[#8650C4] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B6480]">Surat & Dokumen</span>
            <div className="w-8 h-8 rounded-full bg-[#E4EEFC] text-[#2F5FB3] flex items-center justify-center">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D2640] mt-2 tabular-nums">
            {suratList.length} <span className="text-xs font-normal text-[#6B6480]">arsip</span>
          </div>
          <div className="text-xs text-[#8A6100] mt-1 font-medium">
            {pendingSurat.length} antrean verifikasi
          </div>
        </div>

        {/* Kas Kecil */}
        <div
          onClick={() => onNavigate('petty-cash')}
          className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 cursor-pointer hover:border-[#8650C4] transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#6B6480]">Saldo Kas Kecil</span>
            <div className="w-8 h-8 rounded-full bg-[#FFF3D1] text-[#8A6100] flex items-center justify-center">
              <Receipt className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-xl font-bold text-[#2D2640] mt-2 tabular-nums">
            {formatRupiah(saldoKas)}
          </div>
          <div className="text-xs text-[#1F7A4D] mt-1 font-medium">
            Metode Kas Kantor Imprest
          </div>
        </div>
      </div>

      {/* Visual Workflow Flowchart Banner (Direct representation of user attached image) */}
      <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E6DFF1]">
          <div>
            <h2 className="text-base font-semibold text-[#2D2640]">
              Alur Standar Dokumen Surat Menyurat & Disposisi Otomatis
            </h2>
            <p className="text-xs text-[#6B6480]">
              Workflow SOP Administrasi Kearsipan SMKS Ekonomika Depok (Sesuai Diagram Alur Sistem)
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('surat')}
            icon={<ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            Buka Alur Dokumen
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Step 1 */}
          <div className="p-3 bg-[#FAF8FD] border border-[#E6DFF1] rounded-[6px] relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#8650C4] text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-semibold text-[#2D2640]">Penerimaan & Input</span>
            </div>
            <ul className="text-xs text-[#6B6480] space-y-1 list-disc pl-4">
              <li>Dokumen Masuk (Surat, Laporan, Pengajuan)</li>
              <li>Scan & Input ke Sistem Digital (Cloud/DB)</li>
            </ul>
          </div>

          {/* Step 2 */}
          <div className="p-3 bg-[#FAF8FD] border border-[#E6DFF1] rounded-[6px] relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#8650C4] text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-semibold text-[#2D2640]">Verifikasi & Disposisi</span>
            </div>
            <ul className="text-xs text-[#6B6480] space-y-1 list-disc pl-4">
              <li>Validasi Dokumen oleh Pimpinan</li>
              <li>Tidak Valid: Kembalikan untuk Revisi</li>
              <li>Valid: Disposisi Divisi & Terbit Nomor</li>
            </ul>
          </div>

          {/* Step 3 */}
          <div className="p-3 bg-[#FAF8FD] border border-[#E6DFF1] rounded-[6px] relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#8650C4] text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-semibold text-[#2D2640]">Proses & Eksekusi</span>
            </div>
            <ul className="text-xs text-[#6B6480] space-y-1 list-disc pl-4">
              <li>Tindak lanjut oleh Divisi Terkait</li>
              <li>Pembuatan Dokumen Balasan / Laporan</li>
            </ul>
          </div>

          {/* Step 4 */}
          <div className="p-3 bg-[#FAF8FD] border border-[#E6DFF1] rounded-[6px] relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#1F7A4D] text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <span className="text-xs font-semibold text-[#2D2640]">Arsip & Pelaporan</span>
            </div>
            <ul className="text-xs text-[#6B6480] space-y-1 list-disc pl-4">
              <li>Simpan di Cloud Storage Arsip Digital</li>
              <li>Indeks & Penamaan Sesuai SOP Resmi</li>
              <li>Laporan Administrasi Berkala ke Pimpinan</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Perlu Tindakan & Ringkasan Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perlu Tindakan */}
        <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6DFF1]">
            <h2 className="text-base font-semibold text-[#2D2640] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8650C4]" strokeWidth={1.5} />
              Antrean Tindakan & Verifikasi
            </h2>
            <Badge variant="warning">{pendingIzin.length + pendingSurat.length + pendingJurnal.length} antrean</Badge>
          </div>

          <div className="divide-y divide-[#E6DFF1] mt-2">
            {/* Surat pending verifikasi */}
            {pendingSurat.length > 0 ? (
              pendingSurat.slice(0, 3).map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-[#2D2640] truncate">{s.judul}</p>
                    <p className="text-xs text-[#6B6480] truncate">
                      Dari: {s.pengirim} · Status: <span className="capitalize">{s.status}</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('surat')}
                  >
                    Proses
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-4 text-xs text-[#6B6480] text-center">
                Tidak ada dokumen surat yang menunggu verifikasi.
              </div>
            )}

            {/* Izin pending */}
            {pendingIzin.length > 0 &&
              pendingIzin.slice(0, 2).map((iz) => (
                <div key={iz.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-[#2D2640] truncate">
                      Pengajuan Izin {iz.jenis.toUpperCase()}: {iz.namaSiswa} ({iz.kelas})
                    </p>
                    <p className="text-xs text-[#6B6480] truncate">{iz.alasan}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate('absensi')}
                  >
                    Verifikasi
                  </Button>
                </div>
              ))}
          </div>
        </div>

        {/* Fasilitas Pembelajaran & Sarpras */}
        <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6DFF1]">
            <h2 className="text-base font-semibold text-[#2D2640] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#8650C4]" strokeWidth={1.5} />
              Inventarisasi Lab MPLB & Fasilitas
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('inventaris')}
              className="text-xs"
            >
              Lihat Semua
            </Button>
          </div>

          <div className="divide-y divide-[#E6DFF1] mt-2">
            {inventarisList.slice(0, 4).map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-[#2D2640]">{item.namaBarang}</p>
                  <p className="text-xs text-[#6B6480]">
                    Lokasi: {item.lokasi} · Kode: {item.kodeBarang}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={item.tersedia > 0 ? 'success' : 'danger'}>
                    {item.tersedia} / {item.jumlah} Unit
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
