import { getState } from './state.js';

// --- UTILS: TAMPILKAN NOTIFIKASI ---
export function showNotif(type, message) {
  const el = document.getElementById('notification');
  const icon = document.getElementById('notif-icon');
  const msg = document.getElementById('notif-msg');

  if (!el || !icon || !msg) return;

  msg.innerText = message;
  el.className = `fixed top-4 left-4 right-4 z-[60] p-4 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300 max-w-md mx-auto translate-y-0 opacity-100 ${type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`;
  icon.className = type === 'error' ? 'fa-solid fa-circle-xmark text-2xl' : 'fa-solid fa-circle-check text-2xl';

  setTimeout(() => {
    el.classList.add('translate-y-[-150%]', 'opacity-0');
    el.classList.remove('translate-y-0', 'opacity-100');
  }, 4000);
}

// --- UTILS: TAMPILKAN LOADING ---
export function setLoading(isLoading) {
  const el = document.getElementById('loading-overlay');
  if (!el) return;
  if (isLoading) el.classList.replace('hidden', 'flex');
  else el.classList.replace('flex', 'hidden');
}

// --- UTILS: UPDATE USER UI ---
export function updateUserUI() {
  const state = getState();
  const currentUser = state.currentUser;

  if (!currentUser) return;

  const userNameDisplay = document.getElementById('user-name-display');
  const userFullname = document.getElementById('user-fullname');
  const userInitial = document.getElementById('user-initial');
  const userId = document.getElementById('user-id');

  if (userNameDisplay) userNameDisplay.innerText = `Halo, ${currentUser.nama.split(' ')[0]}`;
  if (userFullname) userFullname.innerText = currentUser.nama;
  if (userInitial) userInitial.innerText = currentUser.nama.charAt(0).toUpperCase();
  if (userId) userId.innerText = `ID: ${currentUser.profile.Id || '-'}`;
}

// --- FITUR: NAVIGASI TABS ---
export function switchTab(target) {
  // Sembunyikan semua tab
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));

  // Tampilkan tab target
  const targetTab = document.getElementById(`tab-${target}`);
  if (targetTab) {
    targetTab.classList.remove('hidden');
    targetTab.classList.add('block');
  }

  // Update styling tombol navigasi bawah
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const icon = btn.querySelector('i');
    if (btn.dataset.target === target) {
      let activeColor = 'text-blue-600';
      if (target === 'izin') activeColor = 'text-orange-500';
      btn.className = `nav-btn flex flex-col items-center justify-center w-16 h-14 transition-colors ${activeColor}`;
      if (icon) icon.classList.add('scale-110');
    } else {
      btn.className = 'nav-btn flex flex-col items-center justify-center w-16 h-14 transition-colors text-slate-400 hover:text-slate-600';
      if (icon) icon.classList.remove('scale-110');
    }
  });
}
