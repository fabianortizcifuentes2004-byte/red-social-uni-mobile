import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function TarjetaPublicacion({ publicacion, onLike, onAbrir }) {
  const esDocente = publicacion.rol_autor === "docente";

  return (
    <TouchableOpacity style={styles.tarjeta} onPress={() => onAbrir(publicacion)} activeOpacity={0.85}>
      {publicacion.fijado && (
        <View style={styles.etiquetaFijado}>
          <Text style={styles.etiquetaFijadoTexto}>📌 Aviso fijado</Text>
        </View>
      )}

      <View style={styles.encabezado}>
        <View style={[styles.avatar, esDocente && styles.avatarDocente]}>
          <Text style={styles.avatarInicial}>{publicacion.autor.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.autor}>{publicacion.autor}</Text>
          <Text style={styles.rol}>{esDocente ? "Docente" : "Estudiante"}</Text>
        </View>
      </View>

      <Text style={styles.contenido}>{publicacion.contenido}</Text>

      <View style={styles.pie}>
        <TouchableOpacity style={styles.accion} onPress={() => onLike(publicacion.id)}>
          <Text style={styles.accionTexto}>❤ {publicacion.total_likes}</Text>
        </TouchableOpacity>
        <View style={styles.accion}>
          <Text style={styles.accionTexto}>💬 {publicacion.total_comentarios}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: "#262B4F",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  etiquetaFijado: {
    alignSelf: "flex-start",
    backgroundColor: "#4E5BF2",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  etiquetaFijadoTexto: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#4E5BF2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarDocente: {
    backgroundColor: "#F2984E",
  },
  avatarInicial: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  autor: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  rol: {
    color: "#A9AEC9",
    fontSize: 12,
  },
  contenido: {
    color: "#E4E6F5",
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 12,
  },
  pie: {
    flexDirection: "row",
    gap: 20,
  },
  accion: {
    flexDirection: "row",
    alignItems: "center",
  },
  accionTexto: {
    color: "#A9AEC9",
    fontSize: 13,
  },
});
