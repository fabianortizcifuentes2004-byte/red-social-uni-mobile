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
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import api, { resolverUrlImagen } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Avatar from "../components/Avatar";
import EstadoVacio from "../components/EstadoVacio";
import ModalReporte from "../components/ModalReporte";

export default function DetallePublicacionScreen({ route, navigation }) {
  const { publicacionId } = route.params;
  const { usuario } = useAuth();
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);

  const [publicacion, setPublicacion] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [textoEdicion, setTextoEdicion] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [reporteVisible, setReporteVisible] = useState(null); // { tipo, id } | null

  async function cargarPublicacion() {
    try {
      const { data } = await api.get(`/posts/${publicacionId}`);
      setPublicacion(data);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la publicación");
    }
  }

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
      cargarPublicacion();
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
      Alert.alert("Error", error.response?.data?.error || "No se pudo enviar el comentario");
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

  function iniciarEdicion() {
    setTextoEdicion(publicacion.contenido);
    setEditando(true);
  }

  async function guardarEdicion() {
    if (!textoEdicion.trim()) return;
    setGuardandoEdicion(true);
    try {
      const { data } = await api.put(`/posts/${publicacionId}`, { contenido: textoEdicion.trim() });
      setPublicacion(data);
      setEditando(false);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "No se pudo editar la publicación");
    } finally {
      setGuardandoEdicion(false);
    }
  }

  async function enviarReporte(motivo) {
    try {
      await api.post("/reportes", {
        tipo_objetivo: reporteVisible.tipo,
        objetivo_id: reporteVisible.id,
        motivo,
      });
      Alert.alert("Gracias", "Reportaste este contenido, un administrador lo revisará");
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el reporte");
    } finally {
      setReporteVisible(null);
    }
  }

  if (!publicacion) {
    return <View style={estilos.contenedor} />;
  }

  const esAutor = publicacion.usuario_id === usuario?.id;

  return (
    <KeyboardAvoidingView
      style={estilos.contenedor}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={comentarios}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={estilos.publicacion}>
            <TouchableOpacity
              style={estilos.encabezadoAutor}
              onPress={() => navigation.navigate("PerfilUsuario", { userId: publicacion.usuario_id })}
            >
              <Avatar
                fotoUrl={publicacion.foto_autor}
                nombre={publicacion.autor}
                tamano={38}
                destacado={publicacion.rol_autor === "docente"}
              />
              <View style={estilos.datosAutor}>
                <Text style={estilos.autor}>{publicacion.autor}</Text>
                <Text style={estilos.rol}>{publicacion.rol_autor === "docente" ? "Docente" : "Estudiante"}</Text>
              </View>
            </TouchableOpacity>

            {editando ? (
              <>
                <TextInput
                  style={estilos.inputEdicion}
                  value={textoEdicion}
                  onChangeText={setTextoEdicion}
                  multiline
                />
                <View style={estilos.filaAccionesEdicion}>
                  <TouchableOpacity onPress={() => setEditando(false)}>
                    <Text style={estilos.cancelarEdicion}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={estilos.botonGuardar}
                    onPress={guardarEdicion}
                    disabled={guardandoEdicion}
                  >
                    <Text style={estilos.botonGuardarTexto}>{guardandoEdicion ? "..." : "Guardar"}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={estilos.contenido}>{publicacion.contenido}</Text>
                {publicacion.editado && <Text style={estilos.etiquetaEditado}>Editado</Text>}
                {publicacion.imagen_url && (
                  <Image
                    source={{ uri: resolverUrlImagen(publicacion.imagen_url) }}
                    style={estilos.imagen}
                  />
                )}
                <View style={estilos.filaAcciones}>
                  {esAutor ? (
                    <TouchableOpacity style={estilos.accion} onPress={iniciarEdicion}>
                      <Ionicons name="create-outline" size={16} color={colores.textoSecundario} />
                      <Text style={estilos.accionTexto}>Editar</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={estilos.accion}
                      onPress={() => setReporteVisible({ tipo: "publicacion", id: publicacion.id })}
                    >
                      <Ionicons name="flag-outline" size={16} color={colores.textoSecundario} />
                      <Text style={estilos.accionTexto}>Reportar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            <Text style={estilos.tituloComentarios}>Comentarios</Text>
          </View>
        }
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
                <View style={estilos.accionesComentario}>
                  {item.usuario_id !== usuario?.id && (
                    <TouchableOpacity
                      onPress={() => setReporteVisible({ tipo: "comentario", id: item.id })}
                    >
                      <Ionicons name="flag-outline" size={14} color={colores.textoSecundario} />
                    </TouchableOpacity>
                  )}
                  {puedeEliminar && (
                    <TouchableOpacity onPress={() => confirmarEliminarComentario(item.id)}>
                      <Ionicons name="trash-outline" size={15} color={colores.peligro} />
                    </TouchableOpacity>
                  )}
                </View>
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

      <ModalReporte
        visible={reporteVisible !== null}
        onCerrar={() => setReporteVisible(null)}
        onEnviar={enviarReporte}
      />
    </KeyboardAvoidingView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    publicacion: {
      marginBottom: 20,
    },
    encabezadoAutor: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
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
      fontSize: 16,
      lineHeight: 22,
    },
    etiquetaEditado: {
      color: colores.textoTerciario,
      fontSize: 12,
      marginTop: 4,
      fontStyle: "italic",
    },
    imagen: {
      width: "100%",
      height: 200,
      borderRadius: 12,
      marginTop: 12,
    },
    filaAcciones: {
      flexDirection: "row",
      marginTop: 14,
    },
    accion: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    accionTexto: {
      color: colores.textoSecundario,
      fontSize: 13,
    },
    inputEdicion: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: 10,
      color: colores.texto,
      padding: 12,
      fontSize: 15,
      minHeight: 80,
      textAlignVertical: "top",
    },
    filaAccionesEdicion: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 16,
      marginTop: 10,
    },
    cancelarEdicion: {
      color: colores.textoSecundario,
      fontSize: 14,
    },
    botonGuardar: {
      backgroundColor: colores.acento,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    botonGuardarTexto: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 13,
    },
    tituloComentarios: {
      color: colores.texto,
      fontSize: 15,
      fontWeight: "700",
      marginTop: 20,
      borderTopWidth: 1,
      borderTopColor: colores.borde,
      paddingTop: 16,
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
    accionesComentario: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
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
