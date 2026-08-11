import AsyncStorage from "@react-native-async-storage/async-storage";

// Se define en `.env` (ver `.env.example`). En desarrollo con Expo Go, usa la
// IP local de tu computador (no "localhost", tu celular no la reconoce).
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.100:5000/api";

async function request(method, path, body, params) {
  const token = await AsyncStorage.getItem("access_token");

  let url = `${API_URL}${path}`;
  if (params) {
    const query = new URLSearchParams(params).toString();
    if (query) url += `?${query}`;
  }

  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const error = new Error((data && data.error) || "Error de red");
    error.response = { data, status: response.status };
    throw error;
  }

  return { data };
}

// Interfaz compatible con axios (api.get/post/put) para no tener que
// reescribir las pantallas que ya usan api.get(...).data, error.response.data, etc.
const api = {
  get: (path, config) => request("GET", path, undefined, config?.params),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  delete: (path) => request("DELETE", path),
};

export default api;
