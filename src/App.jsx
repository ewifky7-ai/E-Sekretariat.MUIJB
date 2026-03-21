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

// --- Data & Constants ---
const USERS = [
  { id: 1, username: 'ketua', password: 'ketua123', name: 'Ketua Umum MUI Jawa Barat', role: 'viewer', title: 'Ketua Umum' },
  { id: 2, username: 'sekum', password: 'sekum123', name: 'Sekretaris Umum MUI Jawa Barat', role: 'viewer', title: 'Sekretaris Umum' },
  { id: 3, username: 'admin', password: 'admin123', name: 'Eky Wifky Afandi, M.Ag', role: 'admin', title: 'Admin' },
  { id: 4, username: 'ruhiyat', password: 'ruhiyat123', name: 'H. Ruhiyat', role: 'editor', title: 'Sekretariat Umum' },
  { id: 5, username: 'rani', password: 'rani123', name: 'Rani Nurita Yusuf', role: 'editor', title: 'Sekretariat Keuangan' },
  { id: 6, username: 'dedih', password: 'dedih123', name: 'Dedih Alyadi', role: 'staff', title: 'Staff' },
  { id: 7, username: 'erik', password: 'erik123', name: 'Erik', role: 'staff', title: 'Staff' },
];

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

// --- Sub-Components ---

const BottomNav = ({ activeTab, setActiveTab, currentUser }) => {
  const role = currentUser?.role;
  const canViewArsip = ['admin', 'viewer', 'editor'].includes(role);
  const canAddArsip = ['admin', 'editor'].includes(role);
  const canScan = ['admin', 'editor', 'staff'].includes(role);

  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around py-3 pb-5 px-2 z-50">
      <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-green-600' : 'text-gray-400'}`}>
        <Home size={24} />
        <span className="text-[10px] mt-1 font-medium">Beranda</span>
      </button>
      {canViewArsip && (
        <button onClick={() => setActiveTab('arsip')} className={`flex flex-col items-center ${activeTab === 'arsip' ? 'text-green-600' : 'text-gray-400'}`}>
          <FileText size={24} />
          <span className="text-[10px] mt-1 font-medium">Arsip</span>
        </button>
      )}
      {canScan && (
        <div className="relative -top-6">
          <button onClick={() => setActiveTab('presensi')} className="bg-green-600 text-white p-4 rounded-full shadow-lg border-4 border-gray-50 flex items-center justify-center">
            <MapPin size={28} />
          </button>
        </div>
      )}
      {canAddArsip && (
        <button onClick={() => setActiveTab('buat')} className={`flex flex-col items-center ${activeTab === 'buat' ? 'text-green-600' : 'text-gray-400'}`}>
          <Plus size={24} />
          <span className="text-[10px] mt-1 font-medium">Buat</span>
        </button>
      )}
      <button onClick={() => setActiveTab('profil')} className={`flex flex-col items-center ${activeTab === 'profil' ? 'text-green-600' : 'text-gray-400'}`}>
        <User size={24} />
        <span className="text-[10px] mt-1 font-medium">Profil</span>
      </button>
    </div>
  );
};

