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
import { useTheme } from "../context/ThemeContext";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);
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
      style={estilos.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={estilos.titulo}>Red Universitaria</Text>
      <Text style={estilos.subtitulo}>Inicia sesión con tu correo institucional</Text>

      <TextInput
        style={estilos.input}
        placeholder="correo@sanjose.edu.co"
        placeholderTextColor={colores.textoTerciario}
        autoCapitalize="none"
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={estilos.input}
        placeholder="Contraseña"
        placeholderTextColor={colores.textoTerciario}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={estilos.boton} onPress={manejarLogin} disabled={enviando}>
        <Text style={estilos.botonTexto}>{enviando ? "Ingresando..." : "Ingresar"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Registro")}>
        <Text style={estilos.enlace}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: colores.fondo,
      justifyContent: "center",
      paddingHorizontal: 28,
    },
    titulo: {
      fontSize: 30,
      fontWeight: "700",
      color: colores.texto,
      marginBottom: 6,
    },
    subtitulo: {
      fontSize: 15,
      color: colores.textoSecundario,
      marginBottom: 32,
    },
    input: {
      backgroundColor: colores.superficie,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colores.borde,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: colores.texto,
      marginBottom: 14,
      fontSize: 15,
    },
    boton: {
      backgroundColor: colores.acento,
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
      color: colores.acentoSecundario,
      textAlign: "center",
      marginTop: 20,
      fontSize: 14,
    },
  });
}
