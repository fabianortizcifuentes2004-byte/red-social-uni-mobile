import AsyncStorage from "@react-native-async-storage/async-storage";

// Se define en `.env` (ver `.env.example`). En desarrollo con Expo Go, usa la
// IP local de tu computador (no "localhost", tu celular no la reconoce).
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.100:5000/api";

// Raíz del servidor sin el sufijo "/api", para resolver imágenes servidas en /uploads/...
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

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

async function subirImagen(archivo) {
  // `archivo` es un asset de expo-image-picker: { uri, fileName?, mimeType? }
  const token = await AsyncStorage.getItem("access_token");
  const extension = archivo.uri.split(".").pop().split("?")[0].toLowerCase();

  const formData = new FormData();
  formData.append("archivo", {
    uri: archivo.uri,
    name: archivo.fileName || `imagen.${extension}`,
    type: archivo.mimeType || `image/${extension === "jpg" ? "jpeg" : extension}`,
  });

  const response = await fetch(`${API_URL}/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data?.error || "No se pudo subir la imagen");
    error.response = { data, status: response.status };
    throw error;
  }
  return data; // { url }
}

// Resuelve una URL relativa (p.ej. "/api/uploads/xxx.jpg") a una URL absoluta usable en <Image>.
export function resolverUrlImagen(urlRelativa) {
  if (!urlRelativa) return null;
  return `${API_ORIGIN}${urlRelativa}`;
}

// Interfaz compatible con axios (api.get/post/put) para no tener que
// reescribir las pantallas que ya usan api.get(...).data, error.response.data, etc.
const api = {
  get: (path, config) => request("GET", path, undefined, config?.params),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  delete: (path) => request("DELETE", path),
  subirImagen,
};

export default api;
