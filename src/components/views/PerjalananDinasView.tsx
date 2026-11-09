import React, { useState } from 'react';
import { Plane, Plus, Printer, CheckCircle2, FileText, Search } from 'lucide-react';
import { PerjalananDinas, UserRole } from '../../lib/types';
import { AppStorage } from '../../lib/storage';
import { formatRupiah } from '../../lib/calculations';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';

export interface PerjalananDinasViewProps {
  currentRole: UserRole;
}

export const PerjalananDinasView: React.FC<PerjalananDinasViewProps> = ({ currentRole }) => {
  const [sppdList, setSppdList] = useState<PerjalananDinas[]>(() => AppStorage.getPerjalananDinas());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [previewSppd, setPreviewSppd] = useState<PerjalananDinas | null>(null);

  // Form State
  const [formNama, setFormNama] = useState('Hendra Gunawan, S.Pd.');
  const [formNip, setFormNip] = useState('198204122008011003');
  const [formJabatan, setFormJabatan] = useState('Koordinator PKL & Guru Produktif MPLB');
  const [formMaksud, setFormMaksud] = useState('');
  const [formTujuan, setFormTujuan] = useState('');
  const [formBerangkat, setFormBerangkat] = useState(new Date().toISOString().split('T')[0]);
  const [formKembali, setFormKembali] = useState(new Date().toISOString().split('T')[0]);
  const [formBiaya, setFormBiaya] = useState(450000);

  const refreshData = () => {
    setSppdList(AppStorage.getPerjalananDinas());
  };

  const handleSaveSppd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMaksud.trim() || !formTujuan.trim()) return;

    const count = sppdList.length + 1;
    const formattedNum = String(count).padStart(3, '0');
    const nomorSppd = `${formattedNum}/SPPD/MPLB/X/2026`;

    const d1 = new Date(formBerangkat);
    const d2 = new Date(formKembali);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const lamaHari = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    AppStorage.savePerjalananDinas({
      id: 'spd-' + Date.now(),
      nomorSppd,
      namaPegawai: formNama.trim(),
      nip: formNip.trim(),
      jabatan: formJabatan.trim(),
      maksudTugas: formMaksud.trim(),
      tujuan: formTujuan.trim(),
      tglBerangkat: formBerangkat,
      tglKembali: formKembali,
      lamaHari,
      estimasiBiaya: Number(formBiaya),
      status: currentRole === 'admin' ? 'Disetujui' : 'Pengajuan',
    });

    setIsAddOpen(false);
    refreshData();
  };

  const columns: ColumnDef<PerjalananDinas>[] = [
    { key: 'row_num', header: 'No', type: 'row-number' },
    {
      key: 'nomorSppd',
      header: 'No. SPPD Resmi',
      type: 'short-text',
      render: (s) => <span className="font-bold text-xs text-[#8650C4] tabular-nums">{s.nomorSppd}</span>,
    },
    {
      key: 'namaPegawai',
      header: 'Pegawai / Guru yang Ditugaskan',
      type: 'main-text',
      render: (s) => (
        <div>
          <div className="font-semibold text-xs text-[#2D2640]">{s.namaPegawai}</div>
          <div className="text-[11px] text-[#6B6480]">{s.jabatan} (NIP: {s.nip})</div>
        </div>
      ),
    },
    {
      key: 'maksudTugas',
      header: 'Maksud Perjalanan & Tujuan',
      type: 'main-text',
      render: (s) => (
        <div>
          <div className="font-medium text-xs text-[#2D2640] truncate max-w-[260px]">{s.maksudTugas}</div>
          <div className="text-[11px] text-[#6D3FA6]">Tujuan: {s.tujuan} ({s.lamaHari} Hari)</div>
        </div>
      ),
    },
    {
      key: 'estimasiBiaya',
      header: 'Estimasi Biaya',
      type: 'amount',
      render: (s) => (
        <span className="font-bold text-xs text-[#2D2640] tabular-nums">
          {formatRupiah(s.estimasiBiaya)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      type: 'status',
      render: (s) => (
        <Badge variant={s.status === 'Disetujui' ? 'success' : s.status === 'Selesai' ? 'info' : 'warning'}>
          {s.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      type: 'actions',
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewSppd(s)}
            icon={<Printer className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            SPPD
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Surat Perintah Perjalanan Dinas (SPPD) Guru & Pegawai"
        description="Pengajuan tugas dinas luar sekolah, monitoring PKL ke industri mitra, dan pertanggungjawaban operasional."
        action={
          currentRole !== 'guest' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddOpen(true)}
              icon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
            >
              Buat Pengajuan SPPD
            </Button>
          ) : undefined
        }
      />

      <DataTable
        data={sppdList}
        columns={columns}
        rowKey={(s) => s.id}
        emptyMessage="Belum ada riwayat SPPD"
      />

      {/* Modal Add SPPD */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Pengajuan Perjalanan Dinas (SPPD)"
        description="Surat resmi penugasan dinas luar bagi tenaga pendidik jurusan MPLB."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveSppd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Nama Pegawai yang Ditugaskan"
              required
              value={formNama}
              onChange={(e) => setFormNama(e.target.value)}
            />
            <Input
              label="NIP / NIK"
              required
              value={formNip}
              onChange={(e) => setFormNip(e.target.value)}
            />
          </div>

          <Input
            label="Jabatan Pegawai"
            required
            value={formJabatan}
            onChange={(e) => setFormJabatan(e.target.value)}
          />

          <Input
            label="Maksud Perjalanan Dinas"
            required
            value={formMaksud}
            onChange={(e) => setFormMaksud(e.target.value)}
            placeholder="Contoh: Monitoring dan evaluasi kemajuan siswa PKL di DUDI..."
          />

          <Input
            label="Tempat Tujuan / Lokasi Instansi"
            required
            value={formTujuan}
            onChange={(e) => setFormTujuan(e.target.value)}
            placeholder="Contoh: Balai Kota Depok & PT Telkom Indonesia Witel Depok"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              type="date"
              label="Tanggal Berangkat"
              required
              value={formBerangkat}
              onChange={(e) => setFormBerangkat(e.target.value)}
            />
            <Input
              type="date"
              label="Tanggal Kembali"
              required
              value={formKembali}
              onChange={(e) => setFormKembali(e.target.value)}
            />
            <Input
              type="number"
              label="Estimasi Biaya (Rp)"
              required
              min={0}
              value={formBiaya}
              onChange={(e) => setFormBiaya(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6DFF1]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan & Ajukan SPPD
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Preview Lembar SPPD Resmi */}
      <Modal
        isOpen={!!previewSppd}
        onClose={() => setPreviewSppd(null)}
        title="Lembar Surat Perintah Perjalanan Dinas"
        description="Dokumen dinas resmi SMKS Ekonomika Depok."
        maxWidth="lg"
      >
        {previewSppd && (
          <div className="space-y-4">
            <div className="border border-[#2D2640]/20 p-6 bg-white rounded text-[#2D2640] text-xs">
              <div className="text-center border-b-2 border-[#2D2640] pb-2 mb-4">
                <h2 className="font-bold uppercase tracking-wider text-sm">SMKS EKONOMIKA DEPOK</h2>
                <h1 className="font-extrabold uppercase text-base">SURAT PERINTAH PERJALANAN DINAS (SPPD)</h1>
                <p className="text-xs text-[#8650C4] font-semibold">Nomor: {previewSppd.nomorSppd}</p>
              </div>

              <div className="divide-y divide-[#E6DFF1] border border-[#E6DFF1] rounded">
                <div className="p-2.5 flex justify-between">
                  <span className="w-1/3 text-[#6B6480]">1. Pejabat Yang Memberi Perintah</span>
                  <span className="w-2/3 font-semibold">Kepala Program Keahlian MPLB</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="w-1/3 text-[#6B6480]">2. Nama Pegawai yang Diperintahkan</span>
                  <span className="w-2/3 font-bold text-[#8650C4]">{previewSppd.namaPegawai}</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="w-1/3 text-[#6B6480]">3. NIP / Jabatan</span>
                  <span className="w-2/3">{previewSppd.nip} / {previewSppd.jabatan}</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="w-1/3 text-[#6B6480]">4. Maksud Perjalanan Dinas</span>
                  <span className="w-2/3">{previewSppd.maksudTugas}</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="w-1/3 text-[#6B6480]">5. Tempat Tujuan</span>
                  <span className="w-2/3 font-medium">{previewSppd.tujuan}</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="w-1/3 text-[#6B6480]">6. Lamanya Perjalanan Dinas</span>
                  <span className="w-2/3">{previewSppd.lamaHari} Hari ({previewSppd.tglBerangkat} s/d {previewSppd.tglKembali})</span>
                </div>
                <div className="p-2.5 flex justify-between">
                  <span className="w-1/3 text-[#6B6480]">7. Pembebanan Anggaran</span>
                  <span className="w-2/3 font-bold">{formatRupiah(previewSppd.estimasiBiaya)} (Kas Kecil / BOS)</span>
                </div>
              </div>

              <div className="flex justify-end mt-6 text-center">
                <div className="w-56">
                  <p>Dikeluarkan di: Depok</p>
                  <p className="font-semibold mt-1">Kepala Sekolah / Program MPLB</p>
                  <div className="my-3 text-[10px] text-[#6D3FA6] border border-dashed border-[#8650C4] py-1 rounded">
                    [TTE TERTANDATANGAN RESMI]
                  </div>
                  <p className="font-bold underline">Dra. Hj. Ratna Juwita, M.Pd.</p>
                  <p className="text-[11px] text-[#6B6480]">NIP. 197508152002122001</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewSppd(null)}>
                Tutup
              </Button>
              <Button variant="primary" size="sm" onClick={() => window.print()} icon={<Printer className="w-3.5 h-3.5" strokeWidth={1.5} />}>
                Cetak Lembar SPPD
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
