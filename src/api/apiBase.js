const configuredApiUrl = import.meta.env.VITE_API_BASE_URL;
const defaultApiUrl = import.meta.env.DEV
  ? `http://${window.location.hostname}:8000`
  : window.location.origin;

export const API_BASE_URL = (configuredApiUrl || defaultApiUrl).replace(/\/+$/, "");
