import React, { useCallback, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

function formatearFecha(iso) {
  const fecha = new Date(iso);
  const hoy = new Date();
  const esHoy = fecha.toDateString() === hoy.toDateString();
  if (esHoy) {
    return fecha.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return fecha.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
}

export default function MensajesScreen({ navigation }) {
  const { usuario } = useAuth();
  const [busqueda, setBusqueda] = useState("");
  const [filtroFacultad, setFiltroFacultad] = useState("");
  const [filtroCarrera, setFiltroCarrera] = useState("");
  const [resultados, setResultados] = useState([]);
  const [conversaciones, setConversaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarConversaciones = useCallback(async () => {
    try {
      const { data } = await api.get("/messages/conversaciones");
      setConversaciones(data);
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarConversaciones();
    }, [cargarConversaciones])
  );

  const buscando = busqueda.trim().length >= 2 || filtroFacultad.trim() || filtroCarrera.trim();

  const buscar = useCallback(
    async (texto, facultad, carrera) => {
      if (texto.trim().length < 2 && !facultad.trim() && !carrera.trim()) {
        setResultados([]);
        return;
      }
      const { data } = await api.get("/users", {
        params: { q: texto, facultad, carrera },
      });
      setResultados(data.filter((u) => u.id !== usuario.id));
    },
    [usuario.id]
  );

  function actualizarBusqueda(texto) {
    setBusqueda(texto);
    buscar(texto, filtroFacultad, filtroCarrera);
  }

  function actualizarFacultad(texto) {
    setFiltroFacultad(texto);
    buscar(busqueda, texto, filtroCarrera);
  }

  function actualizarCarrera(texto) {
    setFiltroCarrera(texto);
    buscar(busqueda, filtroFacultad, texto);
  }

  function irAConversacion(otroUsuarioId, nombreOtroUsuario) {
    navigation.navigate("Conversacion", { otroUsuarioId, nombreOtroUsuario });
  }

  const datos = buscando ? resultados : conversaciones;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mensajes</Text>
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre..."
        placeholderTextColor="#8B90A8"
        value={busqueda}
        onChangeText={actualizarBusqueda}
      />
      <View style={styles.filaFiltros}>
        <TextInput
          style={[styles.input, styles.inputFiltro]}
          placeholder="Facultad"
          placeholderTextColor="#8B90A8"
          value={filtroFacultad}
          onChangeText={actualizarFacultad}
        />
        <TextInput
          style={[styles.input, styles.inputFiltro]}
          placeholder="Carrera"
          placeholderTextColor="#8B90A8"
          value={filtroCarrera}
          onChangeText={actualizarCarrera}
        />
      </View>

      <FlatList
        data={datos}
        keyExtractor={(item) => String(buscando ? item.id : item.usuario_id)}
        contentContainerStyle={{ paddingTop: 10 }}
        renderItem={({ item }) => {
          const persona = buscando ? item : item.usuario;
          return (
            <TouchableOpacity
              style={styles.fila}
              onPress={() =>
                buscando
                  ? navigation.navigate("PerfilUsuario", { userId: persona.id })
                  : irAConversacion(persona.id, persona.nombre_completo)
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarInicial}>{persona.nombre_completo.charAt(0)}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.filaSuperior}>
                  <Text style={styles.nombre}>{persona.nombre_completo}</Text>
                  {!buscando && (
                    <Text style={styles.fecha}>{formatearFecha(item.fecha_ultimo_mensaje)}</Text>
                  )}
                </View>
                {buscando ? (
                  <Text style={styles.rol}>
                    {persona.rol === "docente" ? "Docente" : "Estudiante"}
                    {persona.carrera ? ` · ${persona.carrera}` : ""}
                  </Text>
                ) : (
                  <Text style={styles.ultimoMensaje} numberOfLines={1}>
                    {item.ultimo_mensaje}
                  </Text>
                )}
              </View>
              {!buscando && item.no_leidos > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>{item.no_leidos}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !cargando && (
            <Text style={styles.vacio}>
              {buscando ? "No se encontraron usuarios" : "Aún no tienes conversaciones"}
            </Text>
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
    paddingTop: 55,
    paddingHorizontal: 20,
  },
  titulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#262B4F",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
  },
  filaFiltros: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  inputFiltro: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#4E5BF2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarInicial: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  info: {
    flex: 1,
  },
  filaSuperior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nombre: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  rol: {
    color: "#A9AEC9",
    fontSize: 12,
  },
  ultimoMensaje: {
    color: "#A9AEC9",
    fontSize: 13,
    marginTop: 2,
  },
  fecha: {
    color: "#8B90A8",
    fontSize: 11,
  },
  badge: {
    backgroundColor: "#4E5BF2",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    marginLeft: 8,
  },
  badgeTexto: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  vacio: {
    color: "#A9AEC9",
    textAlign: "center",
    marginTop: 30,
  },
});
