import { getState, setCurrentUser, setApiUrl } from './state.js';
import { callApi } from './api.js';
import { showNotif, updateUserUI, switchTab } from './ui.js';

export function initAuth() {
  const state = getState();

  if (!state.apiUrl) {
    document.getElementById('setup-screen').classList.remove('hidden');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.add('hidden');
    return;
  }

  // Cek Login
  if (state.currentUser) {
    updateUserUI();
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.add('hidden');
    const mainApp = document.getElementById('main-app');
    mainApp.classList.remove('hidden');
    mainApp.classList.add('flex');
    switchTab('home');
  } else {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
  }
}

export async function handleSetup(e) {
  e.preventDefault();
  const urlInput = document.getElementById('setup-url').value;

  if (urlInput) {
    setApiUrl(urlInput);
    initAuth();
  } else {
    showNotif('error', 'URL tidak boleh kosong');
  }
}

export async function handleLogin(e) {
  e.preventDefault();
  const nama = document.getElementById('login-id').value;
  const pin = document.getElementById('login-pin').value;
  const state = getState();

  const res = await callApi('login', { nama, pin, deviceId: state.deviceId });
  if (res && res.status === 'success') {
    const user = { nama: res.data.nama, profile: res.data.profile };
    setCurrentUser(user);
    updateUserUI();

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.add('hidden');
    const mainApp = document.getElementById('main-app');
    mainApp.classList.remove('hidden');
    mainApp.classList.add('flex');

    switchTab('home');
    showNotif('success', res.message);
  } else if (res) {
    showNotif('error', res.message);
  }
}

export function handleLogout() {
  setCurrentUser(null);

  const formLogin = document.getElementById('form-login');
  if (formLogin) formLogin.reset();

  const mainApp = document.getElementById('main-app');
  mainApp.classList.add('hidden');
  mainApp.classList.remove('flex');

  document.getElementById('login-screen').classList.remove('hidden');

  showNotif('success', 'Berhasil keluar aplikasi.');
}
