// ==================== KONFIGURASI ====================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzCy0IA8NAf2m9Bd90QNAEmIwVi_euT37Ut0_-hlZKk563vtpV3xVV0GFIHMbswsSny/exec';

// ==================== STATE ====================
let user = null;
let currentPage = 'home';
let selectedMonth = null;

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('absenq_user');
  if (saved) {
    user = JSON.parse(saved);
    showApp();
  } else {
    showLogin();
  }
});

// ==================== API HELPER ====================
async function api(action, data = {}) {
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...data })
    });
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    return { status: 'error', message: e.message };
  }
}

// ==================== LOGIN PAGE ====================
function showLogin() {
  document.getElementById('app').innerHTML = `
    <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f5f5f5; padding:20px;">
      <div style="background:white; padding:30px; border-radius:16px; width:100%; max-width:360px; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <div style="text-align:center; margin-bottom:24px;">
          <div style="width:64px; height:64px; background:#800000; border-radius:16px; margin:0 auto 12px; display:flex; align-items:center; justify-content:center;">
            <span style="color:white; font-size:28px; font-weight:bold;">E</span>
          </div>
          <h1 style="font-size:22px; font-weight:bold; color:#1a1a1a; margin:0;">absEnQ</h1>
          <p style="color:#666; font-size:14px; margin:4px 0 0;">Absensi Karyawan</p>
        </div>
        <input id="loginUser" type="text" placeholder="Username" style="width:100%; padding:12px 16px; border:2px solid #e5e5e5; border-radius:10px; font-size:15px; margin-bottom:12px; box-sizing:border-box;">
        <input id="loginPass" type="password" placeholder="Password" style="width:100%; padding:12px 16px; border:2px solid #e5e5e5; border-radius:10px; font-size:15px; margin-bottom:16px; box-sizing:border-box;">
        <button onclick="doLogin()" style="width:100%; padding:14px; background:#800000; color:white; border:none; border-radius:10px; font-size:16px; font-weight:bold; cursor:pointer;">Masuk</button>
        <p id="loginMsg" style="color:#dc2626; font-size:13px; text-align:center; margin-top:12px; min-height:18px;"></p>
      </div>
    </div>
  `;
}

async function doLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  const msg = document.getElementById('loginMsg');
  
  if (!username || !password) {
    msg.textContent = 'Username dan password wajib diisi';
    return;
  }
  
  msg.textContent = 'Memproses...';
  const res = await api('login', { username, password });
  
  if (res.status === 'success') {
    user = res;
    localStorage.setItem('absenq_user', JSON.stringify(user));
    showApp();
  } else {
    msg.textContent = res.message || 'Login gagal';
  }
}

function logout() {
  localStorage.removeItem('absenq_user');
  user = null;
  showLogin();
}

// ==================== MAIN APP ====================
function showApp() {
  document.getElementById('app').innerHTML = `
    <div style="min-height:100vh; background:#f5f5f5; padding-bottom:80px;">
      <div id="pageContent"></div>
      ${renderBottomNav()}
    </div>
  `;
  navigateTo('home');
}

function renderBottomNav() {
  const items = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'rekap', icon: '📋', label: 'Rekap' },
    { id: 'patroli', icon: '🚶', label: 'Patroli' },
    { id: 'kejadian', icon: '️', label: 'Kejadian' },
    { id: 'pembinaan', icon: '📚', label: 'Pembinaan' }
  ];
  
  return `
    <div style="position:fixed; bottom:0; left:0; right:0; background:white; border-top:1px solid #e5e5e5; display:flex; z-index:100;">
      ${items.map(item => `
        <button onclick="navigateTo('${item.id}')" style="flex:1; padding:10px 0; background:none; border:none; cursor:pointer; text-align:center;">
          <div style="font-size:20px;">${item.icon}</div>
          <div style="font-size:11px; color:${currentPage === item.id ? '#800000' : '#666'}; font-weight:${currentPage === item.id ? 'bold' : 'normal'};">${item.label}</div>
        </button>
      `).join('')}
    </div>
  `;
}

