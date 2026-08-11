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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import api, { resolverUrlImagen } from "../api/client";
import { useAuth } from "../context/AuthContext";
import TarjetaPublicacion from "../components/TarjetaPublicacion";

export default function FeedScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const [publicaciones, setPublicaciones] = useState([]);
  const [nuevoContenido, setNuevoContenido] = useState("");
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(false);
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
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View>
          <Text style={styles.saludo}>Hola, {usuario?.nombre_completo?.split(" ")[0]}</Text>
          <Text style={styles.subSaludo}>{esDocente ? "Docente" : "Estudiante"}</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.cerrarSesion}>Salir</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cajaPublicar}>
        <TextInput
          style={styles.inputPublicar}
          placeholder={esDocente ? "Comparte un aviso con tus estudiantes..." : "¿Qué quieres compartir?"}
          placeholderTextColor="#8B90A8"
          value={nuevoContenido}
          onChangeText={setNuevoContenido}
          multiline
        />
        {imagenSeleccionada && (
          <View style={styles.previewImagenContenedor}>
            <Image source={{ uri: imagenSeleccionada.uri }} style={styles.previewImagen} />
            <TouchableOpacity onPress={() => setImagenSeleccionada(null)}>
              <Text style={styles.quitarImagen}>Quitar imagen</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.filaAcciones}>
          <TouchableOpacity onPress={elegirImagen}>
            <Text style={styles.botonImagen}>📷 {imagenSeleccionada ? "Cambiar imagen" : "Agregar imagen"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botonPublicar} onPress={publicar} disabled={publicando}>
            <Text style={styles.botonPublicarTexto}>{publicando ? "..." : "Publicar"}</Text>
          </TouchableOpacity>
        </View>
      </View>

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
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargarFeed} tintColor="#FFFFFF" />}
        contentContainerStyle={{ paddingVertical: 12 }}
        ListEmptyComponent={
          !cargando && (
            <Text style={styles.vacio}>Aún no hay publicaciones. ¡Sé el primero en compartir algo!</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#1B1F3B",
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
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  subSaludo: {
    color: "#A9AEC9",
    fontSize: 13,
  },
  cerrarSesion: {
    color: "#8C95F6",
    fontSize: 14,
  },
  cajaPublicar: {
    backgroundColor: "#262B4F",
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  inputPublicar: {
    color: "#FFFFFF",
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
    color: "#F26B6B",
    fontSize: 12,
    marginTop: 6,
  },
  filaAcciones: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  botonImagen: {
    color: "#A9AEC9",
    fontSize: 13,
  },
  botonPublicar: {
    backgroundColor: "#4E5BF2",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  botonPublicarTexto: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  vacio: {
    color: "#A9AEC9",
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 40,
  },
});
