import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import Navegacion from "./src/navigation";

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Navegacion />
    </AuthProvider>
  );
}