function navigateTo(page) {
  currentPage = page;
  const content = document.getElementById('pageContent');
  
  if (page === 'home') renderHome(content);
  else if (page === 'rekap') renderRekap(content);
  else if (page === 'patroli') renderPatroli(content);
  else if (page === 'kejadian') renderKejadian(content);
  else if (page === 'pembinaan') renderPembinaan(content);
}

// ==================== HOME PAGE ====================
async function renderHome(el) {
  el.innerHTML = `
    <div style="background:#800000; color:white; padding:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <p style="font-size:13px; opacity:0.9; margin:0;">Selamat datang,</p>
          <h1 style="font-size:20px; font-weight:bold; margin:4px 0 0;">${user.nama}</h1>
        </div>
        <button onclick="logout()" style="background:rgba(255,255,255,0.2); border:none; color:white; padding:8px 14px; border-radius:8px; cursor:pointer; font-size:13px;">Keluar</button>
      </div>
    </div>
    <div style="padding:20px;">
      <div id="homeContent">Memuat...</div>
    </div>
  `;
  
  const res = await api('cekStatus', { username: user.username });
  const homeContent = document.getElementById('homeContent');
  
  if (res.status === 'success') {
    homeContent.innerHTML = `
      <div style="background:white; padding:20px; border-radius:12px; margin-bottom:16px;">
        <h3 style="margin:0 0 16px; font-size:16px;">Status Hari Ini</h3>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <div>
            <p style="margin:0; color:#666; font-size:13px;">Jam Masuk</p>
            <p style="margin:4px 0 0; font-size:20px; font-weight:bold; color:#059669;">${res.jamMasuk}</p>
          </div>
          <div>
            <p style="margin:0; color:#666; font-size:13px;">Jam Pulang</p>
            <p style="margin:4px 0 0; font-size:20px; font-weight:bold; color:#dc2626;">${res.jamPulang}</p>
          </div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <button onclick="doAbsen('Masuk')" ${!res.bisaIn ? 'disabled' : ''} style="padding:16px; background:${res.bisaIn ? '#059669' : '#ccc'}; color:white; border:none; border-radius:12px; font-size:15px; font-weight:bold; cursor:${res.bisaIn ? 'pointer' : 'not-allowed'};">
          Absen Masuk
        </button>
        <button onclick="doAbsen('Pulang')" ${!res.bisaOut ? 'disabled' : ''} style="padding:16px; background:${res.bisaOut ? '#dc2626' : '#ccc'}; color:white; border:none; border-radius:12px; font-size:15px; font-weight:bold; cursor:${res.bisaOut ? 'pointer' : 'not-allowed'};">
          Absen Pulang
        </button>
      </div>
    `;
  } else {
    homeContent.innerHTML = `<p style="color:#dc2626;">${res.message}</p>`;
  }
}

async function doAbsen(tipe) {
  if (!confirm(`Yakin absen ${tipe}?`)) return;
  
  let lat = 0, long = 0;
  if (navigator.geolocation) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      lat = pos.coords.latitude;
      long = pos.coords.longitude;
    } catch (e) {
      alert('Gagal mengambil lokasi');
      return;
    }
  }
  
  alert('Memproses absen...');
  const res = await api('absen', {
    tipeAbsen: tipe,
    username: user.username,
    lat, long,
    foto: 'data:image/jpeg;base64,dummy'
  });
  
  alert(res.message || 'Absen berhasil');
  navigateTo('home');
}

