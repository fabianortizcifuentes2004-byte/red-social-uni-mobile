import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import api from "../api/client";
import { navigationRef } from "../navigation";

// Registra el dispositivo para notificaciones push y guarda el token en el
// backend. No lanza excepciones: si algo falla (sin projectId de EAS, sin
// permiso, emulador sin soporte, etc.) simplemente no se registra el token,
// sin romper el login.
export async function registrarNotificaciones() {
  try {
    if (!Device.isDevice) return; // los simuladores/emuladores no reciben push reales

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const permisoActual = await Notifications.getPermissionsAsync();
    let estado = permisoActual.status;
    if (estado !== "granted") {
      const solicitado = await Notifications.requestPermissionsAsync();
      estado = solicitado.status;
    }
    if (estado !== "granted") return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) {
      // Falta correr `eas init` para vincular el proyecto — sin esto Expo no
      // puede emitir un push token real. El resto de la app funciona igual.
      return;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await api.put("/users/me/push-token", { push_token: token });
  } catch (error) {
    // Ver comentario de arriba: nunca debe romper el flujo de login.
  }
}

// Navega a la pantalla correspondiente cuando el usuario toca una
// notificación, según el campo `tipo` que se envía en `data` desde el backend.
// `contenido` es el `request.content` de la notificación de Expo: { title, data }.
export function navegarDesdeNotificacion(contenido) {
  const datos = contenido?.data;
  if (!navigationRef.isReady() || !datos?.tipo) return;

  switch (datos.tipo) {
    case "mensaje":
      navigationRef.navigate("Conversacion", {
        otroUsuarioId: Number(datos.usuario_id),
        nombreOtroUsuario: contenido.title || "",
      });
      break;
    case "comentario":
    case "like":
      navigationRef.navigate("DetallePublicacion", {
        publicacionId: Number(datos.publicacion_id),
      });
      break;
    case "seguidor":
      navigationRef.navigate("PerfilUsuario", { userId: Number(datos.usuario_id) });
      break;
    default:
      break;
  }
}
