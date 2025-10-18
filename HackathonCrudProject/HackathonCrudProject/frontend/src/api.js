import axios from 'axios';

// Default to relative /api so browser calls same origin.
// You may override at build time with VITE_API_URL (for local dev or other envs).
const BASE = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({
  baseURL: BASE,
  // Optional: timeout, headers, etc.
  timeout: 10000,
});

export default api;