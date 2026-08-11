import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/client";
import { useTheme } from "../context/ThemeContext";
import Avatar from "../components/Avatar";
import EstadoVacio from "../components/EstadoVacio";

export default function UsuariosBloqueadosScreen() {
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);
  const [bloqueados, setBloqueados] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get("/users/me/bloqueados");
      setBloqueados(data);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar la lista de bloqueados");
    } finally {
      setCargando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  async function desbloquear(usuarioId) {
    try {
      await api.delete(`/users/${usuarioId}/bloquear`);
      cargar();
    } catch (error) {
      Alert.alert("Error", "No se pudo desbloquear al usuario");
    }
  }

  return (
    <View style={estilos.contenedor}>
      <FlatList
        data={bloqueados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={estilos.fila}>
            <Avatar fotoUrl={item.foto_url} nombre={item.nombre_completo} tamano={42} />
            <Text style={estilos.nombre}>{item.nombre_completo}</Text>
            <TouchableOpacity onPress={() => desbloquear(item.id)}>
              <Text style={estilos.desbloquear}>Desbloquear</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !cargando && <EstadoVacio icono="lock-closed-outline" texto="No has bloqueado a nadie" />
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
    },
    fila: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
    },
    nombre: {
      flex: 1,
      color: colores.texto,
      fontSize: 15,
      fontWeight: "600",
      marginLeft: 12,
    },
    desbloquear: {
      color: colores.acentoSecundario,
      fontSize: 13,
    },
  });
}
