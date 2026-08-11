import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ROLES = ["estudiante", "docente", "admin"];

export default function AdminScreen() {
  const { usuario } = useAuth();
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);

  const [estadisticas, setEstadisticas] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const [stats, lista] = await Promise.all([
        api.get("/admin/estadisticas"),
        api.get("/admin/usuarios"),
      ]);
      setEstadisticas(stats.data);
      setUsuarios(lista.data);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar el panel de administración");
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  async function cambiarRol(usuarioObjetivo, rol) {
    try {
      await api.put(`/admin/usuarios/${usuarioObjetivo.id}`, { rol });
      cargar();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "No se pudo cambiar el rol");
    }
  }

  async function alternarActivo(usuarioObjetivo) {
    try {
      await api.put(`/admin/usuarios/${usuarioObjetivo.id}`, { activo: !usuarioObjetivo.activo });
      cargar();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.error || "No se pudo actualizar la cuenta");
    }
  }

  const tarjetasEstadisticas = estadisticas
    ? [
        { etiqueta: "Usuarios", valor: estadisticas.usuarios_totales },
        { etiqueta: "Activos", valor: estadisticas.usuarios_activos },
        { etiqueta: "Inactivos", valor: estadisticas.usuarios_inactivos },
        { etiqueta: "Publicaciones", valor: estadisticas.publicaciones_totales },
        { etiqueta: "Últ. semana", valor: estadisticas.publicaciones_ultima_semana },
        { etiqueta: "Comentarios", valor: estadisticas.comentarios_totales },
      ]
    : [];

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Administración</Text>
      <FlatList
        data={usuarios}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargar} tintColor={colores.texto} />}
        ListHeaderComponent={
          <>
            <View style={estilos.grillaStats}>
              {tarjetasEstadisticas.map((t) => (
                <View key={t.etiqueta} style={estilos.tarjetaStat}>
                  <Text style={estilos.statValor}>{t.valor}</Text>
                  <Text style={estilos.statEtiqueta}>{t.etiqueta}</Text>
                </View>
              ))}
            </View>
            <Text style={estilos.subtitulo}>Usuarios</Text>
          </>
        }
        renderItem={({ item }) => {
          const esUnoMismo = item.id === usuario?.id;
          return (
            <View style={estilos.fila}>
              <View style={estilos.info}>
                <Text style={estilos.nombre}>
                  {item.nombre_completo} {!item.activo && <Text style={estilos.etiquetaInactivo}>(inactivo)</Text>}
                </Text>
                <Text style={estilos.correo}>{item.correo}</Text>
              </View>
              <View style={estilos.chips}>
                {ROLES.map((rol) => (
                  <TouchableOpacity
                    key={rol}
                    style={[estilos.chip, item.rol === rol && estilos.chipActivo]}
                    disabled={esUnoMismo}
                    onPress={() => cambiarRol(item, rol)}
                  >
                    <Text style={estilos.chipTexto}>{rol}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[estilos.botonActivo, !item.activo && estilos.botonInactivo]}
                disabled={esUnoMismo}
                onPress={() => alternarActivo(item)}
              >
                <Text style={estilos.botonActivoTexto}>{item.activo ? "Desactivar" : "Activar"}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={!cargando && <Text style={estilos.vacio}>No hay usuarios</Text>}
      />
    </View>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      backgroundColor: colores.fondo,
      paddingTop: 55,
      paddingHorizontal: 20,
    },
    titulo: {
      color: colores.texto,
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 16,
    },
    grillaStats: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 20,
    },
    tarjetaStat: {
      backgroundColor: colores.superficie,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      width: "31%",
    },
    statValor: {
      color: colores.texto,
      fontSize: 18,
      fontWeight: "700",
    },
    statEtiqueta: {
      color: colores.textoSecundario,
      fontSize: 11,
      marginTop: 2,
    },
    subtitulo: {
      color: colores.texto,
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 10,
    },
    fila: {
      backgroundColor: colores.superficie,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    info: {
      marginBottom: 10,
    },
    nombre: {
      color: colores.texto,
      fontSize: 15,
      fontWeight: "600",
    },
    etiquetaInactivo: {
      color: colores.peligro,
      fontSize: 12,
      fontWeight: "400",
    },
    correo: {
      color: colores.textoSecundario,
      fontSize: 12,
      marginTop: 2,
    },
    chips: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 10,
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colores.fondo,
    },
    chipActivo: {
      backgroundColor: colores.acento,
    },
    chipTexto: {
      color: colores.texto,
      fontSize: 12,
    },
    botonActivo: {
      alignSelf: "flex-start",
      backgroundColor: colores.peligro,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 7,
    },
    botonInactivo: {
      backgroundColor: colores.acento,
    },
    botonActivoTexto: {
      color: colores.texto,
      fontSize: 12,
      fontWeight: "600",
    },
    vacio: {
      color: colores.textoSecundario,
      textAlign: "center",
      marginTop: 30,
    },
  });
}
