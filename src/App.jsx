import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  User, 
  Plus, 
  Search, 
  FileDown, 
  FileUp, 
  Award, 
  CheckCircle2, 
  X,
  FileBox,
  Edit,
  Shield,
  LogOut,
  Lock,
  MapPin,
  Clock,
  Download
} from 'lucide-react';

// --- Konfigurasi Data Pengguna ---
const USERS = [
  { id: 1, username: 'ketua', password: 'ketua123', name: 'Ketua Umum MUI Jawa Barat', role: 'viewer', title: 'Ketua Umum' },
  { id: 2, username: 'sekum', password: 'sekum123', name: 'Sekretaris Umum MUI Jawa Barat', role: 'viewer', title: 'Sekretaris Umum' },
  { id: 3, username: 'admin', password: 'admin123', name: 'Eky Wifky Afandi, M.Ag', role: 'admin', title: 'Admin' },
  { id: 4, username: 'ruhiyat', password: 'ruhiyat123', name: 'H. Ruhiyat', role: 'editor', title: 'Sekretariat Umum' },
  { id: 5, username: 'rani', password: 'rani123', name: 'Rani Nurita Yusuf', role: 'editor', title: 'Sekretariat Keuangan' },
  { id: 6, username: 'dedih', password: 'dedih123', name: 'Dedih Alyadi', role: 'staff', title: 'Staff' },
  { id: 7, username: 'erik', password: 'erik123', name: 'Erik', role: 'staff', title: 'Staff' },
];

// --- Fungsi Utilitas ---
const getRomanMonth = (monthIndex) => {
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return romans[monthIndex];
};

const generateLetterNumber = (type, seqNum, dateString) => {
  const padNum = String(seqNum).padStart(3, '0');
  const d = new Date(dateString);
  const romanMonth = getRomanMonth(d.getMonth());
  const year = d.getFullYear();
  return `${type}-${padNum}/DP.P-XII/${romanMonth}/${year}`;
};

// --- Komponen Antarmuka (UI Components) ---

const LoginScreen = ({ onLogin, logoUrl }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!onLogin(username, password)) {
      setError('Username atau password salah!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 w-full max-w-md mx-auto">
      <div className="w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-1 border-4 border-green-50 shadow-md flex items-center justify-center overflow-hidden">
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="w-full h-full object-contain" 
            onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=MUI" }} 
          />
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-1 tracking-tight">E-Sekretariat.MUIJB</h1>
        <p className="text-sm text-gray-400 mb-8 font-medium">MUI Provinsi Jawa Barat</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-500 text-[11px] rounded-xl border border-red-100 font-bold uppercase tracking-wider">{error}</div>}
          <div className="text-left">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Username</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-gray-100 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-green-500" placeholder="Username" />
          </div>
          <div className="text-left">
            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-100 rounded-xl p-3 text-sm bg-gray-50 outline-none focus:ring-2 focus:ring-green-500" placeholder="Password" />
          </div>
          <button type="submit" className="w-full bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-800 transition-all active:scale-95">MASUK APLIKASI</button>
        </form>
      </div>
    </div>
  );
};

