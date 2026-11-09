export type UserRole = 'admin' | 'guru' | 'siswa' | 'guest';

export interface UserProfile {
  id: string;
  loginId: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  kelas?: string;
  nipNik?: string;
}

export type TingkatKelas = 10 | 11 | 12;
export type StatusSiswa = 'aktif' | 'lulus' | 'pindah' | 'keluar';

export interface Siswa {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  kelas: string;
  tingkat: TingkatKelas;
  hp: string;
  hpOrtu: string;
  fotoUrl: string;
  status: StatusSiswa;
  tahunMasuk: number;
  tahunLulus?: number;
  deletedAt?: string | null;
}

export interface Guru {
  id: string;
  nik: string;
  nama: string;
  hp: string;
  fotoUrl: string;
  mapel: string;
  isWaliKelas?: boolean;
  kelasWali?: string;
  isAktif: boolean;
}

export type StatusAbsensi = 'hadir' | 'sakit' | 'izin' | 'alpha' | 'terlambat' | 'dispensasi';

export interface AbsensiRecord {
  id: string;
  siswaId: string;
  namaSiswa: string;
  nis: string;
  kelas: string;
  tanggal: string; // YYYY-MM-DD
  jamKe: number;
  mapel: string;
  status: StatusAbsensi;
  keterangan?: string;
}

export interface PengajuanIzin {
  id: string;
  siswaId: string;
  namaSiswa: string;
  nis: string;
  kelas: string;
  jenis: 'sakit' | 'izin' | 'dispensasi';
  tglMulai: string;
  tglSelesai: string;
  alasan: string;
  buktiUrl: string;
  status: 'pending' | 'disetujui' | 'ditolak';
  catatanGuru?: string;
  diverifikasiOleh?: string;
  diverifikasiAt?: string;
  createdAt: string;
}

export interface DudiPkl {
  id: string;
  nama: string;
  alamat: string;
  kontak: string;
  pembimbingIndustri: string;
  bidangUsaha: string;
  kuota: number;
}

export interface PenempatanPkl {
  id: string;
  siswaId: string;
  namaSiswa: string;
  nis: string;
  kelas: string;
  dudiId: string;
  namaDudi: string;
  divisi: string;
  guruPembimbingId: string;
  namaGuruPembimbing: string;
  tglMulai: string;
  tglSelesai: string;
  durasiMinggu: number;
  catatan: string;
}

export interface JurnalPkl {
  id: string;
  penempatanId: string;
  siswaId: string;
  namaSiswa: string;
  namaDudi: string;
  tanggal: string; // YYYY-MM-DD
  kegiatan: string;
  kendala: string;
  fotoUrl: string;
  statusVerifikasi: 'pending' | 'valid' | 'revisi';
  catatanGuru?: string;
  diverifikasiOleh?: string;
}

// Workflow Dokumen Alur Gambar:
// [1. Penerimaan & Input] -> [2. Verifikasi & Disposisi] -> [3. Proses & Eksekusi] -> [4. Arsip & Pelaporan]
export type StatusWorkflowSurat =
  | 'penerimaan'    // Input dokumen baru / surat masuk
  | 'verifikasi'    // Menunggu validasi pimpinan
  | 'revisi'        // Dikembalikan untuk revisi
  | 'disposisi'     // Dokumen valid, disposisi ke pimpinan/divisi
  | 'eksekusi'      // Ditindaklanjuti divisi terkait & pembuatan balasan
  | 'arsip';        // Diarsipkan di cloud storage & laporan berkala

export interface JenisSurat {
  id: string;
  kode: string; // e.g. SK, SD, SP, SPPD, KET
  nama: string;
  deskripsi: string;
}

export interface SuratDokumen {
  id: string;
  jenisSuratKode: string;
  judul: string;
  nomorAsal?: string;
  pengirim: string;
  tujuan: string;
  perihal: string;
  isiRingkas: string;
  fileUrl?: string;
  tglMasuk: string;
  status: StatusWorkflowSurat;
  catatanRevisi?: string;
  
  // Disposisi
  disposisiKe?: string; // Bagian/Divisi (Arsip, Kepegawaian, Keuangan, Sarpras, PKL, Pengajaran)
  instruksiDisposisi?: string;
  tenggatDisposisi?: string;
  diverifikasiOleh?: string;
  
  // Penomoran Resmi otomatis saat valid / diarsipkan
  nomorUrut?: number;
  nomorSuratResmi?: string; // e.g. 007/SK/MPLB/X/2026
  
  // Eksekusi / Balasan
  catatanTindakLanjut?: string;
  dokumenBalasanUrl?: string;
  
  // Arsip
  kategoriArsip?: string;
  tglArsip?: string;
}

export interface InventarisBarang {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  kategori: 'Peralatan Kantor' | 'Komputer & IT' | 'Mesin Pengganda' | 'Perabot Kantor';
  jumlah: number;
  tersedia: number;
  kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  lokasi: string;
  tglPengadaan: string;
  keterangan: string;
}

export interface PeminjamanBarang {
  id: string;
  barangId: string;
  namaBarang: string;
  peminjamNama: string;
  peminjamRole: 'Siswa' | 'Guru';
  peminjamKelas?: string;
  jumlah: number;
  tglPinjam: string;
  tglKembaliRencana: string;
  tglKembaliAktual?: string;
  status: 'Dipinjam' | 'Dikembalikan' | 'Terlambat';
  keperluan: string;
}

export interface PerjalananDinas {
  id: string;
  nomorSppd: string;
  namaPegawai: string;
  nip: string;
  jabatan: string;
  maksudTugas: string;
  tujuan: string;
  tglBerangkat: string;
  tglKembali: string;
  lamaHari: number;
  estimasiBiaya: number;
  status: 'Pengajuan' | 'Disetujui' | 'Sedang Berjalan' | 'Selesai';
  laporanKegiatan?: string;
}

export interface PettyCashTransaction {
  id: string;
  nomorVoucher: string; // BKK-001 or BKM-001
  tanggal: string;
  tipe: 'debit' | 'kredit'; // debit = pengeluaran (BKK), kredit = penambahan kas (BKM)
  posAnggaran: 'ATK & Materai' | 'Konsumsi Rapat' | 'Perlengkapan Lab' | 'Kurir & Transport' | 'Pengisian Kas';
  keterangan: string;
  nominal: number;
  lampiranNotaUrl?: string;
  dicatatOleh: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  aksi: string;
  entitas: string;
  entitasId?: string;
  deskripsi: string;
  waktu: string;
}