// --- Main Application ---

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
    link.download = `Presensi_MUIJabar_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!currentUser) return <LoginScreen onLogin={handleLogin} logoUrl={logoUrl} />;

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden">
          {activeTab === 'home' && <HomeTab currentUser={currentUser} logoUrl={logoUrl} letters={letters} attendance={attendance} setActiveTab={setActiveTab} />}
          {activeTab === 'arsip' && <ArsipTab letters={letters} searchQuery={searchQuery} setSearchQuery={setSearchQuery} currentUser={currentUser} setEditingLetter={setEditingLetter} setActiveTab={setActiveTab} />}
          {activeTab === 'buat' && <BuatSuratTab formData={formData} setFormData={setFormData} handleAddLetter={handleAddLetter} />}
          {activeTab === 'edit' && <EditSuratTab editingLetter={editingLetter} setEditingLetter={setEditingLetter} handleUpdateLetter={handleUpdateLetter} setActiveTab={setActiveTab} />}
          {activeTab === 'presensi' && <PresensiTab currentUser={currentUser} attendance={attendance} setAttendance={setAttendance} setActiveTab={setActiveTab} />}
          {activeTab === 'profil' && <ProfilTab currentUser={currentUser} attendance={attendance} logoUrl={logoUrl} setLogoUrl={setLogoUrl} setCurrentUser={setCurrentUser} setActiveTab={setActiveTab} exportAttendanceCSV={exportAttendanceCSV} />}
        </div>
        {activeTab !== 'presensi' && activeTab !== 'edit' && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />}
      </div>
    </div>
  );
}

// --- View Tabs ---

const LoginScreen = ({ onLogin, logoUrl }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 w-full max-w-md mx-auto">
      <div className="w-full bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-1 border-4 border-green-50 shadow-md">
          <img src={logoUrl} alt="Logo" className="w-full h-full object-contain rounded-full" onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=MUI" }} />
        </div>
        <h1 className="text-2xl font-bold text-green-800 mb-1">E-Sekretariat.MUIJB</h1>
        <p className="text-sm text-gray-500 mb-8">MUI Provinsi Jawa Barat</p>
        <form onSubmit={(e) => { e.preventDefault(); if(!onLogin(username, password)) setError('Username atau password salah!'); }} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-500 text-xs rounded-lg border border-red-100">{error}</div>}
          <div className="text-left">
            <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50" placeholder="Username" />
          </div>
          <div className="text-left">
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm bg-gray-50" placeholder="Password" />
          </div>
          <button type="submit" className="w-full bg-green-700 text-white font-semibold py-3.5 rounded-xl shadow-md">Masuk</button>
        </form>
      </div>
    </div>
  );
};

const HomeTab = ({ currentUser, logoUrl, letters, attendance, setActiveTab }) => {
  const role = currentUser?.role;
  const todayStr = new Date().toISOString().split('T')[0];
  const userTodayAtt = attendance.find(a => a.date === todayStr && a.name === currentUser?.name && a.type === 'Hadir');

  return (
    <div className="p-4 pb-24 overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-full bg-white p-0.5" />
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-none">E-Sekretariat.MUIJB</h1>
            <p className="text-[10px] text-gray-500 mt-1 uppercase font-medium tracking-wider">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold border border-green-200 uppercase text-xs">{currentUser?.name.substring(0, 2)}</div>
      </div>

      <div className="bg-gradient-to-br from-green-700 to-green-600 rounded-2xl p-5 text-white shadow-lg mb-6 relative overflow-hidden">
        <Award size={100} className="absolute -right-4 -top-4 opacity-10" />
        <h2 className="text-lg font-bold mb-1">Ahlan wa Sahlan, {currentUser?.name.split(',')[0]}!</h2>
        <p className="text-xs text-green-100 mb-4">{currentUser?.title}</p>
        {['admin', 'editor', 'staff'].includes(role) && (
          <div className="bg-white/20 rounded-lg p-3 inline-block backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              {userTodayAtt ? <><CheckCircle2 size={14} className="text-green-200" /><span className="text-xs font-semibold">Absen Hadir: {userTodayAtt.time}</span></> : <><Clock size={14} className="text-yellow-200" /><span className="text-xs font-semibold">Belum Presensi Hari Ini</span></>}
            </div>
          </div>
        )}
      </div>

      {['admin', 'viewer', 'editor'].includes(role) ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><FileDown size={20} /></div>
              <div><p className="text-xl font-bold">{letters.filter(l => l.type === 'A').length}</p><p className="text-[10px] text-gray-400">Internal</p></div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg"><FileUp size={20} /></div>
              <div><p className="text-xl font-bold">{letters.filter(l => l.type === 'B').length}</p><p className="text-[10px] text-gray-400">Eksternal</p></div>
            </div>
          </div>
          <div className="flex justify-between items-center mb-3"><h3 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Aktivitas Terakhir</h3><button onClick={() => setActiveTab('arsip')} className="text-xs text-green-600 font-bold">Lihat Semua</button></div>
          <div className="space-y-3">
            {letters.slice(0, 3).map((letter) => (
              <div key={letter.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-start space-x-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500"><FileText size={18} /></div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 truncate">{letter.title}</h4>
                  <p className="text-[10px] text-green-700 font-mono mt-0.5">{letter.number}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <MapPin size={48} className="mx-auto text-blue-500 mb-4 opacity-30" />
          <h3 className="font-bold text-gray-800 mb-2 text-lg">Presensi GPS</h3>
          <p className="text-xs text-gray-500 mb-6 px-4">Pastikan GPS aktif untuk melakukan absensi kehadiran di kantor.</p>
          <button onClick={() => setActiveTab('presensi')} className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-md">Buka Presensi</button>
        </div>
      )}
    </div>
  );
};

const ArsipTab = ({ letters, searchQuery, setSearchQuery, currentUser, setEditingLetter, setActiveTab }) => {
  const filteredLetters = letters.filter(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()) || l.number.toLowerCase().includes(searchQuery.toLowerCase()));
  return (
    <div className="p-4 pb-24 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Arsip Dokumen</h2>
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        <input type="text" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm outline-none" placeholder="Cari nomor atau perihal..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredLetters.length === 0 ? <div className="text-center py-20 text-gray-400"><FileBox size={48} className="mx-auto mb-2 opacity-10" /><p>Data tidak ditemukan</p></div> : 
        filteredLetters.map((letter) => (
          <div key={letter.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-start space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg text-green-700 shrink-0"><FileText size={18} /></div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-bold text-gray-800 truncate pr-2">{letter.title}</h4>
                {currentUser?.role === 'admin' && <button onClick={() => { setEditingLetter(letter); setActiveTab('edit'); }} className="text-gray-400 hover:text-blue-600"><Edit size={14} /></button>}
              </div>
              <p className="text-xs text-green-700 font-mono mt-1">{letter.number}</p>
              <div className="flex justify-between mt-2"><span className="text-[10px] text-gray-400">{letter.sender}</span><span className="text-[10px] text-gray-400 font-medium">{letter.date}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BuatSuratTab = ({ formData, setFormData, handleAddLetter }) => (
  <div className="p-4 pb-24 h-full overflow-y-auto">
    <h2 className="text-xl font-bold text-gray-800 mb-6">Buat Surat Baru</h2>
    <form onSubmit={handleAddLetter} className="space-y-4">
      <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-4 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          {['A', 'B', 'Kep', 'L'].map(t => (
            <div key={t} onClick={() => setFormData({...formData, type: t})} className={`text-center py-2.5 rounded-lg border text-xs font-bold cursor-pointer ${formData.type === t ? 'bg-green-600 border-green-600 text-white' : 'border-gray-100 text-gray-400 bg-gray-50'}`}>
              {t === 'A' ? 'Internal' : t === 'B' ? 'Eksternal' : t === 'Kep' ? 'Keputusan' : 'Lainnya'}
            </div>
          ))}
        </div>
        <div><label className="text-[10px] font-bold text-gray-400 uppercase">Perihal</label><input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border-b border-gray-100 py-2 text-sm outline-none focus:border-green-600 transition-colors" /></div>
        <div><label className="text-[10px] font-bold text-gray-400 uppercase">Tanggal</label><input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full border-b border-gray-100 py-2 text-sm outline-none" /></div>
        <div><label className="text-[10px] font-bold text-gray-400 uppercase">Tujuan / Pengirim</label><input required type="text" value={formData.sender} onChange={(e) => setFormData({...formData, sender: e.target.value})} className="w-full border-b border-gray-100 py-2 text-sm outline-none" /></div>
      </div>
      <button type="submit" className="w-full bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg">Generate & Simpan Arsip</button>
    </form>
  </div>
);

const EditSuratTab = ({ editingLetter, setEditingLetter, handleUpdateLetter, setActiveTab }) => (
  <div className="p-4 pb-24 h-full overflow-y-auto">
    <div className="flex items-center space-x-3 mb-6"><button onClick={() => { setActiveTab('arsip'); setEditingLetter(null); }}><X size={24} /></button><h2 className="text-xl font-bold text-gray-800">Edit Dokumen</h2></div>
    {editingLetter && (
      <form onSubmit={handleUpdateLetter} className="space-y-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 space-y-4">
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Nomor Surat</label><p className="py-2 text-sm font-mono text-green-700">{editingLetter.number}</p></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Perihal</label><input required type="text" value={editingLetter.title} onChange={(e) => setEditingLetter({...editingLetter, title: e.target.value})} className="w-full border-b border-gray-100 py-2 text-sm outline-none" /></div>
          <div><label className="text-[10px] font-bold text-gray-400 uppercase">Status</label><select value={editingLetter.status} onChange={(e) => setEditingLetter({...editingLetter, status: e.target.value})} className="w-full bg-transparent py-2 text-sm outline-none border-b border-gray-100"><option>Baru</option><option>Diproses</option><option>Selesai</option></select></div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl">Simpan Perubahan</button>
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
    if (!navigator.geolocation) { setMsg({ type: 'err', text: 'GPS tidak didukung' }); setLoading(false); return; }
    navigator.geolocation.getCurrentPosition((pos) => {
      const newAtt = { id: Date.now(), name: currentUser.name, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), date: todayStr, type, lat: pos.coords.latitude, lng: pos.coords.longitude, status: 'Tercatat' };
      setAttendance([newAtt, ...attendance]);
      setMsg({ type: 'success', text: `Absen ${type} Sukses!` });
      setTimeout(() => setActiveTab('home'), 1500);
    }, () => { setMsg({ type: 'err', text: 'Gagal akses GPS' }); setLoading(false); });
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-green-700 text-white p-4 flex items-center space-x-4"><button onClick={() => setActiveTab('home')}><X size={24} /></button><h2 className="font-bold">Presensi Kehadiran</h2></div>
      <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4"><MapPin size={32} /></div>
        <h3 className="text-2xl font-mono font-bold text-gray-800 mb-8">{now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} WIB</h3>
        {msg.text && <div className={`mb-6 p-3 rounded-lg text-xs font-bold ${msg.type === 'err' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-700'}`}>{msg.text}</div>}
        <div className="w-full space-y-3">
          <button disabled={hasHadir || loading} onClick={() => handleAbsen('Hadir')} className={`w-full py-4 rounded-xl font-bold shadow-md ${hasHadir ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white'}`}>{hasHadir ? 'Sudah Hadir' : loading ? 'SINKRON GPS...' : 'ABSEN HADIR'}</button>
          <button disabled={!hasHadir || hasPulang || loading} onClick={() => handleAbsen('Pulang')} className={`w-full py-4 rounded-xl font-bold shadow-md ${hasPulang ? 'bg-gray-100 text-gray-400' : !hasHadir ? 'bg-gray-200 text-gray-500' : 'bg-orange-500 text-white'}`}>{hasPulang ? 'Sudah Pulang' : 'ABSEN PULANG'}</button>
        </div>
      </div>
    </div>
  );
};

