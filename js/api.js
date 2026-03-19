import { getState } from './state.js';
import { setLoading, showNotif } from './ui.js';

export async function callApi(action, dataObj) {
  const state = getState();

  if (!state.apiUrl) {
    showNotif('error', 'URL API belum diatur. Silakan setup terlebih dahulu.');
    return null;
  }

  setLoading(true);
  try {
    const payload = { action: action, ...dataObj };
    const response = await fetch(state.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    setLoading(false);
    return result;
  } catch (error) {
    setLoading(false);
    showNotif('error', 'Gagal terhubung ke server.');
    console.error(error);
    return null;
  }
}
