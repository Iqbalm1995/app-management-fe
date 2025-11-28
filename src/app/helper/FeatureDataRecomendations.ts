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
    featureName: "LOGIN",
    featureDescription: "Fitur autentikasi untuk masuk ke dalam sistem.",
  },
  {
    featureName: "TRANSAKSI",
    featureDescription: "Melakukan dan mengelola transaksi keuangan.",
  },
  {
    featureName: "MUTASI REKENING",
    featureDescription: "Menampilkan riwayat keluar masuk dana pada rekening.",
  },
  {
    featureName: "DASHBOARD",
    featureDescription: "Tampilan ringkasan informasi dan statistik utama.",
  },
  {
    featureName: "MONITORING",
    featureDescription:
      "Pemantauan aktivitas dan status sistem secara real-time.",
  },
  {
    featureName: "EXPORT LAPORAN PDF / EXCEL",
    featureDescription: "Mengunduh laporan dalam format PDF atau Excel.",
  },
  {
    featureName: "USER MANAJEMEN",
    featureDescription: "Mengelola data dan peran pengguna dalam sistem.",
  },
  {
    featureName: "AUDIT TRAIL",
    featureDescription:
      "Mencatat jejak aktivitas pengguna untuk keperluan audit.",
  },
  {
    featureName: "PEMBAYARAN TERJADWAL",
    featureDescription:
      "Menjadwalkan pembayaran secara otomatis sesuai waktu yang ditentukan.",
  },
];
