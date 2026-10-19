// Everything shown on the public landing page lives here. Edit this file, not the page.

export const KOST = {
  name: "By D'River Kost-Vacation",
  area: 'Persada Residence, Ciampea, Bogor',
  address:
    "Persada Residence, Blok D6 dan D16, Cihideung Udik, Kec. Ciampea, Kabupaten Bogor, Jawa Barat 16620",
  whatsapp: '6281524182131',
  whatsappDisplay: '0815-2418-2131',
  instagram: 'by_d.river.kostacation',
  mapsLink: 'https://www.google.com/maps/search/?api=1&query=Persada+Residence+Cihideung+Udik+Ciampea+Bogor',
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.6429256220717!2d106.7105828!3d-6.5666733!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69db003e7bc4f5%3A0xa9bbbd759b90dbb5!2sKost%20By%20D'River%20Kost-Vacation!5e0!3m2!1sid!2sid!4v1786881479129!5m2!1sid!2sid",
  alsoOn: [
    "Mamikos: Kost By The River 01",
    "Pinhome: Kost By D'River Kostacation",
    "Google Maps, Facebook, dan Threads: By D'River Kostacation",
  ],
};

export interface Room {
  id: string;
  name: string;
  price: number;
  // 'ready' = siap disewa. 'tanya' = tanyakan dulu ketersediaannya. UBAH SAAT KAMAR TERISI/KOSONG.
  status: 'ready' | 'tanya';
  note?: string;
  promo?: string;
  video?: string;
  features: string[];
  upgrades: string[];
}

const ALL_UPGRADES = ['Water heater', 'Mini washing machine', 'Mini fridge'];
const NO_HEATER_UPGRADES = ['Mini washing machine', 'Mini fridge'];

export const UPGRADE_PRICE = 'Rp100.000';

export const ROOMS: Room[] = [
  {
    id: 'kamar-1',
    name: 'Kamar 1',
    price: 1650000,
    status: 'tanya',
    promo: 'Gratis sewa 1 bulan untuk pembayaran 1 tahun',
    video: 'https://www.instagram.com/reel/DKy5p2eys8q/',
    features: ['Meja belajar dan kursi', 'Rak buku', 'Extension table', 'Lemari gantung pakaian', 'Trolly', 'Laundry bag', 'AC', 'Shower', 'Jet shower', 'Wastafel', 'Water closet'],
    upgrades: ALL_UPGRADES,
  },
  {
    id: 'kamar-2',
    name: 'Kamar 2 (The New Mezzanine)',
    price: 1550000,
    status: 'tanya',
    video: 'https://www.instagram.com/reel/DaIAg2VStA0/',
    features: ['Kasur dan bantal', 'Meja belajar dan kursi', 'Rak buku', 'Extension table', 'Lemari pakaian', 'Lemari gantung pakaian', 'Trolly', 'Laundry bag', 'Storage', 'Kamar mandi dalam', 'Shower', 'Jet shower', 'Water closet'],
    upgrades: ALL_UPGRADES,
  },
  {
    id: 'kamar-3',
    name: 'Kamar 3',
    price: 1450000,
    status: 'ready',
    video: 'https://www.instagram.com/reel/Dbn0wwkSD0S/',
    features: ['Kasur dan bantal', 'Meja belajar dan kursi', 'Rak buku', 'Extension table', 'Lemari gantung pakaian', 'Trolly', 'Mini loker', 'Laundry bag', 'Under bed storage', 'Kamar mandi dalam', 'Shower', 'Jet shower', 'Water closet', 'Exhaust fan', 'Emergency lamp', 'AC'],
    upgrades: ALL_UPGRADES,
  },
  {
    id: 'kamar-4',
    name: 'Kamar 4',
    price: 1450000,
    status: 'ready',
    features: ['Single bed', 'Meja belajar dan kursi', 'Rak buku', 'Extension table', 'Troli', 'Lemari gantung pakaian', 'Wall mirror', 'Laundry bag', 'Storage', 'Wastafel', 'Kamar mandi dalam', 'AC', 'Shower', 'Jet shower', 'Water closet'],
    upgrades: ALL_UPGRADES,
  },
  {
    id: 'kamar-5',
    name: 'Kamar 5',
    price: 1450000,
    status: 'ready',
    features: ['Double bed mezzanine', 'Meja belajar dan kursi', 'Rak buku', 'Extension table', 'Troli', 'Lemari pakaian', 'Laundry bag', 'Kamar mandi dalam', 'AC', 'Shower', 'Jet shower', 'Water closet'],
    upgrades: ALL_UPGRADES,
  },
  {
    id: 'kamar-6',
    name: 'Kamar 6',
    price: 1850000,
    status: 'ready',
    note: 'Lantai 2 dengan balkon',
    features: ['Kasur dan bantal', 'Meja belajar dan kursi', 'Rak buku', 'Extension table', 'Lemari pakaian', 'Trolly', 'Laundry bag', 'Kamar mandi dalam', 'Shower', 'Jet shower', 'Water closet', 'Water heater', 'AC'],
    upgrades: NO_HEATER_UPGRADES,
  },
  {
    id: 'kamar-7',
    name: 'Kamar 7',
    price: 1850000,
    status: 'ready',
    note: 'Lantai 2 dengan balkon pribadi',
    features: ['Single bed', 'Meja belajar dan kursi', 'Rak buku', 'Extension table', 'Troli', 'Lemari pakaian', 'Lemari gantung pakaian', 'Lemari laci', 'Wall mirror', 'Laundry bag', 'Storage', 'Kursi lipat', 'Mini table', 'Private balkon', 'Kamar mandi dalam', 'AC', 'Shower', 'Jet shower', 'Water closet', 'Water heater'],
    upgrades: NO_HEATER_UPGRADES,
  },
];

