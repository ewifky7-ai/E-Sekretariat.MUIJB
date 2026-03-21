import React, { useState, useEffect } from 'react';
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

const USERS = [
  { id: 1, username: 'ketua', password: 'ketua123', name: 'Ketua Umum MUI Jawa Barat', role: 'viewer', title: 'Ketua Umum' },
  { id: 2, username: 'sekum', password: 'sekum123', name: 'Sekretaris Umum MUI Jawa Barat', role: 'viewer', title: 'Sekretaris Umum' },
  { id: 3, username: 'admin', password: 'admin123', name: 'Eky Wifky Afandi, M.Ag', role: 'admin', title: 'Admin' },
  { id: 4, username: 'ruhiyat', password: 'ruhiyat123', name: 'H. Ruhiyat', role: 'editor', title: 'Sekretariat Umum' },
  { id: 5, username: 'rani', password: 'rani123', name: 'Rani Nurita Yusuf', role: 'editor', title: 'Sekretariat Keuangan' },
  { id: 6, username: 'dedih', password: 'dedih123', name: 'Dedih Alyadi', role: 'staff', title: 'Staff' },
  { id: 7, username: 'erik', password: 'erik123', name: 'Erik', role: 'staff', title: 'Staff' },
];

// --- Utility Functions ---
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

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingLetter, setEditingLetter] = useState(null);
  const [logoUrl, setLogoUrl] = useState('Logo MUI 1080.png');
  
  // --- Mock Data States ---
  const [letters, setLetters] = useState([
    { id: 1, title: 'Undangan Rapat Pleno', type: 'A', seq: 12, date: '2026-03-21', number: 'A-012/DP.P-XII/III/2026', sender: 'Sekretaris Umum', status: 'Selesai' },
    { id: 2, title: 'Fatwa Halal Produk XYZ', type: 'Kep', seq: 48, date: '2026-03-20', number: 'Kep-048/DP.P-XII/III/2026', sender: 'Komisi Fatwa', status: 'Selesai' },
    { id: 3, title: 'Himbauan Ramadhan 1447 H', type: 'B', seq: 25, date: '2026-03-15', number: 'B-025/DP.P-XII/III/2026', sender: 'Ketua Umum', status: 'Selesai' },
  ]);

  const [attendance, setAttendance] = useState([
    { id: 1, name: 'Ahmad Fulan', time: '07:45', date: '2026-03-21', type: 'Hadir', lat: -6.9315, lng: 107.7169, status: 'Tercatat' }
  ]);

  // --- Form State ---
  const [formData, setFormData] = useState({
    title: '',
    type: 'A',
    date: new Date().toISOString().split('T')[0],
    sender: '',
    description: ''
  });

  const handleAddLetter = (e) => {
    e.preventDefault();
    const sameTypeLetters = letters.filter(l => l.type === formData.type);
    const nextSeq = sameTypeLetters.length > 0 ? Math.max(...sameTypeLetters.map(l => l.seq)) + 1 : 1;
    
    const newLetterNumber = generateLetterNumber(formData.type, nextSeq, formData.date);
    
    const newLetter = {
      id: Date.now(),
      title: formData.title,
      type: formData.type,
      seq: nextSeq,
      date: formData.date,
      number: newLetterNumber,
      sender: formData.sender,
      status: 'Baru'
    };

    setLetters([newLetter, ...letters]);
    setActiveTab('arsip');
    setFormData({ title: '', type: 'A', date: new Date().toISOString().split('T')[0], sender: '', description: '' });
  };

  const handleUpdateLetter = (e) => {
    e.preventDefault();
    const updatedLetters = letters.map(l => 
      l.id === editingLetter.id ? editingLetter : l
    );
    setLetters(updatedLetters);
    setActiveTab('arsip');
    setEditingLetter(null);
  };

  // --- Admin Feature: Export CSV ---
  const exportAttendanceCSV = () => {
    const headers = ['ID', 'Nama Staff', 'Tanggal', 'Waktu', 'Tipe Presensi', 'Latitude', 'Longitude', 'Status'];
    const rows = attendance.map(a => 
      [a.id, `"${a.name}"`, a.date, a.time, a.type, a.lat, a.lng, a.status].join(',')
    );
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Data_Presensi_MUI_Jabar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- UI Components ---
  const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleLogin = (e) => {
      e.preventDefault();
      setError('');
      const user = USERS.find(u => u.username === username.toLowerCase() && u.password === password);
      
      if (user) {
        setCurrentUser(user);
        setActiveTab('home');
      } else {
        setError('Username atau password salah!');
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full p-1 border-4 border-green-50 shadow-md">
            <img src={logoUrl} alt="Logo MUI Jawa Barat" className="w-full h-full object-contain rounded-full" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=MUI" }} />
          </div>
          <h1 className="text-2xl font-bold text-green-800 mb-1">E-Sekretariat.MUIJB</h1>
          <p className="text-sm text-gray-500 mb-8">MUI Provinsi Jawa Barat</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-xs rounded-lg font-medium border border-red-100">
                {error}
              </div>
            )}
            
            <div className="text-left">
              <label className="block text-xs font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                placeholder="Masukkan username..."
              />
            </div>
            
            <div className="text-left">
              <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                placeholder="Masukkan password..."
              />
            </div>
            
            <div className="pt-2">
              <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3.5 rounded-xl shadow-md transition-colors">
                Masuk Aplikasi
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const BottomNav = () => {
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
            <button 
              onClick={() => setActiveTab('presensi')} 
              className="bg-green-600 text-white p-4 rounded-full shadow-lg border-4 border-gray-50 flex items-center justify-center"
            >
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

  const HomeTab = () => {
    const role = currentUser?.role;
    const canViewArsip = ['admin', 'viewer', 'editor'].includes(role);

    // Cek apakah user sudah absen hari ini
    const todayStr = new Date().toISOString().split('T')[0];
    const userTodayAtt = attendance.find(a => a.date === todayStr && a.name === currentUser?.name && a.type === 'Hadir');

    return (
      <div className="p-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-full bg-white p-0.5" onError={(e) => { e.target.style.display = 'none' }} />
            <div>
              <h1 className="text-lg font-bold text-gray-800">E-Sekretariat.MUIJB</h1>
              <p className="text-xs text-gray-500">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold border border-green-200 uppercase text-sm shrink-0">
            {currentUser?.name.substring(0, 2)}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-700 to-green-600 rounded-2xl p-5 text-white shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Award size={120} />
          </div>
          <h2 className="text-lg font-semibold mb-1">Selamat Datang, {currentUser?.name.split(',')[0]}!</h2>
          <p className="text-sm text-green-100 mb-4">{currentUser?.title}</p>
          
          {['admin', 'editor', 'staff'].includes(role) && (
            <div className="bg-white/20 rounded-lg p-3 inline-block backdrop-blur-sm">
              <p className="text-xs text-green-50">Status Kehadiran Hari Ini</p>
              <div className="flex items-center space-x-2 mt-1">
                {userTodayAtt ? (
                  <>
                    <CheckCircle2 size={16} className="text-green-200" />
                    <span className="font-semibold text-sm">Sudah Hadir ({userTodayAtt.time})</span>
                  </>
                ) : (
                  <>
                    <Clock size={16} className="text-yellow-200" />
                    <span className="font-semibold text-sm text-yellow-50">Belum Presensi</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {canViewArsip && (
          <>
            <h3 className="font-semibold text-gray-700 mb-3">Statistik Arsip</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileDown size={20} /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{letters.filter(l => l.type === 'A').length}</p>
                  <p className="text-xs text-gray-500">Surat Internal</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><FileUp size={20} /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{letters.filter(l => l.type === 'B').length}</p>
                  <p className="text-xs text-gray-500">Surat Eksternal</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Award size={20} /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{letters.filter(l => l.type === 'Kep').length}</p>
                  <p className="text-xs text-gray-500">Keputusan</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
                <div className="p-3 bg-gray-50 text-gray-600 rounded-lg"><FileText size={20} /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{letters.filter(l => l.type === 'L').length}</p>
                  <p className="text-xs text-gray-500">Surat Lain</p>
                </div>
              </div>
              <div className="col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3 justify-center">
                <div className="p-3 bg-green-50 text-green-600 rounded-lg"><FileBox size={20} /></div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{letters.length}</p>
                  <p className="text-xs text-gray-500">Total Keseluruhan Arsip</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">Aktivitas Terakhir</h3>
              <button onClick={() => setActiveTab('arsip')} className="text-xs text-green-600 font-medium">Lihat Semua</button>
            </div>
            <div className="space-y-3">
              {letters.slice(0, 3).map((letter) => (
                <div key={letter.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-3">
                   <div className={`p-2 rounded-lg mt-1 ${letter.type === 'A' ? 'bg-blue-50 text-blue-600' : letter.type === 'B' ? 'bg-orange-50 text-orange-600' : letter.type === 'Kep' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'}`}>
                      {letter.type === 'A' ? <FileDown size={18} /> : letter.type === 'B' ? <FileUp size={18} /> : letter.type === 'Kep' ? <Award size={18} /> : <FileText size={18} />}
                   </div>
                   <div className="flex-1">
                     <h4 className="text-sm font-semibold text-gray-800 leading-tight">{letter.title}</h4>
                     <p className="text-xs text-green-700 font-mono mt-1">{letter.number}</p>
                     <p className="text-[10px] text-gray-400 mt-1">{letter.date} • {letter.sender}</p>
                   </div>
                </div>
              ))}
            </div>
          </>
        )}

        {role === 'staff' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center mt-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin size={28} />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Presensi GPS Realtime</h3>
            <p className="text-xs text-gray-500 mb-5">Gunakan fitur ini untuk mencatat kehadiran serta lokasi absensi Anda.</p>
            <button onClick={() => setActiveTab('presensi')} className="px-6 py-3 bg-green-600 text-white rounded-full text-sm font-semibold hover:bg-green-700 transition-colors w-full shadow-md flex items-center justify-center space-x-2">
              <MapPin size={18} />
              <span>Buka Menu Presensi</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const ArsipTab = () => {
    const filteredLetters = letters.filter(l => 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="p-4 pb-24 h-full flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Arsip Dokumen</h2>
        
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm"
            placeholder="Cari nomor atau perihal surat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          <button className="px-4 py-1.5 bg-green-600 text-white text-xs rounded-full whitespace-nowrap">Semua</button>
          <button className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs rounded-full whitespace-nowrap">Surat Internal (A)</button>
          <button className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs rounded-full whitespace-nowrap">Surat Eksternal (B)</button>
          <button className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs rounded-full whitespace-nowrap">Keputusan (Kep)</button>
          <button className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs rounded-full whitespace-nowrap">Surat Lain (L)</button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {filteredLetters.length === 0 ? (
             <div className="text-center py-10 text-gray-400">
               <FileBox size={48} className="mx-auto mb-3 opacity-20" />
               <p>Dokumen tidak ditemukan</p>
             </div>
          ) : (
            filteredLetters.map((letter) => (
              <div key={letter.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-3">
                 <div className={`p-2 rounded-lg mt-1 ${letter.type === 'A' ? 'bg-blue-50 text-blue-600' : letter.type === 'B' ? 'bg-orange-50 text-orange-600' : letter.type === 'Kep' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600'}`}>
                    {letter.type === 'A' ? <FileDown size={18} /> : letter.type === 'B' ? <FileUp size={18} /> : letter.type === 'Kep' ? <Award size={18} /> : <FileText size={18} />}
                 </div>
                 <div className="flex-1">
                   <div className="flex justify-between items-start">
                     <div className="flex items-start space-x-2">
                       <h4 className="text-sm font-semibold text-gray-800 leading-tight pr-2">{letter.title}</h4>
                       <span className="text-[9px] px-2 py-0.5 bg-gray-100 rounded text-gray-600">{letter.status}</span>
                 </div>
                 {currentUser?.role === 'admin' && (
                   <button onClick={() => { setEditingLetter(letter); setActiveTab('edit'); }} className="text-gray-400 hover:text-green-600 transition-colors p-1 bg-gray-50 rounded-md">
                     <Edit size={14} />
                   </button>
                 )}
               </div>
               <p className="text-xs text-green-700 font-mono mt-1.5">{letter.number}</p>
                   <div className="flex justify-between items-center mt-2">
                     <p className="text-[10px] text-gray-500">{letter.sender}</p>
                     <p className="text-[10px] text-gray-400">{letter.date}</p>
                   </div>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const BuatSuratTab = () => (
    <div className="p-4 pb-24 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Registrasi Surat Baru</h2>
      
      <form onSubmit={handleAddLetter} className="space-y-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Klasifikasi Surat</label>
            <div className="grid grid-cols-2 gap-2">
              <div 
                onClick={() => setFormData({...formData, type: 'A'})}
                className={`text-center py-2 px-1 rounded-lg border text-xs cursor-pointer transition-colors ${formData.type === 'A' ? 'bg-green-50 border-green-500 text-green-700 font-semibold' : 'border-gray-200 text-gray-500'}`}
              >
                Internal (A)
              </div>
              <div 
                onClick={() => setFormData({...formData, type: 'B'})}
                className={`text-center py-2 px-1 rounded-lg border text-xs cursor-pointer transition-colors ${formData.type === 'B' ? 'bg-green-50 border-green-500 text-green-700 font-semibold' : 'border-gray-200 text-gray-500'}`}
              >
                Eksternal (B)
              </div>
              <div 
                onClick={() => setFormData({...formData, type: 'Kep'})}
                className={`text-center py-2 px-1 rounded-lg border text-xs cursor-pointer transition-colors ${formData.type === 'Kep' ? 'bg-green-50 border-green-500 text-green-700 font-semibold' : 'border-gray-200 text-gray-500'}`}
              >
                Keputusan (Kep)
              </div>
              <div 
                onClick={() => setFormData({...formData, type: 'L'})}
                className={`text-center py-2 px-1 rounded-lg border text-xs cursor-pointer transition-colors ${formData.type === 'L' ? 'bg-green-50 border-green-500 text-green-700 font-semibold' : 'border-gray-200 text-gray-500'}`}
              >
                Lainnya (L)
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              *Nomor surat akan dibuat otomatis: <span className="font-mono text-green-600">{formData.type}-XXX/DP.P-XII/[Bulan]/[Tahun]</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Perihal / Judul Surat</label>
            <input 
              required
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Contoh: Undangan Rapat Evaluasi"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Surat</label>
            <input 
              required
              type="date" 
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Tujuan / Pengirim</label>
            <input 
              required
              type="text" 
              value={formData.sender}
              onChange={(e) => setFormData({...formData, sender: e.target.value})}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Instansi tujuan atau bidang pengirim"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Keterangan Singkat (Opsional)</label>
            <textarea 
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
              placeholder="Catatan tambahan..."
            ></textarea>
          </div>

        </div>

        <button 
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center space-x-2"
        >
          <FileText size={18} />
          <span>Buat & Generate Nomor</span>
        </button>
      </form>
    </div>
  );

  const EditSuratTab = () => (
    <div className="p-4 pb-24 h-full overflow-y-auto">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => { setActiveTab('arsip'); setEditingLetter(null); }} className="text-gray-500 hover:text-gray-800">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">Edit Arsip Surat</h2>
      </div>
      
      {editingLetter && (
        <form onSubmit={handleUpdateLetter} className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nomor Surat (Otomatis)</label>
              <input 
                disabled
                type="text" 
                value={editingLetter.number}
                className="w-full border border-gray-200 bg-gray-50 rounded-lg p-2.5 text-sm outline-none font-mono text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Perihal / Judul Surat</label>
              <input 
                required
                type="text" 
                value={editingLetter.title}
                onChange={(e) => setEditingLetter({...editingLetter, title: e.target.value})}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tujuan / Pengirim</label>
              <input 
                required
                type="text" 
                value={editingLetter.sender}
                onChange={(e) => setEditingLetter({...editingLetter, sender: e.target.value})}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select 
                value={editingLetter.status}
                onChange={(e) => setEditingLetter({...editingLetter, status: e.target.value})}
                className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
              >
                <option value="Baru">Baru</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Dibatalkan">Dibatalkan</option>
              </select>
            </div>

          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-md transition-colors flex justify-center items-center space-x-2"
          >
            <Edit size={18} />
            <span>Simpan Perubahan</span>
          </button>
        </form>
      )}
    </div>
  );

  // --- GPS Attendance Tab ---
  const PresensiTab = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const now = new Date();
    const currentHours = now.getHours();
    const dateStr = now.toISOString().split('T')[0];

    // Cek apakah hari ini sudah absen hadir atau pulang
    const todayAtts = attendance.filter(a => a.date === dateStr && a.name === currentUser?.name);
    const hasCheckedIn = todayAtts.some(a => a.type === 'Hadir');
    const hasCheckedOut = todayAtts.some(a => a.type === 'Pulang');

    // Rule Absen: Hadir mulai 09:00, Pulang mulai 15:00
    const canHadir = currentHours >= 9 && !hasCheckedIn;
    const canPulang = currentHours >= 15 && hasCheckedIn && !hasCheckedOut;

    const handleAbsen = (type) => {
      setIsLoading(true);
      setErrorMsg('');
      
      if (!navigator.geolocation) {
        setErrorMsg('Perangkat atau browser Anda tidak mendukung fitur GPS Geolocation.');
        setIsLoading(false);
        return;
      }

      // Mendapatkan GPS Real-time
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const timeStr = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          
          const newAtt = {
            id: Date.now(),
            name: currentUser.name,
            time: timeStr,
            date: dateStr,
            type: type,
            lat: lat,
            lng: lng,
            status: 'Tercatat'
          };

          setAttendance([newAtt, ...attendance]);
          setIsLoading(false);
          setSuccessMsg(`Absen ${type} berhasil dicatat dengan lokasi terkini!`);
          
          setTimeout(() => {
            setActiveTab('home');
          }, 2000);
        },
        (err) => {
          setErrorMsg('Gagal mendapatkan lokasi. Pastikan GPS aktif dan Anda mengizinkan akses lokasi pada browser.');
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    return (
      <div className="h-full bg-gray-50 flex flex-col relative pb-20">
        <div className="bg-green-700 text-white p-4 flex justify-between items-center shadow-md">
          <button onClick={() => setActiveTab('home')} className="p-2">
            <X size={24} />
          </button>
          <h2 className="font-semibold text-lg">Presensi GPS</h2>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <MapPin size={48} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 mb-1">Validasi Lokasi</h3>
          <p className="text-sm text-center text-gray-500 px-4 mb-8">
            Pastikan Anda berada di area kantor MUI Provinsi Jawa Barat. Sistem akan merekam titik kordinat absensi Anda.
          </p>

          <div className="w-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
            <div className="text-center mb-4 pb-4 border-b border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Waktu Saat Ini</p>
              <p className="text-3xl font-mono font-bold text-gray-800">
                {now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} <span className="text-sm text-gray-500">WIB</span>
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 text-center">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-100 text-center font-semibold">
                {successMsg}
              </div>
            )}

            <div className="space-y-3">
              <button 
                disabled={!canHadir || isLoading || hasCheckedIn}
                onClick={() => handleAbsen('Hadir')}
                className={`w-full py-4 rounded-xl font-bold shadow-md flex items-center justify-center space-x-2 transition-all ${
                  hasCheckedIn ? 'bg-gray-100 text-gray-400 border border-gray-200' 
                  : canHadir ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading && !hasCheckedIn ? (
                  <span className="animate-pulse">Mengambil Lokasi GPS...</span>
                ) : hasCheckedIn ? (
                  <span>Sudah Absen Hadir</span>
                ) : (
                  <>
                    <Clock size={18} />
                    <span>ABSEN HADIR</span>
                    {!canHadir && !hasCheckedIn && <span className="text-[10px] font-normal ml-2">(Mulai 09:00)</span>}
                  </>
                )}
              </button>

              <button 
                disabled={!canPulang || isLoading || hasCheckedOut}
                onClick={() => handleAbsen('Pulang')}
                className={`w-full py-4 rounded-xl font-bold shadow-md flex items-center justify-center space-x-2 transition-all ${
                  hasCheckedOut ? 'bg-gray-100 text-gray-400 border border-gray-200'
                  : canPulang ? 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading && hasCheckedIn && !hasCheckedOut ? (
                  <span className="animate-pulse">Mengambil Lokasi GPS...</span>
                ) : hasCheckedOut ? (
                  <span>Sudah Absen Pulang</span>
                ) : (
                  <>
                    <MapPin size={18} />
                    <span>ABSEN PULANG</span>
                    {!hasCheckedIn && !hasCheckedOut && <span className="text-[10px] font-normal ml-2">(Hadir Dulu)</span>}
                    {hasCheckedIn && !canPulang && !hasCheckedOut && <span className="text-[10px] font-normal ml-2">(Mulai 15:00)</span>}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfilTab = () => {
    const myAttendance = attendance.filter(a => a.name === currentUser?.name);

    return (
      <div className="p-4 pb-24 h-full overflow-y-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Profil Pengguna</h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-2xl border-4 border-white shadow-md mb-3 uppercase">
            {currentUser?.name.substring(0, 2)}
          </div>
          <h3 className="text-lg font-bold text-gray-800">{currentUser?.name}</h3>
          <p className="text-sm text-green-600 font-medium mb-1">{currentUser?.title}</p>
          <p className="text-xs text-gray-500">MUI Provinsi Jawa Barat</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {currentUser?.role === 'admin' && (
            <div className="p-4 border-b border-gray-50 bg-green-50 flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <Shield size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-green-800">Administrator Panel</h4>
                  <p className="text-[10px] text-green-600">Hak akses mengelola aplikasi.</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-green-200/50">
                <label className="block text-xs font-medium text-green-800 mb-1">Ubah Logo Aplikasi (Path/URL)</label>
                <input 
                  type="text" 
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full border border-green-200 rounded-lg p-2 text-xs focus:ring-2 focus:ring-green-500 outline-none mb-1"
                  placeholder="Masukkan nama file atau URL gambar..."
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-green-800 mb-2">Export Data Kehadiran Staff</label>
                <button 
                  onClick={exportAttendanceCSV}
                  className="w-full bg-white border border-green-300 text-green-700 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 hover:bg-green-100 transition-colors"
                >
                  <Download size={14} />
                  <span>Download .CSV (Spreadsheet)</span>
                </button>
              </div>
            </div>
          )}
          
          <div className="p-4 border-b border-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Riwayat Absensi Anda (Mingguan)</h4>
            <div className="space-y-3">
              {myAttendance.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Belum ada data absensi.</p>
              ) : (
                myAttendance.map((att, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <div className="flex items-start space-x-3">
                      <div className={`mt-1 w-2 h-2 rounded-full ${att.type === 'Hadir' ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
                      <div>
                        <p className="text-sm text-gray-800 font-medium">{att.date}</p>
                        <p className="text-[10px] text-gray-500">{att.type} • {att.time} WIB</p>
                        <p className="text-[9px] text-gray-400 font-mono mt-0.5" title="Koordinat GPS">
                          Lat: {att.lat?.toFixed(5) || '-'} | Lng: {att.lng?.toFixed(5) || '-'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-md border border-green-200">
                      {att.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <button 
            onClick={() => {
              setCurrentUser(null);
              setActiveTab('home');
            }}
            className="w-full py-4 text-sm text-red-500 font-semibold hover:bg-red-50 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut size={16} />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex justify-center">
        <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative overflow-hidden">
          <LoginScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex justify-center">
      <div className="w-full max-w-md bg-gray-50 min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        
        {/* Render area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'home' && <HomeTab />}
          {activeTab === 'arsip' && <ArsipTab />}
          {activeTab === 'buat' && <BuatSuratTab />}
          {activeTab === 'edit' && <EditSuratTab />}
          {activeTab === 'presensi' && <PresensiTab />}
          {activeTab === 'profil' && <ProfilTab />}
        </div>

        {/* Bottom Navigation tidak tampil saat mode edit atau presensi */}
        {activeTab !== 'presensi' && activeTab !== 'edit' && <BottomNav />}
      </div>
    </div>
  );
}