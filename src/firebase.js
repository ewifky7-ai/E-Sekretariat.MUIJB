// Mengimpor fungsi inti Firebase
import { initializeApp } from "firebase/app";
// Mengimpor layanan Database, Penyimpanan Foto, dan Autentikasi
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Konfigurasi rahasia aplikasi Anda (Dari Google Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyApJ9TUkUtc7EusDhSewFcm78RWmF80sGU",
  authDomain: "e-sekretariat-muijb.firebaseapp.com",
  projectId: "e-sekretariat-muijb",
  storageBucket: "e-sekretariat-muijb.firebasestorage.app",
  messagingSenderId: "835769461946",
  appId: "1:835769461946:web:43fef5a2eb6552e970a683"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Mengekspor layanan agar bisa digunakan di file App.jsx nanti
export const db = getFirestore(app);     // Untuk data Teks (Surat, Absen, Kegiatan)
export const storage = getStorage(app);  // Untuk file Foto/Gambar
export const auth = getAuth(app);        // Untuk sistem Login Google