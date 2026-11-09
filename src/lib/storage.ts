import {
  Siswa,
  Guru,
  AbsensiRecord,
  PengajuanIzin,
  DudiPkl,
  PenempatanPkl,
  JurnalPkl,
  SuratDokumen,
  InventarisBarang,
  PeminjamanBarang,
  PerjalananDinas,
  PettyCashTransaction,
  ActivityLog,
  UserRole,
  UserProfile,
} from './types';
import {
  USERS_DATA,
  INITIAL_SISWA,
  INITIAL_GURU,
  INITIAL_ABSENSI,
  INITIAL_IZIN,
  INITIAL_DUDI,
  INITIAL_PENEMPATAN,
  INITIAL_JURNAL_PKL,
  INITIAL_SURAT,
  INITIAL_INVENTARIS,
  INITIAL_PEMINJAMAN,
  INITIAL_PERJALANAN_DINAS,
  INITIAL_PETTY_CASH,
  INITIAL_LOGS,
} from './mock-data';
import { generateNomorSurat } from './calculations';

const STORAGE_KEYS = {
  CURRENT_ROLE: 'mplb_current_role',
  SISWA: 'mplb_siswa',
  GURU: 'mplb_guru',
  ABSENSI: 'mplb_absensi',
  IZIN: 'mplb_izin',
  DUDI: 'mplb_dudi',
  PENEMPATAN: 'mplb_penempatan',
  JURNAL: 'mplb_jurnal',
  SURAT: 'mplb_surat',
  INVENTARIS: 'mplb_inventaris',
  PEMINJAMAN: 'mplb_peminjaman',
  PERJALANAN_DINAS: 'mplb_sppd',
  PETTY_CASH: 'mplb_petty_cash',
  LOGS: 'mplb_logs',
};

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save to localStorage [${key}]`, err);
  }
}

export class AppStorage {
  // Role & Session
  static getCurrentRole(): UserRole {
    return getFromStorage<UserRole>(STORAGE_KEYS.CURRENT_ROLE, 'admin');
  }

  static setCurrentRole(role: UserRole): void {
    saveToStorage(STORAGE_KEYS.CURRENT_ROLE, role);
    this.addLog('login', 'Sesi Pengguna', role, `Beralih ke peran: ${role.toUpperCase()}`);
  }

  static getCurrentProfile(): UserProfile {
    const role = this.getCurrentRole();
    return USERS_DATA[role];
  }

  // Activity Log
  static getLogs(): ActivityLog[] {
    return getFromStorage<ActivityLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
  }

  static addLog(aksi: string, entitas: string, entitasId: string, deskripsi: string): void {
    const current = this.getCurrentProfile();
    const logs = this.getLogs();
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      userId: current.id,
      userName: current.name,
      role: current.role,
      aksi,
      entitas,
      entitasId,
      deskripsi,
      waktu: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    };
    saveToStorage(STORAGE_KEYS.LOGS, [newLog, ...logs]);
  }

  // Siswa
  static getSiswa(): Siswa[] {
    const list = getFromStorage<Siswa[]>(STORAGE_KEYS.SISWA, INITIAL_SISWA);
    // Filter soft deleted
    return list.filter((s) => !s.deletedAt);
  }

  static saveSiswa(data: Siswa): void {
    const role = this.getCurrentRole();
    if (role === 'guest') throw new Error('Akses Tamu tidak memiliki izin mengubah data.');
    const list = getFromStorage<Siswa[]>(STORAGE_KEYS.SISWA, INITIAL_SISWA);
    const existingIndex = list.findIndex((s) => s.id === data.id);
    if (existingIndex >= 0) {
      list[existingIndex] = data;
      this.addLog('update', 'Data Siswa', data.nis, `Memperbarui data siswa ${data.nama}`);
    } else {
      list.push(data);
      this.addLog('create', 'Data Siswa', data.nis, `Menambahkan siswa baru ${data.nama}`);
    }
    saveToStorage(STORAGE_KEYS.SISWA, list);
  }

  static deleteSiswa(id: string): void {
    const role = this.getCurrentRole();
    if (role === 'guest') throw new Error('Akses Tamu tidak memiliki izin menghapus data.');
    const list = getFromStorage<Siswa[]>(STORAGE_KEYS.SISWA, INITIAL_SISWA);
    const target = list.find((s) => s.id === id);
    if (target) {
      target.deletedAt = new Date().toISOString();
      saveToStorage(STORAGE_KEYS.SISWA, list);
      this.addLog('delete', 'Data Siswa', target.nis, `Menghapus siswa (soft delete) ${target.nama}`);
    }
  }

  static massDeleteSiswa(ids: string[]): void {
    const role = this.getCurrentRole();
    if (role === 'guest') throw new Error('Akses Tamu tidak memiliki izin menghapus data.');
    const list = getFromStorage<Siswa[]>(STORAGE_KEYS.SISWA, INITIAL_SISWA);
    const now = new Date().toISOString();
    let count = 0;
    list.forEach((s) => {
      if (ids.includes(s.id)) {
        s.deletedAt = now;
        count++;
      }
    });
    saveToStorage(STORAGE_KEYS.SISWA, list);
    this.addLog('delete', 'Data Siswa', `${count} Siswa`, `Menghapus massal ${count} data siswa`);
  }

  static importSiswaBatch(newSiswa: Siswa[]): { success: number; failed: number } {
    const role = this.getCurrentRole();
    if (role !== 'admin') throw new Error('Hanya admin yang dapat mengimpor data siswa.');
    const list = getFromStorage<Siswa[]>(STORAGE_KEYS.SISWA, INITIAL_SISWA);
    let success = 0;
    let failed = 0;

    for (const item of newSiswa) {
      const exists = list.some((s) => s.nis === item.nis && !s.deletedAt);
      if (exists) {
        failed++;
      } else {
        list.push(item);
        success++;
      }
    }
    saveToStorage(STORAGE_KEYS.SISWA, list);
    this.addLog('import', 'Data Siswa', `${success} data`, `Impor Excel: ${success} berhasil, ${failed} duplikat/gagal`);
    return { success, failed };
  }

  // Guru
  static getGuru(): Guru[] {
    return getFromStorage<Guru[]>(STORAGE_KEYS.GURU, INITIAL_GURU);
  }

  // Absensi
  static getAbsensi(): AbsensiRecord[] {
    return getFromStorage<AbsensiRecord[]>(STORAGE_KEYS.ABSENSI, INITIAL_ABSENSI);
  }

  static saveAbsensiBatch(records: AbsensiRecord[]): void {
    const role = this.getCurrentRole();
    if (role === 'guest') throw new Error('Akses Tamu tidak memiliki izin menyimpan absensi.');
    const list = this.getAbsensi();
    const updated = [...list];

    for (const rec of records) {
      const idx = updated.findIndex(
        (a) => a.siswaId === rec.siswaId && a.tanggal === rec.tanggal && a.jamKe === rec.jamKe
      );
      if (idx >= 0) {
        updated[idx] = rec;
      } else {
        updated.push(rec);
      }
    }
    saveToStorage(STORAGE_KEYS.ABSENSI, updated);
    this.addLog('create', 'Absensi Siswa', records[0]?.kelas || 'Kelas', `Menyimpan sesi absensi ${records.length} siswa`);
  }

  // Izin
  static getIzin(): PengajuanIzin[] {
    return getFromStorage<PengajuanIzin[]>(STORAGE_KEYS.IZIN, INITIAL_IZIN);
  }

  static submitIzin(izin: Omit<PengajuanIzin, 'id' | 'status' | 'createdAt'>): void {
    const list = this.getIzin();
    const newIzin: PengajuanIzin = {
      ...izin,
      id: 'iz-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    saveToStorage(STORAGE_KEYS.IZIN, [newIzin, ...list]);
    this.addLog('create', 'Pengajuan Izin', newIzin.namaSiswa, `Mengajukan surat izin ${newIzin.jenis}: ${newIzin.alasan}`);
  }

  static verifyIzin(id: string, status: 'disetujui' | 'ditolak', catatanGuru: string): void {
    const role = this.getCurrentRole();
    if (role === 'guest' || role === 'siswa') throw new Error('Hanya guru dan admin yang dapat memverifikasi izin.');
    const list = this.getIzin();
    const target = list.find((i) => i.id === id);
    if (!target) return;

    const current = this.getCurrentProfile();
    target.status = status;
    target.catatanGuru = catatanGuru;
    target.diverifikasiOleh = current.name;
    target.diverifikasiAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.IZIN, list);
    this.addLog('verify', 'Pengajuan Izin', target.namaSiswa, `${status === 'disetujui' ? 'Menyetujui' : 'Menolak'} izin: ${catatanGuru}`);

    // If approved, automatically upsert attendance record
    if (status === 'disetujui') {
      const absensiList = this.getAbsensi();
      const statusAbsen = target.jenis === 'sakit' ? 'sakit' : target.jenis === 'dispensasi' ? 'dispensasi' : 'izin';
      const newRec: AbsensiRecord = {
        id: 'ab-auto-' + Date.now(),
        siswaId: target.siswaId,
        namaSiswa: target.namaSiswa,
        nis: target.nis,
        kelas: target.kelas,
        tanggal: target.tglMulai,
        jamKe: 1,
        mapel: 'Izin Disetujui',
        status: statusAbsen,
        keterangan: `Izin resmi: ${target.alasan}`,
      };
      saveToStorage(STORAGE_KEYS.ABSENSI, [newRec, ...absensiList]);
    }
  }

  // PKL & DUDI
  static getDudi(): DudiPkl[] {
    return getFromStorage<DudiPkl[]>(STORAGE_KEYS.DUDI, INITIAL_DUDI);
  }

  static getPenempatan(): PenempatanPkl[] {
    return getFromStorage<PenempatanPkl[]>(STORAGE_KEYS.PENEMPATAN, INITIAL_PENEMPATAN);
  }

  static getJurnalPkl(): JurnalPkl[] {
    return getFromStorage<JurnalPkl[]>(STORAGE_KEYS.JURNAL, INITIAL_JURNAL_PKL);
  }

  static submitJurnalPkl(entry: Omit<JurnalPkl, 'id' | 'statusVerifikasi'>): void {
    const role = this.getCurrentRole();
    if (role === 'guest') throw new Error('Akses Tamu tidak dapat mengirim jurnal.');
    const list = this.getJurnalPkl();
    const newEntry: JurnalPkl = {
      ...entry,
      id: 'jur-' + Date.now(),
      statusVerifikasi: 'pending',
    };
    saveToStorage(STORAGE_KEYS.JURNAL, [newEntry, ...list]);
    this.addLog('create', 'Jurnal PKL', entry.namaSiswa, `Mengisi jurnal PKL: ${entry.kegiatan.slice(0, 50)}...`);
  }

  static verifyJurnalPkl(id: string, status: 'valid' | 'revisi', catatan: string): void {
    const list = this.getJurnalPkl();
    const current = this.getCurrentProfile();
    const target = list.find((j) => j.id === id);
    if (!target) return;

    target.statusVerifikasi = status;
    target.catatanGuru = catatan;
    target.diverifikasiOleh = current.name;
    saveToStorage(STORAGE_KEYS.JURNAL, list);
    this.addLog('verify', 'Jurnal PKL', target.namaSiswa, `Verifikasi jurnal PKL (${status}): ${catatan}`);
  }

  // Surat Menyurat (Sesuai Alur Workflow Gambar)
  static getSurat(): SuratDokumen[] {
    return getFromStorage<SuratDokumen[]>(STORAGE_KEYS.SURAT, INITIAL_SURAT);
  }

  static saveSurat(doc: SuratDokumen): void {
    const list = this.getSurat();
    const idx = list.findIndex((s) => s.id === doc.id);
    if (idx >= 0) {
      list[idx] = doc;
      this.addLog('update', 'Dokumen Surat', doc.judul, `Memperbarui alur surat [Status: ${doc.status}]`);
    } else {
      list.unshift(doc);
      this.addLog('create', 'Dokumen Surat', doc.judul, `Menerima/Input dokumen surat baru [${doc.jenisSuratKode}]`);
    }
    saveToStorage(STORAGE_KEYS.SURAT, list);
  }

  /**
   * Menggerakkan surat ke tahap berikutnya pada workflow gambar:
   * 1. Penerimaan -> 2. Verifikasi -> 3. Disposisi -> 4. Eksekusi -> 5. Arsip
   */
  static advanceWorkflowSurat(
    id: string,
    action: {
      actionType: 'kirim_verifikasi' | 'revisi' | 'disposisi' | 'selesai_eksekusi' | 'arsip';
      catatanRevisi?: string;
      disposisiKe?: string;
      instruksiDisposisi?: string;
      tenggatDisposisi?: string;
      catatanTindakLanjut?: string;
    }
  ): SuratDokumen {
    const list = this.getSurat();
    const target = list.find((s) => s.id === id);
    if (!target) throw new Error('Surat tidak ditemukan.');

    const current = this.getCurrentProfile();

    if (action.actionType === 'kirim_verifikasi') {
      target.status = 'verifikasi';
    } else if (action.actionType === 'revisi') {
      target.status = 'revisi';
      target.catatanRevisi = action.catatanRevisi || 'Perlu perbaikan format dan lampiran.';
    } else if (action.actionType === 'disposisi') {
      target.status = 'disposisi';
      target.disposisiKe = action.disposisiKe || 'Bagian Administrasi Umum';
      target.instruksiDisposisi = action.instruksiDisposisi || 'Tindak lanjuti segera.';
      target.tenggatDisposisi = action.tenggatDisposisi;
      target.diverifikasiOleh = current.name;

      // Terbitkan nomor surat resmi jika belum ada
      if (!target.nomorSuratResmi) {
        const nextNumber = list.filter((s) => s.nomorUrut).length + 1;
        target.nomorUrut = nextNumber;
        target.nomorSuratResmi = generateNomorSurat(nextNumber, target.jenisSuratKode, new Date());
      }
    } else if (action.actionType === 'selesai_eksekusi') {
      target.status = 'eksekusi';
      target.catatanTindakLanjut = action.catatanTindakLanjut || 'Telah ditindaklanjuti dan dibuatkan dokumen balasan.';
    } else if (action.actionType === 'arsip') {
      target.status = 'arsip';
      target.kategoriArsip = target.kategoriArsip || 'Arsip Surat Masuk/Keluar Resmi';
      target.tglArsip = new Date().toISOString().split('T')[0];
    }

    saveToStorage(STORAGE_KEYS.SURAT, list);
    this.addLog('workflow', 'Manajemen Surat', target.nomorSuratResmi || target.judul, `Transisi workflow surat ke: ${target.status.toUpperCase()}`);
    return target;
  }

  // Inventarisasi Barang
  static getInventaris(): InventarisBarang[] {
    return getFromStorage<InventarisBarang[]>(STORAGE_KEYS.INVENTARIS, INITIAL_INVENTARIS);
  }

  static saveInventaris(item: InventarisBarang): void {
    const list = this.getInventaris();
    const idx = list.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
      this.addLog('update', 'Inventaris Barang', item.kodeBarang, `Update barang: ${item.namaBarang}`);
    } else {
      list.push(item);
      this.addLog('create', 'Inventaris Barang', item.kodeBarang, `Tambah barang inventaris: ${item.namaBarang}`);
    }
    saveToStorage(STORAGE_KEYS.INVENTARIS, list);
  }

  static getPeminjaman(): PeminjamanBarang[] {
    return getFromStorage<PeminjamanBarang[]>(STORAGE_KEYS.PEMINJAMAN, INITIAL_PEMINJAMAN);
  }

  static pinjamBarang(data: Omit<PeminjamanBarang, 'id' | 'status'>): void {
    const inventarisList = this.getInventaris();
    const targetBarang = inventarisList.find((b) => b.id === data.barangId);
    if (!targetBarang || targetBarang.tersedia < data.jumlah) {
      throw new Error('Stok barang inventaris yang tersedia tidak mencukupi.');
    }

    targetBarang.tersedia -= data.jumlah;
    saveToStorage(STORAGE_KEYS.INVENTARIS, inventarisList);

    const peminjamanList = this.getPeminjaman();
    const newRecord: PeminjamanBarang = {
      ...data,
      id: 'pinj-' + Date.now(),
      status: 'Dipinjam',
    };
    saveToStorage(STORAGE_KEYS.PEMINJAMAN, [newRecord, ...peminjamanList]);
    this.addLog('peminjaman', 'Inventaris Barang', data.namaBarang, `Peminjaman oleh ${data.peminjamNama} sebanyak ${data.jumlah} unit`);
  }

  static kembalikanBarang(peminjamanId: string): void {
    const peminjamanList = this.getPeminjaman();
    const targetPinjam = peminjamanList.find((p) => p.id === peminjamanId);
    if (!targetPinjam) return;

    targetPinjam.status = 'Dikembalikan';
    targetPinjam.tglKembaliAktual = new Date().toISOString().split('T')[0];

    const inventarisList = this.getInventaris();
    const targetBarang = inventarisList.find((b) => b.id === targetPinjam.barangId);
    if (targetBarang) {
      targetBarang.tersedia += targetPinjam.jumlah;
      saveToStorage(STORAGE_KEYS.INVENTARIS, inventarisList);
    }

    saveToStorage(STORAGE_KEYS.PEMINJAMAN, peminjamanList);
    this.addLog('pengembalian', 'Inventaris Barang', targetPinjam.namaBarang, `Pengembalian barang inventaris oleh ${targetPinjam.peminjamNama}`);
  }

  // Perjalanan Dinas (SPPD)
  static getPerjalananDinas(): PerjalananDinas[] {
    return getFromStorage<PerjalananDinas[]>(STORAGE_KEYS.PERJALANAN_DINAS, INITIAL_PERJALANAN_DINAS);
  }

  static savePerjalananDinas(sppd: PerjalananDinas): void {
    const list = this.getPerjalananDinas();
    const idx = list.findIndex((s) => s.id === sppd.id);
    if (idx >= 0) {
      list[idx] = sppd;
      this.addLog('update', 'Perjalanan Dinas', sppd.nomorSppd, `Update SPPD pegawai: ${sppd.namaPegawai}`);
    } else {
      list.unshift(sppd);
      this.addLog('create', 'Perjalanan Dinas', sppd.nomorSppd, `Pengajuan SPPD baru: ${sppd.namaPegawai} (${sppd.tujuan})`);
    }
    saveToStorage(STORAGE_KEYS.PERJALANAN_DINAS, list);
  }

  // Petty Cash (Kas Kecil)
  static getPettyCash(): PettyCashTransaction[] {
    return getFromStorage<PettyCashTransaction[]>(STORAGE_KEYS.PETTY_CASH, INITIAL_PETTY_CASH);
  }

  static savePettyCash(tx: Omit<PettyCashTransaction, 'id'>): void {
    const role = this.getCurrentRole();
    if (role === 'guest') throw new Error('Akses Tamu tidak dapat mencatat transaksi kas.');
    const list = this.getPettyCash();
    const newTx: PettyCashTransaction = {
      ...tx,
      id: 'pc-' + Date.now(),
    };
    saveToStorage(STORAGE_KEYS.PETTY_CASH, [newTx, ...list]);
    this.addLog(
      'finance',
      'Petty Cash',
      tx.nomorVoucher,
      `Pencatatan voucher ${tx.tipe.toUpperCase()} [${tx.posAnggaran}]: Rp ${tx.nominal.toLocaleString('id-ID')}`
    );
  }

  // Reset to initial
  static resetAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    this.addLog('reset', 'Sistem Database', 'Semua Data', 'Database direset ke data sampel awal SMKS Ekonomika Depok');
  }
}
