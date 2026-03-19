import { getState } from './state.js';
import { callApi } from './api.js';
import { showNotif, switchTab } from './ui.js';
import { initAuth, handleLogin, handleLogout, handleSetup } from './auth.js';
import { startScanner, handleQRImage, resetScannerUI } from './scanner.js';
import { loadHistory } from './history.js';

// --- FITUR: PENGAJUAN IZIN ---
async function submitIzin(e) {
  e.preventDefault();
  const state = getState();
  const currentUser = state.currentUser;

  if (!currentUser) return;

  const tipe = document.getElementById('izin-tipe').value;
  const alasan = document.getElementById('izin-alasan').value;

  const res = await callApi('izin', { namaGuru: currentUser.nama, tipe, alasan });
  if (res && res.status === 'success') {
    showNotif('success', res.message);
    document.getElementById('form-izin').reset();
    setTimeout(() => { switchTab('history'); loadHistory(true); }, 1500);
  } else if (res) {
    showNotif('error', res.message);
  }
}

// --- INISIALISASI & EVENT LISTENERS ---
window.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi Auth & Setup
  initAuth();

  // 2. Event Listeners untuk Setup URL
  const formSetup = document.getElementById('form-setup');
  if (formSetup) {
    formSetup.addEventListener('submit', handleSetup);
  }

  // 3. Event Listeners untuk Login
  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', handleLogin);
  }

  // 4. Event Listener untuk Logout
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }

  // 5. Event Listeners untuk Navigasi Tab
  document.querySelectorAll('[data-switch-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Dapatkan target tab, bisa dari current target atau parent yang punya atribut
      const target = e.currentTarget.getAttribute('data-switch-tab');

      const state = getState();
      // Jika pindah tab saat kamera QR sedang aktif, matikan kamera
      if (target !== 'absen' && state.isScanning && state.html5QrCode) {
        state.html5QrCode.stop().then(() => {
          setIsScanning(false);
          resetScannerUI();
        }).catch(err => console.error(err));
      }

      switchTab(target);

      // Trigger khusus saat tab dibuka
      if (target === 'history' && !state.historyLoaded) {
        loadHistory();
      }
    });
  });

  // Refresh History
  const btnRefreshHistory = document.getElementById('btn-refresh-history');
  if (btnRefreshHistory) {
    btnRefreshHistory.addEventListener('click', () => loadHistory(true));
  }

  // 6. Event Listeners untuk QR Scanner
  const btnStartScanner = document.getElementById('btn-start-scanner');
  if (btnStartScanner) {
    btnStartScanner.addEventListener('click', startScanner);
  }

  const qrFileInput = document.getElementById('qr-file-input');
  if (qrFileInput) {
    qrFileInput.addEventListener('change', handleQRImage);
  }

  // 7. Event Listener untuk Izin
  const formIzin = document.getElementById('form-izin');
  if (formIzin) {
    formIzin.addEventListener('submit', submitIzin);
  }
});
