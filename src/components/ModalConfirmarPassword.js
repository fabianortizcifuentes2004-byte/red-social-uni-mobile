import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ModalConfirmarPassword({ visible, titulo, mensaje, onCerrar, onConfirmar }) {
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function manejarConfirmar() {
    if (!password) return;
    setEnviando(true);
    try {
      await onConfirmar(password);
      setPassword("");
    } finally {
      setEnviando(false);
    }
  }

  function cerrar() {
    setPassword("");
    onCerrar();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={cerrar}>
      <View style={estilos.fondo}>
        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>{titulo}</Text>
          {mensaje ? <Text style={estilos.subtitulo}>{mensaje}</Text> : null}
          <TextInput
            style={estilos.input}
            placeholder="Contraseña"
            placeholderTextColor={colores.textoTerciario}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <View style={estilos.filaBotones}>
            <TouchableOpacity onPress={cerrar}>
              <Text style={estilos.cancelar}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.boton} onPress={manejarConfirmar} disabled={enviando}>
              <Text style={estilos.botonTexto}>{enviando ? "..." : "Confirmar"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    fondo: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    tarjeta: {
      backgroundColor: colores.superficie,
      borderRadius: 16,
      padding: 20,
      width: "100%",
    },
    titulo: {
      color: colores.texto,
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 4,
    },
    subtitulo: {
      color: colores.textoSecundario,
      fontSize: 13,
      marginBottom: 14,
    },
    input: {
      backgroundColor: colores.fondo,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colores.borde,
      color: colores.texto,
      padding: 12,
      marginBottom: 16,
    },
    filaBotones: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 16,
      alignItems: "center",
    },
    cancelar: {
      color: colores.textoSecundario,
      fontSize: 14,
    },
    boton: {
      backgroundColor: colores.peligro,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    botonTexto: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 13,
    },
  });
}
