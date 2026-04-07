import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, FileText, User, Plus, Search, FileDown, FileUp, Award, CheckCircle2, 
  X, FileBox, Edit, Shield, LogOut, MapPin, Clock, Download, Camera, 
  Image as ImageIcon, Trash2, Settings, Mail, RefreshCw, ClipboardList, Loader2,
  UserPlus, UserMinus, KeyRound, Globe, ExternalLink, AlertCircle,
  LayoutGrid, Users, Receipt, Wrench, MessageSquareShare, CheckSquare, BellRing, UserCheck, ArrowRightLeft
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
  { id: 8, username: 'test', password: 'testuser', name: 'Akun Uji Coba', role: 'admin', title: 'Penguji Sistem' },
];

const MONTHS = [
  { name: 'Januari', roman: 'I', val: '01' }, { name: 'Februari', roman: 'II', val: '02' }, { name: 'Maret', roman: 'III', val: '03' },
  { name: 'April', roman: 'IV', val: '04' }, { name: 'Mei', roman: 'V', val: '05' }, { name: 'Juni', roman: 'VI', val: '06' },
  { name: 'Juli', roman: 'VII', val: '07' }, { name: 'Agustus', roman: 'VIII', val: '08' }, { name: 'September', roman: 'IX', val: '09' },
  { name: 'Oktober', roman: 'X', val: '10' }, { name: 'November', roman: 'XI', val: '11' }, { name: 'Desember', roman: 'XII', val: '12' }
];
const YEARS = ['2025', '2026', '2027', '2028', '2029', '2030'];

const notifyUser = async (title, body) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try { 
      if (navigator.serviceWorker) {
         const reg = await navigator.serviceWorker.getRegistration();
         if (reg) { reg.showNotification(title, { body, icon: '/logo.png' }); return; }
      }
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-4 md:p-6 w-full">
      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl border border-gray-100 text-center relative overflow-hidden">
        <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-1 border-4 border-green-50 shadow-md flex items-center justify-center overflow-hidden">
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=MUI" }} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-1 tracking-tight">E-Sekretariat V5.2</h1>
        <p className="text-sm text-gray-400 mb-8 font-medium">Sistem Terintegrasi Realtime</p>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-500 text-[11px] rounded-xl border border-red-100 font-bold uppercase tracking-wider">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="text-left">
            <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Username</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 md:p-4 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-green-500" placeholder="Masukkan username" />
          </div>
          <div className="text-left">
            <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 md:p-4 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-green-500" placeholder="Masukkan password" />
          </div>
          <button type="submit" className="w-full bg-green-700 text-white font-bold py-4 md:py-5 rounded-xl shadow-lg hover:bg-green-800 transition-all active:scale-95 text-sm">MASUK APLIKASI</button>
        </form>
      </div>
    </div>
  );
};

const SideNav = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const getBtnClass = (tabNames) => {
    const isActive = Array.isArray(tabNames) ? tabNames.includes(activeTab) : activeTab === tabNames;
    return `flex items-center gap-3 p-4 rounded-2xl transition-all w-full text-left ${isActive ? 'bg-green-600 shadow-md text-white' : 'hover:bg-green-700/50 text-green-50'}`;
  };

  return (
    <div className="hidden md:flex flex-col w-72 bg-green-800 text-white h-full p-6 shadow-2xl relative z-10 shrink-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-800 font-black text-2xl shadow-md"><Award size={28}/></div>
        <div>
          <h2 className="font-black text-xl tracking-wider leading-none">MUI JABAR</h2>
          <p className="text-[10px] text-green-300 font-bold uppercase tracking-widest mt-1">E-Sekretariat V5.2</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-2">
        <button onClick={() => setActiveTab('home')} className={getBtnClass('home')}><Home size={20}/> <span className="font-bold text-sm tracking-wide">Beranda</span></button>
        <button onClick={() => setActiveTab('dokumen')} className={getBtnClass('dokumen')}><FileText size={20}/> <span className="font-bold text-sm tracking-wide">Arsip Dokumen</span></button>
        {currentUser?.role !== 'viewer' && (
          <button onClick={() => setActiveTab('presensi')} className={getBtnClass('presensi')}><MapPin size={20}/> <span className="font-bold text-sm tracking-wide">Presensi Harian</span></button>
        )}
        <button onClick={() => setActiveTab('layanan')} className={getBtnClass(['layanan','galeri','bukutamu','espj','eticket','absenpimpinan'])}><LayoutGrid size={20}/> <span className="font-bold text-sm tracking-wide">Layanan Terpadu</span></button>
        <button onClick={() => setActiveTab('profil')} className={getBtnClass(['profil', 'master'])}><User size={20}/> <span className="font-bold text-sm tracking-wide">Profil & Master</span></button>
      </div>

      <div className="mt-6 pt-6 border-t border-green-700/50 shrink-0">
        <div className="flex items-center gap-3 mb-4 px-2">
          {currentUser?.photo ? <img src={currentUser.photo} className="w-10 h-10 rounded-xl object-cover border-2 border-green-500 shadow-sm"/> : <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center font-bold text-white uppercase shadow-sm border border-green-500">{currentUser?.name.substring(0, 2)}</div>}
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate pr-2">{currentUser?.name}</p>
            <p className="text-[10px] text-green-300 uppercase tracking-widest mt-0.5">{currentUser?.role}</p>
          </div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/20 text-red-200 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-bold text-xs"><LogOut size={14}/> Keluar Sesi</button>
      </div>
    </div>
  );
};

