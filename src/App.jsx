import React, { useState, useEffect } from 'react';
import { 
  Home, FileText, User, Plus, Search, FileDown, FileUp, Award, CheckCircle2, 
  X, FileBox, Edit, Shield, LogOut, MapPin, Clock, Download, Camera, 
  Image as ImageIcon, Trash2, Settings, Mail, RefreshCw, ClipboardList, Loader2
} from 'lucide-react';

// --- IMPORT FIREBASE ---
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';

// --- Konfigurasi Firebase Anda ---
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
const db = getFirestore(app);

// --- Konfigurasi Data Pengguna ---
const USERS = [
  { id: 1, username: 'ketua', password: 'ketua123', name: 'Ketua Umum MUI Jawa Barat', role: 'viewer', title: 'Ketua Umum' },
  { id: 2, username: 'sekum', password: 'sekum123', name: 'Sekretaris Umum MUI Jawa Barat', role: 'viewer', title: 'Sekretaris Umum' },
  { id: 3, username: 'admin', password: 'admin123', name: 'Eky Wifky Afandi, M.Ag', role: 'admin', title: 'Kepala Sekretariat' },
  { id: 4, username: 'ruhiyat', password: 'ruhiyat123', name: 'H. Ruhiyat', role: 'editor', title: 'Sekretariat Umum' },
  { id: 5, username: 'rani', password: 'rani123', name: 'Rani Nurita Yusuf', role: 'editor', title: 'Sekretariat Keuangan' },
  { id: 6, username: 'dedih', password: 'dedih123', name: 'Dedih Alyadi', role: 'staff', title: 'Staff' },
  { id: 7, username: 'erik', password: 'erik123', name: 'Erik', role: 'staff', title: 'Staff' },
];

const generateSuratNumber = (kategori, dateString) => {
  const d = new Date(dateString);
  const year = d.getFullYear();
  const num = Math.floor(Math.random() * 900) + 100;
  const kode = kategori === 'Surat Keluar' ? 'B' : kategori === 'Surat Masuk' ? 'M' : 'Int';
  return `${kode}-${num}/DP.P-XII/${year}`;
};

// --- FUNGSI PINTAR: Kompresi Gambar ke Teks ---
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64String = canvas.toDataURL('image/jpeg', 0.6);
        resolve(base64String);
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- Komponen Login ---
const LoginScreen = ({ onLogin, logoUrl }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onLogin(username, password)) setError('Username atau password salah!');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 w-full max-w-md mx-auto">
      <div className="w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-1 border-4 border-green-50 shadow-md flex items-center justify-center overflow-hidden">
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=MUI" }} />
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-1 tracking-tight">E-Sekretariat.MUIJB</h1>
        <p className="text-sm text-gray-400 mb-8 font-medium">Sistem Terintegrasi Realtime</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-500 text-[11px] rounded-xl border border-red-100 font-bold uppercase tracking-wider">{error}</div>}
          <div className="text-left">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Username</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-green-500" placeholder="Username" />
          </div>
          <div className="text-left">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-green-500" placeholder="Password" />
          </div>
          <button type="submit" className="w-full bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-800 transition-all active:scale-95">MASUK APLIKASI</button>
        </form>
      </div>
    </div>
  );
};