const BottomNav = ({ activeTab, setActiveTab, currentUser }) => {
  const role = currentUser?.role;
  const canViewArsip = ['admin', 'viewer', 'editor'].includes(role);
  const canAddArsip = ['admin', 'editor'].includes(role);
  const canScan = ['admin', 'editor', 'staff'].includes(role);

  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 flex justify-around py-3 pb-6 px-2 z-50">
      <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center transition-colors ${activeTab === 'home' ? 'text-green-600' : 'text-gray-300'}`}>
        <Home size={22} />
        <span className="text-[9px] mt-1 font-bold uppercase">Beranda</span>
      </button>
      {canViewArsip && (
        <button onClick={() => setActiveTab('arsip')} className={`flex flex-col items-center transition-colors ${activeTab === 'arsip' ? 'text-green-600' : 'text-gray-300'}`}>
          <FileText size={22} />
          <span className="text-[9px] mt-1 font-bold uppercase">Arsip</span>
        </button>
      )}
      {canScan && (
        <div className="relative -top-7">
          <button onClick={() => setActiveTab('presensi')} className="bg-green-600 text-white p-4 rounded-full shadow-xl border-4 border-gray-50 flex items-center justify-center hover:bg-green-700 active:scale-90 transition-all">
            <MapPin size={26} />
          </button>
        </div>
      )}
      {canAddArsip && (
        <button onClick={() => setActiveTab('buat')} className={`flex flex-col items-center transition-colors ${activeTab === 'buat' ? 'text-green-600' : 'text-gray-300'}`}>
          <Plus size={22} />
          <span className="text-[9px] mt-1 font-bold uppercase">Buat</span>
        </button>
      )}
      <button onClick={() => setActiveTab('profil')} className={`flex flex-col items-center transition-colors ${activeTab === 'profil' ? 'text-green-600' : 'text-gray-300'}`}>
        <User size={22} />
        <span className="text-[9px] mt-1 font-bold uppercase">Profil</span>
      </button>
    </div>
  );
};

const HomeTab = ({ currentUser, logoUrl, letters, attendance, setActiveTab }) => {
  const role = currentUser?.role;
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayAtt = attendance.find(a => a.date === todayStr && a.name === currentUser?.name && a.type === 'Hadir');

  return (
    <div className="p-4 pb-28 overflow-y-auto h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-full bg-white p-1 border border-gray-100" />
          <div>
            <h1 className="text-lg font-extrabold text-gray-800 leading-none">E-Sekretariat.MUIJB</h1>
            <p className="text-[10px] text-green-600 font-bold uppercase mt-1">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-700 font-bold border border-green-100 uppercase text-xs">{currentUser?.name.substring(0, 2)}</div>
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

      {['admin', 'viewer', 'editor'].includes(role) ? (
        <>
          <h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest ml-1">Ringkasan Arsip</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><FileDown size={20} /></div>
              <div><p className="text-xl font-black text-gray-800 leading-none">{letters.filter(l => l.type === 'A').length}</p><p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Internal</p></div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><FileUp size={20} /></div>
              <div><p className="text-xl font-black text-gray-800 leading-none">{letters.filter(l => l.type === 'B').length}</p><p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Eksternal</p></div>
            </div>
          </div>
          <div className="flex justify-between items-center"><h3 className="font-extrabold text-gray-800 text-xs uppercase tracking-widest ml-1">Aktivitas Terbaru</h3><button onClick={() => setActiveTab('arsip')} className="text-[10px] text-green-600 font-black uppercase">Lihat Semua</button></div>
          <div className="space-y-3">
            {letters.slice(0, 3).map((letter) => (
              <div key={letter.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-start space-x-4 shadow-sm">
                <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400"><FileText size={18} /></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-800 truncate">{letter.title}</h4>
                  <p className="text-[11px] text-green-700 font-mono mt-0.5 font-bold">{letter.number}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"><MapPin size={40} className="opacity-40" /></div>
          <h3 className="font-black text-gray-800 mb-2 text-lg uppercase tracking-tight">Presensi GPS</h3>
          <p className="text-xs text-gray-400 mb-8 px-6 font-medium leading-relaxed">Aktifkan GPS Anda untuk melakukan pelaporan kehadiran di kantor MUI Jabar.</p>
          <button onClick={() => setActiveTab('presensi')} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all">BUKA MENU ABSENSI</button>
        </div>
      )}
    </div>
  );
};

const ArsipTab = ({ letters, searchQuery, setSearchQuery, currentUser, setEditingLetter, setActiveTab }) => {
  const filteredLetters = letters.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.number.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="p-4 pb-28 h-full flex flex-col space-y-4">
      <h2 className="text-2xl font-black text-gray-800 tracking-tight">Arsip Dokumen</h2>
      <div className="relative">
        <Search size={18} className="absolute left-4 top-4 text-gray-300" />
        <input type="text" className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl text-sm outline-none bg-white shadow-sm focus:ring-2 focus:ring-green-500" placeholder="Cari nomor atau perihal..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {filteredLetters.length === 0 ? <div className="text-center py-24 text-gray-300"><FileBox size={60} className="mx-auto mb-4 opacity-10" /><p className="font-bold text-sm uppercase tracking-widest opacity-20">Data Kosong</p></div> : 
        filteredLetters.map((letter) => (
          <div key={letter.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start space-x-4 shadow-sm">
            <div className="p-3 bg-gray-50 rounded-xl text-green-700 shrink-0"><FileText size={20} /></div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-gray-800 truncate pr-4 leading-tight">{letter.title}</h4>
                {currentUser?.role === 'admin' && <button onClick={() => { setEditingLetter(letter); setActiveTab('edit'); }} className="text-gray-300 hover:text-blue-600 transition-colors p-1"><Edit size={16} /></button>}
              </div>
              <p className="text-[11px] text-green-700 font-mono font-bold">{letter.number}</p>
              <div className="flex justify-between mt-3 items-center"><span className="text-[10px] text-gray-400 font-bold uppercase">{letter.sender}</span><span className="text-[10px] text-gray-300 font-black">{letter.date}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BuatSuratTab = ({ formData, setFormData, handleAddLetter }) => (
  <div className="p-4 pb-28 h-full overflow-y-auto space-y-6">
    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Registrasi Surat</h2>
    <form onSubmit={handleAddLetter} className="space-y-4">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-5 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          {['A', 'B', 'Kep', 'L'].map(t => (
            <div key={t} onClick={() => setFormData({...formData, type: t})} className={`text-center py-3 rounded-xl border text-[10px] font-black uppercase tracking-tighter cursor-pointer transition-all ${formData.type === t ? 'bg-green-600 border-green-600 text-white shadow-md' : 'border-gray-50 text-gray-400 bg-gray-50 hover:bg-gray-100'}`}>
              {t === 'A' ? 'Internal' : t === 'B' ? 'Eksternal' : t === 'Kep' ? 'Keputusan' : 'Lainnya'}
            </div>
          ))}
        </div>
        <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Perihal Dokumen</label><input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border-b-2 border-gray-50 p-2 text-sm outline-none focus:border-green-600 font-bold" placeholder="..." /></div>
        <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tanggal Buat</label><input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full border-b-2 border-gray-50 p-2 text-sm outline-none font-bold" /></div>
        <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Tujuan / Pengirim</label><input required type="text" value={formData.sender} onChange={(e) => setFormData({...formData, sender: e.target.value})} className="w-full border-b-2 border-gray-50 p-2 text-sm outline-none font-bold" placeholder="..." /></div>
      </div>
      <button type="submit" className="w-full bg-green-700 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-green-800 active:scale-95 transition-all uppercase tracking-widest text-xs">Simpan Arsip Terpadu</button>
    </form>
  </div>
);

const EditSuratTab = ({ editingLetter, setEditingLetter, handleUpdateLetter, setActiveTab }) => (
  <div className="p-4 pb-28 h-full overflow-y-auto space-y-6">
    <div className="flex items-center space-x-4"><button onClick={() => { setActiveTab('arsip'); setEditingLetter(null); }} className="p-2 bg-white rounded-xl shadow-sm border border-gray-100"><X size={20} /></button><h2 className="text-xl font-black text-gray-800">Edit Dokumen</h2></div>
    {editingLetter && (
      <form onSubmit={handleUpdateLetter} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 space-y-6 shadow-sm">
          <div><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Nomor Surat (System)</label><p className="p-3 text-xs font-mono text-green-700 bg-green-50 rounded-xl mt-1 font-bold">{editingLetter.number}</p></div>
          <div><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Perihal</label><input required type="text" value={editingLetter.title} onChange={(e) => setEditingLetter({...editingLetter, title: e.target.value})} className="w-full border-b-2 border-gray-50 p-2 text-sm outline-none font-bold mt-1" /></div>
          <div><label className="text-[10px] font-black text-gray-400 uppercase ml-1">Status Dokumen</label><select value={editingLetter.status} onChange={(e) => setEditingLetter({...editingLetter, status: e.target.value})} className="w-full bg-transparent p-2 text-sm outline-none border-b-2 border-gray-50 font-bold mt-1 cursor-pointer"><option>Baru</option><option>Diproses</option><option>Selesai</option></select></div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs">Simpan Perubahan</button>
      </form>
    )}
  </div>
);

const PresensiTab = ({ currentUser, attendance, setAttendance, setActiveTab }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const userToday = attendance.filter(a => a.date === todayStr && a.name === currentUser?.name);
  const hasHadir = userToday.some(a => a.type === 'Hadir');
  const hasPulang = userToday.some(a => a.type === 'Pulang');

  const handleAbsen = (type) => {
    setLoading(true);
    if (!navigator.geolocation) { setMsg({ type: 'err', text: 'GPS tidak didukung perangkat' }); setLoading(false); return; }
    navigator.geolocation.getCurrentPosition((pos) => {
      const newAtt = { id: Date.now(), name: currentUser.name, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), date: todayStr, type, lat: pos.coords.latitude, lng: pos.coords.longitude, status: 'Tercatat' };
      setAttendance([newAtt, ...attendance]);
      setMsg({ type: 'success', text: `Absen ${type} Berhasil Dicatat!` });
      setTimeout(() => setActiveTab('home'), 1500);
    }, () => { setMsg({ type: 'err', text: 'Gagal mendapatkan akses lokasi' }); setLoading(false); });
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-green-700 text-white p-5 flex items-center space-x-4 shadow-lg"><button onClick={() => setActiveTab('home')} className="p-1 hover:bg-green-800 rounded-lg"><X size={24} /></button><h2 className="font-black text-sm uppercase tracking-widest">Presensi Kehadiran</h2></div>
      <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse"><MapPin size={36} /></div>
        <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Waktu Server Realtime</h3>
        <h3 className="text-4xl font-mono font-black text-gray-800 mb-10 tracking-tighter">{now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} <span className="text-sm font-bold text-gray-400">WIB</span></h3>
        {msg.text && <div className={`mb-8 p-4 rounded-2xl text-xs font-bold w-full border ${msg.type === 'err' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-700 border-green-100'}`}>{msg.text}</div>}
        <div className="w-full space-y-4">
          <button disabled={hasHadir || loading} onClick={() => handleAbsen('Hadir')} className={`w-full py-5 rounded-2xl font-black shadow-lg transition-all text-xs tracking-widest ${hasHadir ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-blue-600 text-white active:scale-95 shadow-blue-200'}`}>{hasHadir ? 'SUDAH ABSEN HADIR' : loading ? 'MENGAMBIL GPS...' : 'MASUK KANTOR'}</button>
          <button disabled={!hasHadir || hasPulang || loading} onClick={() => handleAbsen('Pulang')} className={`w-full py-5 rounded-2xl font-black shadow-lg transition-all text-xs tracking-widest ${hasPulang ? 'bg-gray-100 text-gray-400 border border-gray-200' : !hasHadir ? 'bg-gray-200 text-gray-400' : 'bg-orange-500 text-white active:scale-95 shadow-orange-200'}`}>{hasPulang ? 'SUDAH ABSEN PULANG' : 'PULANG KANTOR'}</button>
        </div>
      </div>
    </div>
  );
};

