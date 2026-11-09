import React, { useState } from 'react';
import {
  FileText,
  Plus,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FolderSync,
  Archive,
  Send,
  Building,
  Calendar,
  Eye,
  FileCheck,
} from 'lucide-react';
import { SuratDokumen, StatusWorkflowSurat, UserRole } from '../../lib/types';
import { AppStorage } from '../../lib/storage';
import { generateNomorSurat } from '../../lib/calculations';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';

export interface SuratWorkflowViewProps {
  currentRole: UserRole;
  onViewArsip?: () => void;
}

export const SuratWorkflowView: React.FC<SuratWorkflowViewProps> = ({ currentRole, onViewArsip }) => {
  const [suratList, setSuratList] = useState<SuratDokumen[]>(() => AppStorage.getSurat());
  const [selectedStage, setSelectedStage] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isDisposisiModalOpen, setIsDisposisiModalOpen] = useState(false);
  const [isRevisiModalOpen, setIsRevisiModalOpen] = useState(false);
  const [isEksekusiModalOpen, setIsEksekusiModalOpen] = useState(false);
  const [previewSurat, setPreviewSurat] = useState<SuratDokumen | null>(null);

  const [activeSurat, setActiveSurat] = useState<SuratDokumen | null>(null);

  // Input Dokumen Form State
  const [inputJenis, setInputJenis] = useState('SK');
  const [inputJudul, setInputJudul] = useState('');
  const [inputNomorAsal, setInputNomorAsal] = useState('');
  const [inputPengirim, setInputPengirim] = useState('');
  const [inputTujuan, setInputTujuan] = useState('Kepala Program Keahlian MPLB SMKS Ekonomika');
  const [inputPerihal, setInputPerihal] = useState('');
  const [inputIsi, setInputIsi] = useState('');

  // Disposisi Form State
  const [disposisiBagian, setDisposisiBagian] = useState('Hubungan Industri & PKL');
  const [disposisiInstruksi, setDisposisiInstruksi] = useState('');
  const [disposisiTenggat, setDisposisiTenggat] = useState('');

  // Revisi Form State
  const [revisiCatatan, setRevisiCatatan] = useState('');

  // Eksekusi Form State
  const [eksekusiCatatan, setEksekusiCatatan] = useState('');

  const refreshList = () => {
    setSuratList(AppStorage.getSurat());
  };

  // Submit New Document (Tahap 1)
  const handleSubmitInputDokumen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputJudul.trim() || !inputPengirim.trim()) return;

    const newDoc: SuratDokumen = {
      id: 'srt-' + Date.now(),
      jenisSuratKode: inputJenis,
      judul: inputJudul.trim(),
      nomorAsal: inputNomorAsal.trim() || undefined,
      pengirim: inputPengirim.trim(),
      tujuan: inputTujuan.trim(),
      perihal: inputPerihal.trim() || inputJudul.trim(),
      isiRingkas: inputIsi.trim(),
      tglMasuk: new Date().toISOString().split('T')[0],
      status: 'penerimaan',
    };

    AppStorage.saveSurat(newDoc);
    setIsInputModalOpen(false);
    // Reset Form
    setInputJudul('');
    setInputNomorAsal('');
    setInputPengirim('');
    setInputPerihal('');
    setInputIsi('');
    refreshList();
  };

  // Action: Kirim ke Pimpinan untuk verifikasi
  const handleKirimVerifikasi = (surat: SuratDokumen) => {
    AppStorage.advanceWorkflowSurat(surat.id, {
      actionType: 'kirim_verifikasi',
    });
    refreshList();
  };

  // Action: Disposisi Pimpinan (Tahap 2 -> Tahap 3)
  const handleConfirmDisposisi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurat) return;

    AppStorage.advanceWorkflowSurat(activeSurat.id, {
      actionType: 'disposisi',
      disposisiKe: disposisiBagian,
      instruksiDisposisi: disposisiInstruksi.trim() || 'Tindak lanjuti sesuai SOP.',
      tenggatDisposisi: disposisiTenggat || undefined,
    });

    setIsDisposisiModalOpen(false);
    setActiveSurat(null);
    setDisposisiInstruksi('');
    refreshList();
  };

  // Action: Kembalikan untuk revisi
  const handleConfirmRevisi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurat || !revisiCatatan.trim()) return;

    AppStorage.advanceWorkflowSurat(activeSurat.id, {
      actionType: 'revisi',
      catatanRevisi: revisiCatatan.trim(),
    });

    setIsRevisiModalOpen(false);
    setActiveSurat(null);
    setRevisiCatatan('');
    refreshList();
  };

  // Action: Eksekusi pekerjaan selesai & pembuatan laporan/balasan
  const handleConfirmEksekusi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSurat) return;

    AppStorage.advanceWorkflowSurat(activeSurat.id, {
      actionType: 'selesai_eksekusi',
      catatanTindakLanjut: eksekusiCatatan.trim() || 'Pekerjaan telah ditindaklanjuti dan dokumen balasan siap.',
    });

    setIsEksekusiModalOpen(false);
    setActiveSurat(null);
    setEksekusiCatatan('');
    refreshList();
  };

  // Action: Arsipkan Dokumen (Tahap 4)
  const handleArsipkan = (surat: SuratDokumen) => {
    AppStorage.advanceWorkflowSurat(surat.id, {
      actionType: 'arsip',
    });
    refreshList();
  };

  // Filter
  const filteredList = suratList.filter((s) => {
    const matchStage = selectedStage === 'semua' || s.status === selectedStage;
    const matchSearch =
      s.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pengirim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nomorSuratResmi && s.nomorSuratResmi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.disposisiKe && s.disposisiKe.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStage && matchSearch;
  });

  const getStageBadge = (status: StatusWorkflowSurat) => {
    switch (status) {
      case 'penerimaan':
        return <Badge variant="info">1. PENERIMAAN</Badge>;
      case 'verifikasi':
        return <Badge variant="warning">2. MENUNGGU VERIFIKASI</Badge>;
      case 'revisi':
        return <Badge variant="danger">2. REVISI DIPERLUKAN</Badge>;
      case 'disposisi':
        return <Badge variant="primary">2. DISPOSISI PIMPINAN</Badge>;
      case 'eksekusi':
        return <Badge variant="warning">3. PROSES EKSEKUSI</Badge>;
      case 'arsip':
        return <Badge variant="success">4. ARSIP RESMI</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Alur Manajemen Dokumen & Disposisi Surat Otomatis"
        description="Implementasi siklus 4-tahap penerimaan surat masuk, verifikasi pimpinan, disposisi divisi, hingga pengarsipan digital berpenomoran resmi."
        action={
          currentRole !== 'guest' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsInputModalOpen(true)}
              icon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
            >
              Input Dokumen Masuk
            </Button>
          ) : undefined
        }
      />

      {/* Visual Workflow Steps Navigation Bar (Representing Flowchart) */}
      <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-3 overflow-x-auto">
        <div className="flex items-center min-w-[700px] justify-between gap-2 text-xs">
          {/* Step 1 */}
          <button
            onClick={() => setSelectedStage(selectedStage === 'penerimaan' ? 'semua' : 'penerimaan')}
            className={`flex-1 p-2 rounded-[6px] border text-left transition-colors cursor-pointer ${
              selectedStage === 'penerimaan'
                ? 'border-[#8650C4] bg-[#EEE4FA] text-[#6D3FA6] font-semibold'
                : 'border-[#E6DFF1] bg-[#FAF8FD] text-[#6B6480] hover:bg-white'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#8650C4] text-white flex items-center justify-center text-[10px]">1</span>
              <span>Penerimaan & Input</span>
            </div>
            <div className="text-[11px] text-[#6B6480] mt-0.5 truncate">
              Dokumen Masuk · Scan Digital
            </div>
          </button>

          <ArrowRight className="w-4 h-4 text-[#C8A6EE] shrink-0" strokeWidth={1.5} />

          {/* Step 2 */}
          <button
            onClick={() => setSelectedStage(selectedStage === 'verifikasi' ? 'semua' : 'verifikasi')}
            className={`flex-1 p-2 rounded-[6px] border text-left transition-colors cursor-pointer ${
              selectedStage === 'verifikasi' || selectedStage === 'disposisi'
                ? 'border-[#8650C4] bg-[#EEE4FA] text-[#6D3FA6] font-semibold'
                : 'border-[#E6DFF1] bg-[#FAF8FD] text-[#6B6480] hover:bg-white'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#8650C4] text-white flex items-center justify-center text-[10px]">2</span>
              <span>Verifikasi & Disposisi</span>
            </div>
            <div className="text-[11px] text-[#6B6480] mt-0.5 truncate">
              Validasi Pimpinan · Disposisi
            </div>
          </button>

          <ArrowRight className="w-4 h-4 text-[#C8A6EE] shrink-0" strokeWidth={1.5} />

          {/* Step 3 */}
          <button
            onClick={() => setSelectedStage(selectedStage === 'eksekusi' ? 'semua' : 'eksekusi')}
            className={`flex-1 p-2 rounded-[6px] border text-left transition-colors cursor-pointer ${
              selectedStage === 'eksekusi'
                ? 'border-[#8650C4] bg-[#EEE4FA] text-[#6D3FA6] font-semibold'
                : 'border-[#E6DFF1] bg-[#FAF8FD] text-[#6B6480] hover:bg-white'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#8650C4] text-white flex items-center justify-center text-[10px]">3</span>
              <span>Proses & Eksekusi</span>
            </div>
            <div className="text-[11px] text-[#6B6480] mt-0.5 truncate">
              Tindak Lanjut Divisi · Balasan
            </div>
          </button>

          <ArrowRight className="w-4 h-4 text-[#C8A6EE] shrink-0" strokeWidth={1.5} />

          {/* Step 4 */}
          <button
            onClick={() => setSelectedStage(selectedStage === 'arsip' ? 'semua' : 'arsip')}
            className={`flex-1 p-2 rounded-[6px] border text-left transition-colors cursor-pointer ${
              selectedStage === 'arsip'
                ? 'border-[#1F7A4D] bg-[#E3F6EC] text-[#1F7A4D] font-semibold'
                : 'border-[#E6DFF1] bg-[#FAF8FD] text-[#6B6480] hover:bg-white'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-[#1F7A4D] text-white flex items-center justify-center text-[10px]">4</span>
              <span>Arsip & Pelaporan</span>
            </div>
            <div className="text-[11px] text-[#6B6480] mt-0.5 truncate">
              Penyimpanan Cloud · Indeks SOP
            </div>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Cari perihal, nomor surat resmi, pengirim, atau bagian disposisi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[36px] px-3 text-xs bg-white border border-[#E6DFF1] rounded-[6px] focus:outline-none focus:ring-1 focus:ring-[#8650C4]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#6B6480]">Filter Tahap:</span>
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            aria-label="Filter berdasarkan tahap alur surat"
            className="h-[36px] px-2.5 text-xs bg-white border border-[#E6DFF1] rounded-[6px] text-[#2D2640]"
          >
            <option value="semua">Semua Tahap Alur</option>
            <option value="penerimaan">1. Penerimaan & Input</option>
            <option value="verifikasi">2. Menunggu Verifikasi</option>
            <option value="revisi">2. Revisi Diperlukan</option>
            <option value="disposisi">2. Sudah Didisposisikan</option>
            <option value="eksekusi">3. Proses & Eksekusi</option>
            <option value="arsip">4. Arsip Digital Selesai</option>
          </select>
        </div>
      </div>

      {/* Documents Pipeline Cards List */}
      <div className="space-y-3 min-w-0">
        {filteredList.map((surat) => (
          <div
            key={surat.id}
            className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 transition-all hover:border-[#DEC9F5] space-y-3 overflow-hidden min-w-0"
          >
            {/* Top Bar: Badges & Official Number */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6DFF1] pb-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {getStageBadge(surat.status)}
                <Badge variant="primary">{surat.jenisSuratKode}</Badge>
                {surat.nomorSuratResmi && (
                  <span className="text-xs font-bold text-[#8650C4] bg-[#EEE4FA] px-2 py-0.5 rounded tabular-nums truncate max-w-full">
                    No. Resmi: {surat.nomorSuratResmi}
                  </span>
                )}
                {surat.nomorAsal && (
                  <span className="text-xs text-[#6B6480] truncate max-w-full">No. Asal: {surat.nomorAsal}</span>
                )}
              </div>

              <div className="text-xs text-[#6B6480] tabular-nums shrink-0">
                Tgl Masuk: {surat.tglMasuk}
              </div>
            </div>

            {/* Content Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0">
              <div className="lg:col-span-2 space-y-1.5 min-w-0">
                <h3 className="text-sm font-bold text-[#2D2640] break-words">{surat.judul}</h3>
                <p className="text-xs text-[#6B6480] break-words">
                  <strong>Pengirim:</strong> {surat.pengirim} · <strong>Tujuan:</strong> {surat.tujuan}
                </p>
                <p className="text-xs text-[#2D2640] leading-relaxed bg-[#FAF8FD] p-2.5 rounded border border-[#E6DFF1] break-words">
                  <strong>Isi Ringkas:</strong> {surat.isiRingkas}
                </p>

                {/* Revision Note Alert if returned */}
                {surat.status === 'revisi' && surat.catatanRevisi && (
                  <div className="p-2.5 bg-[#FDE7E9] border border-[#B4303C]/20 rounded text-xs text-[#B4303C]">
                    <strong>Catatan Revisi dari Pimpinan:</strong> {surat.catatanRevisi}
                  </div>
                )}

                {/* Disposisi Details if assigned */}
                {surat.disposisiKe && (
                  <div className="p-2.5 bg-[#EEE4FA]/50 border border-[#DEC9F5] rounded text-xs space-y-0.5 text-[#6D3FA6]">
                    <div>
                      <strong>Disposisi Kepada:</strong> {surat.disposisiKe}
                      {surat.diverifikasiOleh && ` (Diverifikasi: ${surat.diverifikasiOleh})`}
                    </div>
                    {surat.instruksiDisposisi && (
                      <div><strong>Instruksi Pimpinan:</strong> {surat.instruksiDisposisi}</div>
                    )}
                    {surat.tenggatDisposisi && (
                      <div className="text-[#8A6100]"><strong>Batas Waktu:</strong> {surat.tenggatDisposisi}</div>
                    )}
                  </div>
                )}

                {/* Follow-up / Execution Details */}
                {surat.catatanTindakLanjut && (
                  <div className="p-2.5 bg-[#E8F8F5] border border-[#2BB5A0]/20 rounded text-xs text-[#1F7A4D]">
                    <strong>Tindak Lanjut & Laporan Hasil:</strong> {surat.catatanTindakLanjut}
                  </div>
                )}
              </div>

              {/* Action Buttons for each Workflow Step */}
              <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#E6DFF1] pt-3 lg:pt-0 lg:pl-4 space-y-2">
                <div className="space-y-2">
                  {/* Step 1: Penerimaan -> Kirim Verifikasi */}
                  {surat.status === 'penerimaan' && currentRole !== 'guest' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => handleKirimVerifikasi(surat)}
                      icon={<Send className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    >
                      Kirim ke Pimpinan
                    </Button>
                  )}

                  {/* Step 2: Verifikasi / Disposisi (Admin / Pimpinan) */}
                  {(surat.status === 'verifikasi' || surat.status === 'revisi') &&
                    (currentRole === 'admin' || currentRole === 'guru') && (
                      <div className="space-y-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setActiveSurat(surat);
                            setIsDisposisiModalOpen(true);
                          }}
                          icon={<Building className="w-3.5 h-3.5" strokeWidth={1.5} />}
                        >
                          Disposisi & Terbitkan No
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-[#B4303C]"
                          onClick={() => {
                            setActiveSurat(surat);
                            setIsRevisiModalOpen(true);
                          }}
                          icon={<RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />}
                        >
                          Minta Revisi Dokumen
                        </Button>
                      </div>
                    )}

                  {/* Step 3: Proses & Eksekusi Divisi */}
                  {surat.status === 'disposisi' && currentRole !== 'guest' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setActiveSurat(surat);
                        setIsEksekusiModalOpen(true);
                      }}
                      icon={<FileCheck className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    >
                      Tindak Lanjut & Selesai
                    </Button>
                  )}

                  {/* Step 4: Selesai Eksekusi -> Arsip Digital */}
                  {surat.status === 'eksekusi' && currentRole !== 'guest' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full bg-[#1F7A4D] hover:bg-[#165c3a]"
                      onClick={() => handleArsipkan(surat)}
                      icon={<Archive className="w-3.5 h-3.5" strokeWidth={1.5} />}
                    >
                      Simpan ke Arsip Digital
                    </Button>
                  )}

                  {/* Preview Official Letterhead Modal */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setPreviewSurat(surat)}
                    icon={<Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
                  >
                    Pratinjau Surat Resmi
                  </Button>
                </div>

                <div className="text-[11px] text-[#6B6480] bg-[#FAF8FD] p-2 rounded text-center">
                  SOP Kearsipan MPLB SMKS Ekonomika
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: INPUT DOKUMEN MASUK BARU */}
      <Modal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        title="[1. Penerimaan & Input Dokumen]"
        description="Pencatatan surat masuk, pengajuan, atau laporan dinas ke sistem digital kearsipan MPLB."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitInputDokumen} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Jenis Dokumen / Surat"
              required
              value={inputJenis}
              onChange={(e) => setInputJenis(e.target.value)}
            >
              <option value="SK">SK - Surat Keputusan / Kerjasama</option>
              <option value="SD">SD - Surat Dinas / Undangan</option>
              <option value="SP">SP - Surat Pengajuan / Permohonan</option>
              <option value="SPPD">SPPD - Surat Tugas Perjalanan Dinas</option>
              <option value="KET">KET - Surat Keterangan Administrasi</option>
            </Select>

            <Input
              label="Nomor Asal Dokumen (Jika Ada)"
              value={inputNomorAsal}
              onChange={(e) => setInputNomorAsal(e.target.value)}
              placeholder="Contoh: 042/DUDI-TLKM/X/2026"
            />
          </div>

          <Input
            label="Judul Dokumen"
            required
            value={inputJudul}
            onChange={(e) => setInputJudul(e.target.value)}
            placeholder="Contoh: Surat Permohonan Kerjasama Tempat PKL dan Magang Guru"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Instansi / Pengirim"
              required
              value={inputPengirim}
              onChange={(e) => setInputPengirim(e.target.value)}
              placeholder="Contoh: PT Telkom Indonesia Witel Depok"
            />
            <Input
              label="Tujuan Penerima di Sekolah"
              required
              value={inputTujuan}
              onChange={(e) => setInputTujuan(e.target.value)}
              placeholder="Contoh: Kepala Program MPLB"
            />
          </div>

          <Input
            label="Perihal Dokumen"
            value={inputPerihal}
            onChange={(e) => setInputPerihal(e.target.value)}
            placeholder="Contoh: Kerjasama PKL dan Penyusunan Kurikulum DUDI"
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#2D2640]">
              Ringkasan Isi Dokumen <span className="text-[#B4303C]">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={inputIsi}
              onChange={(e) => setInputIsi(e.target.value)}
              placeholder="Tuliskan intisari isi surat atau dokumen yang diterima..."
              className="p-3 text-sm border border-[#E6DFF1] rounded-[6px] bg-white focus:outline-none focus:ring-2 focus:ring-[#8650C4]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6DFF1]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsInputModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Dokumen Masuk
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: VERIFIKASI & DISPOSISI PIMPINAN */}
      <Modal
        isOpen={isDisposisiModalOpen}
        onClose={() => setIsDisposisiModalOpen(false)}
        title="[2. Verifikasi & Disposisi oleh Pimpinan]"
        description="Dokumen dinyatakan VALID. Tentukan bagian/divisi penerima dan terbitkan nomor surat resmi berurutan."
        maxWidth="md"
      >
        {activeSurat && (
          <form onSubmit={handleConfirmDisposisi} className="space-y-4">
            <div className="p-3 bg-[#FAF8FD] border border-[#E6DFF1] rounded-[6px] text-xs space-y-1">
              <p><strong>Perihal:</strong> {activeSurat.judul}</p>
              <p><strong>Pengirim:</strong> {activeSurat.pengirim}</p>
              <p className="text-[#8650C4] font-bold">
                Nomor Resmi yang akan Diterbitkan: {generateNomorSurat(suratList.filter(s => s.nomorUrut).length + 1, activeSurat.jenisSuratKode)}
              </p>
            </div>

            <Select
              label="Pilih Bagian / Divisi Disposisi"
              required
              value={disposisiBagian}
              onChange={(e) => setDisposisiBagian(e.target.value)}
            >
              <option value="Hubungan Industri & PKL">Hubungan Industri & PKL (Koordinator PKL)</option>
              <option value="Kearsipan & Dokumentasi">Kearsipan & Dokumentasi</option>
              <option value="Pengajaran & Kurikulum">Pengajaran & Asesmen Kurikulum</option>
              <option value="Keuangan & Kas Kecil">Keuangan & Petty Cash</option>
              <option value="Sarana & Prasarana">Sarana & Prasarana Lab</option>
              <option value="Tata Usaha Kepegawaian">Tata Usaha Kepegawaian</option>
            </Select>

            <Input
              label="Instruksi Disposisi Pimpinan"
              required
              value={disposisiInstruksi}
              onChange={(e) => setDisposisiInstruksi(e.target.value)}
              placeholder="Contoh: Segera buat draft balasan dan jadwalkan rapat..."
            />

            <Input
              type="date"
              label="Batas Waktu Tindak Lanjut (Tenggat)"
              value={disposisiTenggat}
              onChange={(e) => setDisposisiTenggat(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6DFF1]">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsDisposisiModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Terbitkan Nomor & Disposisikan
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: REVISI DOKUMEN */}
      <Modal
        isOpen={isRevisiModalOpen}
        onClose={() => setIsRevisiModalOpen(false)}
        title="Kembalikan Dokumen untuk Revisi"
        description="Dokumen dinyatakan TIDAK VALID. Masukkan alasan penolakan atau kekurangan berkas."
        maxWidth="md"
      >
        {activeSurat && (
          <form onSubmit={handleConfirmRevisi} className="space-y-4">
            <div className="p-3 bg-[#FAF8FD] border border-[#E6DFF1] rounded text-xs">
              <p><strong>Judul Dokumen:</strong> {activeSurat.judul}</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#2D2640]">
                Catatan Revisi / Alasan Pengembalian <span className="text-[#B4303C]">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={revisiCatatan}
                onChange={(e) => setRevisiCatatan(e.target.value)}
                placeholder="Contoh: Dokumen belum ditandatangani basah oleh pimpinan instansi pengirim / Lampiran proposal kurang..."
                className="p-3 text-sm border border-[#E6DFF1] rounded bg-white focus:ring-2 focus:ring-[#8650C4]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E6DFF1]">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsRevisiModalOpen(false)}>
                Batal
              </Button>
              <Button variant="destructive" size="sm" type="submit">
                Kembalikan untuk Revisi
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: PROSES & EKSEKUSI PEKERJAAN */}
      <Modal
        isOpen={isEksekusiModalOpen}
        onClose={() => setIsEksekusiModalOpen(false)}
        title="[3. Proses & Eksekusi Pekerjaan]"
        description="Tindak lanjut oleh divisi terkait dan pembuatan dokumen balasan / laporan hasil."
        maxWidth="md"
      >
        {activeSurat && (
          <form onSubmit={handleConfirmEksekusi} className="space-y-4">
            <div className="p-3 bg-[#FAF8FD] border border-[#E6DFF1] rounded text-xs space-y-1">
              <p><strong>Dokumen:</strong> {activeSurat.judul}</p>
              <p><strong>Instruksi Disposisi:</strong> {activeSurat.instruksiDisposisi}</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#2D2640]">
                Laporan Hasil Eksekusi / Catatan Tindak Lanjut <span className="text-[#B4303C]">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={eksekusiCatatan}
                onChange={(e) => setEksekusiCatatan(e.target.value)}
                placeholder="Contoh: Telah disusun draft MoU kerjasama dan dokumen balasan resmi nomor 007/SK/MPLB/X/2026..."
                className="p-3 text-sm border border-[#E6DFF1] rounded bg-white focus:ring-2 focus:ring-[#8650C4]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E6DFF1]">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsEksekusiModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Simpan Hasil Eksekusi
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL PREVIEW SURAT RESMI */}
      <Modal
        isOpen={!!previewSurat}
        onClose={() => setPreviewSurat(null)}
        title="Pratinjau Dokumen Surat Resmi"
        description="Format standar kop resmi jurusan MPLB SMKS Ekonomika Depok."
        maxWidth="lg"
      >
        {previewSurat && (
          <div className="space-y-4">
            {/* Kop Surat */}
            <div className="border border-[#2D2640]/20 p-6 bg-white rounded shadow-xs text-[#2D2640]">
              <div className="text-center border-b-2 border-[#2D2640] pb-3 mb-4">
                <h2 className="text-base font-bold tracking-wide uppercase">
                  YAYASAN PENDIDIKAN EKONOMIKA DEPOK
                </h2>
                <h1 className="text-lg font-extrabold uppercase">
                  SMKS EKONOMIKA DEPOK
                </h1>
                <p className="text-xs font-semibold text-[#6D3FA6]">
                  PROGRAM KEAHLIAN MANAJEMEN PERKANTORAN DAN LAYANAN BISNIS (MPLB)
                </p>
                <p className="text-[11px] text-[#6B6480] mt-0.5">
                  Jl. Raya Sawangan No. 45, Kota Depok, Jawa Barat 16436 · Telp: (021) 777-1234
                </p>
              </div>

              {/* Header Surat */}
              <div className="flex justify-between text-xs mb-4">
                <div>
                  <p><strong>Nomor:</strong> {previewSurat.nomorSuratResmi || '---/DRAFT/MPLB/---'}</p>
                  <p><strong>Lampiran:</strong> 1 (Satu) Berkas</p>
                  <p><strong>Perihal:</strong> {previewSurat.perihal}</p>
                </div>
                <div className="text-right">
                  <p>Depok, {previewSurat.tglMasuk}</p>
                </div>
              </div>

              <div className="text-xs mb-4">
                <p>Kepada Yth:</p>
                <p className="font-semibold">{previewSurat.tujuan}</p>
                <p>di Tempat</p>
              </div>

              {/* Isi Surat */}
              <div className="text-xs space-y-2 leading-relaxed text-justify mb-8">
                <p>Dengan hormat,</p>
                <p>{previewSurat.isiRingkas}</p>
                {previewSurat.catatanTindakLanjut && (
                  <p className="italic bg-[#FAF8FD] p-2 border-l-2 border-[#8650C4]">
                    Tindak Lanjut Pelaksanaan: {previewSurat.catatanTindakLanjut}
                  </p>
                )}
                <p>
                  Demikian dokumen dan informasi ini kami sampaikan. Atas perhatian dan kerjasama
                  yang baik, kami ucapkan terima kasih.
                </p>
              </div>

              {/* Tanda Tangan */}
              <div className="flex justify-end text-xs">
                <div className="text-center w-60">
                  <p>Mengetahui,</p>
                  <p className="font-medium">Kepala Program Keahlian MPLB</p>
                  <div className="my-4 h-12 flex items-center justify-center">
                    <span className="text-[10px] text-[#6D3FA6] border border-dashed border-[#8650C4] px-2 py-1 rounded">
                      [TTE DIGITAL RESMI SMKS EKONOMIKA]
                    </span>
                  </div>
                  <p className="font-bold underline">Dra. Hj. Ratna Juwita, M.Pd.</p>
                  <p className="text-[11px] text-[#6B6480]">NIP. 197508152002122001</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewSurat(null)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  window.print();
                }}
              >
                Cetak Dokumen
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
