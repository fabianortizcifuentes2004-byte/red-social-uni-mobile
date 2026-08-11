import React, { useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import Navegacion from "./src/navigation";
import { navegarDesdeNotificacion } from "./src/notifications/push";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const suscripcion = useRef(null);

  useEffect(() => {
    suscripcion.current = Notifications.addNotificationResponseReceivedListener((respuesta) => {
      navegarDesdeNotificacion(respuesta.notification.request.content);
    });
    return () => suscripcion.current?.remove();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Navegacion />
      </AuthProvider>
    </ThemeProvider>
  );
}