const ProfilTab = ({ currentUser, attendance, logoUrl, setLogoUrl, setCurrentUser, exportAttendanceCSV }) => {
  const myAtt = attendance.filter(a => a.name === currentUser?.name);
  return (
    <div className="p-4 pb-28 h-full overflow-y-auto space-y-6">
      <h2 className="text-2xl font-black text-gray-800 tracking-tight">Akun Saya</h2>
      <div className="bg-white p-8 rounded-3xl border border-gray-100 text-center shadow-sm">
        <div className="w-24 h-24 bg-green-50 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-black border-4 border-white shadow-md uppercase">{currentUser?.name.substring(0, 2)}</div>
        <h3 className="font-black text-gray-800 text-lg leading-none">{currentUser?.name}</h3>
        <p className="text-[10px] text-green-600 font-bold uppercase mt-2 tracking-widest">{currentUser?.title}</p>
      </div>
      {currentUser?.role === 'admin' && (
        <div className="bg-green-700 p-6 rounded-3xl shadow-xl space-y-5 text-white">
          <div className="flex items-center space-x-3 font-black text-xs uppercase tracking-widest opacity-90"><Shield size={18} /><span>Pengaturan Admin</span></div>
          <div className="space-y-1"><label className="text-[9px] font-black uppercase opacity-60 ml-1">URL Logo Aplikasi</label><input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="w-full p-3 text-xs rounded-xl border border-white/20 bg-white/10 outline-none focus:bg-white/20 font-bold text-white placeholder-white/30" placeholder="Logo path..." /></div>
          <button onClick={exportAttendanceCSV} className="w-full bg-white text-green-700 py-4 rounded-xl text-xs font-black flex items-center justify-center space-x-2 shadow-lg active:scale-95 transition-all"><Download size={16} /><span>EKSPOR DATA (.CSV)</span></button>
        </div>
      )}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-50 font-black text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50/50">Riwayat Presensi Lokal</div>
        <div className="p-4 space-y-4">
          {myAtt.length === 0 ? <p className="text-center text-[10px] text-gray-300 font-bold py-6 uppercase tracking-widest">Belum ada aktivitas</p> : myAtt.map((a, i) => (
            <div key={i} className="flex justify-between items-center text-xs pb-3 border-b border-gray-50 last:border-0 last:pb-0"><div className="font-bold text-gray-700">{a.date} <span className="text-[10px] text-gray-400 font-medium ml-1">[{a.type}]</span></div><div className="text-green-600 font-mono font-black">{a.time}</div></div>
          ))}
        </div>
        <button onClick={() => window.location.reload()} className="w-full py-5 text-xs font-black text-red-500 hover:bg-red-50 flex items-center justify-center space-x-2 transition-colors border-t border-gray-50 uppercase tracking-widest">
          <LogOut size={16} />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </div>
  );
};