// ==================== REKAP PAGE ====================
function renderRekap(el) {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const now = new Date();
  const currentMonth = `${String(now.getMonth() + 1).padStart(2, '0')}_${now.getFullYear()}`;
  
  if (!selectedMonth) selectedMonth = currentMonth;
  
  const [y, m] = selectedMonth.split('_').map(Number);
  const monthName = `${months[m - 1]} ${y}`;
  
  el.innerHTML = `
    <div style="padding:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h1 style="font-size:22px; font-weight:bold; margin:0;">Rekap Absensi</h1>
        <button onclick="loadRekap()" style="background:#800000; color:white; border:none; padding:10px 16px; border-radius:8px; cursor:pointer; font-size:14px;">🔄 Refresh</button>
      </div>
      
      <div style="background:white; padding:16px; border-radius:12px; margin-bottom:16px;">
        <label style="font-size:13px; color:#666; display:block; margin-bottom:8px;">Pilih Bulan</label>
        <select id="selectBulan" onchange="changeMonth(this.value)" style="width:100%; padding:12px; border:2px solid #e5e5e5; border-radius:8px; font-size:15px;">
          ${generateMonthOptions(currentMonth)}
        </select>
      </div>
      
      <div style="background:white; padding:16px; border-radius:12px; margin-bottom:16px;">
        <p style="margin:0 0 12px; color:#666; font-size:14px;">Bulan: ${monthName}</p>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
          <div style="background:#ecfdf5; padding:16px; border-radius:10px; text-align:center;">
            <div id="totalHadir" style="font-size:28px; font-weight:bold; color:#059669;">0</div>
            <div style="font-size:13px; color:#666;">Hadir</div>
          </div>
          <div style="background:#fef3c7; padding:16px; border-radius:10px; text-align:center;">
            <div id="totalIzin" style="font-size:28px; font-weight:bold; color:#d97706;">0</div>
            <div style="font-size:13px; color:#666;">Izin</div>
          </div>
          <div style="background:#fee2e2; padding:16px; border-radius:10px; text-align:center;">
            <div id="totalAlpha" style="font-size:28px; font-weight:bold; color:#dc2626;">0</div>
            <div style="font-size:13px; color:#666;">Alpha</div>
          </div>
        </div>
      </div>
      
      <div style="background:white; padding:16px; border-radius:12px;">
        <h3 style="margin:0 0 16px; font-size:16px;">Riwayat Absensi Anda</h3>
        <div id="listRekap">
          <p style="color:#999; text-align:center; padding:40px 0;">Memuat data...</p>
        </div>
      </div>
    </div>
  `;
  
  loadRekap();
}

function generateMonthOptions(currentMonth) {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const now = new Date();
  let html = '';
  
  for (let y = now.getFullYear(); y >= now.getFullYear() - 2; y--) {
    for (let m = 12; m >= 1; m--) {
      const key = `${String(m).padStart(2, '0')}_${y}`;
      const selected = key === currentMonth ? 'selected' : '';
      html += `<option value="${key}" ${selected}>${months[m - 1]} ${y}</option>`;
    }
  }
  
  return html;
}

function changeMonth(val) {
  selectedMonth = val;
  loadRekap();
}

