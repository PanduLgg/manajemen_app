import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  FileCheck,
  Send,
  UserCheck,
  FileText,
  Clock,
  Eye,
  Check,
  X,
} from 'lucide-react';
import { AbsensiRecord, PengajuanIzin, Siswa, StatusAbsensi, UserRole } from '../../lib/types';
import { AppStorage } from '../../lib/storage';
import { calculateAttendanceSummary } from '../../lib/calculations';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';
import { DataTable, ColumnDef } from '../ui/DataTable';

export interface AbsensiViewProps {
  currentRole: UserRole;
}

export const AbsensiView: React.FC<AbsensiViewProps> = ({ currentRole }) => {
  const [activeTab, setActiveTab] = useState<'input' | 'izin' | 'rekap'>('input');

  // Sesi Absensi Form State
  const [selectedKelas, setSelectedKelas] = useState('XI MPLB 1');
  const [selectedMapel, setSelectedMapel] = useState('Pengelolaan Kearsipan');
  const [selectedTanggal, setSelectedTanggal] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedJamKe, setSelectedJamKe] = useState(1);

  // Student list for selected class
  const allSiswa = AppStorage.getSiswa();
  const classStudents = allSiswa.filter((s) => s.kelas === selectedKelas && s.status === 'aktif');

  // Attendance in-memory working state
  const [sessionStatuses, setSessionStatuses] = useState<Record<string, { status: StatusAbsensi; keterangan: string }>>(() => {
    const existing = AppStorage.getAbsensi();
    const map: Record<string, { status: StatusAbsensi; keterangan: string }> = {};
    classStudents.forEach((s) => {
      const found = existing.find(
        (a) =>
          a.siswaId === s.id &&
          a.tanggal === new Date().toISOString().split('T')[0] &&
          a.jamKe === 1
      );
      map[s.id] = {
        status: found?.status || 'hadir',
        keterangan: found?.keterangan || '',
      };
    });
    return map;
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Izin State
  const [izinList, setIzinList] = useState<PengajuanIzin[]>(() => AppStorage.getIzin());
  const [isAjukanIzinOpen, setIsAjukanIzinOpen] = useState(false);
  const [formIzinJenis, setFormIzinJenis] = useState<'sakit' | 'izin' | 'dispensasi'>('sakit');
  const [formIzinMulai, setFormIzinMulai] = useState(new Date().toISOString().split('T')[0]);
  const [formIzinSelesai, setFormIzinSelesai] = useState(new Date().toISOString().split('T')[0]);
  const [formIzinAlasan, setFormIzinAlasan] = useState('');
  const [formIzinBukti, setFormIzinBukti] = useState('https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=500&auto=format&fit=crop&q=60');

  // Izin Verification Modal
  const [verifyingIzin, setVerifyingIzin] = useState<PengajuanIzin | null>(null);
  const [catatanVerifikasi, setCatatanVerifikasi] = useState('');

  // Handle Mark All Present
  const handleMarkAllHadir = () => {
    const updated: Record<string, { status: StatusAbsensi; keterangan: string }> = {};
    classStudents.forEach((s) => {
      updated[s.id] = { status: 'hadir', keterangan: '' };
    });
    setSessionStatuses(updated);
  };

  // Handle Status change for single student
  const handleSetStudentStatus = (siswaId: string, status: StatusAbsensi) => {
    setSessionStatuses((prev) => ({
      ...prev,
      [siswaId]: {
        status,
        keterangan: prev[siswaId]?.keterangan || '',
      },
    }));
  };

  // Save Session
  const handleSaveAbsensi = () => {
    const records: AbsensiRecord[] = classStudents.map((s) => ({
      id: `ab-${s.id}-${selectedTanggal}-${selectedJamKe}`,
      siswaId: s.id,
      namaSiswa: s.nama,
      nis: s.nis,
      kelas: s.kelas,
      tanggal: selectedTanggal,
      jamKe: selectedJamKe,
      mapel: selectedMapel,
      status: sessionStatuses[s.id]?.status || 'hadir',
      keterangan: sessionStatuses[s.id]?.keterangan || '',
    }));

    AppStorage.saveAbsensiBatch(records);
    setSaveSuccessMsg(`Berhasil menyimpan data absensi kelas ${selectedKelas} (${records.length} siswa)`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Submit Izin
  const handleSubmitIzin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formIzinAlasan.trim() || !formIzinBukti.trim()) return;

    const currentProfile = AppStorage.getCurrentProfile();
    const currentSiswa = allSiswa.find((s) => s.id === currentProfile.id) || allSiswa[0];

    AppStorage.submitIzin({
      siswaId: currentSiswa.id,
      namaSiswa: currentSiswa.nama,
      nis: currentSiswa.nis,
      kelas: currentSiswa.kelas,
      jenis: formIzinJenis,
      tglMulai: formIzinMulai,
      tglSelesai: formIzinSelesai,
      alasan: formIzinAlasan.trim(),
      buktiUrl: formIzinBukti.trim(),
    });

    setIsAjukanIzinOpen(false);
    setIzinList(AppStorage.getIzin());
  };

  // Verify Izin
  const handleProcessVerifikasiIzin = (status: 'disetujui' | 'ditolak') => {
    if (!verifyingIzin) return;
    AppStorage.verifyIzin(verifyingIzin.id, status, catatanVerifikasi);
    setVerifyingIzin(null);
    setCatatanVerifikasi('');
    setIzinList(AppStorage.getIzin());
  };

  // Rekap Data
  const allAbsensiRecords = AppStorage.getAbsensi();
  const summaryRecords = classStudents.map((s) => {
    const records = allAbsensiRecords.filter((a) => a.siswaId === s.id);
    const summary = calculateAttendanceSummary(records);
    return {
      siswa: s,
      ...summary,
    };
  });

  const statusButtons: { key: StatusAbsensi; label: string; activeClass: string }[] = [
    { key: 'hadir', label: 'H', activeClass: 'bg-[#1F7A4D] text-white' },
    { key: 'sakit', label: 'S', activeClass: 'bg-[#8A6100] text-white' },
    { key: 'izin', label: 'I', activeClass: 'bg-[#2F5FB3] text-white' },
    { key: 'alpha', label: 'A', activeClass: 'bg-[#B4303C] text-white' },
    { key: 'terlambat', label: 'T', activeClass: 'bg-[#B35A12] text-white' },
    { key: 'dispensasi', label: 'D', activeClass: 'bg-[#6D3FA6] text-white' },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Data Absen Siswa MPLB"
        description="Pencatatan sesi kehadiran harian, pengajuan izin resmi, dan rekap persentase absensi."
      />

      {/* Tabs Bar */}
      <div className="w-full overflow-x-auto pb-1">
        <div className="inline-flex items-center gap-1 p-1 bg-white border border-[#E6DFF1] rounded-[8px] min-w-max">
          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-1.5 text-sm font-medium rounded-[6px] transition-colors cursor-pointer ${
              activeTab === 'input'
                ? 'bg-[#EEE4FA] text-[#6D3FA6] font-semibold'
                : 'text-[#6B6480] hover:text-[#2D2640]'
            }`}
          >
            Input Sesi Harian
          </button>
          <button
            onClick={() => setActiveTab('izin')}
            className={`px-4 py-1.5 text-sm font-medium rounded-[6px] transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'izin'
                ? 'bg-[#EEE4FA] text-[#6D3FA6] font-semibold'
                : 'text-[#6B6480] hover:text-[#2D2640]'
            }`}
          >
            <span>Pengajuan Izin</span>
            {izinList.filter((i) => i.status === 'pending').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#8A6100] text-white text-xs flex items-center justify-center font-bold">
                {izinList.filter((i) => i.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('rekap')}
            className={`px-4 py-1.5 text-sm font-medium rounded-[6px] transition-colors cursor-pointer ${
              activeTab === 'rekap'
                ? 'bg-[#EEE4FA] text-[#6D3FA6] font-semibold'
                : 'text-[#6B6480] hover:text-[#2D2640]'
            }`}
          >
            Rekap Kehadiran
          </button>
        </div>
      </div>

      {/* TAB 1: INPUT SESI HARIAN */}
      {activeTab === 'input' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select
              label="Pilih Kelas"
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
            >
              <option value="X MPLB 1">X MPLB 1</option>
              <option value="XI MPLB 1">XI MPLB 1</option>
              <option value="XI MPLB 2">XI MPLB 2</option>
              <option value="XII MPLB 1">XII MPLB 1</option>
            </Select>

            <Select
              label="Mata Pelajaran Produktif"
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
            >
              <option value="Pengelolaan Kearsipan">Pengelolaan Kearsipan</option>
              <option value="Tata Kelola Kepegawaian">Tata Kelola Kepegawaian</option>
              <option value="Teknologi Perkantoran">Teknologi Perkantoran</option>
              <option value="Tata Kelola Sarana & Prasarana">Tata Kelola Sarpras</option>
              <option value="Humas & Keprotokolan">Humas & Keprotokolan</option>
            </Select>

            <Input
              type="date"
              label="Tanggal Pertemuan"
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
            />

            <Select
              label="Jam Pertemuan Ke-"
              value={selectedJamKe}
              onChange={(e) => setSelectedJamKe(Number(e.target.value))}
            >
              <option value={1}>Jam Ke 1 - 2 (Pagi)</option>
              <option value={2}>Jam Ke 3 - 4</option>
              <option value={3}>Jam Ke 5 - 6 (Siang)</option>
              <option value={4}>Jam Ke 7 - 8</option>
            </Select>
          </div>

          {/* Quick Action & Save Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8FD] border border-[#E6DFF1] p-3 rounded-[8px]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B6480]">
                Total Siswa: <strong className="text-[#2D2640]">{classStudents.length} siswa</strong>
              </span>
              <span className="text-xs text-[#6B6480]">·</span>
              <span className="text-xs text-[#6B6480]">
                Petunjuk: Klik tombol huruf untuk mengubah status.
              </span>
            </div>

            <div className="flex items-center gap-2">
              {currentRole !== 'guest' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllHadir}
                    icon={<UserCheck className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  >
                    Set Semua Hadir
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveAbsensi}
                    icon={<CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  >
                    Simpan Sesi Absensi
                  </Button>
                </>
              )}
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="p-3 bg-[#E3F6EC] border border-[#1F7A4D]/20 text-[#1F7A4D] text-xs rounded-[6px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Attendance Student Table */}
          <div className="bg-white border border-[#E6DFF1] rounded-[8px] overflow-hidden min-w-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse" style={{ minWidth: '860px', tableLayout: 'fixed' }}>
                <thead className="bg-[#FAF8FD] border-b border-[#E6DFF1] text-xs font-semibold text-[#6B6480] uppercase">
                  <tr className="h-[40px]">
                    <th style={{ width: '56px' }} className="px-4 py-2 text-center whitespace-nowrap">No</th>
                    <th style={{ width: '140px' }} className="px-4 py-2 whitespace-nowrap">NIS</th>
                    <th style={{ minWidth: '220px' }} className="px-4 py-2 whitespace-nowrap">Nama Siswa</th>
                    <th style={{ width: '280px' }} className="px-4 py-2 text-center whitespace-nowrap">Status Kehadiran</th>
                    <th style={{ width: '200px' }} className="px-4 py-2 whitespace-nowrap">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DFF1]">
                  {classStudents.map((s, index) => {
                    const currentStatus = sessionStatuses[s.id]?.status || 'hadir';
                    const currentKet = sessionStatuses[s.id]?.keterangan || '';

                    return (
                      <tr key={s.id} className="h-[44px] hover:bg-[#FAF8FD]">
                        <td className="px-4 py-2 text-center text-xs text-[#6B6480] tabular-nums">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2 font-medium text-xs tabular-nums text-[#2D2640]">
                          {s.nis}
                        </td>
                        <td className="px-4 py-2 font-medium text-xs text-[#2D2640] truncate max-w-[240px]">
                          {s.nama}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {/* Segmented Button: H S I A T D */}
                          <div className="inline-flex items-center gap-1 p-0.5 bg-[#FAF8FD] border border-[#E6DFF1] rounded-[6px]">
                            {statusButtons.map((btn) => {
                              const isSelected = currentStatus === btn.key;
                              return (
                                <button
                                  key={btn.key}
                                  type="button"
                                  disabled={currentRole === 'guest'}
                                  onClick={() => handleSetStudentStatus(s.id, btn.key)}
                                  className={`w-7 h-7 text-xs font-bold rounded-[4px] transition-colors cursor-pointer flex items-center justify-center ${
                                    isSelected
                                      ? btn.activeClass
                                      : 'text-[#6B6480] hover:text-[#2D2640] hover:bg-white'
                                  }`}
                                  title={`${btn.key.toUpperCase()}`}
                                >
                                  {btn.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            placeholder="Catatan (opsional)..."
                            disabled={currentRole === 'guest'}
                            value={currentKet}
                            onChange={(e) =>
                              setSessionStatuses((prev) => ({
                                ...prev,
                                [s.id]: {
                                  status: prev[s.id]?.status || 'hadir',
                                  keterangan: e.target.value,
                                },
                              }))
                            }
                            className="w-full h-[32px] px-2 text-xs border border-[#E6DFF1] rounded-[4px] bg-white focus:outline-none focus:ring-1 focus:ring-[#8650C4]"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENGAJUAN IZIN */}
      {activeTab === 'izin' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#6B6480]">
              Pengajuan surat izin siswa disertai unggahan bukti foto dokter / surat resmi.
            </p>
            {currentRole !== 'guest' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAjukanIzinOpen(true)}
                icon={<Send className="w-3.5 h-3.5" strokeWidth={1.5} />}
              >
                Ajukan Surat Izin
              </Button>
            )}
          </div>

          <div className="divide-y divide-[#E6DFF1] bg-white border border-[#E6DFF1] rounded-[8px]">
            {izinList.map((item) => (
              <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#2D2640]">{item.namaSiswa}</span>
                    <span className="text-xs text-[#6B6480]">({item.kelas} · NIS {item.nis})</span>
                    <Badge
                      variant={
                        item.jenis === 'sakit'
                          ? 'sakit'
                          : item.jenis === 'dispensasi'
                          ? 'dispensasi'
                          : 'izin'
                      }
                    >
                      {item.jenis.toUpperCase()}
                    </Badge>
                    <Badge
                      variant={
                        item.status === 'disetujui'
                          ? 'success'
                          : item.status === 'ditolak'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#2D2640]">{item.alasan}</p>
                  <p className="text-[11px] text-[#6B6480]">
                    Rentang tanggal: <strong className="text-[#2D2640]">{item.tglMulai} s/d {item.tglSelesai}</strong>
                    {item.catatanGuru && ` · Catatan Guru: "${item.catatanGuru}"`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {item.buktiUrl && (
                    <a
                      href={item.buktiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-medium border border-[#E6DFF1] rounded-[6px] hover:bg-[#FAF8FD] flex items-center gap-1 text-[#6D3FA6]"
                    >
                      <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Lihat Bukti Foto
                    </a>
                  )}

                  {currentRole !== 'guest' && currentRole !== 'siswa' && item.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setVerifyingIzin(item);
                        setCatatanVerifikasi('');
                      }}
                    >
                      Verifikasi Izin
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REKAP KEHADIRAN */}
      {activeTab === 'rekap' && (
        <div className="space-y-4">
          <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-sm text-[#2D2640]">
                Rekap Kehadiran Siswa Kelas {selectedKelas}
              </span>
              <p className="text-xs text-[#6B6480]">
                Perhitungan otomatis persentase kehadiran per siswa berdasarkan seluruh sesi absensi.
              </p>
            </div>
            <Select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-48"
            >
              <option value="X MPLB 1">X MPLB 1</option>
              <option value="XI MPLB 1">XI MPLB 1</option>
              <option value="XI MPLB 2">XI MPLB 2</option>
              <option value="XII MPLB 1">XII MPLB 1</option>
            </Select>
          </div>

          <div className="bg-white border border-[#E6DFF1] rounded-[8px] overflow-hidden min-w-0">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse" style={{ minWidth: '760px', tableLayout: 'fixed' }}>
                <thead className="bg-[#FAF8FD] border-b border-[#E6DFF1] text-xs font-semibold text-[#6B6480] uppercase">
                  <tr className="h-[40px]">
                    <th style={{ width: '56px' }} className="px-4 py-2 text-center whitespace-nowrap">No</th>
                    <th style={{ minWidth: '220px' }} className="px-4 py-2 whitespace-nowrap">Nama Siswa</th>
                    <th style={{ width: '70px' }} className="px-4 py-2 text-center whitespace-nowrap">H</th>
                    <th style={{ width: '70px' }} className="px-4 py-2 text-center whitespace-nowrap">S</th>
                    <th style={{ width: '70px' }} className="px-4 py-2 text-center whitespace-nowrap">I</th>
                    <th style={{ width: '70px' }} className="px-4 py-2 text-center whitespace-nowrap">A</th>
                    <th style={{ width: '70px' }} className="px-4 py-2 text-center whitespace-nowrap">T</th>
                    <th style={{ width: '70px' }} className="px-4 py-2 text-center whitespace-nowrap">D</th>
                    <th style={{ width: '120px' }} className="px-4 py-2 text-right whitespace-nowrap">Persentase</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-[#E6DFF1]">
                {summaryRecords.map((item, idx) => (
                  <tr key={item.siswa.id} className="h-[44px] hover:bg-[#FAF8FD]">
                    <td className="px-4 py-2 text-center text-xs text-[#6B6480] tabular-nums">{idx + 1}</td>
                    <td className="px-4 py-2 font-medium text-xs text-[#2D2640]">{item.siswa.nama}</td>
                    <td className="px-4 py-2 text-center text-xs tabular-nums text-[#1F7A4D] font-semibold">{item.hadir}</td>
                    <td className="px-4 py-2 text-center text-xs tabular-nums text-[#8A6100]">{item.sakit}</td>
                    <td className="px-4 py-2 text-center text-xs tabular-nums text-[#2F5FB3]">{item.izin}</td>
                    <td className="px-4 py-2 text-center text-xs tabular-nums text-[#B4303C]">{item.alpha}</td>
                    <td className="px-4 py-2 text-center text-xs tabular-nums text-[#B35A12]">{item.terlambat}</td>
                    <td className="px-4 py-2 text-center text-xs tabular-nums text-[#6D3FA6]">{item.dispensasi}</td>
                    <td className="px-4 py-2 text-right text-xs font-bold tabular-nums">
                      <span className={item.persentaseKehadiran >= 85 ? 'text-[#1F7A4D]' : 'text-[#B4303C]'}>
                        {item.persentaseKehadiran}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {/* Ajukan Izin Modal */}
      <Modal
        isOpen={isAjukanIzinOpen}
        onClose={() => setIsAjukanIzinOpen(false)}
        title="Form Pengajuan Izin Siswa"
        description="Izin wajib menyertakan foto surat keterangan dokter atau surat resmi dispensasi."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitIzin} className="space-y-4">
          <Select
            label="Jenis Izin"
            required
            value={formIzinJenis}
            onChange={(e) => setFormIzinJenis(e.target.value as any)}
          >
            <option value="sakit">Sakit</option>
            <option value="izin">Izin Keperluan Keluarga</option>
            <option value="dispensasi">Dispensasi Tugas Sekolah / Lomba</option>
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Tanggal Mulai"
              required
              value={formIzinMulai}
              onChange={(e) => setFormIzinMulai(e.target.value)}
            />
            <Input
              type="date"
              label="Tanggal Selesai"
              required
              value={formIzinSelesai}
              onChange={(e) => setFormIzinSelesai(e.target.value)}
            />
          </div>

          <Input
            label="Alasan Pengajuan"
            required
            value={formIzinAlasan}
            onChange={(e) => setFormIzinAlasan(e.target.value)}
            placeholder="Jelaskan alasan izin secara singkat dan jelas..."
          />

          <Input
            label="URL Foto Bukti / Resep Dokter"
            required
            value={formIzinBukti}
            onChange={(e) => setFormIzinBukti(e.target.value)}
            helperText="Bukti foto wajib diunggah agar dapat diverifikasi oleh wali kelas / guru."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6DFF1]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAjukanIzinOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Kirim Pengajuan Izin
            </Button>
          </div>
        </form>
      </Modal>

      {/* Verifikasi Izin Modal (Guru / Admin) */}
      <Modal
        isOpen={!!verifyingIzin}
        onClose={() => setVerifyingIzin(null)}
        title="Verifikasi Pengajuan Izin"
        description="Tinjau alasan dan foto bukti sebelum memberikan persetujuan."
        maxWidth="md"
      >
        {verifyingIzin && (
          <div className="space-y-4">
            <div className="p-3 bg-[#FAF8FD] border border-[#E6DFF1] rounded-[6px] text-xs space-y-1">
              <p><strong>Nama:</strong> {verifyingIzin.namaSiswa} ({verifyingIzin.kelas})</p>
              <p><strong>Jenis:</strong> {verifyingIzin.jenis.toUpperCase()}</p>
              <p><strong>Periode:</strong> {verifyingIzin.tglMulai} s/d {verifyingIzin.tglSelesai}</p>
              <p><strong>Alasan:</strong> {verifyingIzin.alasan}</p>
            </div>

            {verifyingIzin.buktiUrl && (
              <div className="border border-[#E6DFF1] rounded-[6px] p-2 bg-white">
                <p className="text-xs font-semibold text-[#2D2640] mb-1">Bukti Lampiran:</p>
                <img
                  src={verifyingIzin.buktiUrl}
                  alt="Bukti izin"
                  className="w-full max-h-[180px] object-cover rounded"
                />
              </div>
            )}

            <Input
              label="Catatan Guru (Opsional)"
              value={catatanVerifikasi}
              onChange={(e) => setCatatanVerifikasi(e.target.value)}
              placeholder="Contoh: Disetujui, lekas sembuh / Tetap pelajari materi bab 2"
            />

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E6DFF1]">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleProcessVerifikasiIzin('ditolak')}
              >
                Tolak Izin
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleProcessVerifikasiIzin('disetujui')}
              >
                Setujui & Catat Absen
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
