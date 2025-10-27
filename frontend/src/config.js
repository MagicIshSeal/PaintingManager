// API Configuration
// In production, this will use the VITE_API_URL from .env.production
// In development, it will use localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
