# Red Social Universitaria — App móvil (React Native + Expo)

## Requisitos
- Node.js 18+
- App "Expo Go" instalada en tu celular (Android/iOS), o un emulador

## Instalación
```
npm install
```

## Configurar la conexión al backend
Copia `.env.example` a `.env` y ajusta `EXPO_PUBLIC_API_URL` con la IP local de
tu computador donde corre el backend Flask (no uses "localhost", tu celular no
la reconoce):

```
EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:5000/api
```

Para ver tu IP local: `ipconfig` (Windows) o `ifconfig`/`ip a` (Mac/Linux).
Expo carga automáticamente las variables `EXPO_PUBLIC_*` de `.env` (reinicia
`npm start` tras editarlo).

## Ejecutar
```
npm start
```
Escanea el código QR con la app Expo Go.

## Estructura
```
src/
├── api/client.js          → cliente axios con token JWT automático
├── context/AuthContext.js → sesión global (login, registro, logout)
├── navigation/             → pestañas y stacks de navegación
├── screens/                 → Login, Registro, Muro, Detalle, Mensajes, Conversación, Perfil
└── components/              → TarjetaPublicacion
```
