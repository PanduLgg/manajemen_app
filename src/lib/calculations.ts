import { AbsensiRecord, PettyCashTransaction } from './types';

export const ROMAN_MONTHS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
  12: 'XII',
};

/**
 * Mengonversi bulan angka (1-12) ke angka romawi
 */
export function toRomanMonth(month: number): string {
  if (month < 1 || month > 12) {
    throw new Error(`Bulan tidak valid: ${month}. Harus antara 1 dan 12.`);
  }
  return ROMAN_MONTHS[month];
}

/**
 * Format nomor surat resmi sesuai SOP MPLB SMKS Ekonomika:
 * {nomor 3 digit}/{kode}/MPLB/{bulan romawi}/{tahun}
 * Contoh: 007/SK/MPLB/X/2026
 */
export function generateNomorSurat(
  nomorUrut: number,
  kodeJenis: string,
  dateInput: Date | string = new Date()
): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const romanMonth = toRomanMonth(month);
  const formattedNumber = String(nomorUrut).padStart(3, '0');
  const upperCode = kodeJenis.trim().toUpperCase();

  return `${formattedNumber}/${upperCode}/MPLB/${romanMonth}/${year}`;
}

/**
 * Agregasi kehadiran siswa
 */
export function calculateAttendanceSummary(records: AbsensiRecord[]) {
  const total = records.length;
  if (total === 0) {
    return {
      total: 0,
      hadir: 0,
      sakit: 0,
      izin: 0,
      alpha: 0,
      terlambat: 0,
      dispensasi: 0,
      persentaseKehadiran: 0,
    };
  }

  let hadir = 0;
  let sakit = 0;
  let izin = 0;
  let alpha = 0;
  let terlambat = 0;
  let dispensasi = 0;

  for (const r of records) {
    switch (r.status) {
      case 'hadir':
        hadir++;
        break;
      case 'sakit':
        sakit++;
        break;
      case 'izin':
        izin++;
        break;
      case 'alpha':
        alpha++;
        break;
      case 'terlambat':
        terlambat++;
        break;
      case 'dispensasi':
        dispensasi++;
        break;
    }
  }

  // Hadir + Dispensasi dihitung hadir penuh, terlambat dihitung hadir dengan catatan
  const totalHadirFisik = hadir + dispensasi + terlambat;
  const persentaseKehadiran = Math.round((totalHadirFisik / total) * 100);

  return {
    total,
    hadir,
    sakit,
    izin,
    alpha,
    terlambat,
    dispensasi,
    persentaseKehadiran,
  };
}

/**
 * Kalkulasi saldo kas kecil (Petty Cash)
 * Kredit = Pemasukan/Pengisian Kas (+)
 * Debit = Pengeluaran (-)
 */
export function calculatePettyCashSummary(transactions: PettyCashTransaction[]) {
  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  for (const tx of transactions) {
    if (tx.tipe === 'kredit') {
      totalPemasukan += tx.nominal;
    } else if (tx.tipe === 'debit') {
      totalPengeluaran += tx.nominal;
    }
  }

  const saldoSaatIni = totalPemasukan - totalPengeluaran;

  return {
    totalPemasukan,
    totalPengeluaran,
    saldoSaatIni,
  };
}

/**
 * Format Rupiah standar Indonesia
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Mask data sensitif untuk peran Guest
 */
export function maskSensitiveData(value: string | undefined): string {
  if (!value) return '-';
  if (value.length <= 4) return '****';
  const start = value.slice(0, 3);
  const end = value.slice(-2);
  return `${start}****${end}`;
}

/**
 * Verifikasi tanggal hari H untuk Jurnal PKL
 */
export function isTodayAsiaJakarta(dateStr: string, now: Date = new Date()): boolean {
  // Format YYYY-MM-DD
  const todayStr = now.toISOString().split('T')[0];
  return dateStr === todayStr;
}