const ProfilTab = ({ currentUser, attendance, logoUrl, setLogoUrl, setCurrentUser, exportAttendanceCSV }) => {
  const myAtt = attendance.filter(a => a.name === currentUser?.name);
  return (
    <div className="p-4 pb-24 h-full overflow-y-auto">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center mb-6">
        <div className="w-20 h-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold uppercase">{currentUser?.name.substring(0, 2)}</div>
        <h3 className="font-bold text-gray-800">{currentUser?.name}</h3>
        <p className="text-xs text-green-600 font-medium">{currentUser?.title}</p>
      </div>
      {currentUser?.role === 'admin' && (
        <div className="bg-green-50 p-4 rounded-2xl mb-6 border border-green-100 space-y-4">
          <div className="flex items-center space-x-2 text-green-800 font-bold text-sm"><Shield size={16} /><span>Admin Panel</span></div>
          <div><label className="text-[10px] text-green-700 font-bold uppercase block mb-1">URL Logo</label><input type="text" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="w-full p-2 text-xs rounded-lg border border-green-200 outline-none" /></div>
          <button onClick={exportAttendanceCSV} className="w-full bg-white border border-green-200 text-green-700 py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2"><Download size={14} /><span>Ekspor CSV</span></button>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 font-bold text-xs text-gray-400 uppercase tracking-widest">Riwayat Absensi</div>
        <div className="p-4 space-y-3">
          {myAtt.length === 0 ? <p className="text-center text-[10px] text-gray-400">Belum ada riwayat</p> : myAtt.map((a, i) => (
            <div key={i} className="flex justify-between items-center text-xs border-b border-gray-50 pb-2"><div className="font-medium text-gray-700">{a.date} <span className="text-gray-400 font-normal">({a.type})</span></div><div className="text-green-600 font-mono">{a.time}</div></div>
          ))}
        </div>
        <button onClick={() => window.location.reload()} className="w-full py-4 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center justify-center space-x-2"><LogOut size={14} /><span>Keluar Aplikasi</span></button>
      </div>
    </div>
  );
};