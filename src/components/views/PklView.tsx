import React, { useState } from 'react';
import {
  Building2,
  Users,
  BookOpen,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Eye,
  Calendar,
} from 'lucide-react';
import { DudiPkl, PenempatanPkl, JurnalPkl, UserRole } from '../../lib/types';
import { AppStorage } from '../../lib/storage';
import { isTodayAsiaJakarta } from '../../lib/calculations';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';
import { DataTable, ColumnDef } from '../ui/DataTable';

export interface PklViewProps {
  currentRole: UserRole;
}

export const PklView: React.FC<PklViewProps> = ({ currentRole }) => {
  const [activeTab, setActiveTab] = useState<'dudi' | 'penempatan' | 'jurnal'>('dudi');

  const [dudiList] = useState<DudiPkl[]>(() => AppStorage.getDudi());
  const [penempatanList] = useState<PenempatanPkl[]>(() => AppStorage.getPenempatan());
  const [jurnalList, setJurnalList] = useState<JurnalPkl[]>(() => AppStorage.getJurnalPkl());

  // Siswa New Journal Modal State
  const [isNewJurnalOpen, setIsNewJurnalOpen] = useState(false);
  const [jurnalPenempatanId, setJurnalPenempatanId] = useState(penempatanList[0]?.id || '');
  const [jurnalTanggal, setJurnalTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [jurnalKegiatan, setJurnalKegiatan] = useState('');
  const [jurnalKendala, setJurnalKendala] = useState('');
  const [jurnalFoto, setJurnalFoto] = useState('');
  const [jurnalError, setJurnalError] = useState<string | null>(null);

  // Guru Verification Modal State
  const [verifyingJurnal, setVerifyingJurnal] = useState<JurnalPkl | null>(null);
  const [catatanVerifikasi, setCatatanVerifikasi] = useState('');

  // Submit Jurnal Handler
  const handleSubmitJurnal = (e: React.FormEvent) => {
    e.preventDefault();
    setJurnalError(null);

    // Strict Rule: Only today's date allowed
    if (!isTodayAsiaJakarta(jurnalTanggal)) {
      setJurnalError('Jurnal PKL hanya dapat diisi untuk tanggal hari ini (Zona Waktu Asia/Jakarta).');
      return;
    }

    if (!jurnalKegiatan.trim()) {
      setJurnalError('Deskripsi kegiatan harian wajib diisi.');
      return;
    }

    const targetPenempatan = penempatanList.find((p) => p.id === jurnalPenempatanId) || penempatanList[0];

    AppStorage.submitJurnalPkl({
      penempatanId: targetPenempatan.id,
      siswaId: targetPenempatan.siswaId,
      namaSiswa: targetPenempatan.namaSiswa,
      namaDudi: targetPenempatan.namaDudi,
      tanggal: jurnalTanggal,
      kegiatan: jurnalKegiatan.trim(),
      kendala: jurnalKendala.trim() || 'Tidak ada kendala yang berarti.',
      fotoUrl: jurnalFoto.trim(),
    });

    setIsNewJurnalOpen(false);
    setJurnalKegiatan('');
    setJurnalKendala('');
    setJurnalFoto('');
    setJurnalList(AppStorage.getJurnalPkl());
  };

  // Verify Jurnal Handler
  const handleVerifyJurnal = (status: 'valid' | 'revisi') => {
    if (!verifyingJurnal) return;
    AppStorage.verifyJurnalPkl(verifyingJurnal.id, status, catatanVerifikasi.trim());
    setVerifyingJurnal(null);
    setCatatanVerifikasi('');
    setJurnalList(AppStorage.getJurnalPkl());
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Monitoring PKL (Praktik Kerja Lapangan)"
        description="Kelola mitra industri DUDI, penempatan siswa per divisi, dan verifikasi jurnal harian."
      />

      {/* Tabs */}
      <div className="w-full overflow-x-auto pb-1">
        <div className="inline-flex items-center gap-1 p-1 bg-white border border-[#E6DFF1] rounded-[8px] min-w-max">
          <button
            onClick={() => setActiveTab('dudi')}
            className={`px-4 py-1.5 text-sm font-medium rounded-[6px] transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'dudi'
                ? 'bg-[#EEE4FA] text-[#6D3FA6] font-semibold'
                : 'text-[#6B6480] hover:text-[#2D2640]'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>Tempat PKL (DUDI)</span>
          </button>

          <button
            onClick={() => setActiveTab('penempatan')}
            className={`px-4 py-1.5 text-sm font-medium rounded-[6px] transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'penempatan'
                ? 'bg-[#EEE4FA] text-[#6D3FA6] font-semibold'
                : 'text-[#6B6480] hover:text-[#2D2640]'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>Penempatan & Divisi</span>
          </button>

          <button
            onClick={() => setActiveTab('jurnal')}
            className={`px-4 py-1.5 text-sm font-medium rounded-[6px] transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'jurnal'
                ? 'bg-[#EEE4FA] text-[#6D3FA6] font-semibold'
                : 'text-[#6B6480] hover:text-[#2D2640]'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" strokeWidth={1.5} />
            <span>Jurnal Harian PKL</span>
            {jurnalList.filter((j) => j.statusVerifikasi === 'pending').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#8A6100] text-white text-xs flex items-center justify-center font-bold">
                {jurnalList.filter((j) => j.statusVerifikasi === 'pending').length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: TEMPAT PKL (DUDI) */}
      {activeTab === 'dudi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
          {dudiList.map((dudi) => {
            const placedStudents = penempatanList.filter((p) => p.dudiId === dudi.id);

            return (
              <div
                key={dudi.id}
                className="bg-white border border-[#E6DFF1] rounded-[8px] p-5 flex flex-col justify-between overflow-hidden min-w-0"
              >
                <div className="min-w-0">
                  <div className="flex flex-col gap-2 min-w-0 mb-2">
                    <h3 className="font-semibold text-base text-[#2D2640] leading-snug break-words">{dudi.nama}</h3>
                    <div>
                      <Badge variant="primary" className="whitespace-normal max-w-full">
                        {dudi.bidangUsaha}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[#6B6480] mt-1 break-words">{dudi.alamat}</p>
                  <p className="text-xs text-[#6B6480] mt-0.5">Kontak: {dudi.kontak}</p>

                  <div className="mt-3 p-3 bg-[#FAF8FD] border border-[#E6DFF1] rounded-[6px] text-xs">
                    <span className="font-semibold text-[#2D2640] block">Pembimbing Industri:</span>
                    <span className="text-[#6B6480]">{dudi.pembimbingIndustri}</span>
                  </div>

                  {/* Placed students list */}
                  <div className="mt-3">
                    <span className="text-xs font-semibold text-[#2D2640] block mb-1">
                      Siswa Ditempatkan ({placedStudents.length} / {dudi.kuota} Kuota):
                    </span>
                    <div className="space-y-1">
                      {placedStudents.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-white border border-[#E6DFF1] rounded-[4px]"
                        >
                          <span className="font-medium text-[#2D2640]">{st.namaSiswa}</span>
                          <span className="text-[#6D3FA6] font-medium">{st.divisi}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PENEMPATAN & DIVISI */}
      {activeTab === 'penempatan' && (
        <div className="space-y-4">
          <div className="bg-[#FAF8FD] border border-[#E6DFF1] p-3 rounded-[8px] text-xs text-[#6B6480]">
            Siswa yang ditempatkan pada perusahaan yang sama dibedakan secara detail berdasarkan <strong>Divisi</strong> dan <strong>Catatan Penugasan Khusus</strong>.
          </div>

          <div className="divide-y divide-[#E6DFF1] bg-white border border-[#E6DFF1] rounded-[8px]">
            {penempatanList.map((p) => (
              <div key={p.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#2D2640]">{p.namaSiswa}</span>
                    <span className="text-xs text-[#6B6480]">({p.kelas})</span>
                    <Badge variant="primary">{p.divisi}</Badge>
                  </div>
                  <p className="text-xs font-medium text-[#2D2640]">
                    DUDI: {p.namaDudi}
                  </p>
                  <p className="text-xs text-[#6B6480]">
                    Pembimbing Sekolah: {p.namaGuruPembimbing} · Durasi: {p.durasiMinggu} Minggu ({p.tglMulai} s/d {p.tglSelesai})
                  </p>
                  <p className="text-xs text-[#6D3FA6] italic bg-[#EEE4FA]/50 p-2 rounded mt-1">
                    Catatan: {p.catatan}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: JURNAL HARIAN PKL */}
      {activeTab === 'jurnal' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#6B6480]">
              Jurnal kegiatan harian siswa diisi setiap hari kerja. <strong>Sesuai aturan sistem, pengisian dibatasi hanya pada hari H.</strong>
            </div>

            {currentRole !== 'guest' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setJurnalTanggal(new Date().toISOString().split('T')[0]);
                  setIsNewJurnalOpen(true);
                }}
                icon={<Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
              >
                Isi Jurnal Hari Ini
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {jurnalList.map((j) => (
              <div
                key={j.id}
                className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6DFF1] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-[#2D2640]">{j.namaSiswa}</span>
                    <span className="text-xs text-[#6B6480]">· {j.namaDudi}</span>
                    <span className="text-xs text-[#6B6480] tabular-nums">· Tanggal: {j.tanggal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        j.statusVerifikasi === 'valid'
                          ? 'success'
                          : j.statusVerifikasi === 'revisi'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {j.statusVerifikasi.toUpperCase()}
                    </Badge>

                    {currentRole !== 'guest' && currentRole !== 'siswa' && j.statusVerifikasi === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setVerifyingJurnal(j);
                          setCatatanVerifikasi('');
                        }}
                      >
                        Verifikasi Guru
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-xs space-y-1.5">
                  <p className="text-[#2D2640] leading-relaxed">
                    <strong>Kegiatan:</strong> {j.kegiatan}
                  </p>
                  <p className="text-[#6B6480]">
                    <strong>Kendala & Solusi:</strong> {j.kendala}
                  </p>
                  {j.catatanGuru && (
                    <div className="p-2.5 bg-[#FAF8FD] border border-[#DEC9F5] rounded text-[#6D3FA6]">
                      <strong>Catatan Pembimbing:</strong> {j.catatanGuru}
                      {j.diverifikasiOleh && ` (oleh ${j.diverifikasiOleh})`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Journal Modal (Siswa) */}
      <Modal
        isOpen={isNewJurnalOpen}
        onClose={() => setIsNewJurnalOpen(false)}
        title="Isi Jurnal Harian PKL"
        description="Dokumentasikan kegiatan praktikum administrasi perkantoran yang dilaksanakan hari ini."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitJurnal} className="space-y-4">
          {jurnalError && (
            <div className="p-3 bg-[#FDE7E9] border border-[#B4303C]/20 rounded-[6px] text-xs text-[#B4303C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>{jurnalError}</span>
            </div>
          )}

          <Select
            label="Tempat Penempatan PKL"
            required
            value={jurnalPenempatanId}
            onChange={(e) => setJurnalPenempatanId(e.target.value)}
          >
            {penempatanList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namaSiswa} - {p.namaDudi} ({p.divisi})
              </option>
            ))}
          </Select>

          <Input
            type="date"
            label="Tanggal Pelaksanaan (Hanya Hari H)"
            required
            value={jurnalTanggal}
            onChange={(e) => setJurnalTanggal(e.target.value)}
            helperText="Sesuai SOP, jurnal tidak dapat diisi untuk tanggal yang telah lewat."
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#2D2640]">
              Deskripsi Pekerjaan / Kegiatan Harian <span className="text-[#B4303C]">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={jurnalKegiatan}
              onChange={(e) => setJurnalKegiatan(e.target.value)}
              placeholder="Contoh: Mengagendakan 25 surat masuk dinas, scanning berkas SK kepegawaian, penataan map odner arsip menurut nomor urut..."
              className="p-3 text-sm border border-[#E6DFF1] rounded-[6px] bg-white focus:outline-none focus:ring-2 focus:ring-[#8650C4]"
            />
          </div>

          <Input
            label="Kendala yang Dihadapi & Cara Mengatasi"
            value={jurnalKendala}
            onChange={(e) => setJurnalKendala(e.target.value)}
            placeholder="Tuliskan kendala teknis atau koordinasi jika ada..."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6DFF1]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsNewJurnalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan & Kirim Jurnal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Verify Jurnal Modal (Guru) */}
      <Modal
        isOpen={!!verifyingJurnal}
        onClose={() => setVerifyingJurnal(null)}
        title="Verifikasi Jurnal Harian PKL"
        description="Berikan penilaian validasi dan arahan tindak lanjut kepada siswa bimbingan."
        maxWidth="md"
      >
        {verifyingJurnal && (
          <div className="space-y-4">
            <div className="p-3 bg-[#FAF8FD] border border-[#E6DFF1] rounded-[6px] text-xs space-y-1">
              <p><strong>Siswa:</strong> {verifyingJurnal.namaSiswa}</p>
              <p><strong>DUDI:</strong> {verifyingJurnal.namaDudi}</p>
              <p><strong>Tanggal:</strong> {verifyingJurnal.tanggal}</p>
              <p><strong>Kegiatan:</strong> {verifyingJurnal.kegiatan}</p>
            </div>

            <Input
              label="Catatan Guru Pembimbing"
              value={catatanVerifikasi}
              onChange={(e) => setCatatanVerifikasi(e.target.value)}
              placeholder="Contoh: Pekerjaan sudah sesuai SOP / Lengkapi dokumentasi foto..."
            />

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E6DFF1]">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleVerifyJurnal('revisi')}
              >
                Minta Revisi
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleVerifyJurnal('valid')}
              >
                Setujui Jurnal (Valid)
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
