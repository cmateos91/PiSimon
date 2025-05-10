# Simon Pi - Juego de Memoria para Pi Network

Simon Pi es un juego de memoria para la plataforma Pi Network, optimizado para funcionar en el entorno de Pi Browser y Pi Sandbox.

## Descripción del Proyecto

Simon Pi es un juego de memoria basado en el clásico juego "Simon". El juego muestra una secuencia de colores y sonidos que el jugador debe repetir correctamente. A medida que el jugador avanza, la secuencia se vuelve más larga y difícil de recordar.

Este proyecto está diseñado específicamente para la plataforma Pi Network, utilizando su SDK para autenticación de usuarios y pagos con la criptomoneda Pi.

## Características

- Juego de memoria con secuencias de colores y sonidos
- Autenticación de usuarios mediante Pi Network
- Tabla de clasificación para comparar puntuaciones
- Opción de guardar puntuaciones mediante micro-pagos con Pi
- Diseño responsive para dispositivos móviles

## Requisitos

- **Pi Browser**: Esta aplicación está diseñada para funcionar exclusivamente en el Pi Browser
- **Cuenta de Pioneer**: Es necesario tener una cuenta en Pi Network para autenticarse
- **Backend compatible**: Se requiere un backend para gestionar la autenticación y las puntuaciones

## Configuración

1. Modifica el archivo `config.js` para establecer la URL de tu backend:
   ```javascript
   API_URL: 'https://tu-backend-para-sandbox.ejemplo.com'
   ```

2. Asegúrate de que tu aplicación esté registrada en el [Pi Developer Portal](https://developers.minepi.com)

3. Actualiza el ID de la aplicación en el archivo `config.js`:
   ```javascript
   APP_ID: 'tu-app-id-de-pi-network'
   ```

## Despliegue

Este proyecto está diseñado para ser desplegado en el entorno de Pi Network:

1. **Sandbox (Desarrollo)**:
   - URL: `https://sandbox.minepi.com/app/tu-app-id`
   - Entorno de pruebas con Pi de prueba

2. **Mainnet (Producción)**:
   - URL: `https://app.minepi.com/app/tu-app-id`
   - Entorno de producción con Pi real

## Estructura del Proyecto

- `/public`: Archivos estáticos (HTML, CSS, JavaScript, imágenes, sonidos)
  - `/css`: Estilos de la aplicación
  - `/img`: Imágenes e iconos
  - `/js`: Código JavaScript
  - `/sound`: Efectos de sonido del juego

## Desarrollo

Este proyecto utiliza el Pi SDK para interactuar con la plataforma Pi Network. Para más información, consulta la [documentación oficial del SDK de Pi](https://developers.minepi.com).

## Nota Importante

Esta aplicación está diseñada para funcionar exclusivamente en el Pi Browser y el entorno de Pi Network. No funcionará correctamente en navegadores web convencionales o fuera del ecosistema de Pi Network.
