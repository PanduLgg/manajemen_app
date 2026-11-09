# DESIGN.md — Sistem Digitalisasi Pembelajaran MPLB

Panduan visual dan UI untuk AI agent. Implementasi memakai **Tailwind CSS + shadcn/ui** di Next.js.

## 1. Karakter Visual

- **Tema:** ungu lavender yang lembut dan segar, **bukan violet gelap**. Kesan ramah, bersih, profesional sekolah.
- **Latar terang**, permukaan putih, banyak ruang kosong, sudut membulat.
- Ungu dipakai untuk identitas (tombol utama, menu aktif, tautan, fokus). Teks tetap memakai warna netral gelap agar mudah dibaca.
- **Dilarang:** latar hitam atau ungu tua pekat, gradasi neon, warna ungu lebih gelap dari `purple-800` untuk elemen besar.

---

## 2. Palet Warna

### Ungu (primary)
| Token | Hex | Pemakaian |
|---|---|---|
| `purple-50` | `#F7F2FD` | Latar halaman, baris tabel selang-seling |
| `purple-100` | `#EEE4FA` | Latar item menu aktif, badge lembut, hover |
| `purple-200` | `#DEC9F5` | Border aksen, divider kuat |
| `purple-300` | `#C8A6EE` | Ikon dekoratif, ilustrasi |
| `purple-400` | `#B184E4` | Hover tombol sekunder, progress |
| `purple-500` | `#9B66D8` | Aksen, ikon aktif, grafik (bukan untuk teks kecil) |
| **`purple-600`** | **`#8650C4`** | **Warna utama: tombol primary, tautan, fokus** |
| `purple-700` | `#6D3FA6` | Hover tombol primary, teks tautan di atas latar terang |
| `purple-800` | `#55327F` | Teks judul aksen. Batas paling gelap yang boleh dipakai |

### Netral
| Token | Hex | Pemakaian |
|---|---|---|
| `bg` | `#FAF8FD` | Latar aplikasi |
| `surface` | `#FFFFFF` | Kartu, tabel, modal |
| `border` | `#E6DFF1` | Garis kartu dan input |
| `text` | `#2D2640` | Teks utama |
| `text-muted` | `#6B6480` | Teks sekunder, placeholder |
| `text-disabled` | `#A69FB8` | Elemen nonaktif |

### Aksen pendamping
| Token | Hex | Pemakaian |
|---|---|---|
| `teal-500` | `#2BB5A0` | Aksen sekunder, indikator positif |
| `teal-50` | `#E8F8F5` | Latar badge teal |

### Status absensi (selalu pakai warna **dan** label teks)
| Status | Warna teks | Latar | Singkatan |
|---|---|---|---|
| Hadir | `#1F7A4D` | `#E3F6EC` | H |
| Sakit | `#8A6100` | `#FFF3D1` | S |
| Izin | `#2F5FB3` | `#E4EEFC` | I |
| Alpha | `#B4303C` | `#FDE7E9` | A |
| Terlambat | `#B35A12` | `#FFEBD6` | T |
| Dispensasi | `#6D3FA6` | `#EEE4FA` | D |

### Status umum
| Status | Teks | Latar |
|---|---|---|
| Sukses / Valid | `#1F7A4D` | `#E3F6EC` |
| Peringatan / Pending | `#8A6100` | `#FFF3D1` |
| Error / Ditolak | `#B4303C` | `#FDE7E9` |
| Info | `#2F5FB3` | `#E4EEFC` |

### Kontras
- Teks putih di atas `purple-600` memenuhi WCAG AA. **Jangan** pakai teks putih di atas `purple-500` atau lebih terang untuk teks kecil.
- Teks `text` di atas `bg` atau `surface` memenuhi AA.

### Token CSS (`globals.css`)
```css
:root {
  --background: 270 50% 98%;      /* #FAF8FD */
  --foreground: 255 25% 21%;      /* #2D2640 */
  --card: 0 0% 100%;
  --card-foreground: 255 25% 21%;
  --primary: 268 48% 53%;         /* #8650C4 */
  --primary-foreground: 0 0% 100%;
  --secondary: 270 62% 94%;       /* #EEE4FA */
  --secondary-foreground: 268 42% 43%; /* #6D3FA6 */
  --muted: 270 50% 98%;
  --muted-foreground: 255 11% 46%; /* #6B6480 */
  --accent: 172 63% 44%;          /* #2BB5A0 */
  --accent-foreground: 0 0% 100%;
  --destructive: 354 58% 46%;     /* #B4303C */
  --border: 265 35% 90%;          /* #E6DFF1 */
  --input: 265 35% 90%;
  --ring: 268 48% 53%;
  --radius: 0.75rem;
}
```
Tidak ada mode gelap pada versi 1.

---

## 3. Tipografi

