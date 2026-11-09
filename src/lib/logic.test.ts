import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toRomanMonth,
  generateNomorSurat,
  calculateAttendanceSummary,
  calculatePettyCashSummary,
  maskSensitiveData,
} from './calculations';
import { AbsensiRecord, PettyCashTransaction } from './types';

test('toRomanMonth mengonversi bulan dengan benar', () => {
  assert.equal(toRomanMonth(1), 'I');
  assert.equal(toRomanMonth(5), 'V');
  assert.equal(toRomanMonth(10), 'X');
  assert.equal(toRomanMonth(12), 'XII');
  assert.throws(() => toRomanMonth(13), /Bulan tidak valid/);
});

test('generateNomorSurat menghasilkan format resmi 007/SK/MPLB/X/2026', () => {
  const date = new Date(2026, 9, 27); // Month index 9 is October (10)
  const nomor = generateNomorSurat(7, 'SK', date);
  assert.equal(nomor, '007/SK/MPLB/X/2026');

  const nomor2 = generateNomorSurat(123, 'SPPD', new Date(2026, 0, 15));
  assert.equal(nomor2, '123/SPPD/MPLB/I/2026');
});

test('calculateAttendanceSummary menghitung persentase dan jumlah status kehadiran dengan benar', () => {
  const records: AbsensiRecord[] = [
    { id: '1', siswaId: 's1', namaSiswa: 'A', nis: '101', kelas: 'X MPLB 1', tanggal: '2026-10-27', jamKe: 1, mapel: 'Kearsipan', status: 'hadir' },
    { id: '2', siswaId: 's2', namaSiswa: 'B', nis: '102', kelas: 'X MPLB 1', tanggal: '2026-10-27', jamKe: 1, mapel: 'Kearsipan', status: 'hadir' },
    { id: '3', siswaId: 's3', namaSiswa: 'C', nis: '103', kelas: 'X MPLB 1', tanggal: '2026-10-27', jamKe: 1, mapel: 'Kearsipan', status: 'sakit' },
    { id: '4', siswaId: 's4', namaSiswa: 'D', nis: '104', kelas: 'X MPLB 1', tanggal: '2026-10-27', jamKe: 1, mapel: 'Kearsipan', status: 'izin' },
    { id: '5', siswaId: 's5', namaSiswa: 'E', nis: '105', kelas: 'X MPLB 1', tanggal: '2026-10-27', jamKe: 1, mapel: 'Kearsipan', status: 'dispensasi' },
  ];

  const summary = calculateAttendanceSummary(records);
  assert.equal(summary.total, 5);
  assert.equal(summary.hadir, 2);
  assert.equal(summary.sakit, 1);
  assert.equal(summary.izin, 1);
  assert.equal(summary.dispensasi, 1);
  // (2 hadir + 1 dispensasi) / 5 = 60%
  assert.equal(summary.persentaseKehadiran, 60);
});

test('calculatePettyCashSummary menghitung saldo kas kecil secara akurat', () => {
  const txs: PettyCashTransaction[] = [
    {
      id: '1',
      nomorVoucher: 'BKM-001',
      tanggal: '2026-10-01',
      tipe: 'kredit', // Pengisian kas masuk Rp 2.500.000
      posAnggaran: 'Pengisian Kas',
      keterangan: 'Drop dana kas kecil bulan Oktober',
      nominal: 2500000,
      dicatatOleh: 'Bendahara MPLB',
    },
    {
      id: '2',
      nomorVoucher: 'BKK-001',
      tanggal: '2026-10-05',
      tipe: 'debit', // Pengeluaran Rp 150.000
      posAnggaran: 'ATK & Materai',
      keterangan: 'Beli materai 10.000 dan map arsip bantex',
      nominal: 150000,
      dicatatOleh: 'Bendahara MPLB',
    },
    {
      id: '3',
      nomorVoucher: 'BKK-002',
      tanggal: '2026-10-10',
      tipe: 'debit', // Pengeluaran Rp 350.000
      posAnggaran: 'Konsumsi Rapat',
      keterangan: 'Snack rapat sinkronisasi kurikulum DUDI',
      nominal: 350000,
      dicatatOleh: 'Bendahara MPLB',
    },
  ];

  const summary = calculatePettyCashSummary(txs);
  assert.equal(summary.totalPemasukan, 2500000);
  assert.equal(summary.totalPengeluaran, 500000);
  assert.equal(summary.saldoSaatIni, 2000000);
});

test('maskSensitiveData menyamarkan nomor HP dan identitas untuk guest', () => {
  assert.equal(maskSensitiveData('081234567890'), '081****90');
  assert.equal(maskSensitiveData(''), '-');
});
