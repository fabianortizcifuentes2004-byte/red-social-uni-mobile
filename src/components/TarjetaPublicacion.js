import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resolverUrlImagen } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import Avatar from "./Avatar";

export default function TarjetaPublicacion({ publicacion, onLike, onAbrir, onAbrirAutor }) {
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);
  const esDocente = publicacion.rol_autor === "docente";

  return (
    <TouchableOpacity style={estilos.tarjeta} onPress={() => onAbrir(publicacion)} activeOpacity={0.85}>
      {publicacion.fijado && (
        <View style={estilos.etiquetaFijado}>
          <Ionicons name="pin" size={11} color="#FFFFFF" />
          <Text style={estilos.etiquetaFijadoTexto}>Aviso fijado</Text>
        </View>
      )}

      <TouchableOpacity
        style={estilos.encabezado}
        onPress={() => onAbrirAutor(publicacion.usuario_id)}
        hitSlop={{ top: 4, bottom: 4 }}
      >
        <Avatar fotoUrl={publicacion.foto_autor} nombre={publicacion.autor} tamano={38} destacado={esDocente} />
        <View style={estilos.datosAutor}>
          <Text style={estilos.autor}>{publicacion.autor}</Text>
          <Text style={estilos.rol}>{esDocente ? "Docente" : "Estudiante"}</Text>
        </View>
      </TouchableOpacity>

      <Text style={estilos.contenido}>{publicacion.contenido}</Text>

      {publicacion.imagen_url && (
        <Image
          source={{ uri: resolverUrlImagen(publicacion.imagen_url) }}
          style={estilos.imagenPublicacion}
        />
      )}

      <View style={estilos.pie}>
        <TouchableOpacity style={estilos.accion} onPress={() => onLike(publicacion.id)}>
          <Ionicons name="heart-outline" size={18} color={colores.textoSecundario} />
          <Text style={estilos.accionTexto}>{publicacion.total_likes}</Text>
        </TouchableOpacity>
        <View style={estilos.accion}>
          <Ionicons name="chatbubble-outline" size={16} color={colores.textoSecundario} />
          <Text style={estilos.accionTexto}>{publicacion.total_comentarios}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    tarjeta: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 12,
    },
    etiquetaFijado: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      alignSelf: "flex-start",
      backgroundColor: colores.acento,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
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
    datosAutor: {
      marginLeft: 10,
    },
    autor: {
      color: colores.texto,
      fontWeight: "600",
      fontSize: 15,
    },
    rol: {
      color: colores.textoSecundario,
      fontSize: 12,
    },
    contenido: {
      color: colores.textoSuave,
      fontSize: 15,
      lineHeight: 21,
      marginBottom: 12,
    },
    imagenPublicacion: {
      width: "100%",
      height: 180,
      borderRadius: 12,
      marginBottom: 12,
    },
    pie: {
      flexDirection: "row",
      gap: 20,
    },
    accion: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    accionTexto: {
      color: colores.textoSecundario,
      fontSize: 13,
    },
  });
}
