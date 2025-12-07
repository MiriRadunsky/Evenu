import axios from 'axios';
import { redirect } from 'react-router-dom';

const url =  import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: url || 'http://localhost:3000',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});


// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      redirect('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