const BottomNav = ({ activeTab, setActiveTab, currentUser }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-around py-3 pb-6 px-2 z-50 md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center transition-colors ${activeTab === 'home' ? 'text-green-600' : 'text-gray-300'}`}><Home size={22} /><span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Beranda</span></button>
      <button onClick={() => setActiveTab('dokumen')} className={`flex flex-col items-center transition-colors ${activeTab === 'dokumen' ? 'text-green-600' : 'text-gray-300'}`}><FileText size={22} /><span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Dokumen</span></button>
      {currentUser?.role !== 'viewer' && (
        <div className="relative -top-7"><button onClick={() => setActiveTab('presensi')} className="bg-green-600 text-white p-4 rounded-full shadow-xl border-4 border-gray-50 flex items-center justify-center hover:bg-green-700 active:scale-90 transition-all"><MapPin size={26} /></button></div>
      )}
      <button onClick={() => setActiveTab('layanan')} className={`flex flex-col items-center transition-colors ${['layanan','galeri','bukutamu','espj','eticket','absenpimpinan'].includes(activeTab) ? 'text-green-600' : 'text-gray-300'}`}><LayoutGrid size={22} /><span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Layanan</span></button>
      <button onClick={() => setActiveTab('profil')} className={`flex flex-col items-center transition-colors ${activeTab === 'profil' || activeTab === 'master' ? 'text-green-600' : 'text-gray-300'}`}><User size={22} /><span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">Profil</span></button>
    </div>
  );
};

const HomeTab = ({ currentUser, logoUrl, letters, attendance, activities, guests, tickets, notes, izins, onAddNote, onDeleteNote, onResolveTicket, onAddActivity, isUploading, setActiveTab, showAlert }) => {
  const role = currentUser?.role;
  const todayStr = new Date().toISOString().split('T')[0];
  const attHadir = attendance.find(a => a.date === todayStr && a.name === currentUser?.name && a.type === 'Hadir');
  const attPulang = attendance.find(a => a.date === todayStr && a.name === currentUser?.name && a.type === 'Pulang');

  const [newActivity, setNewActivity] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newNote, setNewNote] = useState('');

  const canResolveTicket = ['admin', 'dedih', 'erik', 'test'].includes(currentUser?.username?.toLowerCase());

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
  const activeIzins = izins.filter(i => i.date === todayStr && i.status === 'Keluar');

  return (
    <div className="h-full overflow-y-auto w-full p-4 pb-28 md:pb-10 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-full bg-white p-1 border border-gray-100" />
            <div>
              <h1 className="text-lg font-extrabold text-gray-800 leading-none">E-Sekretariat MUIJB</h1>
              <p className="text-[10px] text-green-600 font-bold uppercase mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
          <div className="md:hidden">
            {currentUser?.photo ? (
              <img src={currentUser.photo} className="w-10 h-10 rounded-xl object-cover border-2 border-green-100 shadow-sm" alt="Profile" />
            ) : (
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-700 font-bold border border-green-100 uppercase text-xs">{currentUser?.name.substring(0, 2)}</div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-700 to-green-500 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <Award size={150} className="absolute -right-6 -top-6 opacity-10 rotate-12" />
          <h2 className="text-xl md:text-2xl font-bold mb-1 leading-tight">Ahlan wa Sahlan, <br/> {currentUser?.name.split(',')[0]}!</h2>
          <p className="text-xs md:text-sm text-green-100 mb-6 font-medium">{currentUser?.title}</p>
          
          {['admin', 'editor', 'staff'].includes(role) && (
            <div className="flex flex-wrap gap-2">
              {attHadir && (
                <div className="bg-white/10 rounded-2xl p-3 inline-block backdrop-blur-md border border-white/20">
                  <div className="flex items-center space-x-2">
                    {attHadir.method === 'Manual/Selfie' ? <UserCheck size={16} className="text-green-300" /> : <CheckCircle2 size={16} className="text-green-300" />}
                    <span className="text-xs font-bold">Hadir: {attHadir.time} WIB</span>
                  </div>
                </div>
              )}
              {attPulang && (
                <div className="bg-yellow-400/20 rounded-2xl p-3 inline-block backdrop-blur-md border border-yellow-400/30">
                  <div className="flex items-center space-x-2"><LogOut size={16} className="text-yellow-300" /><span className="text-xs font-bold text-yellow-50">Pulang: {attPulang.time} WIB</span></div>
                </div>
              )}
              {!attHadir && !attPulang && (
                <div className="bg-white/10 rounded-2xl p-4 inline-block backdrop-blur-md border border-white/20">
                  <div className="flex items-center space-x-2"><Clock size={16} className="text-yellow-300" /><span className="text-xs font-bold text-yellow-50">Belum Presensi</span></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- PENGUMUMAN STAF DI LUAR (IZIN KELUAR) --- */}
        {activeIzins.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 p-5 rounded-3xl shadow-sm relative mt-6 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-extrabold text-orange-800 text-xs md:text-sm uppercase tracking-widest flex items-center mb-3">
              <ArrowRightLeft size={16} className="mr-2 text-orange-600"/> Informasi Staf Sedang Di Luar Kantor
            </h3>
            <div className="space-y-2">
              {activeIzins.map(i => (
                 <div key={i.id} className="flex flex-col bg-white p-3 rounded-2xl border border-orange-100 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                       <span className="font-bold text-gray-800 text-sm">{i.name}</span>
                       <span className="text-[10px] font-mono text-orange-600 font-bold bg-orange-100 px-2 py-1 rounded">Keluar: {i.waktuKeluar} WIB</span>
                    </div>
                    <p className="text-xs text-gray-600">Alasan: {i.alasan}</p>
                 </div>
              ))}
            </div>
          </div>
        )}

        {/* --- CATATAN PENTING --- */}
        <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-3xl shadow-sm relative mt-6">
          <h3 className="font-extrabold text-yellow-800 text-xs md:text-sm uppercase tracking-widest flex items-center mb-3">
            <AlertCircle size={16} className="mr-2 text-yellow-600"/> Catatan Pimpinan
          </h3>
          
          <div className="space-y-2 mb-3">
            {notes.length === 0 ? (
              <p className="text-xs text-yellow-700 italic">Belum ada catatan hari ini.</p>
            ) : (
              notes.map(n => (
                <div key={n.id} className="flex justify-between items-start border-b border-yellow-200/50 pb-2 last:border-0">
                  <div className="flex-1 pr-2">
                    <p className="text-xs text-yellow-800 font-bold leading-relaxed">{n.text}</p>
                    <p className="text-[10px] text-yellow-600 uppercase font-black mt-1">- {n.author}</p>
                  </div>
                  {role === 'admin' && (
                    <button onClick={() => onDeleteNote(n.id)} className="p-1.5 bg-yellow-100 text-yellow-600 hover:bg-yellow-200 rounded-md transition-colors"><X size={12}/></button>
                  )}
                </div>
              ))
            )}
          </div>

          {role === 'admin' && (
            <div className="flex gap-2 pt-2 border-t border-yellow-200/50 mt-2">
              <input type="text" value={newNote} onChange={(e)=>setNewNote(e.target.value)} className="flex-1 text-xs p-3 rounded-xl border border-yellow-300 outline-none focus:ring-2 focus:ring-yellow-400 bg-white font-bold text-gray-700" placeholder="Ketik list pengumuman/tugas..." />
              <button onClick={() => { if(newNote.trim()) { onAddNote(newNote); setNewNote(''); } }} className="bg-yellow-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-sm active:scale-95 transition-transform flex items-center"><Plus size={16} className="mr-1"/> TAMBAH</button>
            </div>
          )}
        </div>

        <h3 className="font-extrabold text-gray-800 text-xs md:text-sm uppercase tracking-widest ml-1 mt-6">Ringkasan Dokumen</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 md:p-4 bg-blue-50 text-blue-600 rounded-xl"><FileDown size={24} /></div>
            <div><p className="text-2xl font-black text-gray-800 leading-none">{letters.filter(l => l.kategori === 'Surat Masuk').length}</p><p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase mt-1">S. Masuk</p></div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 md:p-4 bg-orange-50 text-orange-600 rounded-xl"><FileUp size={24} /></div>
            <div><p className="text-2xl font-black text-gray-800 leading-none">{letters.filter(l => l.kategori === 'Surat Keluar').length}</p><p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase mt-1">S. Keluar</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-gray-800 text-xs md:text-sm uppercase tracking-widest ml-1 flex items-center"><Wrench size={16} className="mr-2 text-red-600"/> Perlu Diperbaiki</h3>
              <button onClick={() => setActiveTab('eticket')} className="text-[10px] text-red-600 font-black uppercase tracking-widest">Kelola</button>
            </div>
            <div className="space-y-3">
              {pendingTickets.length === 0 ? (
                <p className="text-center text-xs text-gray-400 font-bold py-4 tracking-widest border-2 border-dashed border-gray-200 rounded-xl bg-white">Semua fasilitas aman</p>
              ) : (
                pendingTickets.slice(0, 3).map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-2xl border border-red-100 shadow-sm flex items-center gap-3">
                    <div className="p-2 bg-red-50 text-red-500 rounded-xl"><Wrench size={16}/></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 truncate">{t.kendala}</h4>
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5">{t.lokasi}</p>
                    </div>
                    {canResolveTicket ? (
                      <button onClick={(e) => { e.preventDefault(); onResolveTicket(t.id); }} className="bg-green-100 text-green-700 hover:bg-green-200 text-[10px] font-black px-3 py-2 rounded-xl transition-colors shrink-0 flex items-center shadow-sm"><CheckSquare size={14} className="mr-1"/> ACC</button>
                    ) : (
                      <span className="bg-red-50 text-red-500 text-[9px] font-black px-2 py-1 rounded-md shrink-0 uppercase tracking-widest">Menunggu</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-extrabold text-gray-800 text-xs md:text-sm uppercase tracking-widest ml-1 flex items-center"><Users size={16} className="mr-2 text-blue-600"/> Tamu Hari Ini</h3>
              <button onClick={() => setActiveTab('bukutamu')} className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Buku Tamu</button>
            </div>
            <div className="space-y-3">
              {todayGuests.length === 0 ? (
                <p className="text-center text-xs text-gray-400 font-bold py-4 tracking-widest border-2 border-dashed border-gray-200 rounded-xl bg-white">Belum ada tamu masuk</p>
              ) : (
                todayGuests.slice(0, 3).map(g => (
                  <div key={g.id} className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><User size={16}/></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 truncate">{g.nama}</h4>
                      <p className="text-[10px] text-gray-500 font-bold mt-0.5">{g.instansi}</p>
                    </div>
                    <span className="text-[10px] font-mono text-blue-500 font-bold">{g.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 mb-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-gray-800 text-xs md:text-sm uppercase tracking-widest ml-1 flex items-center"><Mail size={16} className="mr-2 text-green-600"/> Dokumen Terbaru</h3>
            <button onClick={() => setActiveTab('dokumen')} className="text-[10px] text-green-600 font-black uppercase tracking-widest">Lihat Semua</button>
          </div>
          <div className="space-y-3">
            {letters.length === 0 ? (
              <p className="text-center text-[10px] text-gray-300 font-bold py-4 tracking-widest border-2 border-dashed border-gray-100 rounded-xl bg-white">Belum ada surat</p>
            ) : (
              letters.slice(0, 3).map((letter) => (
                <div key={letter.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-sm">
                  <div className={`p-3 rounded-xl ${letter.kategori === 'Surat Masuk' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}><Mail size={20} /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 truncate">{letter.title}</h4>
                    <p className="text-[10px] text-gray-500 font-bold mt-0.5">{letter.kategori} • {letter.number}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-gray-800 text-xs md:text-sm uppercase tracking-widest flex items-center"><ClipboardList size={16} className="mr-2 text-green-600"/> Kegiatan Harian</h3>
          </div>
          
          {['admin', 'editor', 'staff', 'viewer'].includes(role) && (
            <form onSubmit={handleSubmit} className="mb-6">
              {imagePreview && (
                <div className="relative inline-block mb-3">
                  <img src={imagePreview} className="w-24 h-24 object-cover rounded-xl border-2 border-green-500 shadow-md" alt="Preview" />
                  <button type="button" onClick={() => {setImagePreview(null); setNewImageFile(null)}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-sm hover:bg-red-600"><X size={14}/></button>
                </div>
              )}
              <div className="flex gap-2">
                <input type="file" accept="image/*" capture="environment" id="actCamera" className="hidden" onChange={handleCapture} />
                <label htmlFor="actCamera" className="bg-blue-50 text-blue-600 px-5 flex items-center justify-center rounded-xl cursor-pointer hover:bg-blue-100 border border-blue-100 transition-colors"><Camera size={24}/></label>
                <input type="text" placeholder="Ketik kegiatan / upload foto..." value={newActivity} onChange={(e) => setNewActivity(e.target.value)} disabled={isUploading} className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-sm outline-none focus:border-green-500 font-bold text-gray-700"/>
                <button disabled={isUploading} type="submit" className="bg-green-600 text-white px-6 py-4 rounded-xl text-xs font-black hover:bg-green-700 active:scale-95 transition-all flex items-center">{isUploading ? <Loader2 size={18} className="animate-spin" /> : "CATAT"}</button>
              </div>
            </form>
          )}

          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {todayActivities.length === 0 ? (
              <p className="text-center text-xs text-gray-400 font-bold uppercase py-6 tracking-widest border-2 border-dashed border-gray-100 rounded-xl">Belum ada kegiatan tercatat</p>
            ) : (
              todayActivities.map(act => (
                <div key={act.id} className="border-l-4 border-green-500 pl-4 py-3 bg-gray-50/50 rounded-r-2xl flex items-start gap-4">
                  {act.imageUrl && (<img src={act.imageUrl} onClick={() => setSelectedImage(act.imageUrl)} className="w-16 h-16 object-cover rounded-xl cursor-pointer border border-gray-200 shrink-0 hover:opacity-80 transition-opacity" alt="Thumb" />)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{act.desc}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-[10px] text-gray-500 font-bold flex items-center"><Clock size={12} className="mr-1"/>{act.time}</span>
                      <span className="text-[10px] text-green-600 font-bold flex items-center"><User size={12} className="mr-1"/>{act.reporter}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 text-white bg-white/20 p-3 rounded-full hover:bg-white/40"><X size={28}/></button>
          <img src={selectedImage} className="max-w-full max-h-[85vh] rounded-2xl border-4 border-white/20 shadow-2xl object-contain animate-in zoom-in-95 duration-300" alt="Full view" />
        </div>
      )}
    </div>
  );
};

const LayananTab = ({ setActiveTab }) => {
  return (
    <div className="h-full overflow-y-auto w-full p-4 pb-28 md:pb-10 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Menu Layanan</h2>
        <p className="text-sm text-gray-500 font-medium px-1 -mt-4 mb-6">Pusat aplikasi terintegrasi E-Sekretariat.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <button onClick={() => setActiveTab('bukutamu')} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:shadow-lg transition-all active:scale-95">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-blue-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-inner"><Users size={32} /></div>
            <div className="text-center"><h3 className="font-bold text-sm md:text-base text-gray-800">E-Tamu</h3><p className="text-[10px] md:text-xs text-gray-400 font-medium mt-1">Buku Tamu Digital</p></div>
          </button>
          
          <button onClick={() => setActiveTab('absenpimpinan')} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:border-green-400 hover:shadow-lg transition-all active:scale-95">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 text-green-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-inner"><UserCheck size={32} /></div>
            <div className="text-center"><h3 className="font-bold text-sm md:text-base text-gray-800">Absen Pimpinan</h3><p className="text-[10px] md:text-xs text-gray-400 font-medium mt-1">Kehadiran Pimpinan</p></div>
          </button>

          <button onClick={() => setActiveTab('espj')} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:border-orange-400 hover:shadow-lg transition-all active:scale-95">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 text-orange-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-inner"><Receipt size={32} /></div>
            <div className="text-center"><h3 className="font-bold text-sm md:text-base text-gray-800">E-SPJ</h3><p className="text-[10px] md:text-xs text-gray-400 font-medium mt-1">Laporan Keuangan</p></div>
          </button>

          <button onClick={() => setActiveTab('eticket')} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:border-red-400 hover:shadow-lg transition-all active:scale-95">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-50 text-red-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-inner"><Wrench size={32} /></div>
            <div className="text-center"><h3 className="font-bold text-sm md:text-base text-gray-800">E-Ticket</h3><p className="text-[10px] md:text-xs text-gray-400 font-medium mt-1">Laporan Fasilitas</p></div>
          </button>
          
          <button onClick={() => setActiveTab('galeri')} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:border-purple-400 hover:shadow-lg transition-all active:scale-95">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-50 text-purple-600 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-inner"><ImageIcon size={32} /></div>
            <div className="text-center"><h3 className="font-bold text-sm md:text-base text-gray-800">Galeri</h3><p className="text-[10px] md:text-xs text-gray-400 font-medium mt-1">Dokumentasi Harian</p></div>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MODUL BARU: ABSENSI PIMPINAN ---
const AbsenPimpinanTab = ({ absenPimpinan, onAddAbsenPimpinan, setActiveTab, showAlert }) => {
  const [namaPimpinan, setNamaPimpinan] = useState('');
  const [loading, setLoading] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaPimpinan.trim()) return;
    setLoading(true);
    await onAddAbsenPimpinan(namaPimpinan);
    setNamaPimpinan('');
    setLoading(false);
  };
  
  const todayAbsen = absenPimpinan.filter(a => a.date === todayStr);

  return (
    <div className="h-full overflow-y-auto w-full p-4 pb-28 md:pb-10 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-green-600 text-white p-8 md:p-10 rounded-[2rem] shadow-lg relative overflow-hidden">
          <button onClick={() => setActiveTab('layanan')} className="absolute top-6 right-6 text-white bg-white/20 p-2.5 rounded-full hover:bg-white/40 z-10 transition-all"><X size={20} /></button>
          <UserCheck size={120} className="absolute -right-4 -bottom-4 opacity-10" />
          <h2 className="text-3xl font-black tracking-tight mb-2 pr-10">Absensi Pimpinan</h2>
          <p className="text-sm text-green-100 font-medium">Catat kehadiran pimpinan di kantor MUI Jabar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <div>
            <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Nama Pimpinan / Kiai</label>
            <input required type="text" value={namaPimpinan} onChange={e=>setNamaPimpinan(e.target.value)} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-green-500 font-bold text-gray-800" placeholder="Ketik nama pimpinan yang hadir..." />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-green-600 text-white font-black py-4 md:py-5 rounded-xl shadow-lg hover:bg-green-700 transition-all uppercase tracking-widest text-xs md:text-sm mt-4 flex items-center justify-center">{loading ? <Loader2 size={18} className="animate-spin" /> : "CATAT KEHADIRAN"}</button>
        </form>

        <h3 className="font-extrabold text-gray-800 text-xs md:text-sm uppercase tracking-widest ml-1 mt-8">Daftar Hadir Pimpinan Hari Ini</h3>
        <div className="space-y-3">
          {todayAbsen.length === 0 ? (
             <p className="text-center text-xs text-gray-400 font-bold py-8 tracking-widest border-2 border-dashed border-gray-200 rounded-xl bg-white">Belum ada catatan kehadiran</p>
          ) : (
            todayAbsen.map(a => (
              <div key={a.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-base text-gray-800">{a.namaPimpinan}</h4>
                  <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded-md">{a.time} WIB</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Dicatat oleh: {a.dicatatOleh}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

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
    <div className="h-full overflow-y-auto w-full p-4 pb-28 md:pb-10 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-blue-600 text-white p-8 md:p-10 rounded-[2rem] shadow-lg relative overflow-hidden">
          <button onClick={() => setActiveTab('layanan')} className="absolute top-6 right-6 text-white bg-white/20 p-2.5 rounded-full hover:bg-white/40 z-10 transition-all"><X size={20} /></button>
          <Users size={120} className="absolute -right-4 -bottom-4 opacity-10" />
          <h2 className="text-3xl font-black tracking-tight mb-2 pr-10">Buku Tamu Digital</h2>
          <p className="text-sm text-blue-100 font-medium">Selamat Datang di Sekretariat MUI Jabar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <div><label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Nama Lengkap</label><input required type="text" value={form.nama} onChange={e=>setForm({...form, nama: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-blue-500 font-bold text-gray-800" placeholder="Masukkan nama..." /></div>
          <div><label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Asal Instansi / Lembaga</label><input required type="text" value={form.instansi} onChange={e=>setForm({...form, instansi: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-blue-500 font-bold text-gray-800" placeholder="Misal: Kemenag Jabar" /></div>
          <div><label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Tujuan / Keperluan</label><input required type="text" value={form.tujuan} onChange={e=>setForm({...form, tujuan: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-blue-500 font-bold text-gray-800" placeholder="Ingin bertemu dengan..." /></div>
          <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-black py-4 md:py-5 rounded-xl shadow-lg hover:bg-blue-700 transition-all uppercase tracking-widest text-xs md:text-sm mt-4 flex items-center justify-center">{loading ? <Loader2 size={18} className="animate-spin" /> : "SIMPAN DATA TAMU"}</button>
        </form>

        <h3 className="font-extrabold text-gray-800 text-xs md:text-sm uppercase tracking-widest ml-1 mt-8">Daftar Tamu Hari Ini</h3>
        <div className="space-y-3">
          {todayGuests.length === 0 ? (
             <p className="text-center text-xs text-gray-400 font-bold py-8 tracking-widest border-2 border-dashed border-gray-200 rounded-xl bg-white">Belum ada tamu hari ini</p>
          ) : (
            todayGuests.map(g => (
              <div key={g.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-base text-gray-800">{g.nama}</h4><span className="text-[10px] text-gray-400 font-mono">{g.time} WIB</span>
                </div>
                <p className="text-xs font-bold text-blue-600 uppercase">{g.instansi}</p>
                <p className="text-sm text-gray-600 mt-1">{g.tujuan}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const ESpjTab = ({ spjs, onAddSpj, onAccSpj, currentUser, setActiveTab, showAlert }) => {
  const [form, setForm] = useState({ keterangan: '', qty: '', harga: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const canAccSpj = ['admin', 'rani', 'test'].includes(currentUser?.username?.toLowerCase());
  const calculatedTotal = (Number(form.qty) || 0) * (Number(form.harga) || 0);

  const handleCapture = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) { setFile(selectedFile); setPreview(URL.createObjectURL(selectedFile)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.keterangan || !form.qty || !form.harga || !file) { showAlert("Peringatan", "Lengkapi deskripsi, jumlah, nominal, dan foto struk!"); return; }
    setLoading(true);
    await onAddSpj(form, file);
    setForm({ keterangan: '', qty: '', harga: '' }); setFile(null); setPreview(null); setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto w-full p-4 pb-28 md:pb-10 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-orange-500 text-white p-8 md:p-10 rounded-[2rem] shadow-lg relative overflow-hidden">
          <button onClick={() => setActiveTab('layanan')} className="absolute top-6 right-6 text-white bg-white/20 p-2.5 rounded-full hover:bg-white/40 z-10 transition-all"><X size={20} /></button>
          <Receipt size={120} className="absolute -right-4 -bottom-4 opacity-10" />
          <h2 className="text-3xl font-black tracking-tight mb-2 pr-10">E-SPJ Digital</h2>
          <p className="text-sm text-orange-100 font-medium">Laporan pengeluaran operasional terperinci</p>
        </div>

        {['admin', 'editor', 'staff'].includes(currentUser.role) && (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Deskripsi / Nama Barang</label>
              <input required type="text" value={form.keterangan} onChange={e=>setForm({...form, keterangan: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-orange-500 font-bold text-gray-800" placeholder="Misal: Pembelian Tinta Printer" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Jumlah (Qty)</label>
                <input required type="number" value={form.qty} onChange={e=>setForm({...form, qty: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-orange-500 font-bold text-gray-800" placeholder="Misal: 2" />
              </div>
              <div>
                <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Harga Satuan (Rp)</label>
                <input required type="number" value={form.harga} onChange={e=>setForm({...form, harga: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-orange-500 font-bold text-gray-800" placeholder="Misal: 50000" />
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl flex justify-between items-center border border-orange-100">
               <span className="text-xs font-bold text-orange-800 uppercase tracking-widest">Total Pengajuan:</span>
               <span className="text-lg font-black text-orange-600">{formatRupiah(calculatedTotal)}</span>
            </div>
            <div>
              <label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Foto Struk Pembayaran</label>
              <div className="flex gap-3">
                <input type="file" accept="image/*" capture="environment" id="spjCamera" className="hidden" onChange={handleCapture} />
                <label htmlFor="spjCamera" className="bg-orange-50 text-orange-600 px-5 py-4 flex items-center justify-center rounded-xl cursor-pointer hover:bg-orange-100 border border-orange-100 transition-colors"><Camera size={24}/></label>
                {preview ? (
                   <div className="relative flex-1"><img src={preview} className="h-16 w-auto object-contain rounded-lg border border-gray-200" alt="Struk"/><button type="button" onClick={()=>{setPreview(null); setFile(null)}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5"><X size={12}/></button></div>
                ) : (
                   <div className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-xl flex items-center px-4 text-xs text-gray-400 font-bold">Belum ada struk dilampirkan</div>
                )}
              </div>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-orange-600 text-white font-black py-4 md:py-5 rounded-xl shadow-lg hover:bg-orange-700 transition-all uppercase tracking-widest text-xs md:text-sm mt-4 flex items-center justify-center">{loading ? <Loader2 size={18} className="animate-spin" /> : "KIRIM SPJ"}</button>
          </form>
        )}

        <h3 className="font-extrabold text-gray-800 text-xs md:text-sm uppercase tracking-widest ml-1 mt-8">Riwayat SPJ Terkini</h3>
        <div className="space-y-4">
          {spjs.length === 0 ? (
             <p className="text-center text-xs text-gray-400 font-bold py-8 tracking-widest border-2 border-dashed border-gray-200 rounded-xl bg-white">Belum ada SPJ tercatat</p>
          ) : (
            spjs.map(spj => {
              const tQty = spj.qty || 1;
              const tHarga = spj.harga || spj.jumlah;
              const tTotal = spj.total || spj.jumlah;

              return (
                <div key={spj.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                  {spj.imageUrl && <img src={spj.imageUrl} onClick={() => setSelectedImage(spj.imageUrl)} className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0 cursor-pointer" alt="Struk" />}
                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-gray-800 truncate pr-2">{spj.keterangan}</h4>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold mb-1">{tQty} x {formatRupiah(tHarga)}</p>
                    <p className="text-base font-black text-orange-600 mb-2">{formatRupiah(tTotal)}</p>
                    <div className="flex justify-between mt-1 items-center">
                      <span className="text-[10px] md:text-xs text-gray-500 font-bold">{spj.reporter} • {spj.date}</span>
                      {spj.status === 'Disetujui' ? (
                         <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-md flex items-center"><CheckCircle2 size={12} className="mr-1"/> ACC {spj.accBy}</span>
                      ) : (
                         canAccSpj ? (
                           <button onClick={(e) => { e.preventDefault(); onAccSpj(spj.id); }} className="text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm active:scale-95 transition-all flex items-center"><CheckSquare size={12} className="mr-1"/> TANDAI ACC</button>
                         ) : (
                           <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-md">Menunggu ACC</span>
                         )
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"><button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 text-white bg-white/20 p-3 rounded-full hover:bg-white/40"><X size={28}/></button><img src={selectedImage} className="max-w-full max-h-[85vh] rounded-2xl border-4 border-white/10" alt="Full view" /></div>
        )}
      </div>
    </div>
  );
};

const ETicketTab = ({ tickets, onAddTicket, onResolveTicket, currentUser, setActiveTab, showAlert }) => {
  const [form, setForm] = useState({ lokasi: '', kendala: '' });
  const [loading, setLoading] = useState(false);

  const canResolveTicket = ['admin', 'dedih', 'erik', 'test'].includes(currentUser?.username?.toLowerCase());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onAddTicket(form);
    setForm({ lokasi: '', kendala: '' });
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto w-full p-4 pb-28 md:pb-10 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-red-600 text-white p-8 md:p-10 rounded-[2rem] shadow-lg relative overflow-hidden">
          <button onClick={() => setActiveTab('layanan')} className="absolute top-6 right-6 text-white bg-white/20 p-2.5 rounded-full hover:bg-white/40 z-10 transition-all"><X size={20} /></button>
          <Wrench size={120} className="absolute -right-4 -bottom-4 opacity-10" />
          <h2 className="text-3xl font-black tracking-tight mb-2 pr-10">E-Ticket Masalah</h2>
          <p className="text-sm text-red-100 font-medium">Lapor kerusakan fasilitas / aset kantor</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-5">
          <div><label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Lokasi Fasilitas</label><input required type="text" value={form.lokasi} onChange={e=>setForm({...form, lokasi: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-red-500 font-bold text-gray-800" placeholder="Misal: Ruang Rapat Pimpinan" /></div>
          <div><label className="block text-[10px] md:text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Deskripsi Kerusakan</label><input required type="text" value={form.kendala} onChange={e=>setForm({...form, kendala: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-red-500 font-bold text-gray-800" placeholder="Misal: AC Meneteskan Air / Mati" /></div>
          <button disabled={loading} type="submit" className="w-full bg-red-600 text-white font-black py-4 md:py-5 rounded-xl shadow-lg hover:bg-red-700 transition-all uppercase tracking-widest text-xs md:text-sm mt-4 flex items-center justify-center">{loading ? <Loader2 size={18} className="animate-spin" /> : "BUAT TIKET LAPORAN"}</button>
        </form>

        <h3 className="font-extrabold text-gray-800 text-xs md:text-sm uppercase tracking-widest ml-1 mt-8">Daftar Antrean Tiket</h3>
        <div className="space-y-4">
          {tickets.length === 0 ? (
             <p className="text-center text-xs text-gray-400 font-bold py-8 tracking-widest border-2 border-dashed border-gray-200 rounded-xl bg-white">Semua fasilitas aman terkendali</p>
          ) : (
            tickets.map(t => (
              <div key={t.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-base text-gray-800 line-clamp-2 pr-2">{t.kendala}</h4>
                  {t.status === 'Menunggu' ? (
                    <span className="bg-red-50 text-red-500 text-[9px] font-black px-3 py-1.5 rounded-md shrink-0 uppercase tracking-widest">Menunggu</span>
                  ) : (
                    <span className="bg-green-50 text-green-600 text-[9px] font-black px-3 py-1.5 rounded-md shrink-0 uppercase tracking-widest flex items-center"><CheckSquare size={12} className="mr-1"/> Selesai</span>
                  )}
                </div>
                <div className="flex items-center text-xs font-bold text-gray-500"><MapPin size={14} className="mr-2 text-red-400"/> {t.lokasi}</div>
                <div className="flex justify-between mt-3 items-center pt-3 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase">{t.reporter} • {t.date}</span>
                  {t.status === 'Menunggu' && (
                    canResolveTicket ? (
                      <button onClick={(e) => { e.preventDefault(); onResolveTicket(t.id); }} className="bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 text-[10px] font-black px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center">
                        <CheckSquare size={14} className="mr-1.5"/> Tandai Selesai
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-3 py-1.5 rounded-md">Menunggu Penanganan</span>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

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
    } catch (err) { showAlert("Gagal", "Gagal menambahkan surat: " + err.message); }
  };

  const handleKirimDisposisi = (letterId) => {
    const text = disposisiInputs[letterId];
    if(text && text.trim() !== '') { onUpdateDisposisi(letterId, text, currentUser.name); setDisposisiInputs({...disposisiInputs, [letterId]: ''}); }
  };

  if (view === 'buat') {
    return (
      <div className="h-full overflow-y-auto w-full p-4 pb-28 md:pb-10 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center space-x-4"><button onClick={() => setView('list')} className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50"><X size={24} /></button><h2 className="text-2xl font-black text-gray-800">Registrasi Surat</h2></div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-6 shadow-sm">
              <div className="space-y-2"><label className="text-[10px] md:text-xs font-black text-gray-400 uppercase ml-1">Kategori Surat</label><select value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl text-sm outline-none border border-gray-200 font-bold cursor-pointer"><option>Surat Masuk</option><option>Surat Keluar</option><option>Internal</option><option>Eksternal</option><option>Keputusan</option><option>Lainnya</option></select></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] md:text-xs font-black text-gray-400 uppercase ml-1">Kode Surat</label><input required type="text" value={formData.kodeSurat} onChange={(e) => setFormData({...formData, kodeSurat: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-green-600 font-bold text-gray-800" placeholder="Contoh: A" /></div>
                <div className="space-y-2"><label className="text-[10px] md:text-xs font-black text-gray-400 uppercase ml-1">No. Surat</label><input required type="text" value={formData.noSurat} onChange={(e) => setFormData({...formData, noSurat: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-green-600 font-bold text-gray-800" placeholder="Contoh: 060" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-[10px] md:text-xs font-black text-gray-400 uppercase ml-1">Bulan</label><select required value={formData.bulanSurat} onChange={(e) => setFormData({...formData, bulanSurat: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-green-600 font-bold bg-transparent cursor-pointer text-gray-800">{MONTHS.map(m => <option key={m.roman} value={m.roman}>{m.name}</option>)}</select></div>
                <div className="space-y-2"><label className="text-[10px] md:text-xs font-black text-gray-400 uppercase ml-1">Tahun</label><select required value={formData.tahunSurat} onChange={(e) => setFormData({...formData, tahunSurat: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-green-600 font-bold bg-transparent cursor-pointer text-gray-800">{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
              </div>
              <div className="space-y-2"><label className="text-[10px] md:text-xs font-black text-gray-400 uppercase ml-1">Perihal Dokumen</label><input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none focus:border-green-600 font-bold text-gray-800" placeholder="Perihal..." /></div>
              <div className="space-y-2"><label className="text-[10px] md:text-xs font-black text-gray-400 uppercase ml-1">Tanggal Buat/Terima</label><input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none font-bold text-gray-800" /></div>
              <div className="space-y-2"><label className="text-[10px] md:text-xs font-black text-gray-400 uppercase ml-1">Asal / Tujuan</label><input required type="text" value={formData.sender} onChange={(e) => setFormData({...formData, sender: e.target.value})} className="w-full border-b-2 border-gray-100 p-3 text-sm outline-none font-bold text-gray-800" placeholder="Nama Instansi/Pengirim..." /></div>
            </div>
            <button type="submit" className="w-full bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-green-800 transition-all uppercase tracking-widest text-sm">Simpan Data Surat</button>
          </form>
        </div>
      </div>
    );
  }

  const filteredLetters = letters.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.number.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-full overflow-y-auto w-full p-4 pb-28 md:pb-10 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Arsip Dokumen</h2>
          {['admin', 'editor', 'test'].includes(currentUser.role) && (<button onClick={() => setView('buat')} className="bg-green-100 text-green-700 p-3 rounded-xl border border-green-200 hover:bg-green-200 transition-colors flex items-center shadow-sm"><Plus size={20} className="md:mr-2"/><span className="hidden md:inline text-sm font-bold">REGISTRASI</span></button>)}
        </div>
        <div className="relative"><Search size={20} className="absolute left-5 top-5 text-gray-400" /><input type="text" className="w-full pl-14 pr-5 py-5 border border-gray-200 rounded-3xl text-sm outline-none bg-white shadow-sm focus:ring-2 focus:ring-green-500 font-medium" placeholder="Cari nomor atau perihal surat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <div className="space-y-4">
          {filteredLetters.length === 0 ? <div className="text-center py-24 text-gray-400"><FileBox size={80} className="mx-auto mb-6 opacity-20" /><p className="font-bold text-sm uppercase tracking-widest opacity-50">Data Kosong</p></div> : 
          filteredLetters.map((letter) => (
            <div key={letter.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-5">
                 <div className={`p-4 rounded-2xl shrink-0 ${letter.kategori.includes('Masuk') ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}><FileText size={28} /></div>
                 <div className="flex-1 min-w-0">
                   <h4 className="text-base font-bold text-gray-800 pr-2 leading-tight mb-1">{letter.title}</h4>
                   <p className="text-xs text-green-700 font-mono font-bold mt-1 bg-green-50 inline-block px-2 py-1 rounded-md">{letter.number}</p>
                   <div className="flex justify-between mt-4 items-center"><span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wide">{letter.kategori} • {letter.sender}</span><span className="text-[10px] md:text-xs text-gray-400 font-black">{letter.date}</span></div>
                 </div>
              </div>
              <div className="mt-5 pt-5 border-t border-gray-100">
                 {letter.disposisiText ? (
                   <div className="bg-green-50 p-4 rounded-2xl border border-green-200 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full"></div>
                      <div className="flex items-center gap-2 mb-2 text-green-700"><MessageSquareShare size={16}/> <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Disposisi Pimpinan</span></div>
                      <p className="text-sm md:text-base font-bold text-gray-800 leading-snug">"{letter.disposisiText}"</p><p className="text-[10px] md:text-xs text-green-600 font-bold mt-3 uppercase tracking-wide">- {letter.disposisiBy}</p>
                   </div>
                 ) : (
                   currentUser.role === 'viewer' ? (
                     <div className="flex gap-3">
                       <input type="text" value={disposisiInputs[letter.id] || ''} onChange={e=>setDisposisiInputs({...disposisiInputs, [letter.id]: e.target.value})} placeholder="Ketik instruksi disposisi..." className="flex-1 text-xs md:text-sm p-4 border border-gray-200 rounded-xl outline-none focus:border-green-500 font-bold text-gray-700 bg-gray-50" />
                       <button onClick={(e) => { e.preventDefault(); handleKirimDisposisi(letter.id); }} className="bg-green-600 text-white px-6 py-4 rounded-xl text-xs font-black shadow-md hover:bg-green-700 active:scale-95 transition-all">KIRIM</button>
                     </div>
                   ) : (
                     <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-center"><span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center"><Clock size={16} className="mr-2"/> Menunggu Disposisi Pimpinan</span></div>
                   )
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GaleriTab = ({ activities }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const galleryActivities = activities.filter(a => a.imageUrl);

  return (
    <div className="h-full overflow-y-auto w-full p-4 pb-28 md:pb-10 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><ImageIcon size={28}/></div>
           <div>
             <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight leading-none">Galeri</h2>
             <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Dokumentasi otomatis dari kegiatan harian staf.</p>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {galleryActivities.map(act => (
            <div key={act.id} className="bg-white p-3 rounded-3xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-lg transition-all hover:border-purple-200 group" onClick={() => setSelectedImage(act.imageUrl)}>
              <div className="relative overflow-hidden rounded-2xl mb-3 aspect-square">
                <img src={act.imageUrl} alt="Dokumentasi" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-gray-100" />
              </div>
              <div className="px-1">
                <p className="text-[10px] font-black text-purple-600 truncate uppercase tracking-wide">{act.reporter}</p>
                <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mt-1 h-8">{act.desc}</p>
                <p className="text-[9px] text-gray-400 font-medium mt-2">{act.date} • {act.time}</p>
              </div>
            </div>
          ))}
          {galleryActivities.length === 0 && <div className="col-span-full text-center py-20 text-gray-400 text-sm font-bold uppercase opacity-50 tracking-widest border-2 border-dashed border-gray-200 rounded-3xl">Belum ada foto kegiatan</div>}
        </div>

        {selectedImage && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 md:p-10 backdrop-blur-md transition-all animate-in fade-in">
            <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 md:top-10 md:right-10 text-white bg-white/20 p-3 rounded-full hover:bg-white/40 transition-colors"><X size={28}/></button>
            <img src={selectedImage} className="max-w-full max-h-[85vh] rounded-2xl border-4 border-white/20 shadow-2xl object-contain animate-in zoom-in-95 duration-300" alt="Full view" />
          </div>
        )}
      </div>
    </div>
  );
};

const PresensiTab = ({ currentUser, attendance, onAddAttendance, setActiveTab, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const userToday = attendance.filter(a => a.date === todayStr && a.name === currentUser?.name);
  const hasHadir = userToday.some(a => a.type === 'Hadir');
  const hasPulang = userToday.some(a => a.type === 'Pulang');

  const isDedih = currentUser?.username?.toLowerCase() === 'dedih';

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const timeInMins = currentHour * 60 + currentMinute;

  const isHadirTime = timeInMins >= 420 && timeInMins <= 720; 
  const isPulangTime = timeInMins >= 930 && timeInMins <= 1260; 
  const isPastHadirTime = timeInMins > 720;

  let hadirText = isDedih ? 'HADIR (KIRIM FOTO)' : 'MASUK KANTOR';
  let hadirDisabled = hasHadir || loading || !isHadirTime;
  if (hasHadir) hadirText = 'SUDAH ABSEN HADIR';
  else if (isPastHadirTime) hadirText = 'WAKTU HABIS (ABSTAIN)';
  else if (!isHadirTime) hadirText = 'DIBUKA PUKUL 07:00 - 12:00';

  let pulangText = isDedih ? 'PULANG (KIRIM FOTO)' : 'PULANG KANTOR';
  let pulangDisabled = !hasHadir || hasPulang || loading || !isPulangTime;
  if (hasPulang) pulangText = 'SUDAH ABSEN PULANG';
  else if (!hasHadir) pulangText = 'BELUM ABSEN HADIR';
  else if (!isPulangTime) pulangText = 'DIBUKA PUKUL 15:30 - 21:00';

  const handleCapture = (e) => {
    const file = e.target.files[0];
    if (file) { setPhotoFile(file); setPhotoPreview(URL.createObjectURL(file)); }
  };

  const handleManualAbsen = async (type) => {
    if (!photoFile) { setMsg({ type: 'err', text: 'Wajib lampirkan foto selfie kehadiran/kepulangan!' }); return; }
    setLoading(true);
    try {
      await onAddAttendance(type, null, null, photoFile);
      setMsg({ type: 'success', text: `Absen ${type} Manual (Foto) Berhasil!` });
      setTimeout(() => setActiveTab('home'), 1500);
    } catch (err) { setMsg({ type: 'err', text: `Gagal: ${err.message}` }); }
    setLoading(false);
  };

  const handleAbsen = async (type) => {
    if (isDedih) {
       handleManualAbsen(type);
       return;
    }

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
    <div className="h-full overflow-y-auto w-full bg-gray-50 flex flex-col">
      <div className="md:hidden bg-green-700 text-white p-5 flex items-center space-x-4 shadow-lg shrink-0"><button onClick={() => setActiveTab('home')} className="p-1 hover:bg-green-800 rounded-lg"><X size={24} /></button><h2 className="font-black text-sm uppercase tracking-widest">Presensi Kehadiran</h2></div>
      <div className="max-w-2xl mx-auto h-full flex flex-col w-full p-6 md:p-8">
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50 to-transparent"></div>
          
          {isDedih ? (
             <div className="w-full flex flex-col items-center mb-6 relative z-10">
               <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-4 bg-orange-50 px-4 py-1.5 rounded-full border border-orange-200">Mode Absen Khusus (Kamera)</h3>
               <input type="file" accept="image/*" capture="user" id="selfieCamera" className="hidden" onChange={handleCapture} />
               <label htmlFor="selfieCamera" className="w-32 h-32 bg-blue-50 text-blue-500 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 border-2 border-dashed border-blue-200 transition-colors shadow-inner overflow-hidden">
                 {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <><Camera size={32} className="mb-2"/><span className="text-[10px] font-bold uppercase">Ambil Selfie</span></>}
               </label>
               {photoPreview && <button onClick={()=>{setPhotoPreview(null); setPhotoFile(null)}} className="text-[10px] font-bold text-red-500 mt-2 uppercase underline">Hapus Foto</button>}
             </div>
          ) : (
             <div className="w-28 h-28 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8 shadow-inner relative z-10"><MapPin size={48} className="animate-pulse" /></div>
          )}

          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">Waktu Perangkat / Server</h3>
          <h3 className="text-5xl md:text-6xl font-mono font-black text-gray-800 mb-10 tracking-tighter relative z-10">{currentTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} <span className="text-xl font-bold text-gray-400">WIB</span></h3>
          
          {msg.text && (
            <div className={`mb-8 p-5 rounded-2xl text-sm font-bold w-full border text-left relative z-10 shadow-sm animate-in fade-in slide-in-from-top-2 ${msg.type === 'err' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{msg.text}</div>
          )}
          
          <div className="w-full space-y-4 md:space-y-6 relative z-10 mt-auto">
            <button disabled={hadirDisabled} onClick={() => handleAbsen('Hadir')} className={`w-full py-5 md:py-6 rounded-2xl font-black shadow-lg transition-all text-sm md:text-base tracking-widest ${hadirDisabled ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200/50 flex justify-center items-center'}`}>{loading ? <Loader2 size={24} className="animate-spin" /> : hadirText}</button>
            <button disabled={pulangDisabled} onClick={() => handleAbsen('Pulang')} className={`w-full py-5 md:py-6 rounded-2xl font-black shadow-lg transition-all text-sm md:text-base tracking-widest ${pulangDisabled ? 'bg-gray-100 text-gray-400 border border-gray-200' : !hasHadir ? 'bg-gray-200 text-gray-400' : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-orange-200/50 flex justify-center items-center'}`}>{loading ? <Loader2 size={24} className="animate-spin" /> : pulangText}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  };

  const handleSaveEmail = async () => {
    if(emailForm.trim() !== '') {
      await onUpdateProfile(currentUser.username, { email: emailForm });
      setIsLinking(false);
      showAlert("Sukses", "Email Notifikasi Berhasil Ditautkan.");
    }
  };

  return (
    <div className="h-full overflow-y-auto w-full p-4 pb-28 md:pb-10 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight">Pengaturan Akun</h2>
        
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 text-center shadow-sm relative mt-6">
          <button onClick={() => {setIsEditing(!isEditing); setIsLinking(false);}} className="absolute top-6 right-6 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 p-3 rounded-full">
            {isEditing ? <X size={20} /> : <Edit size={20} />}
          </button>
          
          <div className="w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 relative">
            {photoPreview ? (
              <img src={photoPreview} className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl" alt="Profil" />
            ) : (
              <div className="w-full h-full bg-green-50 text-green-700 rounded-full flex items-center justify-center text-4xl md:text-5xl font-black border-4 border-white shadow-xl uppercase">{currentUser?.name.substring(0, 2)}</div>
            )}
            {isEditing && (
              <>
                <input type="file" accept="image/*" id="profilePhoto" className="hidden" onChange={handlePhotoSelect} />
                <label htmlFor="profilePhoto" className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 border-2 border-white transition-transform active:scale-95"><Camera size={18} /></label>
              </>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-4 mt-6 text-left animate-in fade-in slide-in-from-top-2 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div><label className="text-xs font-bold text-gray-500 mb-1 block ml-1">Nama Tampilan</label><input type="text" value={editForm.name} onChange={(e)=>setEditForm({...editForm, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm font-bold bg-white shadow-sm"/></div>
              <div><label className="text-xs font-bold text-gray-500 mb-1 block ml-1">Password Akun</label><input type="text" value={editForm.password} onChange={(e)=>setEditForm({...editForm, password: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 text-sm font-bold bg-white shadow-sm"/></div>
              <button onClick={handleSaveProfile} disabled={isUploading} className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-sm mt-4 hover:bg-green-700 shadow-md transition-all active:scale-95 flex justify-center items-center uppercase tracking-widest">{isUploading ? <Loader2 size={20} className="animate-spin" /> : "SIMPAN PERUBAHAN"}</button>
            </div>
          ) : (
            <>
              <h3 className="font-black text-gray-800 text-xl md:text-2xl leading-none">{currentUser?.name}</h3>
              <p className="text-xs text-green-600 font-bold uppercase mt-3 tracking-widest">{currentUser?.title}</p>
            </>
          )}
        </div>

        {currentUser.email ? (
          <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 p-5 md:p-6 rounded-3xl text-sm font-black flex items-center justify-center space-x-3 shadow-sm"><CheckCircle2 size={20} /><span>EMAIL TERTAUT: {currentUser.email}</span></div>
        ) : isLinking ? (
          <div className="w-full bg-white border border-blue-200 p-6 md:p-8 rounded-3xl shadow-sm space-y-4 animate-in fade-in">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center"><BellRing size={16} className="mr-2 text-blue-500"/> Daftarkan Gmail Anda Untuk Notifikasi</p>
            <input type="email" value={emailForm} onChange={(e)=>setEmailForm(e.target.value)} className="w-full p-4 border border-gray-200 outline-none text-sm font-bold bg-gray-50 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="Misal: staf.mui@gmail.com"/>
            <div className="flex gap-3 pt-2">
              <button onClick={()=>setIsLinking(false)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-xl text-xs font-black active:scale-95 hover:bg-gray-200 transition-colors uppercase tracking-widest">Batal</button>
              <button onClick={handleSaveEmail} className="flex-1 bg-blue-600 text-white py-4 rounded-xl text-xs font-bold active:scale-95 shadow-md shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest">Simpan Akun</button>
            </div>
          </div>
        ) : (
          <button onClick={() => {setIsLinking(true); setIsEditing(false);}} className="w-full bg-white border-2 border-blue-100 text-blue-600 p-5 md:p-6 rounded-3xl text-sm font-black flex items-center justify-center space-x-3 shadow-sm hover:bg-blue-50 hover:border-blue-300 active:scale-95 transition-all"><Mail size={20} /><span>TAUTKAN AKUN GOOGLE (GMAIL)</span></button>
        )}

        {['admin', 'test', 'ruhiyat'].includes(currentUser?.username?.toLowerCase()) && (
          <button onClick={() => setActiveTab('master')} className="w-full bg-red-600 text-white p-5 md:p-6 rounded-3xl text-sm font-black flex items-center justify-center space-x-3 shadow-lg hover:bg-red-700 hover:shadow-xl active:scale-95 transition-all"><Shield size={20} /><span>BUKA MASTER PANEL</span></button>
        )}

        <button onClick={() => { localStorage.removeItem('muijb_session'); window.location.reload(); }} className="md:hidden w-full p-5 text-xs font-black text-red-500 bg-white rounded-3xl border border-gray-100 flex items-center justify-center space-x-2 shadow-sm uppercase tracking-widest active:scale-95"><LogOut size={16} /><span>Keluar Sesi</span></button>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [logoUrl] = useState('Logo MUI 1080.png');
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState([]);
  
  const [letters, setLetters] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [absenPimpinan, setAbsenPimpinan] = useState([]); // State Baru untuk Absen Pimpinan
  const [activities, setActivities] = useState([]);
  const [guests, setGuests] = useState([]);
  const [spjs, setSpjs] = useState([]);
  const [tickets, setTickets] = useState([]); 
  const [izins, setIzins] = useState([]); 
  const [userProfiles, setUserProfiles] = useState({}); 

  const [dialog, setDialog] = useState({ isOpen: false, type: 'alert', title: '', message: '', onConfirm: null });
  
  const showAlert = (title, message) => {
    const safeMessage = typeof message === 'string' ? message : (message?.message || JSON.stringify(message));
    setDialog({ isOpen: true, type: 'alert', title, message: safeMessage, onConfirm: null });
  };
  
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

  const isTestUser = currentUser?.username === 'test';

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

    // LISTENER BARU: Absen Pimpinan
    const unAbsenPim = onSnapshot(collection(db, 'absen_pimpinan'), (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()})); setAbsenPimpinan(data.sort((a, b) => b.createdAt - a.createdAt));
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
            notifyUser("Laporan Kerusakan Baru", `${change.doc.data().kendala} di ${change.doc.data().lokasi}`);
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
      const data = snap.docs.map(d => ({id: d.id, ...d.data()})); setNotes(data.sort((a, b) => a.createdAt - b.createdAt)); 
    });

    const unIzin = onSnapshot(collection(db, 'izin_keluar'), (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()})); setIzins(data.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => { unUsers(); unLetters(); unAtt(); unAbsenPim(); unAct(); unGuests(); unSpj(); unTicket(); unNotes(); unIzin(); };
  }, [currentUser?.username]); 

  const proceedLogin = (userObj) => {
    setCurrentUser(userObj); 
    setActiveTab('home');
    localStorage.setItem('muijb_session', JSON.stringify({ username: userObj.username, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
  };

  const handleLogout = () => { localStorage.removeItem('muijb_session'); window.location.reload(); };

  const handleUpdateProfile = async (username, newData) => {
    if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi update profil berhasil. Data tidak disimpan.");
    try { await setDoc(doc(db, 'user_profiles', username.toLowerCase()), { ...newData, username: username.toLowerCase() }, { merge: true }); showAlert("Sukses", "Profil berhasil diperbarui!");} 
    catch (error) { showAlert("Gagal", error.message || "Gagal mengupdate profil."); }
  };
  
  const handleAddNote = async (text) => {
    if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi tambah catatan berhasil.");
    try { await addDoc(collection(db, 'catatan_pimpinan'), { text, author: currentUser.name, createdAt: Date.now() }); }
    catch (error) { showAlert("Gagal", error.message || "Gagal menyimpan catatan."); }
  };

  const handleAddIzin = async (staffName, alasan) => {
    if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi catat izin keluar berhasil.");
    try { 
      await addDoc(collection(db, 'izin_keluar'), { 
        name: staffName, alasan, status: 'Keluar', 
        date: new Date().toISOString().split('T')[0],
        waktuKeluar: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
        waktuKembali: null,
        dicatatOleh: currentUser.name, createdAt: Date.now() 
      }); 
      showAlert("Sukses", `Berhasil mencatat izin keluar untuk ${staffName}.`);
    } catch (error) { showAlert("Gagal", error.message || "Gagal mencatat izin."); }
  };

  const handleReturnIzin = async (id) => {
    if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi tandai kembali berhasil.");
    try { 
      await updateDoc(doc(db, 'izin_keluar', id), { 
        status: 'Kembali', 
        waktuKembali: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) 
      }); 
    } catch (error) { showAlert("Gagal", error.message || "Gagal update status kembali."); }
  };
  
  const handleAddLetter = async (formData) => {
    if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi simpan surat berhasil.");
    const generatedNumber = `${formData.kodeSurat}-${formData.noSurat}/DP.P-XII/${formData.bulanSurat}/${formData.tahunSurat}`;
    await addDoc(collection(db, 'arsip_surat'), {
      createdAt: Date.now(), title: formData.title, kategori: formData.kategori, date: formData.date, sender: formData.sender,
      kodeSurat: formData.kodeSurat, noSurat: formData.noSurat, bulanSurat: formData.bulanSurat, tahunSurat: formData.tahunSurat,
      number: generatedNumber, status: 'Baru', uploader: currentUser.name
    });
  };

  const handleUpdateDisposisi = async (id, text, byName) => {
    if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi kirim disposisi berhasil.");
    try { await updateDoc(doc(db, 'arsip_surat', id), { disposisiText: text, disposisiBy: byName, disposisiAt: Date.now() }); } 
    catch (error) { showAlert("Gagal", "Update disposisi gagal: " + error.message); }
  };

  const handleAddAttendance = async (type, lat, lng, imageFile = null) => {
    if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi presensi berhasil.");
    let finalImageBase64 = null;
    let method = 'GPS';
    if (imageFile) {
      finalImageBase64 = await compressImage(imageFile);
      method = 'Manual/Selfie';
    }
    await addDoc(collection(db, 'presensi'), {
      createdAt: Date.now(), name: currentUser.name, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: new Date().toISOString().split('T')[0], type, lat, lng, status: 'Tercatat', method, imageUrl: finalImageBase64
    });
  };

  // FUNGSI BARU: Tambah Absen Pimpinan
  const handleAddAbsenPimpinan = async (namaPimpinan) => {
    if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi absen pimpinan berhasil.");
    try {
      await addDoc(collection(db, 'absen_pimpinan'), {
        createdAt: Date.now(), 
        date: new Date().toISOString().split('T')[0], 
        time: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
        namaPimpinan: namaPimpinan,
        dicatatOleh: currentUser.name
      });
      showAlert("Sukses", `Kehadiran ${namaPimpinan} berhasil dicatat!`);
    } catch(err) { showAlert("Gagal", err.message || "Gagal mencatat kehadiran pimpinan."); }
  };

  const handleAddActivity = async (desc, imageFile) => {
    if (isTestUser) { setIsUploading(false); return showAlert("Mode Uji Coba", "Simulasi catat kegiatan berhasil."); }
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
    if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi simpan tamu berhasil.");
    try {
      await addDoc(collection(db, 'buku_tamu'), {
        createdAt: Date.now(), date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
        nama: formData.nama, instansi: formData.instansi, tujuan: formData.tujuan, penerima: currentUser.name
      });
    } catch(err) { showAlert("Gagal", err.message || "Gagal mencatat tamu."); }
  };

  const handleAddSpj = async (formData, imageFile) => {
    if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi kirim SPJ berhasil.");
    try {
      const finalImageBase64 = await compressImage(imageFile);
      const totalKalkulasi = Number(formData.qty) * Number(formData.harga);
      await addDoc(collection(db, 'e_spj'), {
        createdAt: Date.now(), date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
        keterangan: formData.keterangan, qty: Number(formData.qty), harga: Number(formData.harga), total: totalKalkulasi, jumlah: totalKalkulasi, reporter: currentUser.name, imageUrl: finalImageBase64, status: 'Menunggu'
      });
    } catch (error) { showAlert("Gagal", error.message || "Gagal menyimpan SPJ."); }
  };

  const handleAddTicket = async (formData) => {
    if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi buat tiket berhasil.");
    try {
      await addDoc(collection(db, 'e_tickets'), {
        createdAt: Date.now(), date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}),
        lokasi: formData.lokasi, kendala: formData.kendala, reporter: currentUser.name, status: 'Menunggu'
      });
    } catch (error) { showAlert("Gagal", error.message || "Gagal membuat tiket."); }
  };

  const handleAccSpj = (id) => {
    showConfirm("Konfirmasi ACC", "Tandai pengeluaran ini telah di-ACC?", async () => {
      if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi ACC berhasil.");
      try { await updateDoc(doc(db, 'e_spj', id), { status: 'Disetujui', accBy: currentUser.name, accAt: Date.now() }); }
      catch(err) { showAlert("Gagal", err.message || "Gagal ACC."); }
    });
  };

  const handleResolveTicket = (id) => {
    showConfirm("Selesaikan Tiket", "Tandai kerusakan ini sebagai selesai/diperbaiki?", async () => {
       if (isTestUser) return showAlert("Mode Uji Coba", "Simulasi Selesai berhasil.");
       try { await updateDoc(doc(db, 'e_tickets', id), { status: 'Selesai', resolvedAt: Date.now(), resolvedBy: currentUser.name }); } 
       catch (error) { showAlert("Gagal", error.message || "Gagal Update Tiket."); }
    });
  };

  const handleDeleteLetter = (id) => showConfirm("Hapus Surat", "Hapus surat ini dari server?", async () => { if(isTestUser) return showAlert("Mode Uji Coba", "Simulasi hapus sukses."); try { await deleteDoc(doc(db, 'arsip_surat', id)); } catch(e){ showAlert("Gagal", e.message); } });
  const handleDeleteActivity = (id) => showConfirm("Hapus Kegiatan", "Hapus kegiatan ini dari server?", async () => { if(isTestUser) return showAlert("Mode Uji Coba", "Simulasi hapus sukses."); try { await deleteDoc(doc(db, 'kegiatan_harian', id)); } catch(e){ showAlert("Gagal", e.message); } });
  const handleDeleteSpj = (id) => showConfirm("Hapus SPJ", "Hapus data SPJ ini dari server?", async () => { if(isTestUser) return showAlert("Mode Uji Coba", "Simulasi hapus sukses."); try { await deleteDoc(doc(db, 'e_spj', id)); } catch(e){ showAlert("Gagal", e.message); } });
  const handleDeleteTicket = (id) => showConfirm("Hapus Tiket", "Hapus tiket laporan ini?", async () => { if(isTestUser) return showAlert("Mode Uji Coba", "Simulasi hapus sukses."); try { await deleteDoc(doc(db, 'e_tickets', id)); } catch(e){ showAlert("Gagal", e.message); } });
  const handleDeleteNote = (id) => showConfirm("Hapus Catatan", "Hapus catatan pimpinan ini?", async () => { if(isTestUser) return showAlert("Mode Uji Coba", "Simulasi hapus sukses."); try { await deleteDoc(doc(db, 'catatan_pimpinan', id)); } catch(e){ showAlert("Gagal", e.message); } });
  const handleDeleteGuest = (id) => showConfirm("Hapus Tamu", "Hapus data tamu ini dari server?", async () => { if(isTestUser) return showAlert("Mode Uji Coba", "Simulasi hapus sukses."); try { await deleteDoc(doc(db, 'buku_tamu', id)); } catch(e){ showAlert("Gagal", e.message); } });
  
  // FUNGSI BARU: Hapus Absen Pimpinan
  const handleDeleteAbsenPimpinan = (id) => showConfirm("Hapus Absen Pimpinan", "Hapus catatan kehadiran ini?", async () => { if(isTestUser) return showAlert("Mode Uji Coba", "Simulasi hapus sukses."); try { await deleteDoc(doc(db, 'absen_pimpinan', id)); } catch(e){ showAlert("Gagal", e.message); } });

  if (!currentUser) return <LoginScreen onLogin={proceedLogin} logoUrl={logoUrl} activeUsers={activeUsers} />;

  let renderedTab = activeTab;

  return (
    <div className="bg-gray-200 min-h-screen font-sans flex justify-center items-center md:p-6 lg:p-8">
      {/* Shell Aplikasi */}
      <div className="w-full md:max-w-6xl lg:max-w-[1400px] bg-white md:rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col md:flex-row h-screen md:h-[90vh] md:border border-gray-200">
        
        <DialogModal dialog={dialog} closeDialog={closeDialog} />

        {/* SIDE NAV KHUSUS LAPTOP */}
        {currentUser && <SideNav activeTab={renderedTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={handleLogout} />}

        {/* AREA KONTEN UTAMA */}
        <div className="flex-1 overflow-hidden relative bg-gray-50 flex flex-col">
          {renderedTab === 'home' && <HomeTab currentUser={currentUser} logoUrl={logoUrl} letters={letters} attendance={attendance} activities={activities} guests={guests} tickets={tickets} notes={notes} izins={izins} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} onResolveTicket={handleResolveTicket} onAddActivity={handleAddActivity} isUploading={isUploading} setActiveTab={setActiveTab} showAlert={showAlert} />}
          {renderedTab === 'dokumen' && <DokumenTab letters={letters} onAddLetter={handleAddLetter} onUpdateDisposisi={handleUpdateDisposisi} currentUser={currentUser} showAlert={showAlert} />}
          {renderedTab === 'layanan' && <LayananTab setActiveTab={setActiveTab} />}
          
          {/* TAB BARU: ABSEN PIMPINAN */}
          {renderedTab === 'absenpimpinan' && <AbsenPimpinanTab absenPimpinan={absenPimpinan} onAddAbsenPimpinan={handleAddAbsenPimpinan} setActiveTab={setActiveTab} showAlert={showAlert} />}
          
          {renderedTab === 'bukutamu' && <BukuTamuTab guests={guests} onAddGuest={handleAddGuest} setActiveTab={setActiveTab} showAlert={showAlert} />}
          {renderedTab === 'espj' && <ESpjTab spjs={spjs} onAddSpj={handleAddSpj} onAccSpj={handleAccSpj} currentUser={currentUser} setActiveTab={setActiveTab} showAlert={showAlert} showConfirm={showConfirm} />}
          {renderedTab === 'eticket' && <ETicketTab tickets={tickets} onAddTicket={handleAddTicket} onResolveTicket={handleResolveTicket} currentUser={currentUser} setActiveTab={setActiveTab} showAlert={showAlert} />}
          {renderedTab === 'galeri' && <GaleriTab activities={activities} />}
          {renderedTab === 'presensi' && <PresensiTab currentUser={currentUser} attendance={attendance} onAddAttendance={handleAddAttendance} setActiveTab={setActiveTab} showAlert={showAlert} />}
          {renderedTab === 'profil' && <ProfilTab currentUser={currentUser} onUpdateProfile={handleUpdateProfile} setActiveTab={setActiveTab} showAlert={showAlert} />}
          {renderedTab === 'master' && <MasterAdminTab currentUser={currentUser} attendance={attendance} absenPimpinan={absenPimpinan} letters={letters} activities={activities} guests={guests} spjs={spjs} tickets={tickets} izins={izins} activeUsers={activeUsers} onUpdateUserAdmin={handleUpdateProfile} onDeleteLetter={handleDeleteLetter} onDeleteActivity={handleDeleteActivity} onDeleteSpj={handleDeleteSpj} onDeleteTicket={handleDeleteTicket} onDeleteGuest={handleDeleteGuest} onDeleteAbsenPimpinan={handleDeleteAbsenPimpinan} onAddIzin={handleAddIzin} onReturnIzin={handleReturnIzin} setActiveTab={setActiveTab} showAlert={showAlert} showConfirm={showConfirm} />}
          
          {/* BOTTOM NAV KHUSUS HP (Sembunyi di Laptop) */}
          {!['presensi', 'master', 'bukutamu', 'espj', 'eticket', 'absenpimpinan'].includes(renderedTab) && (
            <BottomNav activeTab={renderedTab} setActiveTab={setActiveTab} currentUser={currentUser} />
          )}
        </div>

      </div>
    </div>
  );
}