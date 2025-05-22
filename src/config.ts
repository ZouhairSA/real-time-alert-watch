
// Configuration for API endpoints
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-flask-app.onrender.com' // Change this to your actual production API URL
  : 'http://localhost:5000';

export const WEBSOCKET_URL = process.env.NODE_ENV === 'production'
  ? 'wss://your-flask-app.onrender.com' // Change this to your actual production WebSocket URL
  : 'ws://localhost:5000';

export const CONFIG = {
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: `${API_BASE_URL}/api/auth/login`,
    },
    USERS: {
      BASE: `${API_BASE_URL}/api/users`,
      BY_ID: (id: number) => `${API_BASE_URL}/api/users/${id}`,
    },
    CAMERAS: {
      BASE: `${API_BASE_URL}/api/cameras`,
      BY_ID: (id: number) => `${API_BASE_URL}/api/cameras/${id}`,
      STREAM: (id: number) => `${API_BASE_URL}/api/cameras/${id}/stream`,
    },
    MODELS: {
      BASE: `${API_BASE_URL}/api/models`,
      BY_ID: (id: number) => `${API_BASE_URL}/api/models/${id}`,
    },
    DETECTIONS: {
      BASE: `${API_BASE_URL}/api/detections`,
      BY_ID: (id: number) => `${API_BASE_URL}/api/detections/${id}`,
    },
  }
};

export default CONFIG;
