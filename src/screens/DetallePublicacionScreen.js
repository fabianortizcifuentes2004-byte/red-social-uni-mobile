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

export default function DetallePublicacionScreen({ route }) {
  const { publicacionId } = route.params;
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

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={comentarios}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.comentario}>
            <Text style={styles.autorComentario}>{item.autor}</Text>
            <Text style={styles.textoComentario}>{item.contenido}</Text>
          </View>
        )}
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
  autorComentario: {
    color: "#8C95F6",
    fontWeight: "600",
    fontSize: 13,
    marginBottom: 3,
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
