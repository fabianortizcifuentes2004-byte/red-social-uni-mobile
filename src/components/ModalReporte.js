import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ModalReporte({ visible, onCerrar, onEnviar }) {
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);
  const [motivo, setMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function manejarEnviar() {
    setEnviando(true);
    try {
      await onEnviar(motivo.trim());
      setMotivo("");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={estilos.fondo}>
        <View style={estilos.tarjeta}>
          <Text style={estilos.titulo}>Reportar contenido</Text>
          <Text style={estilos.subtitulo}>Cuéntanos brevemente por qué (opcional)</Text>
          <TextInput
            style={estilos.input}
            placeholder="Motivo..."
            placeholderTextColor={colores.textoTerciario}
            value={motivo}
            onChangeText={setMotivo}
            multiline
          />
          <View style={estilos.filaBotones}>
            <TouchableOpacity onPress={onCerrar}>
              <Text style={estilos.cancelar}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={estilos.boton} onPress={manejarEnviar} disabled={enviando}>
              <Text style={estilos.botonTexto}>{enviando ? "..." : "Reportar"}</Text>
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
      minHeight: 70,
      textAlignVertical: "top",
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