- **Font:** Plus Jakarta Sans (fallback: Inter, system-ui, sans-serif).
- Muat lewat `next/font/google`.

| Peran | Ukuran | Berat | Tinggi baris |
|---|---|---|---|
| Judul halaman (H1) | 24 px (HP) / 28 px (laptop) | 700 | 1.25 |
| Judul seksi (H2) | 20 px | 600 | 1.3 |
| Judul kartu (H3) | 16 px | 600 | 1.4 |
| Isi | 14–16 px | 400 | 1.5 |
| Label dan caption | 12–13 px | 500 | 1.4 |
| Angka statistik | 28 px | 700 | 1.1 |

---

## 4. Spasi, Bentuk, Bayangan

- Skala spasi 4 px: 4, 8, 12, 16, 24, 32, 48.
- Gutter halaman: 16 px (HP), 24–32 px (laptop).
- Radius: input dan tombol `8–10 px`, kartu `14 px`, modal `16 px`, badge penuh (pill).
- Bayangan kartu: `0 1px 2px rgba(85,50,127,0.06), 0 4px 12px rgba(85,50,127,0.05)`.
- Border 1 px `border`. Fokus: ring 2 px `purple-400` dengan offset 2 px.

---

## 5. Layout dan Responsivitas

Mobile-first. Breakpoint: `sm 640`, `md 768`, `lg 1024`, `xl 1280`.

### Laptop (≥ 1024 px)
- Sidebar kiri tetap, lebar 256 px, latar putih dengan border kanan.
- Bar atas: judul halaman, pencarian, avatar dan menu profil.
- Konten maksimum 1280 px, tabel penuh dengan filter, checkbox, dan aksi massal.

### HP (< 1024 px)
- **Bottom navigation** 4–5 ikon utama (ikon + label), tinggi 64 px, menu lain di "Lainnya".
- Bar atas ringkas dengan judul dan avatar.
- **Tabel berubah menjadi daftar kartu.** Satu kartu per baris data dengan aksi di menu titik tiga.
- Tombol aksi utama besar dan melayang (FAB) di kanan bawah bila perlu.
- Form satu kolom, target sentuh minimal 44 px.
- Input foto membuka kamera atau galeri (`accept="image/*"`, `capture`).
- Tidak ada scroll horizontal pada 360 px.

### Item menu
- Normal: ikon dan teks `text-muted`.
- Hover: latar `purple-50`.
- Aktif: latar `purple-100`, teks `purple-700`, indikator batang 3 px `purple-600` di sisi kiri (laptop) atau di atas ikon (HP).

### Grup menu di sidebar
Dua label seksi kecil huruf kapital `text-muted`: **EMPLOYEE** dan **PEMBELAJARAN**, sesuai `PRD.md` bagian 3. Menu yang tidak berhak diakses **tidak dirender** untuk role tersebut.

---

## 6. Komponen

### Tombol
| Varian | Gaya |
|---|---|
| Primary | Latar `purple-600`, teks putih, hover `purple-700` |
| Secondary | Latar `purple-100`, teks `purple-700`, hover `purple-200` |
| Outline | Border `purple-200`, teks `purple-700`, hover latar `purple-50` |
| Ghost | Tanpa latar, hover `purple-50` |
| Destructive | Latar `#B4303C`, teks putih |
Tinggi 40 px (laptop), 44 px (HP). Status loading menampilkan spinner dan menonaktifkan tombol.

### Input
Latar putih, border `border`, radius 10 px, fokus ring `purple-400`. Label di atas input. Pesan error merah di bawah input dengan ikon. Bidang wajib bertanda `*`.

### Kartu statistik (dashboard)
Latar putih, ikon dalam lingkaran `purple-100`, angka besar, label kecil `text-muted`, tren opsional dengan teks teal atau merah.

### Tabel data (laptop)
- Header latar `purple-50`, teks `text-muted` huruf kecil tebal.
- Baris hover `purple-50`. Baris terpilih `purple-100`.
- Kolom pertama checkbox (pilih semua di header).
- **Bar aksi massal** muncul di atas tabel saat ada baris terpilih: "N dipilih · Hapus · Ubah status · Batal".
- Pagination di bawah, pencarian dan filter di atas.

### Badge status
Pill dengan latar dan teks sesuai tabel status. Selalu menampilkan teks, tidak hanya titik warna.

### Input absensi
- Laptop: tabel siswa dengan segmented button `H S I A T D`.
- HP: kartu per siswa dengan enam tombol status besar dan warna sesuai status. Tombol "Semua Hadir" dan "Simpan" menempel di bawah layar.

### Modal dan dialog
Radius 16 px, overlay `rgba(45,38,64,0.45)`. Dialog hapus massal menampilkan jumlah data dan, untuk hapus permanen, meminta ketik kata "HAPUS".

