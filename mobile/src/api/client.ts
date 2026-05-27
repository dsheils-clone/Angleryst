import axios from 'axios';
import { getToken } from '../storage/auth';

const BASE_URL = 'http://localhost:8080';

const client = axios.create({ baseURL: BASE_URL });

client.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
