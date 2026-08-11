import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ConversacionScreen({ route, navigation }) {
  const { otroUsuarioId, nombreOtroUsuario } = route.params;
  const { usuario } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState("");
  const listaRef = useRef(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: nombreOtroUsuario });
  }, [navigation, nombreOtroUsuario]);

  async function cargarConversacion() {
    const { data } = await api.get(`/messages/conversacion/${otroUsuarioId}`);
    setMensajes(data);
  }

  useFocusEffect(
    useCallback(() => {
      cargarConversacion();
    }, [otroUsuarioId])
  );

  async function enviar() {
    if (!texto.trim()) return;
    const contenido = texto.trim();
    setTexto("");
    await api.post("/messages", { destinatario_id: otroUsuarioId, contenido });
    cargarConversacion();
  }

  return (
    <KeyboardAvoidingView
      style={styles.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={listaRef}
        data={mensajes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const esMio = item.remitente_id === usuario.id;
          return (
            <View style={[styles.burbuja, esMio ? styles.burbujaMia : styles.burbujaOtro]}>
              <Text style={styles.textoBurbuja}>{item.contenido}</Text>
            </View>
          );
        }}
      />

      <View style={styles.cajaEscribir}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#8B90A8"
          value={texto}
          onChangeText={setTexto}
        />
        <TouchableOpacity style={styles.boton} onPress={enviar}>
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
  burbuja: {
    maxWidth: "75%",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  burbujaMia: {
    backgroundColor: "#4E5BF2",
    alignSelf: "flex-end",
  },
  burbujaOtro: {
    backgroundColor: "#262B4F",
    alignSelf: "flex-start",
  },
  textoBurbuja: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  cajaEscribir: {
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