async function loadRekap() {
  const listEl = document.getElementById('listRekap');
  if (!listEl) return;
  
  const bulan = selectedMonth;
  const bulanParam = bulan.replace('_', '/');
  
  listEl.innerHTML = '<p style="text-align:center; color:#999; padding:20px;">Memuat...</p>';
  
  document.getElementById('totalHadir').textContent = '0';
  document.getElementById('totalIzin').textContent = '0';
  document.getElementById('totalAlpha').textContent = '0';
  
  try {
    const res = await api('getRekapFromSheetBulanan', {
      username: user.username,
      bulan: bulanParam
    });
    
    console.log('Rekap response:', res);
    
    if (res.status !== 'success' || !res.data || res.data.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:#999;">
          <div style="font-size:48px; margin-bottom:12px;">📅</div>
          <p style="margin:0;">Belum ada data absensi</p>
        </div>
      `;
      return;
    }
    
    // Group data per tanggal
    const grouped = {};
    res.data.forEach(item => {
      if (!grouped[item.tanggal]) grouped[item.tanggal] = {};
      if (item.keterangan === 'IN') grouped[item.tanggal].in = item.jam;
      if (item.keterangan === 'OUT') grouped[item.tanggal].out = item.jam;
    });
    
    // Hitung statistik
    let hadir = 0, izin = 0, alpha = 0;
    const [y, m] = bulan.split('_').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    
    Object.values(grouped).forEach(d => {
      if (d.in && d.out) hadir++;
      else if (d.in && !d.out) hadir++;
    });
    
    document.getElementById('totalHadir').textContent = hadir;
    document.getElementById('totalIzin').textContent = izin;
    document.getElementById('totalAlpha').textContent = alpha;
    
    // Render tabel
    const sortedDates = Object.keys(grouped).sort();
    
    let html = `
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <thead>
            <tr style="background:#800000; color:white;">
              <th style="padding:12px; text-align:left; border:1px solid #ddd;">Tanggal</th>
              <th style="padding:12px; text-align:center; border:1px solid #ddd;">Jam Masuk</th>
              <th style="padding:12px; text-align:center; border:1px solid #ddd;">Jam Pulang</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    sortedDates.forEach((tgl, idx) => {
      const d = grouped[tgl];
      const tglObj = new Date(tgl.split('-').reverse().join('-') + 'T00:00:00');
      const tglFmt = tglObj.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
      
      html += `
        <tr style="background:${idx % 2 === 0 ? '#fafafa' : 'white'};">
          <td style="padding:12px; border:1px solid #ddd;">${tglFmt}</td>
          <td style="padding:12px; text-align:center; border:1px solid #ddd; color:${d.in ? '#059669' : '#999'}; font-weight:${d.in ? 'bold' : 'normal'};">${d.in || '-'}</td>
          <td style="padding:12px; text-align:center; border:1px solid #ddd; color:${d.out ? '#dc2626' : '#999'}; font-weight:${d.out ? 'bold' : 'normal'};">${d.out || '-'}</td>
        </tr>
      `;
    });
    
    html += '</tbody></table></div>';
    listEl.innerHTML = html;
    
  } catch (err) {
    console.error('Load rekap error:', err);
    listEl.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:#dc2626;">
        <p>Gagal memuat data</p>
        <button onclick="loadRekap()" style="margin-top:12px; padding:8px 20px; background:#800000; color:white; border:none; border-radius:8px; cursor:pointer;">Coba Lagi</button>
      </div>
    `;
  }
}

// ==================== PATROLI PAGE ====================
function renderPatroli(el) {
  el.innerHTML = `
    <div style="padding:20px;">
      <h1 style="font-size:22px; font-weight:bold; margin:0 0 20px;">Patroli</h1>
      <div style="background:white; padding:20px; border-radius:12px; text-align:center; color:#999;">
        <div style="font-size:48px; margin-bottom:12px;">🚶</div>
        <p>Fitur patroli</p>
      </div>
    </div>
  `;
}

// ==================== KEJADIAN PAGE ====================
function renderKejadian(el) {
  el.innerHTML = `
    <div style="padding:20px;">
      <h1 style="font-size:22px; font-weight:bold; margin:0 0 20px;">Kejadian</h1>
      <div style="background:white; padding:20px; border-radius:12px; text-align:center; color:#999;">
        <div style="font-size:48px; margin-bottom:12px;">⚠️</div>
        <p>Fitur kejadian</p>
      </div>
    </div>
  `;
}

// ==================== PEMBINAAN PAGE ====================
function renderPembinaan(el) {
  el.innerHTML = `
    <div style="padding:20px;">
      <h1 style="font-size:22px; font-weight:bold; margin:0 0 20px;">Pembinaan</h1>
      <div style="background:white; padding:20px; border-radius:12px; text-align:center; color:#999;">
        <div style="font-size:48px; margin-bottom:12px;">📚</div>
        <p>Fitur pembinaan</p>
      </div>
    </div>
  `;
}
