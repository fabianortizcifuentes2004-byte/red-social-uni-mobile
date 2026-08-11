import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function PerfilScreen() {
  const { usuario, logout } = useAuth();
  const [biografia, setBiografia] = useState(usuario?.biografia || "");
  const [carrera, setCarrera] = useState(usuario?.carrera || "");
  const [guardando, setGuardando] = useState(false);

  async function guardarPerfil() {
    setGuardando(true);
    try {
      await api.put("/users/me", { biografia, carrera });
      Alert.alert("Listo", "Perfil actualizado");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el perfil");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.avatar}>
        <Text style={styles.avatarInicial}>{usuario?.nombre_completo?.charAt(0)}</Text>
      </View>
      <Text style={styles.nombre}>{usuario?.nombre_completo}</Text>
      <Text style={styles.correo}>{usuario?.correo}</Text>
      <Text style={styles.rol}>{usuario?.rol === "docente" ? "Docente" : "Estudiante"}</Text>

      <Text style={styles.etiqueta}>Carrera / Facultad</Text>
      <TextInput style={styles.input} value={carrera} onChangeText={setCarrera} placeholderTextColor="#8B90A8" />

      <Text style={styles.etiqueta}>Biografía</Text>
      <TextInput
        style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
        value={biografia}
        onChangeText={setBiografia}
        multiline
        maxLength={280}
        placeholderTextColor="#8B90A8"
      />

      <TouchableOpacity style={styles.boton} onPress={guardarPerfil} disabled={guardando}>
        <Text style={styles.botonTexto}>{guardando ? "Guardando..." : "Guardar cambios"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonSalir} onPress={logout}>
        <Text style={styles.botonSalirTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#1B1F3B",
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4E5BF2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarInicial: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },
  nombre: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  correo: {
    color: "#A9AEC9",
    fontSize: 13,
    marginTop: 2,
  },
  rol: {
    color: "#8C95F6",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 24,
  },
  etiqueta: {
    color: "#A9AEC9",
    alignSelf: "flex-start",
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#262B4F",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    width: "100%",
    marginBottom: 18,
  },
  boton: {
    backgroundColor: "#4E5BF2",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
  },
  botonTexto: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  botonSalir: {
    marginTop: 16,
  },
  botonSalirTexto: {
    color: "#F26B6B",
    fontSize: 14,
  },
});
