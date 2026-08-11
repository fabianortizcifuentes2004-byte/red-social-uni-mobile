import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function RegistroScreen({ navigation }) {
  const { registro } = useAuth();
  const { colores } = useTheme();
  const estilos = crearEstilos(colores);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [facultad, setFacultad] = useState("");
  const [rol, setRol] = useState("estudiante");
  const [enviando, setEnviando] = useState(false);

  async function manejarRegistro() {
    if (!nombreCompleto || !correo || !password) {
      Alert.alert("Faltan datos", "Completa nombre, correo y contraseña");
      return;
    }
    setEnviando(true);
    try {
      await registro({ nombre_completo: nombreCompleto, correo, password, facultad, rol });
    } catch (error) {
      const mensaje = error.response?.data?.error || "No se pudo completar el registro";
      Alert.alert("Error", mensaje);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenedor}>
      <Image source={require("../../assets/logo-usanjose.jpg")} style={estilos.logo} />
      <Text style={estilos.titulo}>Crear cuenta</Text>
      <Text style={estilos.subtitulo}>Usa tu correo institucional para registrarte</Text>

      <TextInput
        style={estilos.input}
        placeholder="Nombre completo"
        placeholderTextColor={colores.textoTerciario}
        value={nombreCompleto}
        onChangeText={setNombreCompleto}
      />
      <TextInput
        style={estilos.input}
        placeholder="correo@sanjose.edu.co"
        placeholderTextColor={colores.textoTerciario}
        autoCapitalize="none"
        keyboardType="email-address"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={estilos.input}
        placeholder="Contraseña"
        placeholderTextColor={colores.textoTerciario}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={estilos.input}
        placeholder="Facultad o carrera"
        placeholderTextColor={colores.textoTerciario}
        value={facultad}
        onChangeText={setFacultad}
      />

      <Text style={estilos.etiqueta}>Soy:</Text>
      <View style={estilos.filaRoles}>
        <TouchableOpacity
          style={[estilos.chipRol, rol === "estudiante" && estilos.chipRolActivo]}
          onPress={() => setRol("estudiante")}
        >
          <Text style={estilos.chipTexto}>Estudiante</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[estilos.chipRol, rol === "docente" && estilos.chipRolActivo]}
          onPress={() => setRol("docente")}
        >
          <Text style={estilos.chipTexto}>Docente</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={estilos.boton} onPress={manejarRegistro} disabled={enviando}>
        <Text style={estilos.botonTexto}>{enviando ? "Creando cuenta..." : "Crear cuenta"}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={estilos.enlace}>Ya tengo cuenta, iniciar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function crearEstilos(colores) {
  return StyleSheet.create({
    contenedor: {
      flexGrow: 1,
      backgroundColor: colores.fondo,
      justifyContent: "center",
      paddingHorizontal: 28,
      paddingVertical: 60,
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 16,
      alignSelf: "center",
      marginBottom: 16,
    },
    titulo: {
      fontSize: 28,
      fontWeight: "700",
      color: colores.texto,
      marginBottom: 6,
      textAlign: "center",
    },
    subtitulo: {
      fontSize: 14,
      color: colores.textoSecundario,
      marginBottom: 28,
      textAlign: "center",
    },
    input: {
      backgroundColor: colores.superficie,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colores.borde,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: colores.texto,
      marginBottom: 14,
      fontSize: 15,
    },
    etiqueta: {
      color: colores.textoSecundario,
      marginBottom: 8,
      fontSize: 14,
    },
    filaRoles: {
      flexDirection: "row",
      marginBottom: 20,
      gap: 10,
    },
    chipRol: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: colores.superficie,
      borderWidth: 1,
      borderColor: colores.borde,
      alignItems: "center",
    },
    chipRolActivo: {
      backgroundColor: colores.acento,
      borderColor: colores.acento,
    },
    chipTexto: {
      color: colores.texto,
      fontWeight: "600",
    },
    boton: {
      backgroundColor: colores.acento,
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: "center",
      marginTop: 8,
    },
    botonTexto: {
      color: "#FFFFFF",
      fontWeight: "600",
      fontSize: 16,
    },
    enlace: {
      color: colores.acentoSecundario,
      textAlign: "center",
      marginTop: 20,
      fontSize: 14,
    },
  });
}
