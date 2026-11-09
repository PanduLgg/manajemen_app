import React, { useState } from 'react';
import { Archive, Search, Download, Eye, FileText, Printer, CheckCircle } from 'lucide-react';
import { SuratDokumen, UserRole } from '../../lib/types';
import { AppStorage } from '../../lib/storage';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { PageHeader } from '../ui/PageHeader';
import { Modal } from '../ui/Modal';

export interface ArsipDigitalViewProps {
  currentRole: UserRole;
}

export const ArsipDigitalView: React.FC<ArsipDigitalViewProps> = ({ currentRole }) => {
  const [suratList] = useState<SuratDokumen[]>(() => AppStorage.getSurat());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState('semua');
  const [previewSurat, setPreviewSurat] = useState<SuratDokumen | null>(null);

  // Documents that are either in 'arsip' status or have official numbering
  const arsipDocuments = suratList.filter(
    (s) => s.status === 'arsip' || !!s.nomorSuratResmi
  );

  const filtered = arsipDocuments.filter((s) => {
    const matchSearch =
      s.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nomorSuratResmi && s.nomorSuratResmi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.pengirim.toLowerCase().includes(searchQuery.toLowerCase());

    const matchKategori =
      filterKategori === 'semua' || s.jenisSuratKode === filterKategori;

    return matchSearch && matchKategori;
  });

  const columns: ColumnDef<SuratDokumen>[] = [
    {
      key: 'row_num',
      header: 'No',
      type: 'row-number',
    },
    {
      key: 'nomorSuratResmi',
      header: 'Nomor Surat Resmi',
      type: 'short-text',
      render: (s) => (
        <span className="font-bold text-[#8650C4] tabular-nums text-xs">
          {s.nomorSuratResmi || '00' + s.id.slice(-1) + '/SK/MPLB/X/2026'}
        </span>
      ),
    },
    {
      key: 'judul',
      header: 'Judul Dokumen & Perihal',
      type: 'main-text',
      render: (s) => (
        <div>
          <div className="font-medium text-xs text-[#2D2640] truncate max-w-[280px]">
            {s.judul}
          </div>
          <div className="text-[11px] text-[#6B6480]">
            Pengirim: {s.pengirim} · Disposisi: {s.disposisiKe || '-'}
          </div>
        </div>
      ),
    },
    {
      key: 'jenisSuratKode',
      header: 'Klasifikasi',
      type: 'status',
      render: (s) => <Badge variant="primary">{s.jenisSuratKode}</Badge>,
    },
    {
      key: 'tglMasuk',
      header: 'Tgl Arsip',
      type: 'date',
      render: (s) => (
        <span className="text-xs tabular-nums text-[#2D2640]">
          {s.tglArsip || s.tglMasuk}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status Arsip',
      type: 'status',
      render: () => <Badge variant="success">TERVERIFIKASI</Badge>,
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
            onClick={() => setPreviewSurat(s)}
            icon={<Eye className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            Buka
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Arsip Digital Dokumen & Surat"
        description="Repositori digital terpusat untuk dokumen surat resmi, SK kerjasama DUDI, dan laporan kegiatan jurusan MPLB."
      />

      <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B6480] absolute left-3 top-3 pointer-events-none" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Cari berdasarkan nomor surat resmi, judul, atau pengirim..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[40px] pl-9 pr-3 text-sm bg-white border border-[#E6DFF1] rounded-[6px] focus:outline-none focus:ring-2 focus:ring-[#8650C4]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            aria-label="Filter klasifikasi arsip"
            className="h-[40px] px-3 text-sm bg-white border border-[#E6DFF1] rounded-[6px] text-[#2D2640]"
          >
            <option value="semua">Semua Klasifikasi</option>
            <option value="SK">SK - Surat Keputusan</option>
            <option value="SD">SD - Surat Dinas</option>
            <option value="SP">SP - Surat Pengajuan</option>
            <option value="SPPD">SPPD - Perjalanan Dinas</option>
          </select>
        </div>
      </div>

      <DataTable
        data={filtered}
        columns={columns}
        rowKey={(s) => s.id}
        emptyMessage="Belum ada arsip digital untuk kategori ini"
      />

      {/* Detail / Preview Modal */}
      <Modal
        isOpen={!!previewSurat}
        onClose={() => setPreviewSurat(null)}
        title="Arsip Dokumen Resmi MPLB"
        description="Salinan digital sah tersimpan di cloud repository sekolah."
        maxWidth="lg"
      >
        {previewSurat && (
          <div className="space-y-4">
            <div className="p-4 bg-[#FAF8FD] border border-[#E6DFF1] rounded-[6px] text-xs space-y-2">
              <div className="flex justify-between items-center border-b border-[#E6DFF1] pb-2">
                <span className="font-bold text-sm text-[#8650C4]">
                  {previewSurat.nomorSuratResmi || '007/SK/MPLB/X/2026'}
                </span>
                <Badge variant="success">ARSIP DIGITAL TERVALIDASI</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <p><strong>Perihal:</strong> {previewSurat.perihal}</p>
                <p><strong>Pengirim:</strong> {previewSurat.pengirim}</p>
                <p><strong>Penerima:</strong> {previewSurat.tujuan}</p>
                <p><strong>Disposisi Divisi:</strong> {previewSurat.disposisiKe || 'Arsip Umum'}</p>
              </div>

              <div className="pt-2 border-t border-[#E6DFF1]">
                <p className="font-semibold text-[#2D2640]">Ringkasan Dokumen:</p>
                <p className="text-[#6B6480] mt-0.5 leading-relaxed">{previewSurat.isiRingkas}</p>
              </div>

              {previewSurat.catatanTindakLanjut && (
                <div className="pt-2 border-t border-[#E6DFF1]">
                  <p className="font-semibold text-[#1F7A4D]">Hasil Tindak Lanjut:</p>
                  <p className="text-[#1F7A4D] mt-0.5">{previewSurat.catatanTindakLanjut}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewSurat(null)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.print()}
                icon={<Printer className="w-3.5 h-3.5" strokeWidth={1.5} />}
              >
                Cetak Lembar Disposisi & Arsip
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
