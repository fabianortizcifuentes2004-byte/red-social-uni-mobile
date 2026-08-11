import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function MensajesScreen({ navigation }) {
  const { usuario } = useAuth();
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);

  async function buscar(texto) {
    setBusqueda(texto);
    if (texto.trim().length < 2) {
      setResultados([]);
      return;
    }
    const { data } = await api.get("/users", { params: { q: texto } });
    setResultados(data.filter((u) => u.id !== usuario.id));
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mensajes</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre..."
        placeholderTextColor="#8B90A8"
        value={busqueda}
        onChangeText={buscar}
      />

      <FlatList
        data={resultados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingTop: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.fila}
            onPress={() =>
              navigation.navigate("Conversacion", { otroUsuarioId: item.id, nombreOtroUsuario: item.nombre_completo })
            }
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarInicial}>{item.nombre_completo.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.nombre}>{item.nombre_completo}</Text>
              <Text style={styles.rol}>{item.rol === "docente" ? "Docente" : "Estudiante"}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          busqueda.length >= 2 && (
            <Text style={styles.vacio}>No se encontraron usuarios</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#1B1F3B",
    paddingTop: 55,
    paddingHorizontal: 20,
  },
  titulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#262B4F",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#4E5BF2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarInicial: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  nombre: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  rol: {
    color: "#A9AEC9",
    fontSize: 12,
  },
  vacio: {
    color: "#A9AEC9",
    textAlign: "center",
    marginTop: 30,
  },
});
