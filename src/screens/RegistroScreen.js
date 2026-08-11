import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RegistroScreen({ navigation }) {
  const { registro } = useAuth();
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [facultad, setFacultad] = useState("");
  const [rol, setRol] = useState("estudiante");
  const [enviando, setEnviando] = useState(false);

  async function manejarRegistro() {
    if (!nombreCompleto || !correo || !password) {
      Alert.alert("Faltan datos", "Completa nombre, correo y contraseña");
      return;
    }
    setEnviando(true);
    try {
      await registro({ nombre_completo: nombreCompleto, correo, password, facultad, rol });
    } catch (error) {
      const mensaje = error.response?.data?.error || "No se pudo completar el registro";
      Alert.alert("Error", mensaje);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>Crear cuenta</Text>
      <Text style={styles.subtitulo}>Usa tu correo institucional para registrarte</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        placeholderTextColor="#8B90A8"
        value={nombreCompleto}
        onChangeText={setNombreCompleto}
      />
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
      <TextInput
        style={styles.input}
        placeholder="Facultad o carrera"
        placeholderTextColor="#8B90A8"
        value={facultad}
        onChangeText={setFacultad}
      />

      <Text style={styles.etiqueta}>Soy:</Text>
      <View style={styles.filaRoles}>
        <TouchableOpacity
          style={[styles.chipRol, rol === "estudiante" && styles.chipRolActivo]}
          onPress={() => setRol("estudiante")}
        >
          <Text style={styles.chipTexto}>Estudiante</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chipRol, rol === "docente" && styles.chipRolActivo]}
          onPress={() => setRol("docente")}
        >
          <Text style={styles.chipTexto}>Docente</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.boton} onPress={manejarRegistro} disabled={enviando}>
        <Text style={styles.botonTexto}>{enviando ? "Creando cuenta..." : "Crear cuenta"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.enlace}>Ya tengo cuenta, iniciar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexGrow: 1,
    backgroundColor: "#1B1F3B",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 60,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 14,
    color: "#A9AEC9",
    marginBottom: 28,
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
  etiqueta: {
    color: "#A9AEC9",
    marginBottom: 8,
    fontSize: 14,
  },
  filaRoles: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  chipRol: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#262B4F",
    alignItems: "center",
  },
  chipRolActivo: {
    backgroundColor: "#4E5BF2",
  },
  chipTexto: {
    color: "#FFFFFF",
    fontWeight: "600",
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
