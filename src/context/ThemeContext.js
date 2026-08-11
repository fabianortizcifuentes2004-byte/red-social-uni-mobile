import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { paletaOscura, paletaClara } from "../theme/paletas";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const esquemaSistema = useColorScheme();
  const [preferencia, setPreferencia] = useState("sistema"); // "oscuro" | "claro" | "sistema"

  useEffect(() => {
    AsyncStorage.getItem("tema").then((valor) => {
      if (valor === "oscuro" || valor === "claro" || valor === "sistema") {
        setPreferencia(valor);
      }
    });
  }, []);

  async function cambiarPreferencia(nueva) {
    setPreferencia(nueva);
    await AsyncStorage.setItem("tema", nueva);
  }

  const esOscuro = preferencia === "sistema" ? esquemaSistema !== "light" : preferencia === "oscuro";
  const colores = esOscuro ? paletaOscura : paletaClara;

  const valor = useMemo(
    () => ({ colores, esOscuro, preferencia, cambiarPreferencia }),
    [colores, esOscuro, preferencia]
  );

  return <ThemeContext.Provider value={valor}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