### Toast
Muncul kanan atas (laptop) atau atas tengah (HP), hilang otomatis 4 detik. Variasi sukses, error, info.

### Upload berkas
Area drop dengan border putus-putus `purple-200`, ikon unggah `purple-500`. Menampilkan pratinjau, ukuran, dan progress bar `purple-500`. Foto dikompres sebelum dikirim.

### Wizard import Excel
Stepper 4 langkah: Unduh template → Upload → Preview validasi → Konfirmasi dan hasil. Langkah aktif `purple-600`, selesai teal, belum `border`. Preview menampilkan ringkasan "Valid N · Error N" dan tabel error.

### Wizard naik kelas
Stepper: Pilih tahun ajaran → Petakan kelas → Preview siswa → Konfirmasi. Ringkasan akhir "X naik, Y lulus, Z tinggal kelas" dengan dialog konfirmasi tegas.

### Empty state
Ikon lembut `purple-300`, judul singkat, satu kalimat penjelasan, dan tombol aksi utama.

### Skeleton loading
Blok `purple-100` berdenyut halus untuk tabel dan kartu.

---

## 7. Halaman Utama (wireframe)

### Login
Latar `bg` dengan blok dekoratif `purple-100` lembut. Kartu putih di tengah: logo, judul "Masuk", input **NIS / NIK**, input password, tombol Masuk (primary), pemisah "atau", tombol **Masuk sebagai Tamu** (outline). Teks bantuan kecil "Lupa password? Hubungi kepala program".

### Dashboard
Baris kartu statistik (2 kolom di HP, 4 di laptop) → area "Perlu tindakan" (izin dan surat menunggu) → ringkasan kehadiran → jadwal atau tugas terdekat. Konten menyesuaikan role.

### Data Siswa
Judul, tombol **Tambah** (primary), **Import**, **Export** (outline). Pencarian dan filter kelas dan status. Tabel (laptop) atau kartu (HP) dengan foto kecil, nama, NIS, kelas, badge status. Bar aksi massal. Guest melihat data yang disamarkan dan tanpa tombol aksi.

### Absensi
Pilih kelas, mapel, tanggal, jam ke → daftar siswa dengan tombol status → Simpan. Ringkasan jumlah per status di atas daftar.

### Izin
Siswa: daftar pengajuan dan tombol **Ajukan Izin** (form jenis, tanggal, alasan, foto bukti wajib). Guru: daftar pending dengan pratinjau foto, tombol Setujui dan Tolak plus catatan.

### Tugas
Guru: daftar tugas, buat tugas, tabel pengumpulan dengan input nilai. Siswa: kartu tugas dengan sisa waktu dan status.

### Surat
Daftar surat dengan badge status (Draft, Diajukan, Revisi, Valid) dan nomor surat bila valid. Detail menampilkan riwayat verifikasi dan catatan revisi. Guru melihat antrean verifikasi.

### Arsip Digital
Pencarian dan filter (jenis, tahun, nomor), daftar dokumen valid, pratinjau dan unduh PDF.

### PKL
Tab: **Tempat PKL**, **Penempatan**, **Jurnal**. Kartu perusahaan menampilkan daftar siswa beserta divisi dan catatan. Jurnal: form hari ini (tanggal terkunci pada hari H), riwayat jurnal dengan badge verifikasi.

### Rekap
Pilih periode (bulan atau semester), kelas, lalu tabel rekap dengan kolom jumlah tiap status dan persentase. Tombol Export Excel dan PDF.

### Log Aktivitas (admin)
Tabel kronologis dengan filter pengguna, aksi, tanggal. Baris dapat dibuka untuk melihat data sebelum dan sesudah.

---

## 8. Ikon dan Ilustrasi

- Ikon: **lucide-react**, tebal garis 1.75, ukuran 20 px (menu) dan 16 px (inline).
- Ilustrasi opsional bergaya datar dengan palet ungu dan teal. Tidak memakai foto stok untuk antarmuka.

## 9. Gerak

Transisi 150–200 ms `ease-out` untuk hover, buka tutup modal, dan pergantian tab. Hormati `prefers-reduced-motion`. Tidak ada animasi mencolok.

## 10. Aksesibilitas

- Kontras minimal WCAG AA.
- Status tidak hanya dibedakan lewat warna, selalu ada label atau singkatan.
- Fokus keyboard terlihat jelas.
- Semua input punya label, ikon-saja punya `aria-label`.
- Target sentuh minimal 44 × 44 px.

## 11. Bahasa Antarmuka

Bahasa Indonesia, nada ramah dan singkat. Contoh: "Simpan", "Batal", "Data berhasil disimpan", "Anda tidak memiliki akses ke halaman ini". Format tanggal `27 Okt 2026`, waktu 24 jam, zona Asia/Jakarta.
