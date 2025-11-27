// API Configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isDevelopment || isLocalhost 
  ? 'http://localhost:5000'
  : ''; // Empty string means same origin (Vercel deployment)

export const WS_URL = isDevelopment || isLocalhost
  ? 'ws://localhost:5000'
  : `wss://${window.location.host}`;

console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', API_BASE_URL);
console.log('WebSocket URL:', WS_URL);