export const SHARED = ['Dapur', 'Snack', 'Wifi', 'Parkir', 'IPL', 'Air', 'Ruang laundry'];

export const NEARBY = ['Jogging track', 'Masjid', 'Satpam 24 jam', 'One gate system', 'CCTV', 'Indomaret', 'Laundry shop', 'ATM BNI', 'Apotek'];

export const RULES: { title: string; items: string[] }[] = [
  {
    title: 'Syarat dan pembayaran',
    items: [
      'Khusus putri: mahasiswi dan karyawati. Satu kamar untuk 1 atau 2 orang sesuai perjanjian sewa.',
      'Dokumen: formulir perjanjian, fotokopi KTP, Kartu Keluarga, dan kartu mahasiswa (KTP asli ditunjukkan saat wawancara), serta nomor WhatsApp aktif dan nomor orang tua atau keluarga.',
      'Booking: DP minimal setengah dari harga sewa, berlaku 5 hari kalender, diproses lewat WhatsApp.',
      'Sebelum masuk: bayar sewa pertama dan deposit Rp500.000. Deposit dikembalikan 3 hari kerja setelah masa sewa habis, dikurangi kerusakan, kehilangan, atau denda jika ada.',
      'Pembayaran lewat transfer mobile banking. Perpanjangan sewa paling lambat 1 minggu sebelum masa sewa berakhir.',
      'Listrik kamar memakai token yang dibeli penyewa sesuai kebutuhan.',
    ],
  },
  {
    title: 'Tamu dan jam kunjungan',
    items: [
      'Tamu diterima di area penerima tamu di teras luar. Tamu lawan jenis tidak boleh masuk ke dalam rumah kost atau kamar.',
      'Jam kunjungan tamu 09.00 sampai 22.00 WIB. Tamu menginap harus lapor dan mendapat izin admin.',
      'Jam operasional kost 06.00 sampai 23.00 WIB. Di luar jam itu, penghuni memberi kabar dan meminta izin orang tua. Admin bisa dihubungi 24 jam untuk keadaan darurat.',
    ],
  },
  {
    title: 'Kebersihan dan keamanan',
    items: [
      'Dilarang merokok di dalam kamar dan rumah kost. Ruang merokok tersedia di luar rumah kost.',
      'Dilarang memasak di dalam kamar. Dapur dan ruang laundry dipakai bergantian dengan tertib.',
      'Cleaning Day seminggu sekali, dan Maintenance Day sebulan sekali bila diperlukan.',
      'Hewan peliharaan hanya boleh dengan izin admin atau pemilik.',
      'Ada denda untuk pelanggaran tertentu. Aturan lengkap diberikan sebelum akad.',
    ],
  },
];
