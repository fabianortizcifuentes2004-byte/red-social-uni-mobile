import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function DetallePublicacionScreen({ route, navigation }) {
  const { publicacionId } = route.params;
  const { usuario } = useAuth();
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cargarComentarios() {
    try {
      const { data } = await api.get(`/posts/${publicacionId}/comentarios`);
      setComentarios(data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los comentarios");
    }
  }

  useFocusEffect(
    useCallback(() => {
      cargarComentarios();
    }, [publicacionId])
  );

  async function enviarComentario() {
    if (!nuevoComentario.trim()) return;
    setEnviando(true);
    try {
      await api.post(`/posts/${publicacionId}/comentarios`, { contenido: nuevoComentario.trim() });
      setNuevoComentario("");
      cargarComentarios();
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el comentario");
    } finally {
      setEnviando(false);
    }
  }

  function confirmarEliminarComentario(comentarioId) {
    Alert.alert("Eliminar comentario", "¿Seguro que quieres eliminarlo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/posts/${publicacionId}/comentarios/${comentarioId}`);
            cargarComentarios();
          } catch (error) {
            Alert.alert("Error", "No se pudo eliminar el comentario");
          }
        },
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={comentarios}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const puedeEliminar = item.usuario_id === usuario?.id || usuario?.rol === "admin";
          return (
            <View style={styles.comentario}>
              <View style={styles.filaComentario}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("PerfilUsuario", { userId: item.usuario_id })}
                >
                  <Text style={styles.autorComentario}>{item.autor}</Text>
                </TouchableOpacity>
                {puedeEliminar && (
                  <TouchableOpacity onPress={() => confirmarEliminarComentario(item.id)}>
                    <Text style={styles.eliminarComentario}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.textoComentario}>{item.contenido}</Text>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.vacio}>Sé el primero en comentar</Text>}
      />

      <View style={styles.cajaComentar}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un comentario..."
          placeholderTextColor="#8B90A8"
          value={nuevoComentario}
          onChangeText={setNuevoComentario}
        />
        <TouchableOpacity style={styles.boton} onPress={enviarComentario} disabled={enviando}>
          <Text style={styles.botonTexto}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#1B1F3B",
  },
  comentario: {
    backgroundColor: "#262B4F",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  filaComentario: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  autorComentario: {
    color: "#8C95F6",
    fontWeight: "600",
    fontSize: 13,
  },
  eliminarComentario: {
    color: "#F26B6B",
    fontSize: 12,
  },
  textoComentario: {
    color: "#E4E6F5",
    fontSize: 14,
  },
  vacio: {
    color: "#A9AEC9",
    textAlign: "center",
    marginTop: 30,
  },
  cajaComentar: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#262B4F",
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#262B4F",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#FFFFFF",
  },
  boton: {
    backgroundColor: "#4E5BF2",
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  botonTexto: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
