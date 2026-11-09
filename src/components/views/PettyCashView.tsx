import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Wallet,
  Calendar,
} from 'lucide-react';
import { PettyCashTransaction, UserRole } from '../../lib/types';
import { AppStorage } from '../../lib/storage';
import { calculatePettyCashSummary, formatRupiah } from '../../lib/calculations';
import { DataTable, ColumnDef } from '../ui/DataTable';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input, Select } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';

export interface PettyCashViewProps {
  currentRole: UserRole;
}

export const PettyCashView: React.FC<PettyCashViewProps> = ({ currentRole }) => {
  const [transactions, setTransactions] = useState<PettyCashTransaction[]>(() =>
    AppStorage.getPettyCash()
  );
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form State
  const [formTipe, setFormTipe] = useState<'debit' | 'kredit'>('debit');
  const [formPos, setFormPos] = useState<PettyCashTransaction['posAnggaran']>('ATK & Materai');
  const [formKeterangan, setFormKeterangan] = useState('');
  const [formNominal, setFormNominal] = useState(150000);
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);

  const refreshData = () => {
    setTransactions(AppStorage.getPettyCash());
  };

  const summary = calculatePettyCashSummary(transactions);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKeterangan.trim() || formNominal <= 0) return;

    const count = transactions.length + 1;
    const prefix = formTipe === 'debit' ? 'BKK' : 'BKM';
    const nomorVoucher = `${prefix}-${String(count).padStart(3, '0')}/PC/X/26`;

    AppStorage.savePettyCash({
      nomorVoucher,
      tanggal: formTanggal,
      tipe: formTipe,
      posAnggaran: formPos,
      keterangan: formKeterangan.trim(),
      nominal: Number(formNominal),
      dicatatOleh: 'Bendahara Jurusan MPLB',
    });

    setIsAddOpen(false);
    setFormKeterangan('');
    refreshData();
  };

  const handleExportKas = () => {
    const headers = ['No', 'No. Voucher', 'Tanggal', 'Tipe', 'Pos Anggaran', 'Keterangan', 'Pemasukan (Kredit)', 'Pengeluaran (Debit)'];
    const rows = transactions.map((t, idx) => [
      idx + 1,
      t.nomorVoucher,
      t.tanggal,
      t.tipe.toUpperCase(),
      `"${t.posAnggaran}"`,
      `"${t.keterangan}"`,
      t.tipe === 'kredit' ? t.nominal : 0,
      t.tipe === 'debit' ? t.nominal : 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mutasi_Kas_Kecil_MPLB_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<PettyCashTransaction>[] = [
    { key: 'row_num', header: 'No', type: 'row-number' },
    {
      key: 'nomorVoucher',
      header: 'No. Voucher',
      type: 'short-text',
      render: (t) => <span className="font-bold text-xs text-[#2D2640] tabular-nums">{t.nomorVoucher}</span>,
    },
    {
      key: 'tanggal',
      header: 'Tanggal',
      type: 'date',
      render: (t) => <span className="text-xs text-[#2D2640] tabular-nums">{t.tanggal}</span>,
    },
    {
      key: 'keterangan',
      header: 'Uraian Keperluan & Pos Anggaran',
      type: 'main-text',
      render: (t) => (
        <div>
          <div className="font-medium text-xs text-[#2D2640] truncate max-w-[280px]">{t.keterangan}</div>
          <div className="text-[11px] text-[#6B6480]">Pos: {t.posAnggaran}</div>
        </div>
      ),
    },
    {
      key: 'pemasukan',
      header: 'Pemasukan (Kredit)',
      type: 'amount',
      render: (t) => (
        <span className="text-xs font-semibold tabular-nums text-[#1F7A4D]">
          {t.tipe === 'kredit' ? formatRupiah(t.nominal) : '-'}
        </span>
      ),
    },
    {
      key: 'pengeluaran',
      header: 'Pengeluaran (Debit)',
      type: 'amount',
      render: (t) => (
        <span className="text-xs font-semibold tabular-nums text-[#B4303C]">
          {t.tipe === 'debit' ? formatRupiah(t.nominal) : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Administrasi Keuangan Kas Kecil (Petty Cash)"
        description="Pengelolaan dana kas kecil operasional jurusan perkantoran menggunakan metode pembukuan imprest standar kantor."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportKas}
              icon={<Download className="w-3.5 h-3.5" strokeWidth={1.5} />}
            >
              Export Buku Kas
            </Button>
            {currentRole !== 'guest' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
              >
                Catat Voucher Kas
              </Button>
            )}
          </div>
        }
      />

      {/* KPI Balance Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Saldo Saat Ini */}
        <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#6B6480]">Saldo Kas Berjalan</span>
            <div className="text-2xl font-bold text-[#8650C4] mt-1 tabular-nums">
              {formatRupiah(summary.saldoSaatIni)}
            </div>
            <span className="text-[11px] text-[#1F7A4D] font-medium">Dana Tunai Tersedia di Brankas</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#EEE4FA] text-[#8650C4] flex items-center justify-center">
            <Wallet className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>

        {/* Total Pemasukan */}
        <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#6B6480]">Total Pengisian Kas (BKM)</span>
            <div className="text-2xl font-bold text-[#1F7A4D] mt-1 tabular-nums">
              {formatRupiah(summary.totalPemasukan)}
            </div>
            <span className="text-[11px] text-[#6B6480]">Drop Dana Bulan Oktober</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E3F6EC] text-[#1F7A4D] flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-white border border-[#E6DFF1] rounded-[8px] p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#6B6480]">Total Pengeluaran (BKK)</span>
            <div className="text-2xl font-bold text-[#B4303C] mt-1 tabular-nums">
              {formatRupiah(summary.totalPengeluaran)}
            </div>
            <span className="text-[11px] text-[#6B6480]">Operasional ATK & Konsumsi</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#FDE7E9] text-[#B4303C] flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Main Mutasi Table */}
      <DataTable
        data={transactions}
        columns={columns}
        rowKey={(t) => t.id}
        emptyMessage="Belum ada transaksi kas kecil tercatat"
      />

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Catat Voucher Transaksi Kas Kecil"
        description="Bukti Kas Keluar (BKK) untuk pengeluaran atau Bukti Kas Masuk (BKM) untuk penambahan dana."
        maxWidth="md"
      >
        <form onSubmit={handleSaveTransaction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Jenis Voucher"
              required
              value={formTipe}
              onChange={(e) => {
                const t = e.target.value as 'debit' | 'kredit';
                setFormTipe(t);
                if (t === 'kredit') setFormPos('Pengisian Kas');
                else setFormPos('ATK & Materai');
              }}
            >
              <option value="debit">BKK - Bukti Kas Keluar (Pengeluaran)</option>
              <option value="kredit">BKM - Bukti Kas Masuk (Penerimaan)</option>
            </Select>

            <Select
              label="Pos Anggaran"
              required
              value={formPos}
              onChange={(e) => setFormPos(e.target.value as any)}
            >
              {formTipe === 'debit' ? (
                <>
                  <option value="ATK & Materai">ATK & Materai</option>
                  <option value="Konsumsi Rapat">Konsumsi Rapat</option>
                  <option value="Perlengkapan Lab">Perlengkapan Lab</option>
                  <option value="Kurir & Transport">Kurir & Transport</option>
                </>
              ) : (
                <option value="Pengisian Kas">Pengisian Kas (Drop Dana)</option>
              )}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Tanggal Transaksi"
              required
              value={formTanggal}
              onChange={(e) => setFormTanggal(e.target.value)}
            />

            <Input
              type="number"
              label="Nominal (Rp)"
              required
              min={1000}
              step={1000}
              value={formNominal}
              onChange={(e) => setFormNominal(Number(e.target.value))}
            />
          </div>

          <Input
            label="Keterangan / Uraian Keperluan"
            required
            value={formKeterangan}
            onChange={(e) => setFormKeterangan(e.target.value)}
            placeholder="Contoh: Pembelian 10 materai Rp 10.000 untuk MoU PKL"
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6DFF1]">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAddOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Simpan Voucher Transaksi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