// --- Komponen Navigasi Bawah ---
const BottomNav = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-around py-3 pb-6 px-2 z-50">
      <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center transition-colors ${activeTab === 'home' ? 'text-green-600' : 'text-gray-300'}`}>
        <Home size={22} />
        <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Beranda</span>
      </button>
      <button onClick={() => setActiveTab('dokumen')} className={`flex flex-col items-center transition-colors ${activeTab === 'dokumen' ? 'text-green-600' : 'text-gray-300'}`}>
        <FileText size={22} />
        <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Dokumen</span>
      </button>
      
      <div className="relative -top-7">
        <button onClick={() => setActiveTab('presensi')} className="bg-green-600 text-white p-4 rounded-full shadow-xl border-4 border-gray-50 flex items-center justify-center hover:bg-green-700 active:scale-90 transition-all">
          <MapPin size={26} />
        </button>
      </div>

      <button onClick={() => setActiveTab('galeri')} className={`flex flex-col items-center transition-colors ${activeTab === 'galeri' ? 'text-green-600' : 'text-gray-300'}`}>
        <ImageIcon size={22} />
        <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Galeri</span>
      </button>
      <button onClick={() => setActiveTab('profil')} className={`flex flex-col items-center transition-colors ${activeTab === 'profil' || activeTab === 'master' ? 'text-green-600' : 'text-gray-300'}`}>
        <User size={22} />
        <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Profil</span>
      </button>
    </div>
  );
};

// --- Tab Beranda ---
const HomeTab = ({ currentUser, logoUrl, letters, attendance, activities, onAddActivity, isUploading, setActiveTab }) => {
  const role = currentUser?.role;
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayAtt = attendance.find(a => a.date === todayStr && a.name === currentUser?.name && a.type === 'Hadir');

  const suratMasuk = letters.filter(l => l.kategori === 'Surat Masuk').length;
  const suratKeluar = letters.filter(l => l.kategori === 'Surat Keluar').length;

  const [newActivity, setNewActivity] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newActivity.trim() && !newImageFile) return;
    await onAddActivity(newActivity, newImageFile);
    setNewActivity('');
    setNewImageFile(null);
    setImagePreview(null);
  };

  const todayActivities = activities.filter(a => a.date === todayStr);

  return (
    <div className="p-4 pb-28 overflow-y-auto h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-full bg-white p-1 border border-gray-100" />
          <div>
            <h1 className="text-lg font-extrabold text-gray-800 leading-none">E-Sekretariat MUIJB</h1>
            <p className="text-[10px] text-green-600 font-bold uppercase mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>
        
        {/* Foto Profil Dinamis di Pojok */}
        {currentUser?.photo ? (
          <img src={currentUser.photo} className="w-10 h-10 rounded-xl object-cover border-2 border-green-100 shadow-sm" alt="Profile" />
        ) : (
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-700 font-bold border border-green-100 uppercase text-xs">
            {currentUser?.name.substring(0, 2)}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-green-700 to-green-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <Award size={120} className="absolute -right-6 -top-6 opacity-10 rotate-12" />
        <h2 className="text-xl font-bold mb-1 leading-tight">Ahlan wa Sahlan, <br/> {currentUser?.name.split(',')[0]}!</h2>
        <p className="text-xs text-green-100 mb-6 font-medium">{currentUser?.title}</p>
        {['admin', 'editor', 'staff'].includes(role) && (
          <div className="bg-white/10 rounded-2xl p-4 inline-block backdrop-blur-md border border-white/20">
            <div className="flex items-center space-x-2">
              {userTodayAtt ? <><CheckCircle2 size={16} className="text-green-300" /><span className="text-xs font-bold">Hadir: {userTodayAtt.time} WIB</span></> : <><Clock size={16} className="text-yellow-300" /><span className="text-xs font-bold text-yellow-50">Belum Presensi GPS</span></>}
            </div>
          </div>
        )}
      </div>

      <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest ml-1">Ringkasan Dokumen</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileDown size={20} /></div>
          <div><p className="text-xl font-black text-gray-800 leading-none">{suratMasuk}</p><p className="text-[10px] text-gray-400 font-bold uppercase mt-1">S. Masuk</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><FileUp size={20} /></div>
          <div><p className="text-xl font-black text-gray-800 leading-none">{suratKeluar}</p><p className="text-[10px] text-gray-400 font-bold uppercase mt-1">S. Keluar</p></div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 mb-3">
        <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest ml-1 flex items-center"><Mail size={16} className="mr-2 text-green-600"/> Dokumen Terbaru</h3>
        <button onClick={() => setActiveTab('dokumen')} className="text-[10px] text-green-600 font-black uppercase tracking-widest">Lihat Semua</button>
      </div>
      <div className="space-y-3 mb-6">
        {letters.length === 0 ? (
          <p className="text-center text-[10px] text-gray-300 font-bold py-2 tracking-widest border-2 border-dashed border-gray-50 rounded-xl">Belum ada surat</p>
        ) : (
          letters.slice(0, 3).map((letter) => (
            <div key={letter.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-start space-x-4 shadow-sm">
              <div className={`p-2.5 rounded-xl ${letter.kategori === 'Surat Masuk' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}><Mail size={18} /></div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-800 truncate">{letter.title}</h4>
                <p className="text-[10px] text-gray-500 font-bold mt-0.5">{letter.kategori}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest flex items-center"><ClipboardList size={16} className="mr-2 text-green-600"/> Kegiatan Harian</h3>
        </div>
        
        {['admin', 'editor', 'staff'].includes(role) && (
          <form onSubmit={handleSubmit} className="mb-4">
            {imagePreview && (
              <div className="relative inline-block mb-3">
                <img src={imagePreview} className="w-20 h-20 object-cover rounded-xl border-2 border-green-500 shadow-md" alt="Preview" />
                <button type="button" onClick={() => {setImagePreview(null); setNewImageFile(null)}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"><X size={14}/></button>
              </div>
            )}
            <div className="flex gap-2">
              <input type="file" accept="image/*" capture="environment" id="actCamera" className="hidden" onChange={handleCapture} />
              <label htmlFor="actCamera" className="bg-blue-50 text-blue-600 px-4 flex items-center justify-center rounded-xl cursor-pointer hover:bg-blue-100 border border-blue-100 transition-colors">
                <Camera size={20}/>
              </label>
              <input 
                type="text" 
                placeholder="Ketik kegiatan / upload foto..." 
                value={newActivity}
                onChange={(e) => setNewActivity(e.target.value)}
                disabled={isUploading}
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-xs outline-none focus:border-green-500 font-bold text-gray-700"
              />
              <button disabled={isUploading} type="submit" className="bg-green-600 text-white px-4 py-3 rounded-xl text-xs font-black hover:bg-green-700 active:scale-95 transition-all flex items-center">
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : "CATAT"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {todayActivities.length === 0 ? (
            <p className="text-center text-[10px] text-gray-300 font-bold uppercase py-6 tracking-widest border-2 border-dashed border-gray-50 rounded-xl">Belum ada kegiatan tercatat</p>
          ) : (
            todayActivities.map(act => (
              <div key={act.id} className="border-l-4 border-green-500 pl-3 py-2.5 bg-gray-50/50 rounded-r-xl flex items-start gap-3">
                {act.imageUrl && (
                  <img src={act.imageUrl} onClick={() => setSelectedImage(act.imageUrl)} className="w-12 h-12 object-cover rounded-lg cursor-pointer border border-gray-200 shrink-0 hover:opacity-80 transition-opacity" alt="Thumb" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800 leading-tight">{act.desc}</p>
                  <div className="flex gap-4 mt-1.5">
                    <span className="text-[9px] text-gray-400 font-bold flex items-center"><Clock size={10} className="mr-1"/>{act.time}</span>
                    <span className="text-[9px] text-green-600 font-bold flex items-center"><User size={10} className="mr-1"/>{act.reporter}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/40"><X size={24}/></button>
          <img src={selectedImage} className="max-w-full max-h-[80vh] rounded-2xl border-4 border-white/10" alt="Full view" />
        </div>
      )}
    </div>
  );
};

// --- Tab Dokumen ---
const DokumenTab = ({ letters, onAddLetter, currentUser }) => {
  const [view, setView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    title: '', kategori: 'Surat Masuk', date: new Date().toISOString().split('T')[0], sender: '', description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddLetter(formData);
      setView('list');
      setFormData({ title: '', kategori: 'Surat Masuk', date: new Date().toISOString().split('T')[0], sender: '', description: '' });
    } catch (err) {
      alert("Gagal menambahkan surat: " + err.message);
    }
  };

  if (view === 'buat') {
    return (
      <div className="p-4 pb-28 h-full overflow-y-auto space-y-6">
        <div className="flex items-center space-x-4"><button onClick={() => setView('list')} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"><X size={20} /></button><h2 className="text-xl font-black text-gray-800">Registrasi Surat</h2></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-5 shadow-sm">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Kategori Surat</label>
              <select value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none border border-gray-100 font-bold cursor-pointer">
                <option>Surat Masuk</option><option>Surat Keluar</option><option>Internal</option><option>Eksternal</option><option>Keputusan</option>
              </select>
            </div>
            <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Perihal Dokumen</label><input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border-b-2 border-gray-50 p-2 text-sm outline-none focus:border-green-600 font-bold" placeholder="Perihal..." /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tanggal Buat/Terima</label><input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full border-b-2 border-gray-50 p-2 text-sm outline-none font-bold" /></div>
            <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Asal / Tujuan</label><input required type="text" value={formData.sender} onChange={(e) => setFormData({...formData, sender: e.target.value})} className="w-full border-b-2 border-gray-50 p-2 text-sm outline-none font-bold" placeholder="Nama Instansi/Pengirim..." /></div>
          </div>
          <button type="submit" className="w-full bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-green-800 transition-all uppercase tracking-widest text-xs">Simpan Data Surat</button>
        </form>
      </div>
    );
  }

  const filteredLetters = letters.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.number.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-4 pb-28 h-full flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Arsip Dokumen</h2>
        {['admin', 'editor'].includes(currentUser.role) && (
          <button onClick={() => setView('buat')} className="bg-green-100 text-green-700 p-2 rounded-xl border border-green-200"><Plus size={20} /></button>
        )}
      </div>
      <div className="relative">
        <Search size={18} className="absolute left-4 top-4 text-gray-300" />
        <input type="text" className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl text-sm outline-none bg-white shadow-sm focus:ring-2 focus:ring-green-500" placeholder="Cari nomor atau perihal..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredLetters.length === 0 ? <div className="text-center py-24 text-gray-300"><FileBox size={60} className="mx-auto mb-4 opacity-10" /><p className="font-bold text-sm uppercase tracking-widest opacity-20">Data Kosong</p></div> : 
        filteredLetters.map((letter) => (
          <div key={letter.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start space-x-4 shadow-sm">
            <div className={`p-3 rounded-xl shrink-0 ${letter.kategori.includes('Masuk') ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}><FileText size={20} /></div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-800 truncate pr-4 leading-tight">{letter.title}</h4>
              <p className="text-[11px] text-green-700 font-mono font-bold mt-1">{letter.number}</p>
              <div className="flex justify-between mt-3 items-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase">{letter.kategori}</span>
                <span className="text-[10px] text-gray-300 font-black">{letter.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Tab Galeri ---
const GaleriTab = ({ activities }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const galleryActivities = activities.filter(a => a.imageUrl);

  return (
    <div className="p-4 pb-28 h-full flex flex-col space-y-4">
      <h2 className="text-2xl font-black text-gray-800 tracking-tight">Galeri Kegiatan</h2>
      <p className="text-xs text-gray-400 px-1">Kumpulan foto dokumentasi dari daftar kegiatan harian.</p>

      <div className="grid grid-cols-2 gap-3 mt-2 overflow-y-auto pb-4">
        {galleryActivities.map(act => (
          <div key={act.id} className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedImage(act.imageUrl)}>
            <img src={act.imageUrl} alt="Dokumentasi" className="w-full h-32 object-cover rounded-xl mb-2 bg-gray-100" />
            <p className="text-[9px] font-bold text-green-600 truncate">{act.reporter}</p>
            <p className="text-[10px] text-gray-800 font-bold line-clamp-2 leading-tight mt-0.5">{act.desc}</p>
            <p className="text-[8px] text-gray-400 mt-1">{act.date} • {act.time}</p>
          </div>
        ))}
        {galleryActivities.length === 0 && <div className="col-span-2 text-center py-10 text-gray-400 text-xs font-bold uppercase opacity-50">Belum ada foto kegiatan</div>}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/40"><X size={24}/></button>
          <img src={selectedImage} className="max-w-full max-h-[80vh] rounded-2xl border-4 border-white/10" alt="Full view" />
        </div>
      )}
    </div>
  );
};

// --- Tab Presensi ---
const PresensiTab = ({ currentUser, attendance, onAddAttendance, setActiveTab }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const todayStr = new Date().toISOString().split('T')[0];
  const userToday = attendance.filter(a => a.date === todayStr && a.name === currentUser?.name);
  const hasHadir = userToday.some(a => a.type === 'Hadir');
  const hasPulang = userToday.some(a => a.type === 'Pulang');

  const handleAbsen = async (type) => {
    setLoading(true);
    if (!navigator.geolocation) { setMsg({ type: 'err', text: 'GPS tidak didukung perangkat' }); setLoading(false); return; }
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await onAddAttendance(type, pos.coords.latitude, pos.coords.longitude);
        setMsg({ type: 'success', text: `Absen ${type} Berhasil Dicatat ke Server!` });
        setTimeout(() => setActiveTab('home'), 1500);
      } catch (err) {
        console.error("Error Firebase:", err);
        setMsg({ type: 'err', text: `Gagal ke Server: ${err.message}` });
      }
      setLoading(false);
    }, () => { setMsg({ type: 'err', text: 'Gagal mendapatkan akses lokasi' }); setLoading(false); });
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-green-700 text-white p-5 flex items-center space-x-4 shadow-lg"><button onClick={() => setActiveTab('home')} className="p-1 hover:bg-green-800 rounded-lg"><X size={24} /></button><h2 className="font-black text-sm uppercase tracking-widest">Presensi Kehadiran</h2></div>
      <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse"><MapPin size={36} /></div>
        <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Waktu Perangkat</h3>
        <h3 className="text-4xl font-mono font-black text-gray-800 mb-10 tracking-tighter">{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} <span className="text-sm font-bold text-gray-400">WIB</span></h3>
        
        {msg.text && (
          <div className={`mb-8 p-4 rounded-2xl text-xs font-bold w-full border text-left ${msg.type === 'err' ? 'bg-red-50 text-red-500 border-red-200' : 'bg-green-50 text-green-700 border-green-100'}`}>
            {msg.text}
          </div>
        )}
        
        <div className="w-full space-y-4">
          <button disabled={hasHadir || loading} onClick={() => handleAbsen('Hadir')} className={`w-full py-5 rounded-2xl font-black shadow-lg transition-all text-xs tracking-widest ${hasHadir ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-blue-600 text-white active:scale-95 shadow-blue-200 flex justify-center items-center'}`}>{loading ? <Loader2 size={20} className="animate-spin" /> : hasHadir ? 'SUDAH ABSEN HADIR' : 'MASUK KANTOR'}</button>
          <button disabled={!hasHadir || hasPulang || loading} onClick={() => handleAbsen('Pulang')} className={`w-full py-5 rounded-2xl font-black shadow-lg transition-all text-xs tracking-widest ${hasPulang ? 'bg-gray-100 text-gray-400 border border-gray-200' : !hasHadir ? 'bg-gray-200 text-gray-400' : 'bg-orange-500 text-white active:scale-95 shadow-orange-200 flex justify-center items-center'}`}>{loading ? <Loader2 size={20} className="animate-spin" /> : hasPulang ? 'SUDAH ABSEN PULANG' : 'PULANG KANTOR'}</button>
        </div>
      </div>
    </div>
  );
};

// --- Tab Profil ---
const ProfilTab = ({ currentUser, onUpdateProfile, setActiveTab }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // State Edit Form
  const [editForm, setEditForm] = useState({ name: currentUser.name, password: currentUser.password });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(currentUser.photo || null);

  // State Link Akun Google (Email)
  const [isLinking, setIsLinking] = useState(false);
  const [emailForm, setEmailForm] = useState(currentUser.email || '');

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setIsUploading(true);
    let finalPhoto = currentUser.photo || null;
    if (photoFile) {
      finalPhoto = await compressImage(photoFile); // Kompres foto agar ringan
    }
    
    await onUpdateProfile(currentUser.username, {
      name: editForm.name,
      password: editForm.password,
      photo: finalPhoto
    });
    
    setIsUploading(false);
    setIsEditing(false);
  };

  const handleSaveEmail = async () => {
    if(emailForm.trim() !== '') {
      await onUpdateProfile(currentUser.username, { email: emailForm });
      setIsLinking(false);
    }
  };

  return (
    <div className="p-4 pb-28 h-full overflow-y-auto space-y-6">
      <h2 className="text-2xl font-black text-gray-800 tracking-tight">Pengaturan Akun</h2>
      
      {/* KOTAK PROFIL */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center shadow-sm relative">
        <button onClick={() => {setIsEditing(!isEditing); setIsLinking(false);}} className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors">
          {isEditing ? <X size={20} /> : <Edit size={20} />}
        </button>
        
        <div className="w-24 h-24 mx-auto mb-4 relative">
          {photoPreview ? (
            <img src={photoPreview} className="w-full h-full rounded-full object-cover border-4 border-white shadow-md" alt="Profil" />
          ) : (
            <div className="w-full h-full bg-green-50 text-green-700 rounded-full flex items-center justify-center text-3xl font-black border-4 border-white shadow-md uppercase">
              {currentUser?.name.substring(0, 2)}
            </div>
          )}
          
          {isEditing && (
            <>
              <input type="file" accept="image/*" id="profilePhoto" className="hidden" onChange={handlePhotoSelect} />
              <label htmlFor="profilePhoto" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 border-2 border-white transition-transform active:scale-95">
                <Camera size={14} />
              </label>
            </>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-3 mt-4 text-left animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="text-[10px] font-bold text-gray-400">Nama Tampilan</label>
              <input type="text" value={editForm.name} onChange={(e)=>setEditForm({...editForm, name: e.target.value})} className="w-full p-2 border-b-2 border-green-500 outline-none text-sm font-bold bg-transparent"/>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400">Password Akun</label>
              <input type="text" value={editForm.password} onChange={(e)=>setEditForm({...editForm, password: e.target.value})} className="w-full p-2 border-b-2 border-green-500 outline-none text-sm font-bold bg-transparent"/>
            </div>
            <button onClick={handleSaveProfile} disabled={isUploading} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-xs mt-2 hover:bg-green-700 transition-colors flex justify-center items-center">
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : "SIMPAN PERUBAHAN"}
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-black text-gray-800 text-lg leading-none">{currentUser?.name}</h3>
            <p className="text-[10px] text-green-600 font-bold uppercase mt-2 tracking-widest">{currentUser?.title}</p>
          </>
        )}
      </div>

      {/* KOTAK PENAUTAN GOOGLE (EMAIL PUSH) */}
      {currentUser.email ? (
        <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-4 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-sm">
          <CheckCircle2 size={16} /><span>TERTAUT: {currentUser.email}</span>
        </div>
      ) : isLinking ? (
        <div className="w-full bg-white border border-blue-200 p-5 rounded-2xl shadow-sm space-y-3 animate-in fade-in">
          <p className="text-[10px] font-bold text-gray-500 uppercase">Daftarkan Gmail Anda Untuk Notifikasi</p>
          <input type="email" value={emailForm} onChange={(e)=>setEmailForm(e.target.value)} className="w-full p-3 border border-gray-100 outline-none text-sm font-bold bg-gray-50 rounded-xl focus:border-blue-500" placeholder="contoh@gmail.com"/>
          <div className="flex gap-2 pt-2">
            <button onClick={()=>setIsLinking(false)} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl text-xs font-bold active:scale-95">Batal</button>
            <button onClick={handleSaveEmail} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-xs font-bold active:scale-95 shadow-md shadow-blue-200">Simpan Akun</button>
          </div>
        </div>
      ) : (
        <button onClick={() => {setIsLinking(true); setIsEditing(false);}} className="w-full bg-white border border-blue-200 text-blue-600 py-4 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-sm hover:bg-blue-50 active:scale-95 transition-all">
          <Mail size={16} /><span>TAUTKAN AKUN GOOGLE (GMAIL)</span>
        </button>
      )}

      {currentUser?.role === 'admin' && (
        <button onClick={() => setActiveTab('master')} className="w-full bg-red-600 text-white py-4 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-lg hover:bg-red-700 active:scale-95 transition-all">
          <Shield size={16} /><span>BUKA MASTER PANEL ADMIN</span>
        </button>
      )}

      <button onClick={() => window.location.reload()} className="w-full py-5 text-xs font-black text-red-500 bg-white rounded-2xl border border-gray-100 flex items-center justify-center space-x-2 shadow-sm uppercase tracking-widest active:scale-95">
        <LogOut size={16} /><span>Keluar Sesi</span>
      </button>
    </div>
  );
};

// --- Tab Master Admin Panel ---
const MasterAdminTab = ({ attendance, letters, activities, users, onDeleteLetter, onDeletePhoto, setActiveTab }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const staffUsers = USERS.filter(u => u.role !== 'viewer');

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const exportAbsensi = () => {
    const headers = ['ID', 'Nama', 'Tanggal', 'Waktu', 'Tipe', 'Status'];
    const rows = attendance.map(a => [a.id, `"${a.name}"`, a.date, a.time, a.type, a.status].join(','));
    downloadCSV([headers.join(','), ...rows].join('\n'), `Laporan_Absensi_${todayStr}.csv`);
  };

  const exportKegiatan = () => {
    const headers = ['ID', 'Tanggal', 'Waktu', 'Deskripsi Kegiatan', 'Pelapor', 'Ada Foto?'];
    const rows = activities.map(a => [a.id, a.date, a.time, `"${a.desc}"`, `"${a.reporter}"`, a.imageUrl ? 'Ya' : 'Tidak'].join(','));
    downloadCSV([headers.join(','), ...rows].join('\n'), `Laporan_Kegiatan_${todayStr}.csv`);
  };

  const exportSurat = () => {
    const headers = ['ID', 'Nomor Surat', 'Perihal', 'Kategori', 'Tanggal', 'Penginput'];
    const rows = letters.map(l => [l.id, l.number, `"${l.title}"`, l.kategori, l.date, `"${l.uploader}"`].join(','));
    downloadCSV([headers.join(','), ...rows].join('\n'), `Laporan_Surat_${todayStr}.csv`);
  };

  const exportEmailStaff = () => {
    const headers = ['Username', 'Nama Lengkap', 'Jabatan', 'Alamat Email Terdaftar'];
    const rows = Object.keys(users).map(username => {
      const u = users[username];
      return [`"${username}"`, `"${u.name}"`, `"${u.role}"`, `"${u.email || '-'}"`];
    });
    downloadCSV([headers.join(','), ...rows].join('\n'), `Daftar_Email_Staff_${todayStr}.csv`);
  };

  const galleryActivities = activities.filter(a => a.imageUrl);

  return (
    <div className="p-4 pb-28 h-full overflow-y-auto space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="flex items-center space-x-4 mb-4">
        <button onClick={() => setActiveTab('profil')} className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"><X size={20} /></button>
        <h2 className="text-xl font-black">Admin Master Panel</h2>
      </div>

      <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm flex items-center"><RefreshCw size={14} className="mr-2 text-green-400"/> Pantauan Absen Hari Ini</h3>
          <span className="text-[10px] text-gray-400">{todayStr}</span>
        </div>
        <div className="space-y-2">
          {staffUsers.map(baseUser => {
            // Ambil data nama terupdate jika sudah diubah
            const userProfile = users[baseUser.username] || baseUser;
            const hasAttended = attendance.find(a => a.date === todayStr && a.name === userProfile.name && a.type === 'Hadir');
            return (
              <div key={baseUser.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-xl text-xs">
                <div>
                  <p className="font-bold text-gray-200">{userProfile.name}</p>
                  <p className="text-[9px] text-gray-400">{userProfile.email || 'Email belum ditautkan'}</p>
                </div>
                {hasAttended ? (
                  <span className="bg-green-900/50 text-green-400 px-3 py-1 rounded-lg font-mono font-bold shadow-inner">{hasAttended.time}</span>
                ) : (
                  <span className="bg-red-900/50 text-red-400 px-3 py-1 rounded-lg font-bold text-[10px] shadow-inner">BELUM</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-xl">
        <h3 className="font-bold text-sm mb-4 flex items-center"><Shield size={16} className="mr-2 text-red-400"/> Kelola Database</h3>
        
        <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold">Dokumen Terakhir</p>
        <div className="space-y-2 mb-4">
          {letters.slice(0, 3).map(l => (
            <div key={l.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-xl">
              <div className="truncate pr-2"><p className="text-xs font-bold truncate">{l.title}</p><p className="text-[9px] text-gray-400">{l.kategori}</p></div>
              <button onClick={() => onDeleteLetter(l.id)} className="p-2 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors"><Trash2 size={14}/></button>
            </div>
          ))}
          {letters.length === 0 && <p className="text-xs text-gray-500 italic">Data kosong</p>}
        </div>

        <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold">Foto Terakhir</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {galleryActivities.slice(0,4).map(p => (
            <div key={p.id} className="relative shrink-0">
              <img src={p.imageUrl} className="w-16 h-16 object-cover rounded-lg border border-gray-600 shadow-md" />
              <button onClick={() => onDeletePhoto(p.id)} className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700 transition-colors"><X size={10}/></button>
            </div>
          ))}
          {galleryActivities.length === 0 && <p className="text-xs text-gray-500 italic">Belum ada foto</p>}
        </div>
      </div>

      <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-xl">
        <h3 className="font-bold text-sm mb-4">Ekspor Data Server (CSV)</h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={exportAbsensi} className="bg-blue-600/20 text-blue-400 border border-blue-600/50 py-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-blue-600/40 transition-colors active:scale-95">
            <Download size={16}/> Absensi
          </button>
          <button onClick={exportKegiatan} className="bg-purple-600/20 text-purple-400 border border-purple-600/50 py-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-purple-600/40 transition-colors active:scale-95">
            <Download size={16}/> Kegiatan
          </button>
          <button onClick={exportSurat} className="bg-orange-600/20 text-orange-400 border border-orange-600/50 py-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-orange-600/40 transition-colors active:scale-95">
            <Download size={16}/> Arsip Surat
          </button>
          <button onClick={exportEmailStaff} className="bg-green-600/20 text-green-400 border border-green-600/50 py-3 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-1 hover:bg-green-600/40 transition-colors active:scale-95">
            <Download size={16}/> Data Email
          </button>
        </div>
      </div>
    </div>
  );
};

// --- FUNGSI UTAMA (APP) DENGAN INTEGRASI FIREBASE ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [logoUrl] = useState('Logo MUI 1080.png');
  const [isUploading, setIsUploading] = useState(false);
  
  // State tersinkronisasi Firebase
  const [letters, setLetters] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userProfiles, setUserProfiles] = useState({}); // State penyimpan profil (nama, foto, password, email)

  // EFFECT: Mengambil data real-time dari Firebase
  useEffect(() => {
    // Listener untuk Profil Pengguna (Password, Nama, Foto)
    const unUsers = onSnapshot(collection(db, 'user_profiles'), (snap) => {
      const data = {};
      snap.docs.forEach(d => { data[d.id] = d.data(); });
      setUserProfiles(data);
      
      // Update data currentUser jika sedang login dan ada perubahan
      if (currentUser) {
        const updatedProfile = data[currentUser.username];
        if (updatedProfile) {
          setCurrentUser(prev => ({ ...prev, ...updatedProfile }));
        }
      }
    }, (error) => console.error("Error mengambil profil:", error));

    // Listener untuk Arsip Surat
    const unLetters = onSnapshot(collection(db, 'arsip_surat'), (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      setLetters(data.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => console.error("Error mengambil surat:", error));

    // Listener untuk Presensi
    const unAtt = onSnapshot(collection(db, 'presensi'), (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      setAttendance(data.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => console.error("Error mengambil absen:", error));

    // Listener untuk Kegiatan Harian
    const unAct = onSnapshot(collection(db, 'kegiatan_harian'), (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      setActivities(data.sort((a, b) => b.createdAt - a.createdAt));
    }, (error) => console.error("Error mengambil kegiatan:", error));

    return () => { unUsers(); unLetters(); unAtt(); unAct(); }; // Cleanup
  }, [currentUser?.username]); // Dependensi username agar sinkron saat ganti akun

  const handleLogin = (username, password) => {
    // 1. Cari user di daftar master USERS (hardcoded bawaan)
    const baseUser = USERS.find(u => u.username === username.toLowerCase());
    if (!baseUser) return false;

    // 2. Cek apakah user pernah mengubah profilnya (di database Firebase)
    const profileDb = userProfiles[baseUser.username] || {};
    
    // 3. Gunakan password dari database, jika tidak ada gunakan bawaan
    const activePassword = profileDb.password || baseUser.password;

    if (password === activePassword) {
      // Gabungkan data dasar dengan data dari database (foto, nama baru, email)
      setCurrentUser({ ...baseUser, ...profileDb });
      setActiveTab('home');
      return true;
    }
    return false;
  };

  // HANDLER FIREBASE: Update Profil User Permanen (Nama, Foto, Password, Email)
  const handleUpdateProfile = async (username, newData) => {
    try {
      // Menggunakan setDoc dengan merge: true agar menyimpan tanpa menghapus data lain
      const userRef = doc(db, 'user_profiles', username);
      await setDoc(userRef, newData, { merge: true });
    } catch (error) {
      alert("Gagal mengupdate profil ke server: " + error.message);
    }
  };

  // HANDLER FIREBASE: Tambah Surat
  const handleAddLetter = async (formData) => {
    await addDoc(collection(db, 'arsip_surat'), {
      createdAt: Date.now(),
      title: formData.title,
      kategori: formData.kategori,
      date: formData.date,
      sender: formData.sender,
      number: generateSuratNumber(formData.kategori, formData.date),
      status: 'Baru',
      uploader: currentUser.name
    });
  };

  // HANDLER FIREBASE: Absen GPS
  const handleAddAttendance = async (type, lat, lng) => {
    await addDoc(collection(db, 'presensi'), {
      createdAt: Date.now(),
      name: currentUser.name, // Gunakan nama terupdate
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: new Date().toISOString().split('T')[0],
      type, lat, lng, status: 'Tercatat'
    });
  };

  // HANDLER FIREBASE: Tambah Kegiatan (Foto Base64)
  const handleAddActivity = async (desc, imageFile) => {
    setIsUploading(true);
    let finalImageBase64 = null;
    
    try {
      if (imageFile) finalImageBase64 = await compressImage(imageFile);

      await addDoc(collection(db, 'kegiatan_harian'), {
        createdAt: Date.now(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
        desc: desc || 'Melampirkan foto dokumentasi',
        reporter: currentUser.name, // Gunakan nama terupdate
        imageUrl: finalImageBase64
      });
    } catch (error) {
      alert("Gagal menyimpan data ke server: " + error.message);
    }
    setIsUploading(false);
  };

  // HANDLER FIREBASE: Hapus Data (Master Admin)
  const handleDeleteLetter = async (id) => {
    if(confirm("Hapus surat ini dari server?")) {
      try { await deleteDoc(doc(db, 'arsip_surat', id)); } 
      catch(err) { alert("Gagal menghapus: " + err.message); }
    }
  };

  const handleDeletePhoto = async (id) => {
    if(confirm("Hapus foto ini?")) {
      try { await updateDoc(doc(db, 'kegiatan_harian', id), { imageUrl: null }); } 
      catch(err) { alert("Gagal menghapus foto: " + err.message); }
    }
  };

  if (!currentUser) return <LoginScreen onLogin={handleLogin} logoUrl={logoUrl} />;

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          {activeTab === 'home' && <HomeTab currentUser={currentUser} logoUrl={logoUrl} letters={letters} attendance={attendance} activities={activities} onAddActivity={handleAddActivity} isUploading={isUploading} setActiveTab={setActiveTab} />}
          {activeTab === 'dokumen' && <DokumenTab letters={letters} onAddLetter={handleAddLetter} currentUser={currentUser} />}
          {activeTab === 'galeri' && <GaleriTab activities={activities} />}
          {activeTab === 'presensi' && <PresensiTab currentUser={currentUser} attendance={attendance} onAddAttendance={handleAddAttendance} setActiveTab={setActiveTab} />}
          {activeTab === 'profil' && <ProfilTab currentUser={currentUser} onUpdateProfile={handleUpdateProfile} setActiveTab={setActiveTab} />}
          {activeTab === 'master' && <MasterAdminTab attendance={attendance} letters={letters} activities={activities} users={userProfiles} onDeleteLetter={handleDeleteLetter} onDeletePhoto={handleDeletePhoto} setActiveTab={setActiveTab} />}
        </div>
        
        {activeTab !== 'presensi' && activeTab !== 'master' && (
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </div>
    </div>
  );
}