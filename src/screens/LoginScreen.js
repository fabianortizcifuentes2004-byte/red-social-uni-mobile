import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function manejarLogin() {
    if (!correo || !password) {
      Alert.alert("Faltan datos", "Ingresa tu correo y contraseña");
      return;
    }
    setEnviando(true);
    try {
      await login(correo, password);
    } catch (error) {
      const mensaje = error.response?.data?.error || "No se pudo iniciar sesión";
      Alert.alert("Error", mensaje);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.titulo}>Red Universitaria</Text>
      <Text style={styles.subtitulo}>Inicia sesión con tu correo institucional</Text>

      <TextInput
        style={styles.input}
        placeholder="correo@sanjose.edu.co"
        placeholderTextColor="#8B90A8"
        autoCapitalize="none"
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#8B90A8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.boton}
        onPress={manejarLogin}
        disabled={enviando}
      >
        <Text style={styles.botonTexto}>{enviando ? "Ingresando..." : "Ingresar"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
        <Text style={styles.enlace}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#1B1F3B",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 15,
    color: "#A9AEC9",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#262B4F",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFFFFF",
    marginBottom: 14,
    fontSize: 15,
  },
  boton: {
    backgroundColor: "#4E5BF2",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  botonTexto: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  enlace: {
    color: "#8C95F6",
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});
