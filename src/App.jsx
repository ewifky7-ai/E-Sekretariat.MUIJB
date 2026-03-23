import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, FileText, User, Plus, Search, FileDown, FileUp, Award, CheckCircle2, 
  X, FileBox, Edit, Shield, LogOut, MapPin, Clock, Download, Camera, 
  Image as ImageIcon, Trash2, Settings, Mail, RefreshCw, ClipboardList, Loader2,
  UserPlus, UserMinus, KeyRound, Globe, ExternalLink, AlertCircle,
  LayoutGrid, Users, Receipt, Wrench, MessageSquareShare, CheckSquare, BellRing
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const USERS = [
  { id: 1, username: 'ketua', password: 'ketua123', name: 'Ketua Umum MUI Jawa Barat', role: 'viewer', title: 'Ketua Umum' },
  { id: 2, username: 'sekum', password: 'sekum123', name: 'Sekretaris Umum MUI Jawa Barat', role: 'viewer', title: 'Sekretaris Umum' },
  { id: 3, username: 'admin', password: 'admin123', name: 'Eky Wifky Afandi, M.Ag', role: 'admin', title: 'Kepala Sekretariat' },
  { id: 4, username: 'ruhiyat', password: 'ruhiyat123', name: 'H. Ruhiyat', role: 'editor', title: 'Sekretariat Umum' },
  { id: 5, username: 'rani', password: 'rani123', name: 'Rani Nurita Yusuf', role: 'editor', title: 'Sekretariat Keuangan' },
  { id: 6, username: 'dedih', password: 'dedih123', name: 'Dedih Alyadi', role: 'staff', title: 'Staff' },
  { id: 7, username: 'erik', password: 'erik123', name: 'Erik', role: 'staff', title: 'Staff' },
];

const MONTHS = [
  { name: 'Januari', roman: 'I', val: '01' }, { name: 'Februari', roman: 'II', val: '02' }, { name: 'Maret', roman: 'III', val: '03' },
  { name: 'April', roman: 'IV', val: '04' }, { name: 'Mei', roman: 'V', val: '05' }, { name: 'Juni', roman: 'VI', val: '06' },
  { name: 'Juli', roman: 'VII', val: '07' }, { name: 'Agustus', roman: 'VIII', val: '08' }, { name: 'September', roman: 'IX', val: '09' },
  { name: 'Oktober', roman: 'X', val: '10' }, { name: 'November', roman: 'XI', val: '11' }, { name: 'Desember', roman: 'XII', val: '12' }
];
const YEARS = ['2025', '2026', '2027', '2028', '2029', '2030'];

// --- BROWSER PUSH NOTIFICATION HELPER (DIPERBARUI UNTUK HP ANDROID) ---
const notifyUser = async (title, body) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try { 
      // Coba jalankan lewat Service Worker untuk mengatasi blokir di HP Android
      if (navigator.serviceWorker) {
         const reg = await navigator.serviceWorker.getRegistration();
         if (reg) { reg.showNotification(title, { body, icon: '/logo.png' }); return; }
      }
      // Fallback untuk Laptop / iPhone
      new Notification(title, { body, icon: '/logo.png' }); 
    } catch(e) { console.error("Notif gagal:", e); }
  }
};

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
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(angka) || 0);
};

