import React, { useCallback, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Avatar from "../components/Avatar";
import EstadoVacio from "../components/EstadoVacio";

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
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);
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

  const buscando = Boolean(busqueda.trim().length >= 2 || filtroFacultad.trim() || filtroCarrera.trim());

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
    <View style={estilos.contenedor}>
      <Text style={estilos.titulo}>Mensajes</Text>
      <TextInput
        style={estilos.input}
        placeholder="Buscar por nombre..."
        placeholderTextColor={colores.textoTerciario}
        value={busqueda}
        onChangeText={actualizarBusqueda}
      />
      <View style={estilos.filaFiltros}>
        <TextInput
          style={[estilos.input, estilos.inputFiltro]}
          placeholder="Facultad"
          placeholderTextColor={colores.textoTerciario}
          value={filtroFacultad}
          onChangeText={actualizarFacultad}
        />
        <TextInput
          style={[estilos.input, estilos.inputFiltro]}
          placeholder="Carrera"
          placeholderTextColor={colores.textoTerciario}
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
              style={estilos.fila}
              onPress={() =>
                buscando
                  ? navigation.navigate("PerfilUsuario", { userId: persona.id })
                  : irAConversacion(persona.id, persona.nombre_completo)
              }
            >
              <Avatar fotoUrl={persona.foto_url} nombre={persona.nombre_completo} tamano={42} />
              <View style={estilos.info}>
                <View style={estilos.filaSuperior}>
                  <Text style={estilos.nombre}>{persona.nombre_completo}</Text>
                  {!buscando && (
                    <Text style={estilos.fecha}>{formatearFecha(item.fecha_ultimo_mensaje)}</Text>
                  )}
                </View>
                {buscando ? (
                  <Text style={estilos.rol}>
                    {persona.rol === "docente" ? "Docente" : "Estudiante"}
                    {persona.carrera ? ` · ${persona.carrera}` : ""}
                  </Text>
                ) : (
                  <Text style={estilos.ultimoMensaje} numberOfLines={1}>
                    {item.ultimo_mensaje}
                  </Text>
                )}
              </View>
              {!buscando && item.no_leidos > 0 && (
                <View style={estilos.badge}>
                  <Text style={estilos.badgeTexto}>{item.no_leidos}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !cargando && (
            <EstadoVacio
              icono={buscando ? "search-outline" : "chatbubbles-outline"}
              texto={buscando ? "No se encontraron usuarios" : "Aún no tienes conversaciones"}
            />
          )
        }
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
    input: {
      backgroundColor: colores.superficie,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colores.borde,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: colores.texto,
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
    info: {
      flex: 1,
      marginLeft: 12,
    },
    filaSuperior: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    nombre: {
      color: colores.texto,
      fontSize: 15,
      fontWeight: "600",
    },
    rol: {
      color: colores.textoSecundario,
      fontSize: 12,
    },
    ultimoMensaje: {
      color: colores.textoSecundario,
      fontSize: 13,
      marginTop: 2,
    },
    fecha: {
      color: colores.textoTerciario,
      fontSize: 11,
    },
    badge: {
      backgroundColor: colores.acento,
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
  });
}
