import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useAuth } from "../context/AuthContext";
import LoginScreen from "../screens/LoginScreen";
import RegistroScreen from "../screens/RegistroScreen";
import FeedScreen from "../screens/FeedScreen";
import DetallePublicacionScreen from "../screens/DetallePublicacionScreen";
import MensajesScreen from "../screens/MensajesScreen";
import ConversacionScreen from "../screens/ConversacionScreen";
import PerfilScreen from "../screens/PerfilScreen";

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const temaOscuro = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#1B1F3B",
    card: "#1B1F3B",
    border: "#262B4F",
    primary: "#4E5BF2",
  },
};

function PilaAutenticacion() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Registro" component={RegistroScreen} />
    </AuthStack.Navigator>
  );
}

function PestanasPrincipales() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#161A34", borderTopColor: "#262B4F" },
        tabBarActiveTintColor: "#8C95F6",
        tabBarInactiveTintColor: "#6C7099",
      }}
    >
      <Tabs.Screen name="Muro" component={FeedScreen} />
      <Tabs.Screen name="Mensajes" component={MensajesScreen} />
      <Tabs.Screen name="Perfil" component={PerfilScreen} />
    </Tabs.Navigator>
  );
}

function PilaPrincipal() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1B1F3B" },
        headerTintColor: "#FFFFFF",
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
    </MainStack.Navigator>
  );
}

export default function Navegacion() {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <View style={{ flex: 1, backgroundColor: "#1B1F3B", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#4E5BF2" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={temaOscuro}>
      {usuario ? <PilaPrincipal /> : <PilaAutenticacion />}
    </NavigationContainer>
  );
}
