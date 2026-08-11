import React, { useCallback, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import api, { resolverUrlImagen } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const OPCIONES_APARIENCIA = [
  { valor: "sistema", etiqueta: "Sistema" },
  { valor: "oscuro", etiqueta: "Oscuro" },
  { valor: "claro", etiqueta: "Claro" },
];

export default function PerfilScreen() {
  const { usuario, logout, actualizarUsuario } = useAuth();
  const { colores, preferencia, cambiarPreferencia } = useTheme();
  const estilos = crearEstilos(colores);
  const [biografia, setBiografia] = useState(usuario?.biografia || "");
  const [carrera, setCarrera] = useState(usuario?.carrera || "");
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [contadores, setContadores] = useState({ total_seguidores: 0, total_siguiendo: 0 });

  useFocusEffect(
    useCallback(() => {
      if (!usuario?.id) return;
      api
        .get(`/users/${usuario.id}`)
        .then(({ data }) =>
          setContadores({ total_seguidores: data.total_seguidores, total_siguiendo: data.total_siguiendo })
        )
        .catch(() => {});
    }, [usuario?.id])
  );

  async function guardarPerfil() {
    setGuardando(true);
    try {
      await api.put("/users/me", { biografia, carrera });
      await actualizarUsuario({ biografia, carrera });
      Alert.alert("Listo", "Perfil actualizado");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el perfil");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarFoto() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert("Permiso requerido", "Habilita el acceso a tus fotos para cambiar el avatar");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (resultado.canceled) return;

    setSubiendoFoto(true);
    try {
      const { url } = await api.subirImagen(resultado.assets[0]);
      await api.put("/users/me", { foto_url: url });
      await actualizarUsuario({ foto_url: url });
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la foto de perfil");
    } finally {
      setSubiendoFoto(false);
    }
  }

  return (
    <View style={estilos.contenedor}>
      <TouchableOpacity onPress={cambiarFoto} disabled={subiendoFoto}>
        {usuario?.foto_url ? (
          <Image source={{ uri: resolverUrlImagen(usuario.foto_url) }} style={estilos.avatarImagen} />
        ) : (
          <View style={estilos.avatar}>
            <Text style={estilos.avatarInicial}>{usuario?.nombre_completo?.charAt(0)}</Text>
          </View>
        )}
        <Text style={estilos.cambiarFoto}>{subiendoFoto ? "Subiendo..." : "Cambiar foto"}</Text>
      </TouchableOpacity>
      <Text style={estilos.nombre}>{usuario?.nombre_completo}</Text>
      <Text style={estilos.correo}>{usuario?.correo}</Text>
      <Text style={estilos.rol}>{usuario?.rol === "docente" ? "Docente" : "Estudiante"}</Text>

      <View style={estilos.filaContadores}>
        <View style={estilos.contador}>
          <Text style={estilos.contadorNumero}>{contadores.total_seguidores}</Text>
          <Text style={estilos.contadorEtiqueta}>Seguidores</Text>
        </View>
        <View style={estilos.contador}>
          <Text style={estilos.contadorNumero}>{contadores.total_siguiendo}</Text>
          <Text style={estilos.contadorEtiqueta}>Siguiendo</Text>
        </View>
      </View>

      <Text style={estilos.etiqueta}>Carrera / Facultad</Text>
      <TextInput
        style={estilos.input}
        value={carrera}
        onChangeText={setCarrera}
        placeholderTextColor={colores.textoTerciario}
      />

      <Text style={estilos.etiqueta}>Biografía</Text>
      <TextInput
        style={[estilos.input, { minHeight: 80, textAlignVertical: "top" }]}
        value={biografia}
        onChangeText={setBiografia}
        multiline
        maxLength={280}
        placeholderTextColor={colores.textoTerciario}
      />

      <TouchableOpacity style={estilos.boton} onPress={guardarPerfil} disabled={guardando}>
        <Text style={estilos.botonTexto}>{guardando ? "Guardando..." : "Guardar cambios"}</Text>
      </TouchableOpacity>

      <Text style={estilos.etiqueta}>Apariencia</Text>
      <View style={estilos.filaApariencia}>
        {OPCIONES_APARIENCIA.map((opcion) => (
          <TouchableOpacity
            key={opcion.valor}
            style={[estilos.chipApariencia, preferencia === opcion.valor && estilos.chipAparienciaActivo]}
            onPress={() => cambiarPreferencia(opcion.valor)}
          >
            <Text style={estilos.chipAparienciaTexto}>{opcion.etiqueta}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={estilos.botonSalir} onPress={logout}>
        <Text style={estilos.botonSalirTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: colores.fondo,
      paddingTop: 60,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    avatarImagen: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: 6,
    },
    cambiarFoto: {
      color: colores.acentoSecundario,
      fontSize: 12,
      textAlign: "center",
      marginBottom: 14,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colores.acento,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    avatarInicial: {
      color: "#FFFFFF",
      fontSize: 32,
      fontWeight: "700",
    },
    nombre: {
      color: colores.texto,
      fontSize: 20,
      fontWeight: "700",
    },
    correo: {
      color: colores.textoSecundario,
      fontSize: 13,
      marginTop: 2,
    },
    rol: {
      color: colores.acentoSecundario,
      fontSize: 13,
      marginTop: 4,
    },
    filaContadores: {
      flexDirection: "row",
      gap: 32,
      marginTop: 18,
      marginBottom: 24,
    },
    contador: {
      alignItems: "center",
    },
    contadorNumero: {
      color: colores.texto,
      fontSize: 17,
      fontWeight: "700",
    },
    contadorEtiqueta: {
      color: colores.textoSecundario,
      fontSize: 12,
      marginTop: 2,
    },
    etiqueta: {
      color: colores.textoSecundario,
      alignSelf: "flex-start",
      fontSize: 13,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colores.superficie,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colores.borde,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: colores.texto,
      width: "100%",
      marginBottom: 18,
    },
    boton: {
      backgroundColor: colores.acento,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      width: "100%",
      marginBottom: 24,
    },
    botonTexto: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
    filaApariencia: {
      flexDirection: "row",
      gap: 8,
      width: "100%",
    },
    chipApariencia: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      alignItems: "center",
    },
    chipAparienciaActivo: {
      backgroundColor: colores.acento,
      borderColor: colores.acento,
    },
    chipAparienciaTexto: {
      color: colores.texto,
      fontSize: 13,
      fontWeight: "600",
    },
    botonSalir: {
      marginTop: 20,
    },
    botonSalirTexto: {
      color: colores.peligro,
      fontSize: 14,
    },
  });
}
