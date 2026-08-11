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
import { Ionicons } from "@expo/vector-icons";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import EstadoVacio from "../components/EstadoVacio";

export default function DetallePublicacionScreen({ route, navigation }) {
  const { publicacionId } = route.params;
  const { usuario } = useAuth();
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);
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
      style={estilos.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={comentarios}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        renderItem={({ item }) => {
          const puedeEliminar = item.usuario_id === usuario?.id || usuario?.rol === "admin";
          return (
            <View style={estilos.comentario}>
              <View style={estilos.filaComentario}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("PerfilUsuario", { userId: item.usuario_id })}
                >
                  <Text style={estilos.autorComentario}>{item.autor}</Text>
                </TouchableOpacity>
                {puedeEliminar && (
                  <TouchableOpacity onPress={() => confirmarEliminarComentario(item.id)}>
                    <Ionicons name="trash-outline" size={15} color={colores.peligro} />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={estilos.textoComentario}>{item.contenido}</Text>
            </View>
          );
        }}
        ListEmptyComponent={<EstadoVacio icono="chatbubble-ellipses-outline" texto="Sé el primero en comentar" />}
      />

      <View style={estilos.cajaComentar}>
        <TextInput
          style={estilos.input}
          placeholder="Escribe un comentario..."
          placeholderTextColor={colores.textoTerciario}
          value={nuevoComentario}
          onChangeText={setNuevoComentario}
        />
        <TouchableOpacity style={estilos.boton} onPress={enviarComentario} disabled={enviando}>
          <Ionicons name="send" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    comentario: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
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
      color: colores.acentoSecundario,
      fontWeight: "600",
      fontSize: 13,
    },
    textoComentario: {
      color: colores.textoSuave,
      fontSize: 14,
    },
    cajaComentar: {
      flexDirection: "row",
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: colores.borde,
      gap: 8,
    },
    input: {
      flex: 1,
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      color: colores.texto,
    },
    boton: {
      backgroundColor: colores.acento,
      borderRadius: 10,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
