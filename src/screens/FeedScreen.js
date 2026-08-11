import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import TarjetaPublicacion from "../components/TarjetaPublicacion";
import EstadoVacio from "../components/EstadoVacio";

export default function FeedScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);
  const [publicaciones, setPublicaciones] = useState([]);
  const [nuevoContenido, setNuevoContenido] = useState("");
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [cargaInicial, setCargaInicial] = useState(true);
  const [publicando, setPublicando] = useState(false);

  const esDocente = usuario?.rol === "docente";

  async function cargarFeed() {
    setCargando(true);
    try {
      const { data } = await api.get("/posts");
      setPublicaciones(data);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar el muro");
    } finally {
      setCargando(false);
      setCargaInicial(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      cargarFeed();
    }, [])
  );

  async function elegirImagen() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert("Permiso requerido", "Habilita el acceso a tus fotos para adjuntar una imagen");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!resultado.canceled) {
      setImagenSeleccionada(resultado.assets[0]);
    }
  }

  async function publicar() {
    if (!nuevoContenido.trim()) return;
    setPublicando(true);
    try {
      let imagen_url;
      if (imagenSeleccionada) {
        const subida = await api.subirImagen(imagenSeleccionada);
        imagen_url = subida.url;
      }
      await api.post("/posts", { contenido: nuevoContenido.trim(), imagen_url });
      setNuevoContenido("");
      setImagenSeleccionada(null);
      cargarFeed();
    } catch (error) {
      Alert.alert("Error", "No se pudo publicar");
    } finally {
      setPublicando(false);
    }
  }

  async function darLike(publicacionId) {
    try {
      await api.post(`/posts/${publicacionId}/like`);
      cargarFeed();
    } catch (error) {
      Alert.alert("Error", "No se pudo procesar el like");
    }
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.encabezado}>
        <View>
          <Text style={estilos.saludo}>Hola, {usuario?.nombre_completo?.split(" ")[0]}</Text>
          <Text style={estilos.subSaludo}>{esDocente ? "Docente" : "Estudiante"}</Text>
        </View>
        <TouchableOpacity style={estilos.botonSalir} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color={colores.acentoSecundario} />
          <Text style={estilos.cerrarSesion}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={estilos.cajaPublicar}>
        <TextInput
          style={estilos.inputPublicar}
          placeholder={esDocente ? "Comparte un aviso con tus estudiantes..." : "¿Qué quieres compartir?"}
          placeholderTextColor={colores.textoTerciario}
          value={nuevoContenido}
          onChangeText={setNuevoContenido}
          multiline
        />
        {imagenSeleccionada && (
          <View style={estilos.previewImagenContenedor}>
            <Image source={{ uri: imagenSeleccionada.uri }} style={estilos.previewImagen} />
            <TouchableOpacity onPress={() => setImagenSeleccionada(null)}>
              <Text style={estilos.quitarImagen}>Quitar imagen</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={estilos.filaAcciones}>
          <TouchableOpacity style={estilos.botonImagenFila} onPress={elegirImagen}>
            <Ionicons name="image-outline" size={16} color={colores.textoSecundario} />
            <Text style={estilos.botonImagen}>{imagenSeleccionada ? "Cambiar imagen" : "Agregar imagen"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={estilos.botonPublicar} onPress={publicar} disabled={publicando}>
            <Text style={estilos.botonPublicarTexto}>{publicando ? "..." : "Publicar"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {cargaInicial ? (
        <ActivityIndicator color={colores.acento} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={publicaciones}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TarjetaPublicacion
              publicacion={item}
              onLike={darLike}
              onAbrir={(pub) => navigation.navigate("DetallePublicacion", { publicacionId: pub.id })}
              onAbrirAutor={(usuarioId) => navigation.navigate("PerfilUsuario", { userId: usuarioId })}
            />
          )}
          refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargarFeed} tintColor={colores.acento} />}
          contentContainerStyle={{ paddingVertical: 12 }}
          ListEmptyComponent={
            <EstadoVacio icono="newspaper-outline" texto="Aún no hay publicaciones. ¡Sé el primero en compartir algo!" />
          }
        />
      )}
    </View>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: colores.fondo,
    },
    encabezado: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 55,
      paddingBottom: 16,
    },
    saludo: {
      color: colores.texto,
      fontSize: 20,
      fontWeight: "700",
    },
    subSaludo: {
      color: colores.textoSecundario,
      fontSize: 13,
    },
    botonSalir: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    cerrarSesion: {
      color: colores.acentoSecundario,
      fontSize: 14,
    },
    cajaPublicar: {
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      marginHorizontal: 16,
      borderRadius: 14,
      padding: 14,
      marginBottom: 8,
    },
    inputPublicar: {
      color: colores.texto,
      fontSize: 14,
      minHeight: 40,
      textAlignVertical: "top",
    },
    previewImagenContenedor: {
      marginTop: 10,
    },
    previewImagen: {
      width: "100%",
      height: 160,
      borderRadius: 10,
    },
    quitarImagen: {
      color: colores.peligro,
      fontSize: 12,
      marginTop: 6,
    },
    filaAcciones: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 8,
    },
    botonImagenFila: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    botonImagen: {
      color: colores.textoSecundario,
      fontSize: 13,
    },
    botonPublicar: {
      backgroundColor: colores.acento,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    botonPublicarTexto: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 13,
    },
  });
}
