import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

export default function EstadoVacio({ icono = "file-tray-outline", texto }) {
  const { colores } = useTheme();
  return (
    <View style={styles.contenedor}>
      <Ionicons name={icono} size={38} color={colores.textoTerciario} />
      <Text style={[styles.texto, { color: colores.textoSecundario }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    paddingHorizontal: 40,
    gap: 10,
  },
  texto: {
    fontSize: 14,
    textAlign: "center",
  },
});
