import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { resolverUrlImagen } from "../api/client";
import { useTheme } from "../context/ThemeContext";

export default function Avatar({ fotoUrl, nombre, tamano = 42, destacado = false }) {
  const { colores } = useTheme();
  const estiloBase = { width: tamano, height: tamano, borderRadius: tamano / 2 };

  if (fotoUrl) {
    return <Image source={{ uri: resolverUrlImagen(fotoUrl) }} style={estiloBase} />;
  }

  return (
    <View
      style={[
        estiloBase,
        styles.contenedorInicial,
        { backgroundColor: destacado ? colores.docente : colores.acento },
      ]}
    >
      <Text style={[styles.inicial, { fontSize: tamano * 0.42, color: colores.texto }]}>
        {nombre?.charAt(0)?.toUpperCase() || "?"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedorInicial: {
    alignItems: "center",
    justifyContent: "center",
  },
  inicial: {
    fontWeight: "700",
  },
});
