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
import { Ionicons } from "@expo/vector-icons";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import EstadoVacio from "../components/EstadoVacio";

export default function ConversacionScreen({ route, navigation }) {
  const { otroUsuarioId, nombreOtroUsuario } = route.params;
  const { usuario } = useAuth();
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);
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
      style={estilos.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        ref={listaRef}
        data={mensajes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        renderItem={({ item }) => {
          const esMio = item.remitente_id === usuario.id;
          return (
            <View style={[estilos.burbuja, esMio ? estilos.burbujaMia : estilos.burbujaOtro]}>
              <Text style={esMio ? estilos.textoBurbujaMia : estilos.textoBurbujaOtro}>{item.contenido}</Text>
            </View>
          );
        }}
        ListEmptyComponent={<EstadoVacio icono="chatbox-ellipses-outline" texto="Envía el primer mensaje" />}
      />

      <View style={estilos.cajaEscribir}>
        <TextInput
          style={estilos.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={colores.textoTerciario}
          value={texto}
          onChangeText={setTexto}
        />
        <TouchableOpacity style={estilos.boton} onPress={enviar}>
          <Ionicons name="send" size={18} color="#FFFFFF" />
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
    burbuja: {
      maxWidth: "75%",
      borderRadius: 14,
      padding: 12,
      marginBottom: 8,
    },
    burbujaMia: {
      backgroundColor: colores.acento,
      alignSelf: "flex-end",
    },
    burbujaOtro: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      alignSelf: "flex-start",
    },
    textoBurbujaMia: {
      color: "#FFFFFF",
      fontSize: 14,
    },
    textoBurbujaOtro: {
      color: colores.texto,
      fontSize: 14,
    },
    cajaEscribir: {
      flexDirection: "row",
      padding: 12,
      borderTopWidth: 1,
      borderTopColor: colores.borde,
      gap: 8,
    },
    input: {
      flex: 1,
      backgroundColor: colores.superficie,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colores.borde,
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
