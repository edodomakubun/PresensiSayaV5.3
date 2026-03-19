import { getState, setCurrentLocation, setHtml5QrCode, setIsScanning } from './state.js';
import { callApi } from './api.js';
import { showNotif, switchTab } from './ui.js';
import { loadHistory } from './history.js';

// --- FITUR: SCAN QR & ABSENSI GPS OTOMATIS ---

export function resetScannerUI() {
  const qrReader = document.getElementById('qr-reader');
  if (qrReader) {
    qrReader.classList.add('hidden');
    qrReader.classList.remove('block');
  }

  const iconContainer = document.getElementById('gps-icon-container');
  if (iconContainer) {
    iconContainer.classList.remove('hidden');
    iconContainer.className = "w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-500 bg-blue-100 text-blue-600 ring-4 ring-blue-50";
  }

  const btnGroup = document.getElementById('btn-group-get-location');
  if (btnGroup) btnGroup.classList.remove('hidden');

  const text = document.getElementById('gps-status-text');
  if (text) text.innerText = "Tekan tombol di bawah untuk mulai scan QR Code Sekolah.";

  const icon = document.getElementById('gps-icon');
  if (icon) icon.className = "fa-solid fa-qrcode text-3xl";
}

export function startScanner() {
  const state = getState();
  let scannerInstance = state.html5QrCode;

  if (!scannerInstance) {
    scannerInstance = new Html5Qrcode("qr-reader");
    setHtml5QrCode(scannerInstance);
  }

  // Update UI to show scanner and hide start button
  const qrReader = document.getElementById('qr-reader');
  if (qrReader) {
    qrReader.classList.remove('hidden');
    qrReader.classList.add('block');
  }

  const iconContainer = document.getElementById('gps-icon-container');
  if (iconContainer) iconContainer.classList.add('hidden');

  const btnGroup = document.getElementById('btn-group-get-location');
  if (btnGroup) btnGroup.classList.add('hidden');

  const text = document.getElementById('gps-status-text');
  if (text) text.innerText = "Arahkan kamera ke QR Code...";

  setIsScanning(true);

  scannerInstance.start(
    { facingMode: "environment" },
    {
      fps: 10,
      qrbox: { width: 250, height: 250 }
    },
    (decodedText, decodedResult) => {
      // Success callback
      if (state.isScanning) {
        setIsScanning(false);
        scannerInstance.stop().then(() => {
          if (qrReader) qrReader.classList.add('hidden');
          processAbsenFromQR(decodedText);
        }).catch(err => {
          console.error("Gagal menghentikan scanner", err);
          processAbsenFromQR(decodedText);
        });
      }
    },
    (errorMessage) => {
      // Parse error, ignore and keep scanning
    }
  ).catch(err => {
    console.error("Gagal memulai scanner", err);
    showNotif('error', 'Gagal mengakses kamera. Pastikan izin kamera diberikan.');
    setIsScanning(false);
    resetScannerUI();
  });
}

export function processAbsenFromQR(qrText) {
  const iconContainer = document.getElementById('gps-icon-container');
  const icon = document.getElementById('gps-icon');
  const text = document.getElementById('gps-status-text');

  if (iconContainer) iconContainer.classList.remove('hidden');

  if (text) text.innerHTML = "QR Terbaca!<br>Sedang memvalidasi lokasi GPS...";
  if (icon) icon.className = "fa-solid fa-spinner fa-spin text-3xl";
  if (iconContainer) iconContainer.className = "w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-500 bg-amber-100 text-amber-600 ring-4 ring-amber-50";

  setCurrentLocation(null);

  if (!navigator.geolocation) {
    if (text) text.innerHTML = "<span class='text-red-600 font-bold'>GPS tidak didukung di perangkat ini.</span>";
    if (icon) icon.className = "fa-solid fa-location-arrow text-3xl";
    return;
  }

  // Ambil kordinat lokasi pengguna
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const location = { lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy };
      setCurrentLocation(location);

      // Update UI Sementara mencari
      if (iconContainer) iconContainer.className = "w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-500 bg-emerald-100 text-emerald-600 ring-4 ring-emerald-50";
      if (icon) icon.className = "fa-solid fa-location-dot text-3xl";
      if (text) text.innerText = "Lokasi ditemukan! Mengirim data...";

      const dataBox = document.getElementById('gps-data-box');
      if (dataBox) dataBox.classList.remove('hidden');

      const valLat = document.getElementById('val-lat');
      const valLng = document.getElementById('val-lng');
      const valAcc = document.getElementById('val-acc');

      if (valLat) valLat.innerText = location.lat.toFixed(6);
      if (valLng) valLng.innerText = location.lng.toFixed(6);
      if (valAcc) valAcc.innerText = Math.round(location.accuracy);

      // Langsung jalankan proses submit data ke server secara otomatis
      await submitAbsenOtomatis(qrText);
    },
    (error) => {
      let msg = 'Gagal mendapatkan lokasi.';
      if(error.code === 1) msg = 'Akses lokasi ditolak. Izinkan aplikasi di pengaturan browser Anda.';
      if(error.code === 2) msg = 'Sinyal GPS tidak tersedia.';
      if(error.code === 3) msg = 'Waktu habis saat mencari GPS.';

      if (text) text.innerHTML = `<span class='text-red-600 font-bold'>${msg}</span>`;
      if (iconContainer) iconContainer.className = "w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-500 bg-red-100 text-red-600 ring-4 ring-red-50";
      if (icon) icon.className = "fa-solid fa-circle-xmark text-3xl";

      const btnGroup = document.getElementById('btn-group-get-location');
      if (btnGroup) {
        btnGroup.classList.remove('hidden');
        const btn = btnGroup.querySelector('button');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Coba Ulangi';
      }
    },
    { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
  );
}

export async function submitAbsenOtomatis(qrText) {
  const state = getState();
  const currentLocation = state.currentLocation;

  if (!currentLocation || !state.currentUser) return;

  const res = await callApi('absen', {
    namaGuru: state.currentUser.nama,
    latitude: currentLocation.lat,
    longitude: currentLocation.lng,
    qrCodeScanned: qrText // Optional: dikirim ke backend
  });

  if (res && res.status === 'success') {
    showNotif('success', res.message);
    const text = document.getElementById('gps-status-text');
    if (text) text.innerHTML = `<span class="text-emerald-600 font-bold text-lg">Absen Berhasil!</span>`;

    const btnGroup = document.getElementById('btn-group-get-location');
    if (btnGroup) btnGroup.classList.add('hidden');

    setTimeout(() => {
      switchTab('history');
      loadHistory(true);
      resetScannerUI();
    }, 2000);
  } else if (res) {
    showNotif('error', res.message);

    const text = document.getElementById('gps-status-text');
    if (text) text.innerHTML = `<span class='text-red-600 font-bold'>Gagal: ${res.message}</span>`;

    const btnGroup = document.getElementById('btn-group-get-location');
    if (btnGroup) {
      btnGroup.classList.remove('hidden');
      const btn = btnGroup.querySelector('button');
      if (btn) btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Coba Scan Ulang';
    }

    const iconContainer = document.getElementById('gps-icon-container');
    if (iconContainer) iconContainer.className = "w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-500 bg-red-100 text-red-600 ring-4 ring-red-50";

    const icon = document.getElementById('gps-icon');
    if (icon) icon.className = "fa-solid fa-circle-xmark text-3xl";
  }
}
