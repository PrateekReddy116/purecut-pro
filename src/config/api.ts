/**
 * API Configuration
 * 
 * Automatically detects the correct API base URL:
 * - In development: uses localhost
 * - When accessed from network: uses the same host as the frontend
 */

const getApiBaseUrl = (): string => {
  // If running in development mode on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000';
  }
  
  // If accessed from network (e.g., mobile phone), use the same host
  // This assumes backend is running on port 8000 on the same machine
  return `http://${window.location.hostname}:8000`;
};

export const API_BASE_URL = getApiBaseUrl();