// --- Fungsi Utama Aplikasi ---

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLetter, setEditingLetter] = useState(null);
  const [logoUrl, setLogoUrl] = useState('Logo MUI 1080.png');
  
  const [letters, setLetters] = useState([
    { id: 1, title: 'Undangan Rapat Pleno', type: 'A', seq: 12, date: '2026-03-21', number: 'A-012/DP.P-XII/III/2026', sender: 'Sekretaris Umum', status: 'Selesai' },
    { id: 2, title: 'Fatwa Halal Produk XYZ', type: 'Kep', seq: 48, date: '2026-03-20', number: 'Kep-048/DP.P-XII/III/2026', sender: 'Komisi Fatwa', status: 'Selesai' },
    { id: 3, title: 'Himbauan Ramadhan 1447 H', type: 'B', seq: 25, date: '2026-03-15', number: 'B-025/DP.P-XII/III/2026', sender: 'Ketua Umum', status: 'Selesai' },
  ]);

  const [attendance, setAttendance] = useState([
    { id: 1, name: 'Ahmad Fulan', time: '07:45', date: '2026-03-21', type: 'Hadir', lat: -6.9315, lng: 107.7169, status: 'Tercatat' }
  ]);

  const [formData, setFormData] = useState({
    title: '', type: 'A', date: new Date().toISOString().split('T')[0], sender: '', description: ''
  });

  const handleLogin = (username, password) => {
    const user = USERS.find(u => u.username === username.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      setActiveTab('home');
      return true;
    }
    return false;
  };

  const handleAddLetter = (e) => {
    e.preventDefault();
    const sameTypeLetters = letters.filter(l => l.type === formData.type);
    const nextSeq = sameTypeLetters.length > 0 ? Math.max(...sameTypeLetters.map(l => l.seq)) + 1 : 1;
    const newLetterNumber = generateLetterNumber(formData.type, nextSeq, formData.date);
    const newLetter = { id: Date.now(), ...formData, seq: nextSeq, number: newLetterNumber, status: 'Baru' };
    setLetters([newLetter, ...letters]);
    setActiveTab('arsip');
    setFormData({ title: '', type: 'A', date: new Date().toISOString().split('T')[0], sender: '', description: '' });
  };

  const handleUpdateLetter = (e) => {
    e.preventDefault();
    setLetters(letters.map(l => l.id === editingLetter.id ? editingLetter : l));
    setActiveTab('arsip');
    setEditingLetter(null);
  };

  const exportAttendanceCSV = () => {
    const headers = ['ID', 'Nama Staff', 'Tanggal', 'Waktu', 'Tipe Presensi', 'Latitude', 'Longitude', 'Status'];
    const rows = attendance.map(a => [a.id, `"${a.name}"`, a.date, a.time, a.type, a.lat, a.lng, a.status].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Rekap_Presensi_MUIJabar_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Render Layar Login jika belum ada user
  if (!currentUser) return <LoginScreen onLogin={handleLogin} logoUrl={logoUrl} />;

  // Render Aplikasi Utama
  return (
    <div className="bg-gray-50 min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          {activeTab === 'home' && (
            <HomeTab 
              currentUser={currentUser} 
              logoUrl={logoUrl} 
              letters={letters} 
              attendance={attendance} 
              setActiveTab={setActiveTab} 
            />
          )}
          {activeTab === 'arsip' && (
            <ArsipTab 
              letters={letters} 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              currentUser={currentUser} 
              setEditingLetter={setEditingLetter} 
              setActiveTab={setActiveTab} 
            />
          )}
          {activeTab === 'buat' && (
            <BuatSuratTab 
              formData={formData} 
              setFormData={setFormData} 
              handleAddLetter={handleAddLetter} 
            />
          )}
          {activeTab === 'edit' && (
            <EditSuratTab 
              editingLetter={editingLetter} 
              setEditingLetter={setEditingLetter} 
              handleUpdateLetter={handleUpdateLetter} 
              setActiveTab={setActiveTab} 
            />
          )}
          {activeTab === 'presensi' && (
            <PresensiTab 
              currentUser={currentUser} 
              attendance={attendance} 
              setAttendance={setAttendance} 
              setActiveTab={setActiveTab} 
            />
          )}
          {activeTab === 'profil' && (
            <ProfilTab 
              currentUser={currentUser} 
              attendance={attendance} 
              logoUrl={logoUrl} 
              setLogoUrl={setLogoUrl} 
              setCurrentUser={setCurrentUser} 
              exportAttendanceCSV={exportAttendanceCSV} 
            />
          )}
        </div>
        {/* Navigasi bawah hanya tampil jika tidak sedang di menu presensi atau edit */}
        {activeTab !== 'presensi' && activeTab !== 'edit' && (
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}