import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

export async function login(username: string, password: string): Promise<string> {
  const res = await axios.post(`${BASE_URL}/users/login`, { username, password });
  return res.data as string;
}

export async function register(username: string, email: string, password: string): Promise<void> {
  await axios.post(`${BASE_URL}/users/register`, { username, email, password });
}
