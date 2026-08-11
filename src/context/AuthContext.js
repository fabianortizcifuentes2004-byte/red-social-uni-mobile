import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    restaurarSesion();
  }, []);

  async function restaurarSesion() {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const usuarioGuardado = await AsyncStorage.getItem("usuario");
      if (token && usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado));
      }
    } finally {
      setCargando(false);
    }
  }

  async function login(correo, password) {
    const { data } = await api.post("/auth/login", { correo, password });
    await AsyncStorage.setItem("access_token", data.access_token);
    await AsyncStorage.setItem("usuario", JSON.stringify(data.usuario));
    setUsuario(data.usuario);
  }

  async function registro(datos) {
    await api.post("/auth/registro", datos);
    // Tras registrarse, inicia sesión automáticamente
    await login(datos.correo, datos.password);
  }

  async function logout() {
    await AsyncStorage.multiRemove(["access_token", "usuario"]);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