// --- CUSTOM DIALOG MODAL (ANTI NGE-BLANK) ---
const DialogModal = ({ dialog, closeDialog }) => {
  if (!dialog.isOpen) return null;
  const safeMessage = typeof dialog.message === 'string' ? dialog.message : JSON.stringify(dialog.message);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-5">
      <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl transform transition-all animate-in fade-in zoom-in-95">
        <h3 className={`text-lg font-black mb-2 ${dialog.type === 'alert' ? 'text-blue-600' : 'text-orange-600'}`}>
          {dialog.title}
        </h3>
        <p className="text-sm text-gray-600 mb-8 font-medium leading-relaxed">{safeMessage}</p>
        <div className="flex gap-3 justify-end">
          {dialog.type === 'confirm' && (
            <button onClick={closeDialog} className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-black rounded-xl transition-colors active:scale-95">Batal</button>
          )}
          <button 
            onClick={() => { if(dialog.onConfirm) dialog.onConfirm(); closeDialog(); }} 
            className={`px-5 py-3 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 flex items-center ${dialog.type === 'confirm' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {dialog.type === 'confirm' ? <><CheckCircle2 size={16} className="mr-2"/> Ya, Lanjutkan</> : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 1. LAYAR LOGIN ---
const LoginScreen = ({ onLogin, logoUrl, activeUsers }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const user = activeUsers.find(u => u.username === username.toLowerCase() && u.password === password);
    if (!user) { setError('Username atau password salah!'); return; }
    
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
    
    onLogin(user);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 w-full max-w-md mx-auto">
      <div className="w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center relative overflow-hidden">
        <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-1 border-4 border-green-50 shadow-md flex items-center justify-center overflow-hidden">
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=MUI" }} />
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-1 tracking-tight">E-Sekretariat V4</h1>
        <p className="text-sm text-gray-400 mb-8 font-medium">Sistem Terintegrasi Realtime</p>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-500 text-[11px] rounded-xl border border-red-100 font-bold uppercase tracking-wider">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="text-left">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Username</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-green-500" placeholder="Masukkan username" />
          </div>
          <div className="text-left">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-green-500" placeholder="Masukkan password" />
          </div>
          <button type="submit" className="w-full bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-800 transition-all active:scale-95">MASUK APLIKASI</button>
        </form>
      </div>
    </div>
  );
};

// --- 2. BOTTOM NAV ---
const BottomNav = ({ activeTab, setActiveTab, currentUser }) => {
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
      
      {currentUser?.role !== 'viewer' && (
        <div className="relative -top-7">
          <button onClick={() => setActiveTab('presensi')} className="bg-green-600 text-white p-4 rounded-full shadow-xl border-4 border-gray-50 flex items-center justify-center hover:bg-green-700 active:scale-90 transition-all">
            <MapPin size={26} />
          </button>
        </div>
      )}

      <button onClick={() => setActiveTab('layanan')} className={`flex flex-col items-center transition-colors ${['layanan','galeri','bukutamu','espj','eticket'].includes(activeTab) ? 'text-green-600' : 'text-gray-300'}`}>
        <LayoutGrid size={22} />
        <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Layanan</span>
      </button>

      <button onClick={() => setActiveTab('profil')} className={`flex flex-col items-center transition-colors ${activeTab === 'profil' || activeTab === 'master' ? 'text-green-600' : 'text-gray-300'}`}>
        <User size={22} />
        <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Profil</span>
      </button>
    </div>
  );
};

// --- 3. BERANDA ---
const HomeTab = ({ currentUser, logoUrl, letters, attendance, activities, guests, tickets, notes, onAddNote, onDeleteNote, onResolveTicket, onAddActivity, isUploading, setActiveTab, showAlert }) => {
  const role = currentUser?.role;
  const todayStr = new Date().toISOString().split('T')[0];
  const attHadir = attendance.find(a => a.date === todayStr && a.name === currentUser?.name && a.type === 'Hadir');
  const attPulang = attendance.find(a => a.date === todayStr && a.name === currentUser?.name && a.type === 'Pulang');

  const [newActivity, setNewActivity] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newNote, setNewNote] = useState('');

  // Hak Akses Eksekusi Tiket: Hanya admin, dedih, erik
  const canResolveTicket = ['admin', 'dedih', 'erik'].includes(currentUser?.username?.toLowerCase());

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) { setNewImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newActivity.trim() && !newImageFile) return;
    await onAddActivity(newActivity, newImageFile);
    setNewActivity(''); setNewImageFile(null); setImagePreview(null);
    showAlert("Sukses", "Kegiatan harian berhasil dicatat.");
  };

  const todayActivities = activities.filter(a => a.date === todayStr);
  const pendingTickets = tickets.filter(t => t.status === 'Menunggu');
  const todayGuests = guests.filter(g => g.date === todayStr);

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
        {currentUser?.photo ? (
          <img src={currentUser.photo} className="w-10 h-10 rounded-xl object-cover border-2 border-green-100 shadow-sm" alt="Profile" />
        ) : (
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-700 font-bold border border-green-100 uppercase text-xs">{currentUser?.name.substring(0, 2)}</div>
        )}
      </div>

      <div className="bg-gradient-to-br from-green-700 to-green-500 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <Award size={120} className="absolute -right-6 -top-6 opacity-10 rotate-12" />
        <h2 className="text-xl font-bold mb-1 leading-tight">Ahlan wa Sahlan, <br/> {currentUser?.name.split(',')[0]}!</h2>
        <p className="text-xs text-green-100 mb-6 font-medium">{currentUser?.title}</p>
        
        {['admin', 'editor', 'staff'].includes(role) && (
          <div className="flex flex-wrap gap-2">
            {attHadir && (
              <div className="bg-white/10 rounded-2xl p-3 inline-block backdrop-blur-md border border-white/20">
                <div className="flex items-center space-x-2"><CheckCircle2 size={16} className="text-green-300" /><span className="text-xs font-bold">Hadir: {attHadir.time} WIB</span></div>
              </div>
            )}
            {attPulang && (
              <div className="bg-yellow-400/20 rounded-2xl p-3 inline-block backdrop-blur-md border border-yellow-400/30">
                <div className="flex items-center space-x-2"><LogOut size={16} className="text-yellow-300" /><span className="text-xs font-bold text-yellow-50">Pulang: {attPulang.time} WIB</span></div>
              </div>
            )}
            {!attHadir && !attPulang && (
              <div className="bg-white/10 rounded-2xl p-4 inline-block backdrop-blur-md border border-white/20">
                <div className="flex items-center space-x-2"><Clock size={16} className="text-yellow-300" /><span className="text-xs font-bold text-yellow-50">Belum Presensi GPS</span></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- CATATAN PENTING --- */}
      <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-3xl shadow-sm relative mt-6">
        <h3 className="font-extrabold text-yellow-800 text-xs uppercase tracking-widest flex items-center mb-3">
          <AlertCircle size={14} className="mr-2 text-yellow-600"/> Catatan Pimpinan
        </h3>
        
        <div className="space-y-2 mb-3">
          {notes.length === 0 ? (
            <p className="text-[10px] text-yellow-700 italic">Belum ada catatan hari ini.</p>
          ) : (
            notes.map(n => (
              <div key={n.id} className="flex justify-between items-start border-b border-yellow-200/50 pb-2 last:border-0">
                <div className="flex-1 pr-2">
                  <p className="text-[11px] text-yellow-800 font-bold leading-relaxed">{n.text}</p>
                  <p className="text-[8px] text-yellow-600 uppercase font-black mt-1">- {n.author}</p>
                </div>
                {role === 'admin' && (
                  <button onClick={() => onDeleteNote(n.id)} className="p-1.5 bg-yellow-100 text-yellow-600 hover:bg-yellow-200 rounded-md transition-colors"><X size={10}/></button>
                )}
              </div>
            ))
          )}
        </div>

        {role === 'admin' && (
          <div className="flex gap-2 pt-2 border-t border-yellow-200/50 mt-2">
            <input type="text" value={newNote} onChange={(e)=>setNewNote(e.target.value)} className="flex-1 text-[10px] p-2.5 rounded-xl border border-yellow-300 outline-none focus:ring-2 focus:ring-yellow-400 bg-white font-bold text-gray-700" placeholder="Ketik list pengumuman/tugas..." />
            <button onClick={() => { if(newNote.trim()) { onAddNote(newNote); setNewNote(''); } }} className="bg-yellow-500 text-white px-3 py-2 rounded-xl text-[10px] font-black shadow-sm active:scale-95 transition-transform"><Plus size={14}/></button>
          </div>
        )}
      </div>

      <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest ml-1 mt-6">Ringkasan Dokumen</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileDown size={20} /></div>
          <div><p className="text-xl font-black text-gray-800 leading-none">{letters.filter(l => l.kategori === 'Surat Masuk').length}</p><p className="text-[10px] text-gray-400 font-bold uppercase mt-1">S. Masuk</p></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><FileUp size={20} /></div>
          <div><p className="text-xl font-black text-gray-800 leading-none">{letters.filter(l => l.kategori === 'Surat Keluar').length}</p><p className="text-[10px] text-gray-400 font-bold uppercase mt-1">S. Keluar</p></div>
        </div>
      </div>

      {/* --- E-TICKET URGENT --- */}
      <div className="mt-6 mb-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest ml-1 flex items-center"><Wrench size={16} className="mr-2 text-red-600"/> Laporan Kendala</h3>
          <button onClick={() => setActiveTab('eticket')} className="text-[10px] text-red-600 font-black uppercase tracking-widest">Kelola</button>
        </div>
        <div className="space-y-3">
          {pendingTickets.length === 0 ? (
            <p className="text-center text-[10px] text-gray-300 font-bold py-3 tracking-widest border-2 border-dashed border-gray-100 rounded-xl bg-white">Semua fasilitas aman</p>
          ) : (
            pendingTickets.slice(0, 2).map(t => (
              <div key={t.id} className="bg-white p-3 rounded-2xl border border-red-100 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-red-50 text-red-500 rounded-xl"><Wrench size={14}/></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-gray-800 truncate">{t.kendala}</h4>
                  <p className="text-[9px] text-gray-500 font-bold mt-0.5">{t.lokasi}</p>
                </div>
                {/* HAK AKSES TANDAI SELESAI */}
                {canResolveTicket ? (
                  <button onClick={(e) => { e.preventDefault(); onResolveTicket(t.id); }} className="bg-green-100 text-green-700 hover:bg-green-200 text-[9px] font-black px-3 py-2 rounded-xl transition-colors shrink-0 flex items-center shadow-sm">
                    <CheckSquare size={12} className="mr-1"/> SELESAI
                  </button>
                ) : (
                  <span className="bg-red-50 text-red-500 text-[9px] font-black px-2 py-1 rounded-md shrink-0 uppercase tracking-widest">Menunggu</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- TAMU HARI INI --- */}
      <div className="mt-6 mb-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest ml-1 flex items-center"><Users size={16} className="mr-2 text-blue-600"/> Tamu Hari Ini</h3>
          <button onClick={() => setActiveTab('bukutamu')} className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Buku Tamu</button>
        </div>
        <div className="space-y-3">
          {todayGuests.length === 0 ? (
            <p className="text-center text-[10px] text-gray-300 font-bold py-3 tracking-widest border-2 border-dashed border-gray-100 rounded-xl bg-white">Belum ada tamu masuk</p>
          ) : (
            todayGuests.slice(0, 2).map(g => (
              <div key={g.id} className="bg-white p-3 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><User size={14}/></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-gray-800 truncate">{g.nama}</h4>
                  <p className="text-[9px] text-gray-500 font-bold mt-0.5">{g.instansi}</p>
                </div>
                <span className="text-[9px] font-mono text-blue-500 font-bold">{g.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 mb-3">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest ml-1 flex items-center"><Mail size={16} className="mr-2 text-green-600"/> Dokumen Terbaru</h3>
          <button onClick={() => setActiveTab('dokumen')} className="text-[10px] text-green-600 font-black uppercase tracking-widest">Lihat Semua</button>
        </div>
        <div className="space-y-3">
          {letters.length === 0 ? (
            <p className="text-center text-[10px] text-gray-300 font-bold py-4 tracking-widest border-2 border-dashed border-gray-100 rounded-xl bg-white">Belum ada surat</p>
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
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest flex items-center"><ClipboardList size={16} className="mr-2 text-green-600"/> Kegiatan Harian</h3>
        </div>
        
        {['admin', 'editor', 'staff', 'viewer'].includes(role) && (
          <form onSubmit={handleSubmit} className="mb-4">
            {imagePreview && (
              <div className="relative inline-block mb-3">
                <img src={imagePreview} className="w-20 h-20 object-cover rounded-xl border-2 border-green-500 shadow-md" alt="Preview" />
                <button type="button" onClick={() => {setImagePreview(null); setNewImageFile(null)}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"><X size={14}/></button>
              </div>
            )}
            <div className="flex gap-2">
              <input type="file" accept="image/*" capture="environment" id="actCamera" className="hidden" onChange={handleCapture} />
              <label htmlFor="actCamera" className="bg-blue-50 text-blue-600 px-4 flex items-center justify-center rounded-xl cursor-pointer hover:bg-blue-100 border border-blue-100 transition-colors"><Camera size={20}/></label>
              <input type="text" placeholder="Ketik kegiatan / upload foto..." value={newActivity} onChange={(e) => setNewActivity(e.target.value)} disabled={isUploading} className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-xs outline-none focus:border-green-500 font-bold text-gray-700"/>
              <button disabled={isUploading} type="submit" className="bg-green-600 text-white px-4 py-3 rounded-xl text-xs font-black hover:bg-green-700 active:scale-95 transition-all flex items-center">{isUploading ? <Loader2 size={16} className="animate-spin" /> : "CATAT"}</button>
            </div>
          </form>
        )}

        <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
          {todayActivities.length === 0 ? (
            <p className="text-center text-[10px] text-gray-300 font-bold uppercase py-6 tracking-widest border-2 border-dashed border-gray-50 rounded-xl">Belum ada kegiatan tercatat</p>
          ) : (
            todayActivities.map(act => (
              <div key={act.id} className="border-l-4 border-green-500 pl-3 py-2.5 bg-gray-50/50 rounded-r-xl flex items-start gap-3">
                {act.imageUrl && (<img src={act.imageUrl} onClick={() => setSelectedImage(act.imageUrl)} className="w-12 h-12 object-cover rounded-lg cursor-pointer border border-gray-200 shrink-0 hover:opacity-80 transition-opacity" alt="Thumb" />)}
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

// --- 4. LAYANAN TAB ---
const LayananTab = ({ setActiveTab }) => {
  return (
    <div className="p-4 pb-28 h-full overflow-y-auto space-y-6">
      <h2 className="text-2xl font-black text-gray-800 tracking-tight">Menu Layanan</h2>
      <p className="text-xs text-gray-400 px-1 -mt-4">Pusat aplikasi terintegrasi E-Sekretariat.</p>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setActiveTab('bukutamu')} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:shadow-md transition-all active:scale-95">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><Users size={28} /></div>
          <div className="text-center"><h3 className="font-bold text-sm text-gray-800">E-Tamu</h3><p className="text-[9px] text-gray-400 font-medium mt-1">Buku Tamu Digital</p></div>
        </button>

        <button onClick={() => setActiveTab('espj')} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 hover:border-orange-400 hover:shadow-md transition-all active:scale-95">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner"><Receipt size={28} /></div>
          <div className="text-center"><h3 className="font-bold text-sm text-gray-800">E-SPJ</h3><p className="text-[9px] text-gray-400 font-medium mt-1">Laporan Keuangan</p></div>
        </button>

        <button onClick={() => setActiveTab('eticket')} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 hover:border-red-400 hover:shadow-md transition-all active:scale-95">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shadow-inner"><Wrench size={28} /></div>
          <div className="text-center"><h3 className="font-bold text-sm text-gray-800">E-Ticket</h3><p className="text-[9px] text-gray-400 font-medium mt-1">Laporan Fasilitas</p></div>
        </button>
        
        <button onClick={() => setActiveTab('galeri')} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3 hover:border-purple-400 hover:shadow-md transition-all active:scale-95">
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner"><ImageIcon size={28} /></div>
          <div className="text-center"><h3 className="font-bold text-sm text-gray-800">Galeri</h3><p className="text-[9px] text-gray-400 font-medium mt-1">Dokumentasi Harian</p></div>
        </button>
      </div>
    </div>
  );
};

// --- 5. BUKU TAMU TAB ---
const BukuTamuTab = ({ guests, onAddGuest, setActiveTab, showAlert }) => {
  const [form, setForm] = useState({ nama: '', instansi: '', tujuan: '' });
  const [loading, setLoading] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onAddGuest(form);
    setForm({ nama: '', instansi: '', tujuan: '' });
    setLoading(false);
    showAlert("Sukses", "Terima kasih, data tamu berhasil dicatat!");
  };
  
  const todayGuests = guests.filter(g => g.date === todayStr);

  return (
    <div className="p-4 pb-28 h-full overflow-y-auto space-y-6">
      <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <button onClick={() => setActiveTab('layanan')} className="absolute top-4 right-4 text-white bg-white/20 p-2 rounded-full hover:bg-white/40 z-10 transition-all"><X size={18} /></button>
        <Users size={100} className="absolute -right-4 -bottom-4 opacity-10" />
        <h2 className="text-2xl font-black tracking-tight mb-1 pr-10">Buku Tamu Digital</h2>
        <p className="text-xs text-blue-100 font-medium">Selamat Datang di Sekretariat MUI Jabar</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Nama Lengkap</label><input required type="text" value={form.nama} onChange={e=>setForm({...form, nama: e.target.value})} className="w-full border-b-2 border-gray-100 p-2 text-sm outline-none focus:border-blue-500 font-bold text-gray-800" placeholder="Masukkan nama..." /></div>
        <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Asal Instansi / Lembaga</label><input required type="text" value={form.instansi} onChange={e=>setForm({...form, instansi: e.target.value})} className="w-full border-b-2 border-gray-100 p-2 text-sm outline-none focus:border-blue-500 font-bold text-gray-800" placeholder="Misal: Kemenag Jabar" /></div>
        <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Tujuan / Keperluan</label><input required type="text" value={form.tujuan} onChange={e=>setForm({...form, tujuan: e.target.value})} className="w-full border-b-2 border-gray-100 p-2 text-sm outline-none focus:border-blue-500 font-bold text-gray-800" placeholder="Ingin bertemu dengan..." /></div>
        <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs mt-2 flex items-center justify-center">{loading ? <Loader2 size={16} className="animate-spin" /> : "SIMPAN DATA TAMU"}</button>
      </form>

      <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest ml-1 mt-6">Daftar Tamu Hari Ini</h3>
      <div className="space-y-3">
        {todayGuests.length === 0 ? (
           <p className="text-center text-[10px] text-gray-300 font-bold py-6 tracking-widest border-2 border-dashed border-gray-100 rounded-xl bg-white">Belum ada tamu hari ini</p>
        ) : (
          todayGuests.map(g => (
            <div key={g.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-gray-800">{g.nama}</h4><span className="text-[9px] text-gray-400 font-mono">{g.time} WIB</span>
              </div>
              <p className="text-[10px] font-bold text-blue-600 uppercase">{g.instansi}</p><p className="text-xs text-gray-600 mt-1">{g.tujuan}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- 6. E-SPJ TAB ---
const ESpjTab = ({ spjs, onAddSpj, onAccSpj, currentUser, setActiveTab, showAlert }) => {
  const [form, setForm] = useState({ keterangan: '', jumlah: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Hak Akses ACC SPJ: Hanya rani atau admin
  const canAccSpj = ['admin', 'rani'].includes(currentUser?.username?.toLowerCase());

  const handleCapture = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) { setFile(selectedFile); setPreview(URL.createObjectURL(selectedFile)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.keterangan || !form.jumlah || !file) { showAlert("Peringatan", "Lengkapi deskripsi, nominal, dan foto struk!"); return; }
    setLoading(true);
    await onAddSpj(form, file);
    setForm({ keterangan: '', jumlah: '' }); setFile(null); setPreview(null); setLoading(false);
    showAlert("Sukses", "Bukti SPJ berhasil dikirim ke server!");
  };

  return (
    <div className="p-4 pb-28 h-full overflow-y-auto space-y-6">
      <div className="bg-orange-500 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <button onClick={() => setActiveTab('layanan')} className="absolute top-4 right-4 text-white bg-white/20 p-2 rounded-full hover:bg-white/40 z-10 transition-all"><X size={18} /></button>
        <Receipt size={100} className="absolute -right-4 -bottom-4 opacity-10" />
        <h2 className="text-2xl font-black tracking-tight mb-1 pr-10">E-SPJ Digital</h2>
        <p className="text-xs text-orange-100 font-medium">Unggah bukti pengeluaran operasional</p>
      </div>

      {['admin', 'editor', 'staff'].includes(currentUser.role) && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Deskripsi Pengeluaran</label><input required type="text" value={form.keterangan} onChange={e=>setForm({...form, keterangan: e.target.value})} className="w-full border-b-2 border-gray-100 p-2 text-sm outline-none focus:border-orange-500 font-bold text-gray-800" placeholder="Misal: Beli Tinta Printer" /></div>
          <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Nominal (Rp)</label><input required type="number" value={form.jumlah} onChange={e=>setForm({...form, jumlah: e.target.value})} className="w-full border-b-2 border-gray-100 p-2 text-sm outline-none focus:border-orange-500 font-bold text-gray-800" placeholder="Misal: 150000" /></div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 ml-1">Foto Struk Pembayaran</label>
            <div className="flex gap-2">
              <input type="file" accept="image/*" capture="environment" id="spjCamera" className="hidden" onChange={handleCapture} />
              <label htmlFor="spjCamera" className="bg-orange-50 text-orange-600 px-4 py-3 flex items-center justify-center rounded-xl cursor-pointer hover:bg-orange-100 border border-orange-100 transition-colors"><Camera size={20}/></label>
              {preview ? (
                 <div className="relative flex-1"><img src={preview} className="h-12 w-auto object-contain rounded-lg border border-gray-200" alt="Struk"/><button type="button" onClick={()=>{setPreview(null); setFile(null)}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={10}/></button></div>
              ) : (
                 <div className="flex-1 bg-gray-50 border border-dashed border-gray-200 rounded-xl flex items-center px-3 text-[10px] text-gray-400 font-bold">Belum ada struk</div>
              )}
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-700 transition-all uppercase tracking-widest text-xs mt-2 flex items-center justify-center">{loading ? <Loader2 size={16} className="animate-spin" /> : "KIRIM SPJ"}</button>
        </form>
      )}

      <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest ml-1 mt-6">Riwayat SPJ Terkini</h3>
      <div className="space-y-3">
        {spjs.length === 0 ? (
           <p className="text-center text-[10px] text-gray-300 font-bold py-6 tracking-widest border-2 border-dashed border-gray-100 rounded-xl bg-white">Belum ada SPJ tercatat</p>
        ) : (
          spjs.map(spj => (
            <div key={spj.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
              {spj.imageUrl && <img src={spj.imageUrl} onClick={() => setSelectedImage(spj.imageUrl)} className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0 cursor-pointer" alt="Struk" />}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-xs text-gray-800 truncate pr-2">{spj.keterangan}</h4>
                </div>
                <p className="text-sm font-black text-orange-600 mb-1">{formatRupiah(spj.jumlah)}</p>
                <div className="flex justify-between mt-1 items-center">
                  <span className="text-[9px] text-gray-500 font-bold">{spj.reporter} • {spj.date}</span>
                  {/* HANYA RANI / ADMIN YANG BISA KLIK TANDAI ACC */}
                  {spj.status === 'Disetujui' ? (
                     <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center"><CheckCircle2 size={10} className="mr-1"/> ACC {spj.accBy}</span>
                  ) : (
                     canAccSpj ? (
                       <button onClick={(e) => { e.preventDefault(); onAccSpj(spj.id); }} className="text-[9px] font-black text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md shadow-sm active:scale-95 transition-all flex items-center"><CheckSquare size={10} className="mr-1"/> TANDAI ACC</button>
                     ) : (
                       <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">Menunggu ACC</span>
                     )
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"><button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/40"><X size={24}/></button><img src={selectedImage} className="max-w-full max-h-[80vh] rounded-2xl border-4 border-white/10" alt="Full view" /></div>
      )}
    </div>
  );
};

// --- 7. E-TICKET TAB ---
const ETicketTab = ({ tickets, onAddTicket, onResolveTicket, currentUser, setActiveTab, showAlert }) => {
  const [form, setForm] = useState({ lokasi: '', kendala: '' });
  const [loading, setLoading] = useState(false);

  // Hak Akses Eksekusi Tiket: Hanya admin, dedih, erik
  const canResolveTicket = ['admin', 'dedih', 'erik'].includes(currentUser?.username?.toLowerCase());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onAddTicket(form);
    setForm({ lokasi: '', kendala: '' });
    setLoading(false);
    showAlert("Sukses", "Tiket laporan kendala berhasil dibuat!");
  };

  return (
    <div className="p-4 pb-28 h-full overflow-y-auto space-y-6">
      <div className="bg-red-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <button onClick={() => setActiveTab('layanan')} className="absolute top-4 right-4 text-white bg-white/20 p-2 rounded-full hover:bg-white/40 z-10 transition-all"><X size={18} /></button>
        <Wrench size={100} className="absolute -right-4 -bottom-4 opacity-10" />
        <h2 className="text-2xl font-black tracking-tight mb-1 pr-10">E-Ticket Masalah</h2>
        <p className="text-xs text-red-100 font-medium">Lapor kerusakan fasilitas / aset kantor</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Lokasi Fasilitas</label><input required type="text" value={form.lokasi} onChange={e=>setForm({...form, lokasi: e.target.value})} className="w-full border-b-2 border-gray-100 p-2 text-sm outline-none focus:border-red-500 font-bold text-gray-800" placeholder="Misal: Ruang Rapat Pimpinan" /></div>
        <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Deskripsi Kerusakan</label><input required type="text" value={form.kendala} onChange={e=>setForm({...form, kendala: e.target.value})} className="w-full border-b-2 border-gray-100 p-2 text-sm outline-none focus:border-red-500 font-bold text-gray-800" placeholder="Misal: AC Meneteskan Air / Mati" /></div>
        <button disabled={loading} type="submit" className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-red-700 transition-all uppercase tracking-widest text-xs mt-2 flex items-center justify-center">{loading ? <Loader2 size={16} className="animate-spin" /> : "BUAT TIKET LAPORAN"}</button>
      </form>

      <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest ml-1 mt-6">Daftar Antrean Tiket</h3>
      <div className="space-y-3">
        {tickets.length === 0 ? (
           <p className="text-center text-[10px] text-gray-300 font-bold py-6 tracking-widest border-2 border-dashed border-gray-100 rounded-xl bg-white">Semua fasilitas aman terkendali</p>
        ) : (
          tickets.map(t => (
            <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-gray-800 line-clamp-2 pr-2">{t.kendala}</h4>
                {t.status === 'Menunggu' ? (
                  <span className="bg-red-50 text-red-500 text-[9px] font-black px-2 py-1 rounded-md shrink-0 uppercase tracking-widest">Menunggu</span>
                ) : (
                  <span className="bg-green-50 text-green-600 text-[9px] font-black px-2 py-1 rounded-md shrink-0 uppercase tracking-widest flex items-center"><CheckSquare size={10} className="mr-1"/> Selesai</span>
                )}
              </div>
              <div className="flex items-center text-[10px] font-bold text-gray-400 mt-1"><MapPin size={10} className="mr-1 text-red-400"/> {t.lokasi}</div>
              <div className="flex justify-between mt-2 items-center pt-2 border-t border-gray-50">
                <span className="text-[9px] text-gray-400 font-bold uppercase">{t.reporter} • {t.date}</span>
                {/* HAK AKSES TANDAI SELESAI */}
                {t.status === 'Menunggu' && (
                  canResolveTicket ? (
                    <button onClick={(e) => { e.preventDefault(); onResolveTicket(t.id); }} className="bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 text-[9px] font-black px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center">
                      <CheckSquare size={10} className="mr-1"/> Tandai Selesai
                    </button>
                  ) : (
                    <span className="text-[9px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">Menunggu Penanganan</span>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- 8. DOKUMEN TAB ---
const DokumenTab = ({ letters, onAddLetter, onUpdateDisposisi, currentUser, showAlert }) => {
  const [view, setView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [disposisiInputs, setDisposisiInputs] = useState({});
  const [formData, setFormData] = useState({ title: '', kategori: 'Surat Masuk', date: new Date().toISOString().split('T')[0], sender: '', kodeSurat: '', noSurat: '', bulanSurat: MONTHS[new Date().getMonth()].roman, tahunSurat: new Date().getFullYear().toString()});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddLetter(formData); setView('list');
      setFormData({ title: '', kategori: 'Surat Masuk', date: new Date().toISOString().split('T')[0], sender: '', kodeSurat: '', noSurat: '', bulanSurat: MONTHS[new Date().getMonth()].roman, tahunSurat: new Date().getFullYear().toString() });
      showAlert("Sukses", "Data surat berhasil disimpan!");
    } catch (err) { showAlert("Gagal", "Gagal menambahkan surat: " + err.message); }
  };

  const handleKirimDisposisi = (letterId) => {
    const text = disposisiInputs[letterId];
    if(text && text.trim() !== '') { onUpdateDisposisi(letterId, text, currentUser.name); setDisposisiInputs({...disposisiInputs, [letterId]: ''}); }
  };

  if (view === 'buat') {
    return (
      <div className="p-4 pb-28 h-full overflow-y-auto space-y-6">
        <div className="flex items-center space-x-4"><button onClick={() => setView('list')} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"><X size={20} /></button><h2 className="text-xl font-black text-gray-800">Registrasi Surat</h2></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-5 shadow-sm">
            <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Kategori Surat</label><select value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none border border-gray-100 font-bold cursor-pointer"><option>Surat Masuk</option><option>Surat Keluar</option><option>Internal</option><option>Eksternal</option><option>Keputusan</option><option>Lainnya</option></select></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Kode Surat</label><input required type="text" value={formData.kodeSurat} onChange={(e) => setFormData({...formData, kodeSurat: e.target.value})} className="w-full border-b-2 border-gray-50 p-2 text-sm outline-none focus:border-green-600 font-bold" placeholder="Contoh: A" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">No. Surat</label><input required type="text" value={formData.noSurat} onChange={(e) => setFormData({...formData, noSurat: e.target.value})} className="w-full border-b-2 border-gray-50 p-2 text-sm outline-none focus:border-green-600 font-bold" placeholder="Contoh: 060" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Bulan</label><select required value={formData.bulanSurat} onChange={(e) => setFormData({...formData, bulanSurat: e.target.value})} className="w-full border-b-2 border-gray-50 p-2 text-sm outline-none focus:border-green-600 font-bold bg-transparent cursor-pointer">{MONTHS.map(m => <option key={m.roman} value={m.roman}>{m.name}</option>)}</select></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tahun</label><select required value={formData.tahunSurat} onChange={(e) => setFormData({...formData, tahunSurat: e.target.value})} className="w-full border-b-2 border-gray-50 p-2 text-sm outline-none focus:border-green-600 font-bold bg-transparent cursor-pointer">{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
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
        {['admin', 'editor'].includes(currentUser.role) && (<button onClick={() => setView('buat')} className="bg-green-100 text-green-700 p-2 rounded-xl border border-green-200"><Plus size={20} /></button>)}
      </div>
      <div className="relative"><Search size={18} className="absolute left-4 top-4 text-gray-300" /><input type="text" className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl text-sm outline-none bg-white shadow-sm focus:ring-2 focus:ring-green-500" placeholder="Cari nomor atau perihal..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredLetters.length === 0 ? <div className="text-center py-24 text-gray-300"><FileBox size={60} className="mx-auto mb-4 opacity-10" /><p className="font-bold text-sm uppercase tracking-widest opacity-20">Data Kosong</p></div> : 
        filteredLetters.map((letter) => (
          <div key={letter.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-start space-x-4">
               <div className={`p-3 rounded-xl shrink-0 ${letter.kategori.includes('Masuk') ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}><FileText size={20} /></div>
               <div className="flex-1 min-w-0">
                 <h4 className="text-sm font-bold text-gray-800 pr-2 leading-tight">{letter.title}</h4>
                 <p className="text-[11px] text-green-700 font-mono font-bold mt-1">{letter.number}</p>
                 <div className="flex justify-between mt-2 items-center"><span className="text-[10px] text-gray-400 font-bold uppercase">{letter.kategori} • {letter.sender}</span><span className="text-[10px] text-gray-300 font-black">{letter.date}</span></div>
               </div>
            </div>
            {/* --- FITUR DISPOSISI E-SURAT --- */}
            <div className="mt-4 pt-4 border-t border-gray-100">
               {letter.disposisiText ? (
                 <div className="bg-green-50 p-3 rounded-xl border border-green-200">
                    <div className="flex items-center gap-1 mb-1 text-green-700"><MessageSquareShare size={12}/> <span className="text-[9px] font-black uppercase tracking-widest">Disposisi Pimpinan</span></div>
                    <p className="text-xs font-bold text-gray-800 leading-snug">"{letter.disposisiText}"</p><p className="text-[9px] text-green-600 font-bold mt-2">- {letter.disposisiBy}</p>
                 </div>
               ) : (
                 currentUser.role === 'viewer' ? (
                   <div className="flex gap-2">
                     <input type="text" value={disposisiInputs[letter.id] || ''} onChange={e=>setDisposisiInputs({...disposisiInputs, [letter.id]: e.target.value})} placeholder="Ketik instruksi disposisi..." className="flex-1 text-xs p-3 border border-gray-200 rounded-xl outline-none focus:border-green-500 font-medium bg-gray-50" />
                     <button onClick={(e) => { e.preventDefault(); handleKirimDisposisi(letter.id); }} className="bg-green-600 text-white px-4 py-3 rounded-xl text-xs font-black shadow-md hover:bg-green-700 active:scale-95 transition-all">KIRIM</button>
                   </div>
                 ) : (
                   <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-center"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center"><Clock size={12} className="mr-1"/> Menunggu Disposisi Pimpinan</span></div>
                 )
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GaleriTab = ({ activities }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const galleryActivities = activities.filter(a => a.imageUrl);

  return (
    <div className="p-4 pb-28 h-full flex flex-col space-y-4">
      <div className="flex items-center gap-3">
         <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><ImageIcon size={24}/></div>
         <h2 className="text-2xl font-black text-gray-800 tracking-tight">Galeri</h2>
      </div>
      <p className="text-xs text-gray-400 px-1 -mt-2">Dokumentasi otomatis dari kegiatan staf lapangan.</p>

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

const PresensiTab = ({ currentUser, attendance, onAddAttendance, setActiveTab, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const todayStr = new Date().toISOString().split('T')[0];
  const userToday = attendance.filter(a => a.date === todayStr && a.name === currentUser?.name);
  const hasHadir = userToday.some(a => a.type === 'Hadir');
  const hasPulang = userToday.some(a => a.type === 'Pulang');

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const timeInMins = currentHour * 60 + currentMinute;

  const isHadirTime = timeInMins >= 540 && timeInMins <= 720; 
  const isPulangTime = timeInMins >= 930 && timeInMins <= 1260; 
  const isPastHadirTime = timeInMins > 720;

  let hadirText = 'MASUK KANTOR';
  let hadirDisabled = hasHadir || loading || !isHadirTime;
  if (hasHadir) hadirText = 'SUDAH ABSEN HADIR';
  else if (isPastHadirTime) hadirText = 'WAKTU HABIS (ABSTAIN)';
  else if (!isHadirTime) hadirText = 'DIBUKA PUKUL 09:00 - 12:00';

  let pulangText = 'PULANG KANTOR';
  let pulangDisabled = !hasHadir || hasPulang || loading || !isPulangTime;
  if (hasPulang) pulangText = 'SUDAH ABSEN PULANG';
  else if (!hasHadir) pulangText = 'BELUM ABSEN HADIR';
  else if (!isPulangTime) pulangText = 'DIBUKA PUKUL 15:30 - 21:00';

  const handleAbsen = async (type) => {
    setLoading(true);
    if (!navigator.geolocation) { setMsg({ type: 'err', text: 'GPS tidak didukung perangkat' }); setLoading(false); return; }
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await onAddAttendance(type, pos.coords.latitude, pos.coords.longitude);
          setMsg({ type: 'success', text: `Absen ${type} Berhasil Dicatat ke Server!` });
          setTimeout(() => setActiveTab('home'), 1500);
        } catch (err) { setMsg({ type: 'err', text: `Gagal ke Server: ${err.message}` }); }
        setLoading(false);
      }, 
      (error) => { 
        if(error.code === 3) setMsg({ type: 'err', text: 'Sinyal GPS terlalu lemah. Pastikan Anda di luar ruangan.' });
        else setMsg({ type: 'err', text: 'Akses lokasi ditolak atau tidak tersedia.' });
        setLoading(false); 
      },
      { timeout: 10000, enableHighAccuracy: true } 
    );
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-green-700 text-white p-5 flex items-center space-x-4 shadow-lg"><button onClick={() => setActiveTab('home')} className="p-1 hover:bg-green-800 rounded-lg"><X size={24} /></button><h2 className="font-black text-sm uppercase tracking-widest">Presensi Kehadiran</h2></div>
      <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse"><MapPin size={36} /></div>
        <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Waktu Perangkat</h3>
        <h3 className="text-4xl font-mono font-black text-gray-800 mb-10 tracking-tighter">{currentTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} <span className="text-sm font-bold text-gray-400">WIB</span></h3>
        
        {msg.text && (
          <div className={`mb-8 p-4 rounded-2xl text-xs font-bold w-full border text-left ${msg.type === 'err' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>{msg.text}</div>
        )}
        
        <div className="w-full space-y-4">
          <button disabled={hadirDisabled} onClick={() => handleAbsen('Hadir')} className={`w-full py-5 rounded-2xl font-black shadow-lg transition-all text-xs tracking-widest ${hadirDisabled ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-blue-600 text-white active:scale-95 shadow-blue-200 flex justify-center items-center'}`}>{loading ? <Loader2 size={20} className="animate-spin" /> : hadirText}</button>
          <button disabled={pulangDisabled} onClick={() => handleAbsen('Pulang')} className={`w-full py-5 rounded-2xl font-black shadow-lg transition-all text-xs tracking-widest ${pulangDisabled ? 'bg-gray-100 text-gray-400 border border-gray-200' : !hasHadir ? 'bg-gray-200 text-gray-400' : 'bg-orange-500 text-white active:scale-95 shadow-orange-200 flex justify-center items-center'}`}>{loading ? <Loader2 size={20} className="animate-spin" /> : pulangText}</button>
        </div>
      </div>
    </div>
  );
};

// --- 11. PROFIL TAB ---
const ProfilTab = ({ currentUser, onUpdateProfile, setActiveTab, showAlert }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editForm, setEditForm] = useState({ name: currentUser.name, password: currentUser.password });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(currentUser.photo || null);
  const [isLinking, setIsLinking] = useState(false);
  const [emailForm, setEmailForm] = useState(currentUser.email || '');

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
  };

  const handleSaveProfile = async () => {
    setIsUploading(true);
    let finalPhoto = currentUser.photo || null;
    if (photoFile) finalPhoto = await compressImage(photoFile); 
    await onUpdateProfile(currentUser.username, { name: editForm.name, password: editForm.password, photo: finalPhoto });
    setIsUploading(false); setIsEditing(false);
    showAlert("Sukses", "Profil berhasil diperbarui!");
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
      
      <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center shadow-sm relative">
        <button onClick={() => {setIsEditing(!isEditing); setIsLinking(false);}} className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 transition-colors">
          {isEditing ? <X size={20} /> : <Edit size={20} />}
        </button>
        
        <div className="w-24 h-24 mx-auto mb-4 relative">
          {photoPreview ? (
            <img src={photoPreview} className="w-full h-full rounded-full object-cover border-4 border-white shadow-md" alt="Profil" />
          ) : (
            <div className="w-full h-full bg-green-50 text-green-700 rounded-full flex items-center justify-center text-3xl font-black border-4 border-white shadow-md uppercase">{currentUser?.name.substring(0, 2)}</div>
          )}
          {isEditing && (
            <>
              <input type="file" accept="image/*" id="profilePhoto" className="hidden" onChange={handlePhotoSelect} />
              <label htmlFor="profilePhoto" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 border-2 border-white transition-transform active:scale-95"><Camera size={14} /></label>
            </>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-3 mt-4 text-left animate-in fade-in slide-in-from-top-2">
            <div><label className="text-[10px] font-bold text-gray-400">Nama Tampilan</label><input type="text" value={editForm.name} onChange={(e)=>setEditForm({...editForm, name: e.target.value})} className="w-full p-2 border-b-2 border-green-500 outline-none text-sm font-bold bg-transparent"/></div>
            <div><label className="text-[10px] font-bold text-gray-400">Password Akun</label><input type="text" value={editForm.password} onChange={(e)=>setEditForm({...editForm, password: e.target.value})} className="w-full p-2 border-b-2 border-green-500 outline-none text-sm font-bold bg-transparent"/></div>
            <button onClick={handleSaveProfile} disabled={isUploading} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-xs mt-2 hover:bg-green-700 transition-colors flex justify-center items-center">{isUploading ? <Loader2 size={16} className="animate-spin" /> : "SIMPAN PERUBAHAN"}</button>
          </div>
        ) : (
          <>
            <h3 className="font-black text-gray-800 text-lg leading-none">{currentUser?.name}</h3>
            <p className="text-[10px] text-green-600 font-bold uppercase mt-2 tracking-widest">{currentUser?.title}</p>
          </>
        )}
      </div>

      {currentUser.email ? (
        <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-4 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-sm"><CheckCircle2 size={16} /><span>TERTAUT: {currentUser.email}</span></div>
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
        <button onClick={() => {setIsLinking(true); setIsEditing(false);}} className="w-full bg-white border border-blue-200 text-blue-600 py-4 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-sm hover:bg-blue-50 active:scale-95 transition-all"><Mail size={16} /><span>TAUTKAN AKUN GOOGLE (GMAIL)</span></button>
      )}

      {currentUser?.role === 'admin' && (
        <button onClick={() => setActiveTab('master')} className="w-full bg-red-600 text-white py-4 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 shadow-lg hover:bg-red-700 active:scale-95 transition-all"><Shield size={16} /><span>BUKA MASTER PANEL ADMIN</span></button>
      )}

      <button onClick={() => { localStorage.removeItem('muijb_session'); window.location.reload(); }} className="w-full py-5 text-xs font-black text-red-500 bg-white rounded-2xl border border-gray-100 flex items-center justify-center space-x-2 shadow-sm uppercase tracking-widest active:scale-95"><LogOut size={16} /><span>Keluar Sesi</span></button>
    </div>
  );
};

// --- 12. MASTER ADMIN TAB ---
const MasterAdminTab = ({ attendance, letters, activities, guests, spjs, tickets, activeUsers, onUpdateUserAdmin, onDeleteLetter, onDeleteActivity, onDeletePhoto, onDeleteSpj, onDeleteTicket, setActiveTab, showAlert, showConfirm }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const staffUsers = activeUsers.filter(u => u.role !== 'viewer' && u.role !== 'admin');
  const [view, setView] = useState('dashboard');
  const [userForm, setUserForm] = useState({ username: '', name: '', password: '', role: 'staff', title: 'Staff' });
  
  // --- FILTER BULAN DAN TAHUN ---
  const [exportMonth, setExportMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [exportYear, setExportYear] = useState(new Date().getFullYear().toString());

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = filename; link.click();
  };

  const exportData = (type) => {
    const prefixDate = `${exportYear}-${exportMonth}`; // Format: YYYY-MM
    let headers, rows, filename;

    if(type === 'absensi') {
      headers = ['ID', 'Nama', 'Tanggal', 'Waktu', 'Tipe', 'Status'];
      rows = attendance.filter(a => a.date.startsWith(prefixDate)).map(a => [a.id, `"${a.name}"`, a.date, a.time, a.type, a.status].join(','));
      filename = `Absensi_${prefixDate}.csv`;
    } else if(type === 'kegiatan') {
      headers = ['ID', 'Tanggal', 'Waktu', 'Deskripsi Kegiatan', 'Pelapor', 'Ada Foto?'];
      rows = activities.filter(a => a.date.startsWith(prefixDate)).map(a => [a.id, a.date, a.time, `"${a.desc}"`, `"${a.reporter}"`, a.imageUrl ? 'Ya' : 'Tidak'].join(','));
      filename = `Kegiatan_${prefixDate}.csv`;
    } else if(type === 'surat') {
      headers = ['ID', 'Nomor Surat', 'Perihal', 'Kategori', 'Tanggal', 'Penginput', 'Disposisi'];
      rows = letters.filter(l => l.date.startsWith(prefixDate)).map(l => [l.id, l.number, `"${l.title}"`, l.kategori, l.date, `"${l.uploader}"`, `"${l.disposisiText || '-'}"`].join(','));
      filename = `ArsipSurat_${prefixDate}.csv`;
    } else if(type === 'email') {
      headers = ['Username', 'Nama Lengkap', 'Jabatan', 'Alamat Email Terdaftar'];
      rows = activeUsers.map(u => [`"${u.username}"`, `"${u.name}"`, `"${u.role}"`, `"${u.email || '-'}"`]);
      filename = `DataEmailStaf_${todayStr}.csv`;
    } else if(type === 'spj') {
      headers = ['ID', 'Tanggal', 'Keterangan', 'Nominal', 'Pelapor', 'Status', 'ACC Oleh'];
      rows = spjs.filter(s => s.date.startsWith(prefixDate)).map(s => [s.id, s.date, `"${s.keterangan}"`, s.jumlah, `"${s.reporter}"`, s.status || 'Menunggu', `"${s.accBy || '-'}"`].join(','));
      filename = `RekapSPJ_${prefixDate}.csv`;
    } else if(type === 'tiket') {
      headers = ['ID', 'Tanggal', 'Lokasi', 'Kendala', 'Pelapor', 'Status', 'Diperbaiki Oleh'];
      rows = tickets.filter(t => t.date.startsWith(prefixDate)).map(t => [t.id, t.date, `"${t.lokasi}"`, `"${t.kendala}"`, `"${t.reporter}"`, t.status, `"${t.resolvedBy || '-'}"`].join(','));
      filename = `RekapTiket_${prefixDate}.csv`;
    } else if(type === 'tamu') {
      headers = ['ID', 'Tanggal', 'Waktu', 'Nama Tamu', 'Instansi', 'Tujuan', 'Penerima'];
      rows = guests.filter(g => g.date.startsWith(prefixDate)).map(g => [g.id, g.date, g.time, `"${g.nama}"`, `"${g.instansi}"`, `"${g.tujuan}"`, `"${g.penerima}"`].join(','));
      filename = `BukuTamu_${prefixDate}.csv`;
    }

    if(headers) downloadCSV([headers.join(','), ...rows].join('\n'), filename);
  };

  const exportSemuaData = () => {
    showAlert("Mulai Mengunduh", "Proses pengunduhan file CSV akan dimulai. Mohon pastikan browser Anda mengizinkan 'Multiple Downloads'.");
    setTimeout(() => exportData('absensi'), 500);
    setTimeout(() => exportData('kegiatan'), 1000);
    setTimeout(() => exportData('surat'), 1500);
    setTimeout(() => exportData('spj'), 2000);
    setTimeout(() => exportData('tiket'), 2500);
    setTimeout(() => exportData('tamu'), 3000);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if(!userForm.username || !userForm.password || !userForm.name) return;
    await onUpdateUserAdmin(userForm.username, userForm);
    setUserForm({ username: '', name: '', password: '', role: 'staff', title: 'Staff' });
    showAlert("Sukses", "Akun berhasil disimpan!");
  };

  const handleDeleteUser = (username) => {
    showConfirm("Hapus Akun", `Hapus akun ${username} secara permanen?`, async () => {
      await onUpdateUserAdmin(username, { deleted: true });
    });
  };

  const todayGuests = guests.filter(g => g.date === todayStr);

  if (view === 'users') {
    return (
      <div className="p-4 pb-28 h-full overflow-y-auto space-y-6 bg-gray-900 text-white min-h-screen">
        <div className="flex items-center space-x-4 mb-4"><button onClick={() => setView('dashboard')} className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"><X size={20} /></button><h2 className="text-xl font-black">Kelola Pengguna</h2></div>
        <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-xl">
          <h3 className="font-bold text-sm mb-4 flex items-center"><UserPlus size={16} className="mr-2 text-blue-400"/> Tambah / Edit Akun</h3>
          <form onSubmit={handleSaveUser} className="space-y-3">
            <div><input required type="text" placeholder="Username (tanpa spasi)" value={userForm.username} onChange={e=>setUserForm({...userForm, username: e.target.value.toLowerCase()})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs outline-none focus:border-blue-500" /></div>
            <div><input required type="text" placeholder="Nama Lengkap" value={userForm.name} onChange={e=>setUserForm({...userForm, name: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs outline-none focus:border-blue-500" /></div>
            <div><input required type="text" placeholder="Password" value={userForm.password} onChange={e=>setUserForm({...userForm, password: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs outline-none focus:border-blue-500" /></div>
            <div className="grid grid-cols-2 gap-2">
              <select value={userForm.role} onChange={e=>setUserForm({...userForm, role: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs outline-none text-white"><option value="staff">Staff Biasa</option><option value="editor">Editor (Admin Surat)</option><option value="viewer">Viewer (Pimpinan)</option><option value="admin">Super Admin</option></select>
              <input required type="text" placeholder="Jabatan" value={userForm.title} onChange={e=>setUserForm({...userForm, title: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 text-xs outline-none focus:border-blue-500" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold text-xs mt-2 transition-colors">Simpan Akun</button>
          </form>
        </div>
        <div className="space-y-2">
          {activeUsers.filter(u => u.username !== 'admin').map(u => (
            <div key={u.username} className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex justify-between items-center">
              <div><p className="font-bold text-sm text-gray-100">{u.name}</p><p className="text-[10px] text-gray-400 font-mono">@{u.username} • {u.role.toUpperCase()}</p></div>
              <div className="flex gap-2"><button onClick={() => setUserForm({username: u.username, name: u.name, password: u.password, role: u.role, title: u.title})} className="p-2 bg-blue-900/50 text-blue-400 rounded-lg hover:bg-blue-800 transition-colors"><Edit size={14}/></button><button onClick={() => handleDeleteUser(u.username)} className="p-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-800 transition-colors"><UserMinus size={14}/></button></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-28 h-full overflow-y-auto space-y-6 bg-gray-900 text-white min-h-screen">
      <div className="flex items-center space-x-4 mb-4"><button onClick={() => setActiveTab('profil')} className="p-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"><X size={20} /></button><h2 className="text-xl font-black">Admin Master Panel</h2></div>

      <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-xl">
        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-sm flex items-center"><RefreshCw size={14} className="mr-2 text-green-400"/> Pantauan Absen Hari Ini</h3><span className="text-[10px] text-gray-400">{todayStr}</span></div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {staffUsers.map(userProfile => {
            const attHadir = attendance.find(a => a.date === todayStr && a.name === userProfile.name && a.type === 'Hadir');
            const attPulang = attendance.find(a => a.date === todayStr && a.name === userProfile.name && a.type === 'Pulang');
            return (
              <div key={userProfile.username} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-xl text-xs">
                <div><p className="font-bold text-gray-200">{userProfile.name}</p><p className="text-[9px] text-gray-400">{userProfile.email || 'Email belum ditautkan'}</p></div>
                <div className="flex flex-col items-end gap-1">
                  {attHadir ? <span className="bg-green-900/50 text-green-400 px-2 py-0.5 rounded-md font-mono font-bold shadow-inner text-[10px]">Hadir: {attHadir.time}</span> : <span className="bg-red-900/50 text-red-400 px-2 py-0.5 rounded-md font-bold text-[10px] shadow-inner">BELUM HADIR</span>}
                  {attPulang ? <span className="bg-yellow-900/50 text-yellow-400 px-2 py-0.5 rounded-md font-mono font-bold shadow-inner text-[10px]">Pulang: {attPulang.time}</span> : (attHadir && <span className="bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded-md font-bold text-[9px] shadow-inner">Belum Pulang</span>)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      <button onClick={() => setView('users')} className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black text-xs flex items-center justify-center space-x-2 shadow-lg hover:bg-blue-700 transition-all"><KeyRound size={16} /><span>KELOLA AKUN & PASSWORD STAF</span></button>

      {/* --- MENU EKSPOR BARU DENGAN FILTER --- */}
      <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-xl">
        <h3 className="font-bold text-sm mb-4">Ekspor Data Server (.CSV)</h3>
        <div className="flex gap-2 mb-4">
          <select value={exportMonth} onChange={(e) => setExportMonth(e.target.value)} className="bg-gray-900 border border-gray-600 text-gray-200 text-xs rounded-xl p-3 outline-none flex-1">
            {MONTHS.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
          </select>
          <select value={exportYear} onChange={(e) => setExportYear(e.target.value)} className="bg-gray-900 border border-gray-600 text-gray-200 text-xs rounded-xl p-3 outline-none flex-1">
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={()=>exportData('absensi')} className="bg-blue-600/20 text-blue-400 border border-blue-600/50 py-3 rounded-xl font-bold text-[10px] flex flex-col items-center gap-1 active:scale-95"><Download size={14}/> Absensi</button>
          <button onClick={()=>exportData('kegiatan')} className="bg-purple-600/20 text-purple-400 border border-purple-600/50 py-3 rounded-xl font-bold text-[10px] flex flex-col items-center gap-1 active:scale-95"><Download size={14}/> Kegiatan</button>
          <button onClick={()=>exportData('surat')} className="bg-orange-600/20 text-orange-400 border border-orange-600/50 py-3 rounded-xl font-bold text-[10px] flex flex-col items-center gap-1 active:scale-95"><Download size={14}/> Surat</button>
          <button onClick={()=>exportData('tamu')} className="bg-cyan-600/20 text-cyan-400 border border-cyan-600/50 py-3 rounded-xl font-bold text-[10px] flex flex-col items-center gap-1 active:scale-95"><Download size={14}/> Tamu</button>
          <button onClick={()=>exportData('spj')} className="bg-yellow-600/20 text-yellow-400 border border-yellow-600/50 py-3 rounded-xl font-bold text-[10px] flex flex-col items-center gap-1 active:scale-95"><Download size={14}/> E-SPJ</button>
          <button onClick={()=>exportData('tiket')} className="bg-red-600/20 text-red-400 border border-red-600/50 py-3 rounded-xl font-bold text-[10px] flex flex-col items-center gap-1 active:scale-95"><Download size={14}/> Tiket Laporan</button>
        </div>
        <button onClick={exportSemuaData} className="w-full mt-3 bg-white text-gray-900 py-3 rounded-xl font-black text-xs shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2"><Download size={16} /> UNDUH SEMUA DATA BULAN INI</button>
      </div>

      <div className="bg-gray-800 p-5 rounded-3xl border border-gray-700 shadow-xl">
        <h3 className="font-bold text-sm mb-4 flex items-center"><Shield size={16} className="mr-2 text-red-400"/> Kelola Database Master</h3>
        
        <p className="text-[10px] text-gray-400 mb-2 uppercase font-bold">Dokumen Surat Terakhir</p>
        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
          {letters.slice(0, 5).map(l => (
            <div key={l.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-xl"><div className="truncate pr-2"><p className="text-xs font-bold truncate text-gray-200">{l.title}</p><p className="text-[9px] text-gray-400">{l.kategori}</p></div><button onClick={() => onDeleteLetter(l.id)} className="p-2 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors"><Trash2 size={14}/></button></div>
          ))}
        </div>

        <p className="text-[10px] text-gray-400 mb-2 mt-4 uppercase font-bold">Kegiatan Terakhir</p>
        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
          {activities.slice(0, 5).map(act => (
            <div key={act.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-xl"><div className="truncate pr-2"><p className="text-xs font-bold truncate text-gray-200">{act.desc}</p><p className="text-[9px] text-gray-400">{act.reporter} • {act.date}</p></div><button onClick={() => onDeleteActivity(act.id)} className="p-2 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors"><Trash2 size={14}/></button></div>
          ))}
        </div>

        <p className="text-[10px] text-gray-400 mb-2 mt-4 uppercase font-bold">SPJ Keuangan Terakhir</p>
        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
          {spjs.slice(0, 5).map(s => (
            <div key={s.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-xl"><div className="truncate pr-2"><p className="text-xs font-bold truncate text-gray-200">{s.keterangan}</p><p className="text-[9px] text-gray-400">{formatRupiah(s.jumlah)}</p></div><button onClick={() => onDeleteSpj(s.id)} className="p-2 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors"><Trash2 size={14}/></button></div>
          ))}
        </div>

        <p className="text-[10px] text-gray-400 mb-2 mt-4 uppercase font-bold">Tiket Laporan Terakhir</p>
        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
          {tickets.slice(0, 5).map(t => (
            <div key={t.id} className="flex justify-between items-center p-2 bg-gray-700/50 rounded-xl"><div className="truncate pr-2"><p className="text-xs font-bold truncate text-gray-200">{t.kendala}</p><p className="text-[9px] text-gray-400">{t.lokasi}</p></div><button onClick={() => onDeleteTicket(t.id)} className="p-2 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors"><Trash2 size={14}/></button></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 13. FUNGSI UTAMA (APP) ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [logoUrl] = useState('Logo MUI 1080.png');
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState([]);
  
  const [letters, setLetters] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [activities, setActivities] = useState([]);
  const [guests, setGuests] = useState([]);
  const [spjs, setSpjs] = useState([]);
  const [tickets, setTickets] = useState([]); 
  const [userProfiles, setUserProfiles] = useState({}); 

  // Modal State Bawaan Aplikasi (Anti Nge-Blank)
  const [dialog, setDialog] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });
  
  // Fungsi Peringatan yang Aman
  const showAlert = (title, message) => {
    const safeMessage = typeof message === 'string' ? message : (message?.message || JSON.stringify(message));
    setDialog({ isOpen: true, type: 'alert', title, message: safeMessage, onConfirm: null });
  };
  
  // Fungsi Konfirmasi yang Aman
  const showConfirm = (title, message, onConfirm) => {
    const safeMessage = typeof message === 'string' ? message : (message?.message || JSON.stringify(message));
    setDialog({ isOpen: true, type: 'confirm', title, message: safeMessage, onConfirm });
  };
  
  const closeDialog = () => setDialog(prev => ({ ...prev, isOpen: false }));

  const activeUsers = [...USERS];
  Object.values(userProfiles).forEach(profile => {
    if (profile.username && !profile.deleted) {
      const idx = activeUsers.findIndex(u => u.username === profile.username);
      if (idx >= 0) activeUsers[idx] = { ...activeUsers[idx], ...profile };
      else activeUsers.push(profile);
    } else if (profile.deleted) {
      const idx = activeUsers.findIndex(u => u.username === profile.username);
      if (idx >= 0) activeUsers.splice(idx, 1);
    }
  });

  useEffect(() => {
    const sessionStr = localStorage.getItem('muijb_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (Date.now() < session.expiresAt) {
          setTimeout(() => {
            const savedUser = activeUsers.find(u => u.username === session.username);
            if (savedUser) setCurrentUser(savedUser);
          }, 500);
        } else {
          localStorage.removeItem('muijb_session');
        }
      } catch (e) { localStorage.removeItem('muijb_session'); }
    }
  }, [userProfiles]); 

  // Listener Firebase Terpusat
  useEffect(() => {
    let isInitUsers = true;
    const unUsers = onSnapshot(collection(db, 'user_profiles'), (snap) => {
      const data = {}; snap.docs.forEach(d => { data[d.id] = d.data(); }); setUserProfiles(data);
      if (currentUser && !isInitUsers) {
        const updatedProfile = data[currentUser.username];
        if (updatedProfile && !updatedProfile.deleted) setCurrentUser(prev => ({ ...prev, ...updatedProfile }));
        else if (updatedProfile?.deleted) { setCurrentUser(null); localStorage.removeItem('muijb_session'); }
      }
      isInitUsers = false;
    });

    let isInitLetters = true;
    const unLetters = onSnapshot(collection(db, 'arsip_surat'), (snap) => {
      if (!isInitLetters) {
        snap.docChanges().forEach(change => {
          if (change.type === "added" && change.doc.data().uploader !== currentUser?.name) {
            notifyUser("Surat Baru Masuk", `Ada surat baru dari ${change.doc.data().sender}`);
          }
        });
      }
      isInitLetters = false;
      const data = snap.docs.map(d => ({id: d.id, ...d.data()})); setLetters(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    const unAtt = onSnapshot(collection(db, 'presensi'), (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()})); setAttendance(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    const unAct = onSnapshot(collection(db, 'kegiatan_harian'), (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()})); setActivities(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    const unGuests = onSnapshot(collection(db, 'buku_tamu'), (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()})); setGuests(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    let isInitSpj = true;
    const unSpj = onSnapshot(collection(db, 'e_spj'), (snap) => {
      if (!isInitSpj) {
        snap.docChanges().forEach(change => {
          if (change.type === "added" && change.doc.data().reporter !== currentUser?.name) {
            notifyUser("SPJ Pengeluaran Baru", `${change.doc.data().reporter} mengirim SPJ: ${change.doc.data().keterangan}`);
          }
        });
      }
      isInitSpj = false;
      const data = snap.docs.map(d => ({id: d.id, ...d.data()})); setSpjs(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    let isInitTickets = true;
    const unTicket = onSnapshot(collection(db, 'e_tickets'), (snap) => {
      if (!isInitTickets) {
        snap.docChanges().forEach(change => {
          if (change.type === "added" && change.doc.data().reporter !== currentUser?.name) {
            notifyUser("Laporan Kerusakan (E-Ticket)", `Kendala baru: ${change.doc.data().kendala} di ${change.doc.data().lokasi}`);
          }
        });
      }
      isInitTickets = false;
      const data = snap.docs.map(d => ({id: d.id, ...d.data()})); setTickets(data.sort((a, b) => b.createdAt - a.createdAt));
    });
    
    let isInitNotes = true;
    const unNotes = onSnapshot(collection(db, 'catatan_pimpinan'), (snap) => {
      if (!isInitNotes) {
        snap.docChanges().forEach(change => {
          if (change.type === "added" && change.doc.data().author !== currentUser?.name) {
            notifyUser("Catatan Pimpinan Baru", change.doc.data().text);
          }
        });
      }
      isInitNotes = false;
      const data = snap.docs.map(d => ({id: d.id, ...d.data()})); setNotes(data.sort((a, b) => a.createdAt - b.createdAt)); // Catatan lama di atas
    });

    return () => { unUsers(); unLetters(); unAtt(); unAct(); unGuests(); unSpj(); unTicket(); unNotes(); };
  }, [currentUser?.username]); 

  const proceedLogin = (userObj) => {
    setCurrentUser(userObj); setActiveTab('home');
    localStorage.setItem('muijb_session', JSON.stringify({ username: userObj.username, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  };

  const handleUpdateProfile = async (username, newData) => {
    try { await setDoc(doc(db, 'user_profiles', username.toLowerCase()), { ...newData, username: username.toLowerCase() }, { merge: true }); } 
    catch (error) { showAlert("Gagal", error.message || "Gagal mengupdate profil."); }
  };
  
  const handleAddNote = async (text) => {
    try { await addDoc(collection(db, 'catatan_pimpinan'), { text, author: currentUser.name, createdAt: Date.now() }); }
    catch (error) { showAlert("Gagal", error.message || "Gagal menyimpan catatan."); }
  };
  
  const handleAddLetter = async (formData) => {
    const generatedNumber = `${formData.kodeSurat}-${formData.noSurat}/DP.P-XII/${formData.bulanSurat}/${formData.tahunSurat}`;
    await addDoc(collection(db, 'arsip_surat'), {
      createdAt: Date.now(), title: formData.title, kategori: formData.kategori, date: formData.date, sender: formData.sender,
      kodeSurat: formData.kodeSurat, noSurat: formData.noSurat, bulanSurat: formData.bulanSurat, tahunSurat: formData.tahunSurat,
      number: generatedNumber, status: 'Baru', uploader: currentUser.name
    });
  };

  const handleUpdateDisposisi = async (id, text, byName) => {
    try { await updateDoc(doc(db, 'arsip_surat', id), { disposisiText: text, disposisiBy: byName, disposisiAt: Date.now() }); } 
    catch (error) { showAlert("Gagal", "Update disposisi gagal: " + error.message); }
  };

  const handleAddAttendance = async (type, lat, lng) => {
    await addDoc(collection(db, 'presensi'), {
      createdAt: Date.now(), name: currentUser.name, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: new Date().toISOString().split('T')[0], type, lat, lng, status: 'Tercatat'
    });
  };

  const handleAddActivity = async (desc, imageFile) => {
    setIsUploading(true);
    let finalImageBase64 = null;
    try {
      if (imageFile) finalImageBase64 = await compressImage(imageFile);
      await addDoc(collection(db, 'kegiatan_harian'), {
        createdAt: Date.now(), date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
        desc: desc || 'Melampirkan foto dokumentasi', reporter: currentUser.name, imageUrl: finalImageBase64
      });
    } catch (error) { showAlert("Gagal", error.message || "Gagal menyimpan kegiatan."); }
    setIsUploading(false);
  };

  const handleAddGuest = async (formData) => {
    try {
      await addDoc(collection(db, 'buku_tamu'), {
        createdAt: Date.now(), date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
        nama: formData.nama, instansi: formData.instansi, tujuan: formData.tujuan, penerima: currentUser.name
      });
    } catch(err) { showAlert("Gagal", err.message || "Gagal mencatat tamu."); }
  };

  const handleAddSpj = async (formData, imageFile) => {
    try {
      const finalImageBase64 = await compressImage(imageFile);
      await addDoc(collection(db, 'e_spj'), {
        createdAt: Date.now(), date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
        keterangan: formData.keterangan, jumlah: Number(formData.jumlah), reporter: currentUser.name, imageUrl: finalImageBase64, status: 'Menunggu'
      });
    } catch (error) { showAlert("Gagal", error.message || "Gagal menyimpan SPJ."); }
  };

  const handleAddTicket = async (formData) => {
    try {
      await addDoc(collection(db, 'e_tickets'), {
        createdAt: Date.now(), date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
        lokasi: formData.lokasi, kendala: formData.kendala, reporter: currentUser.name, status: 'Menunggu'
      });
    } catch (error) { showAlert("Gagal", error.message || "Gagal membuat tiket."); }
  };

  // --- Handlers dengan Dialog Kustom ---
  const handleAccSpj = (id) => {
    showConfirm("Konfirmasi ACC", "Tandai pengeluaran ini telah di-ACC?", async () => {
      try { await updateDoc(doc(db, 'e_spj', id), { status: 'Disetujui', accBy: currentUser.name, accAt: Date.now() }); }
      catch(err) { showAlert("Gagal", err.message || "Gagal ACC."); }
    });
  };

  const handleResolveTicket = (id) => {
    showConfirm("Selesaikan Tiket", "Tandai kerusakan ini sebagai selesai/diperbaiki?", async () => {
       try { await updateDoc(doc(db, 'e_tickets', id), { status: 'Selesai', resolvedAt: Date.now(), resolvedBy: currentUser.name }); } 
       catch (error) { showAlert("Gagal", error.message || "Gagal Update Tiket."); }
    });
  };

  const handleDeleteLetter = (id) => showConfirm("Hapus Surat", "Hapus surat ini dari server?", async () => { try { await deleteDoc(doc(db, 'arsip_surat', id)); } catch(e){ showAlert("Gagal", e.message); } });
  const handleDeleteActivity = (id) => showConfirm("Hapus Kegiatan", "Hapus kegiatan ini dari server?", async () => { try { await deleteDoc(doc(db, 'kegiatan_harian', id)); } catch(e){ showAlert("Gagal", e.message); } });
  const handleDeleteSpj = (id) => showConfirm("Hapus SPJ", "Hapus data SPJ ini dari server?", async () => { try { await deleteDoc(doc(db, 'e_spj', id)); } catch(e){ showAlert("Gagal", e.message); } });
  const handleDeleteTicket = (id) => showConfirm("Hapus Tiket", "Hapus tiket laporan ini?", async () => { try { await deleteDoc(doc(db, 'e_tickets', id)); } catch(e){ showAlert("Gagal", e.message); } });
  const handleDeleteNote = (id) => showConfirm("Hapus Catatan", "Hapus catatan pimpinan ini?", async () => { try { await deleteDoc(doc(db, 'catatan_pimpinan', id)); } catch(e){ showAlert("Gagal", e.message); } });

  if (!currentUser) return <LoginScreen onLogin={proceedLogin} logoUrl={logoUrl} activeUsers={activeUsers} />;

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        {/* MODAL DIALOG SISTEM */}
        <DialogModal dialog={dialog} closeDialog={closeDialog} />

        <div className="flex-1 overflow-hidden">
          {activeTab === 'home' && <HomeTab currentUser={currentUser} logoUrl={logoUrl} letters={letters} attendance={attendance} activities={activities} guests={guests} tickets={tickets} notes={notes} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} onResolveTicket={handleResolveTicket} onAddActivity={handleAddActivity} isUploading={isUploading} setActiveTab={setActiveTab} showAlert={showAlert} />}
          {activeTab === 'dokumen' && <DokumenTab letters={letters} onAddLetter={handleAddLetter} onUpdateDisposisi={handleUpdateDisposisi} currentUser={currentUser} showAlert={showAlert} />}
          {activeTab === 'layanan' && <LayananTab setActiveTab={setActiveTab} />}
          {activeTab === 'bukutamu' && <BukuTamuTab guests={guests} onAddGuest={handleAddGuest} setActiveTab={setActiveTab} showAlert={showAlert} />}
          {activeTab === 'espj' && <ESpjTab spjs={spjs} onAddSpj={handleAddSpj} onAccSpj={handleAccSpj} currentUser={currentUser} setActiveTab={setActiveTab} showAlert={showAlert} />}
          {activeTab === 'eticket' && <ETicketTab tickets={tickets} onAddTicket={handleAddTicket} onResolveTicket={handleResolveTicket} currentUser={currentUser} setActiveTab={setActiveTab} showAlert={showAlert} />}
          {activeTab === 'galeri' && <GaleriTab activities={activities} />}
          {activeTab === 'presensi' && <PresensiTab currentUser={currentUser} attendance={attendance} onAddAttendance={handleAddAttendance} setActiveTab={setActiveTab} showAlert={showAlert} />}
          {activeTab === 'profil' && <ProfilTab currentUser={currentUser} onUpdateProfile={handleUpdateProfile} setActiveTab={setActiveTab} showAlert={showAlert} />}
          {activeTab === 'master' && <MasterAdminTab attendance={attendance} letters={letters} activities={activities} guests={guests} spjs={spjs} tickets={tickets} activeUsers={activeUsers} onUpdateUserAdmin={handleUpdateProfile} onDeleteLetter={handleDeleteLetter} onDeleteActivity={handleDeleteActivity} onDeleteSpj={handleDeleteSpj} onDeleteTicket={handleDeleteTicket} setActiveTab={setActiveTab} showAlert={showAlert} showConfirm={showConfirm} />}
        </div>
        {!['presensi', 'master', 'bukutamu', 'espj', 'eticket'].includes(activeTab) && (
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}