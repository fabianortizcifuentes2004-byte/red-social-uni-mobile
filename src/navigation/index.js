import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LoginScreen from "../screens/LoginScreen";
import RegistroScreen from "../screens/RegistroScreen";
import FeedScreen from "../screens/FeedScreen";
import DetallePublicacionScreen from "../screens/DetallePublicacionScreen";
import MensajesScreen from "../screens/MensajesScreen";
import ConversacionScreen from "../screens/ConversacionScreen";
import PerfilScreen from "../screens/PerfilScreen";
import PerfilUsuarioScreen from "../screens/PerfilUsuarioScreen";
import AdminScreen from "../screens/AdminScreen";
import UsuariosBloqueadosScreen from "../screens/UsuariosBloqueadosScreen";

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function PilaAutenticacion() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Registro" component={RegistroScreen} />
    </AuthStack.Navigator>
  );
}

const ICONOS_TAB = {
  Muro: "newspaper-outline",
  Mensajes: "chatbubbles-outline",
  Perfil: "person-outline",
  Admin: "shield-checkmark-outline",
};

function PestanasPrincipales() {
  const { colores } = useTheme();
  const { usuario } = useAuth();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: colores.tabBarFondo, borderTopColor: colores.superficie },
        tabBarActiveTintColor: colores.acentoSecundario,
        tabBarInactiveTintColor: colores.tabBarInactivo,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONOS_TAB[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tabs.Screen name="Muro" component={FeedScreen} />
      <Tabs.Screen name="Mensajes" component={MensajesScreen} />
      <Tabs.Screen name="Perfil" component={PerfilScreen} />
      {usuario?.rol === "admin" && <Tabs.Screen name="Admin" component={AdminScreen} />}
    </Tabs.Navigator>
  );
}

function PilaPrincipal() {
  const { colores } = useTheme();
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colores.fondo },
        headerTintColor: colores.texto,
        headerShadowVisible: false,
      }}
    >
      <MainStack.Screen name="Pestanas" component={PestanasPrincipales} options={{ headerShown: false }} />
      <MainStack.Screen
        name="DetallePublicacion"
        component={DetallePublicacionScreen}
        options={{ title: "Publicación" }}
      />
      <MainStack.Screen name="Conversacion" component={ConversacionScreen} />
      <MainStack.Screen
        name="PerfilUsuario"
        component={PerfilUsuarioScreen}
        options={{ title: "Perfil" }}
      />
      <MainStack.Screen
        name="UsuariosBloqueados"
        component={UsuariosBloqueadosScreen}
        options={{ title: "Usuarios bloqueados" }}
      />
    </MainStack.Navigator>
  );
}

export default function Navegacion() {
  const { usuario, cargando } = useAuth();
  const { colores, esOscuro } = useTheme();

  const temaNavegacion = {
    ...(esOscuro ? DarkTheme : DefaultTheme),
    colors: {
      ...(esOscuro ? DarkTheme.colors : DefaultTheme.colors),
      background: colores.fondo,
      card: colores.fondo,
      border: colores.superficie,
      primary: colores.acento,
    },
  };

  if (cargando) {
    return (
      <View style={{ flex: 1, backgroundColor: colores.fondo, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colores.acento} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={temaNavegacion}>
      {usuario ? <PilaPrincipal /> : <PilaAutenticacion />}
    </NavigationContainer>
  );
}
