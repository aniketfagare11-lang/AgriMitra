/**
 * Central API base URL.
 * Falls back to localhost:5000 so the app works even without a .env file.
 */
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
