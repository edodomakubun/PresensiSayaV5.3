import { getState, setHistoryLoaded } from './state.js';

export async function loadHistory(forceRefresh = false) {
  const state = getState();
  const currentUser = state.currentUser;
  const apiUrl = state.apiUrl;

  if (!currentUser || !apiUrl) return;

  const container = document.getElementById('history-container');
  if (!container) return;

  // Skeleton Loading
  container.innerHTML = `
    <div class="h-20 bg-slate-200 animate-pulse rounded-2xl w-full mb-3"></div>
    <div class="h-20 bg-slate-200 animate-pulse rounded-2xl w-full mb-3"></div>
  `;

  try {
    const response = await fetch(`${apiUrl}?nama=${encodeURIComponent(currentUser.nama)}`);
    const data = await response.json();
    setHistoryLoaded(true);
    renderHistory(data);
  } catch (err) {
    container.innerHTML = `<p class="text-center text-red-500 text-sm mt-5">Gagal memuat data.</p>`;
    console.error(err);
  }
}

export function renderHistory(data) {
  const container = document.getElementById('history-container');
  if (!container) return;

  container.innerHTML = '';

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
          <i class="fa-solid fa-clock-rotate-left text-3xl"></i>
        </div>
        <p class="text-slate-500 font-medium">Belum ada riwayat bulan ini.</p>
      </div>
    `;
    return;
  }

  data.forEach(item => {
    const ket = (item.keterangan || '').toUpperCase();
    let cardColor = "bg-white border-slate-100";
    let iconColor = "text-slate-400";
    let iconClass = "fa-solid fa-location-dot";

    if (ket.includes('MASUK')) { cardColor = "bg-emerald-50 border-emerald-100"; iconColor = "text-emerald-500"; iconClass = "fa-solid fa-right-to-bracket"; }
    else if (ket.includes('TERLAMBAT')) { cardColor = "bg-amber-50 border-amber-100"; iconColor = "text-amber-500"; iconClass = "fa-solid fa-clock"; }
    else if (ket.includes('PULANG')) { cardColor = "bg-blue-50 border-blue-100"; iconColor = "text-blue-500"; iconClass = "fa-solid fa-person-walking-arrow-right"; }
    else if (ket.includes('LIBUR')) { cardColor = "bg-red-50 border-red-100"; iconColor = "text-red-500"; iconClass = "fa-solid fa-mug-hot"; }
    else if (ket.includes('PENGAJUAN')) {
      iconClass = "fa-solid fa-file-signature";
      if (ket.includes('DISETUJUI')) { cardColor = "bg-emerald-100 border-emerald-200"; iconColor = "text-emerald-600"; }
      else if (ket.includes('MENUNGGU')) { cardColor = "bg-orange-50 border-orange-200"; iconColor = "text-orange-500"; }
      else if (ket.includes('DITOLAK')) { cardColor = "bg-red-50 border-red-200"; iconColor = "text-red-600"; }
    }

    const dateObj = new Date(item.isoTimestamp);
    const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const html = `
      <div class="p-4 rounded-2xl border flex items-center gap-4 ${cardColor} mb-3">
        <div class="p-3 w-12 h-12 flex items-center justify-center rounded-xl bg-white/50 shadow-sm ${iconColor}">
          <i class="${iconClass} text-xl"></i>
        </div>
        <div class="flex-1">
          <p class="font-bold text-slate-800 text-sm leading-tight">${item.keterangan}</p>
          <p class="text-xs font-semibold text-slate-500 mt-1">${dateStr}</p>
        </div>
        <div class="text-right">
          <span class="text-sm font-bold text-slate-700 bg-white/60 px-2 py-1 rounded-lg shadow-sm border border-slate-100/50">
            ${timeStr}
          </span>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}
