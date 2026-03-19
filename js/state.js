// Shared state management

const state = {
  currentUser: null,
  deviceId: '',
  apiUrl: localStorage.getItem('absen_api_url') || '',
  currentLocation: null,
  historyLoaded: false,
  html5QrCode: null,
  isScanning: false
};

export const getState = () => state;

export const setCurrentUser = (user) => {
  state.currentUser = user;
  if (user) {
    localStorage.setItem('absen_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('absen_user');
  }
};

export const setDeviceId = (id) => {
  state.deviceId = id;
  localStorage.setItem('absen_device_id', id);
};

export const setApiUrl = (url) => {
  state.apiUrl = url;
  localStorage.setItem('absen_api_url', url);
};

export const setCurrentLocation = (location) => {
  state.currentLocation = location;
};

export const setHistoryLoaded = (loaded) => {
  state.historyLoaded = loaded;
};

export const setHtml5QrCode = (qrCodeInstance) => {
  state.html5QrCode = qrCodeInstance;
};

export const setIsScanning = (scanning) => {
  state.isScanning = scanning;
};

// Initialize device ID on load if not present
if (!state.deviceId) {
  const storedDeviceId = localStorage.getItem('absen_device_id');
  if (storedDeviceId) {
    state.deviceId = storedDeviceId;
  } else {
    const newDeviceId = 'dev_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    setDeviceId(newDeviceId);
  }
}

// Initialize user on load if present
const savedUser = localStorage.getItem('absen_user');
if (savedUser) {
  try {
    state.currentUser = JSON.parse(savedUser);
  } catch(e) {
    console.error("Failed to parse saved user", e);
  }
}
