import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api, { resolverUrlImagen } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function PerfilUsuarioScreen({ route, navigation }) {
  const { userId } = route.params;
  const { usuario: usuarioActual } = useAuth();
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);

  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [procesandoSeguir, setProcesandoSeguir] = useState(false);

  const cargarPerfil = useCallback(async () => {
    try {
      const { data } = await api.get(`/users/${userId}`);
      setPerfil(data);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar el perfil");
    } finally {
      setCargando(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [cargarPerfil])
  );

  async function alternarSeguir() {
    setProcesandoSeguir(true);
    try {
      if (perfil.lo_sigues) {
        await api.delete(`/users/${userId}/seguir`);
      } else {
        await api.post(`/users/${userId}/seguir`);
      }
      cargarPerfil();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el seguimiento");
    } finally {
      setProcesandoSeguir(false);
    }
  }

  if (cargando || !perfil) {
    return (
      <View style={estilos.contenedorCargando}>
        <ActivityIndicator color={colores.acento} size="large" />
      </View>
    );
  }

  const esUnoMismo = perfil.id === usuarioActual?.id;
  const esDocente = perfil.rol === "docente";

  return (
    <View style={estilos.contenedor}>
      {perfil.foto_url ? (
        <Image source={{ uri: resolverUrlImagen(perfil.foto_url) }} style={estilos.avatarImagen} />
      ) : (
        <View style={estilos.avatar}>
          <Text style={estilos.avatarInicial}>{perfil.nombre_completo.charAt(0)}</Text>
        </View>
      )}

      <Text style={estilos.nombre}>{perfil.nombre_completo}</Text>
      <Text style={estilos.rol}>{esDocente ? "Docente" : "Estudiante"}</Text>
      {(perfil.facultad || perfil.carrera) && (
        <Text style={estilos.detalle}>{[perfil.facultad, perfil.carrera].filter(Boolean).join(" · ")}</Text>
      )}
      {perfil.biografia ? <Text style={estilos.biografia}>{perfil.biografia}</Text> : null}

      <View style={estilos.filaContadores}>
        <View style={estilos.contador}>
          <Text style={estilos.contadorNumero}>{perfil.total_seguidores}</Text>
          <Text style={estilos.contadorEtiqueta}>Seguidores</Text>
        </View>
        <View style={estilos.contador}>
          <Text style={estilos.contadorNumero}>{perfil.total_siguiendo}</Text>
          <Text style={estilos.contadorEtiqueta}>Siguiendo</Text>
        </View>
      </View>

      {!esUnoMismo && (
        <View style={estilos.filaAcciones}>
          <TouchableOpacity
            style={[estilos.boton, perfil.lo_sigues && estilos.botonSecundario]}
            onPress={alternarSeguir}
            disabled={procesandoSeguir}
          >
            <Text style={estilos.botonTexto}>
              {procesandoSeguir ? "..." : perfil.lo_sigues ? "Dejar de seguir" : "Seguir"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[estilos.boton, estilos.botonSecundario]}
            onPress={() =>
              navigation.navigate("Conversacion", {
                otroUsuarioId: perfil.id,
                nombreOtroUsuario: perfil.nombre_completo,
              })
            }
          >
            <Text style={estilos.botonTexto}>Enviar mensaje</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedorCargando: {
      flex: 1,
      backgroundColor: colores.fondo,
      alignItems: "center",
      justifyContent: "center",
    },
    contenedor: {
      flex: 1,
      backgroundColor: colores.fondo,
      paddingTop: 32,
      paddingHorizontal: 24,
      alignItems: "center",
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: colores.acento,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    avatarImagen: {
      width: 88,
      height: 88,
      borderRadius: 44,
      marginBottom: 14,
    },
    avatarInicial: {
      color: colores.texto,
      fontSize: 34,
      fontWeight: "700",
    },
    nombre: {
      color: colores.texto,
      fontSize: 20,
      fontWeight: "700",
    },
    rol: {
      color: colores.acentoSecundario,
      fontSize: 13,
      marginTop: 4,
    },
    detalle: {
      color: colores.textoSecundario,
      fontSize: 13,
      marginTop: 6,
      textAlign: "center",
    },
    biografia: {
      color: colores.textoSuave,
      fontSize: 14,
      marginTop: 14,
      textAlign: "center",
      lineHeight: 20,
    },
    filaContadores: {
      flexDirection: "row",
      gap: 32,
      marginTop: 24,
    },
    contador: {
      alignItems: "center",
    },
    contadorNumero: {
      color: colores.texto,
      fontSize: 18,
      fontWeight: "700",
    },
    contadorEtiqueta: {
      color: colores.textoSecundario,
      fontSize: 12,
      marginTop: 2,
    },
    filaAcciones: {
      flexDirection: "row",
      gap: 12,
      marginTop: 28,
      width: "100%",
    },
    boton: {
      flex: 1,
      backgroundColor: colores.acento,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: "center",
    },
    botonSecundario: {
      backgroundColor: colores.superficie,
    },
    botonTexto: {
      color: colores.texto,
      fontWeight: "600",
      fontSize: 14,
    },
  });
}
