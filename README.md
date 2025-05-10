# Simon Pi Game

Un juego de memoria "Simon dice" para la red Pi Network, donde los usuarios pueden autenticarse con su cuenta de Pi, jugar y guardar sus puntuaciones en un ranking global previo pago de 1 Pi.

## Características

- Juego clásico Simon con 4 colores
- Autenticación con Pi Network
- Sistema de pagos con Pi para guardar puntuaciones
- Ranking global de mejores puntuaciones

## Requisitos previos

- Node.js (v14 o superior)
- MongoDB
- Cuenta de desarrollador en Pi Network
- API Key de Pi Network

## Configuración del entorno

1. Clona este repositorio
2. Configura el archivo `.env` en la carpeta `server` con tus credenciales de Pi Network
3. Instala las dependencias del servidor:

```bash
cd server
npm install
```

4. Inicia el servidor:

```bash
npm run dev
```

5. Abre el navegador en `http://localhost:3000` para acceder a la API
6. Para el frontend, simplemente abre el archivo `public/index.html` en tu navegador o configura un servidor web estático

## Configuración para producción

Para desplegar en producción, debes:

1. Registrar tu aplicación en el Developer Portal de Pi Network
2. Obtener una API Key de producción
3. Cambiar la configuración a modo producción (Mainnet)
4. Desplegar el backend en un servidor que soporte Node.js
5. Configurar MongoDB con autenticación adecuada
6. Implementar medidas de seguridad adicionales

## Estructura del proyecto

```
simon-pi-game/
│
├── public/               # Frontend de la aplicación
│   ├── css/              # Estilos CSS
│   ├── js/               # Archivos JavaScript
│   └── index.html        # Página principal
│
└── server/               # Backend de la aplicación
    ├── models/           # Modelos de Mongoose
    ├── routes/           # Rutas de la API
    ├── .env              # Variables de entorno
    ├── package.json      # Dependencias 
    └── server.js         # Punto de entrada del servidor
```

## Integración con Pi Network

Este juego utiliza las siguientes características de Pi Network:

- **Autenticación de usuarios**: Permite a los usuarios iniciar sesión con su cuenta de Pi
- **Pagos**: Permite a los usuarios pagar 1 Pi para guardar su puntuación en el ranking

## Desarrollo futuro

Algunas ideas para mejoras futuras:

- Añadir más modos de juego
- Implementar sistema de logros
- Añadir efectos visuales mejorados
- Crear una versión móvil nativa
- Implementar un sistema de torneos

## Licencia

MIT

## Contacto

Para cualquier consulta o sugerencia, puedes contactar a:
ejemplo@correo.com
