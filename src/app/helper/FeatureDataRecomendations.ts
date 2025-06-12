export interface FeatureDataRecomendationsProps {
  featureName: string;
  featureDescription: string;
}

//   {
//     featureName: "",
//     featureDescription: "",
//   },
export const FeatureRecomentionsBacklogs: FeatureDataRecomendationsProps[] = [
  {
    featureName: "Login",
    featureDescription: "Fitur autentikasi untuk masuk ke dalam sistem.",
  },
  {
    featureName: "Transaksi",
    featureDescription: "Melakukan dan mengelola transaksi keuangan.",
  },
  {
    featureName: "Mutasi Rekening",
    featureDescription: "Menampilkan riwayat keluar masuk dana pada rekening.",
  },
  {
    featureName: "Dashboard",
    featureDescription: "Tampilan ringkasan informasi dan statistik utama.",
  },
  {
    featureName: "Monitoring",
    featureDescription:
      "Pemantauan aktivitas dan status sistem secara real-time.",
  },
  {
    featureName: "Export Laporan PDF / EXCEL",
    featureDescription: "Mengunduh laporan dalam format PDF atau Excel.",
  },
  {
    featureName: "User Manajemen",
    featureDescription: "Mengelola data dan peran pengguna dalam sistem.",
  },
  {
    featureName: "Audit Trail",
    featureDescription:
      "Mencatat jejak aktivitas pengguna untuk keperluan audit.",
  },
  {
    featureName: "Pembayaran Terjadwal",
    featureDescription:
      "Menjadwalkan pembayaran secara otomatis sesuai waktu yang ditentukan.",
  },
];
