import axios from 'axios';
import { store } from '../store';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Authorization interceptor
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token; 
  // const token = localStorage.getItem('token');
  console.log("token",token);
  
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // store.dispatch({ type: 'auth/clearToken' }); 

      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
