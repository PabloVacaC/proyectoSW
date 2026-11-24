// frontend-mobile/src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import axios from 'axios';

// Comportamiento de notificación en primer plano (Heads-up banner en la parte superior como WhatsApp)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

export const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://18.219.151.60/api/v1';

/**
 * Configura los canales de notificación en Android con máxima importancia
 * para que se desplieguen como banner superior (Heads-Up) con sonido y vibración tipo WhatsApp.
 */
export async function setupNotificationChannelsAsync(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      // Canal prioritario estilo WhatsApp / Mensajería
      await Notifications.setNotificationChannelAsync('skylearn-whatsapp-alerts', {
        name: 'Mensajes y Bienvenida Skylearn',
        description: 'Notificaciones emergentes de alta prioridad estilo WhatsApp',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
        showBadge: true,
        lightColor: '#25D366',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: false,
      });

      // Canal 'default' (Android lo usa por defecto para trigger inmediato con heads-up)
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificaciones Skylearn',
        description: 'Alertas de bienvenida y actividades',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        enableVibrate: true,
        showBadge: true,
        lightColor: '#25D366',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    } catch (chanErr) {
      console.warn('Advertencia al configurar canales de notificación en Android:', chanErr);
    }
  }
}

/**
 * Emite una notificación push local inmediata que aparece en la parte superior
 * de la pantalla como un mensaje emergente tipo WhatsApp.
 */
export async function sendWelcomePushNotification(teacherName?: string): Promise<boolean> {
  try {
    await setupNotificationChannelsAsync();

    let hasPermission = false;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      hasPermission = finalStatus === 'granted';
    } catch (permErr) {
      console.warn('Error al verificar permisos de notificación:', permErr);
    }

    if (!hasPermission) {
      console.warn('Permiso de notificaciones push no otorgado por el usuario.');
      return false;
    }

    const greeting = teacherName ? `¡Hola ${teacherName}! ` : '';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💬 Skylearn',
        body: `¡Bienvenidos a Skylearn! 👋 ${greeting}Tu panel docente y tutor virtual están listos.`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        badge: 1,
        vibrate: [0, 250, 250, 250],
        data: {
          type: 'welcome',
          appName: 'Skylearn',
          timestamp: Date.now(),
        },
      },
      trigger: null, // Inmediato y universal: Android usa canal 'default' con importancia MAX
    });

    return true;
  } catch (error: any) {
    console.error('Error al emitir notificación push de bienvenida:', error?.message || error);
    return false;
  }
}

/**
 * Emite una notificación personalizada tipo WhatsApp
 */
export async function sendCustomPushNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<boolean> {
  try {
    await setupNotificationChannelsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        badge: 1,
        vibrate: [0, 250, 250, 250],
        data: data || {},
      },
      trigger: null,
    });
    return true;
  } catch (error: any) {
    console.error('Error al emitir notificación personalizada:', error?.message || error);
    return false;
  }
}

export async function registerForPushNotificationsAsync(teacherToken?: string): Promise<string | null> {
  try {
    await setupNotificationChannelsAsync();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permiso de notificaciones push denegado');
      return null;
    }

    let token: string | null = null;
    try {
      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      token = pushTokenData?.data || null;

      // Si contamos con sesión de docente, registrar el token en el backend
      if (teacherToken && token) {
        await axios.post(
          `${BACKEND_URL}/teacher/device-token`,
          { pushToken: token },
          { headers: { Authorization: `Bearer ${teacherToken}` } },
        );
      }
    } catch (tokenErr) {
      console.log('Push token remoto no disponible en entorno local (notificaciones locales activas):', tokenErr);
    }

    return token;
  } catch (error: any) {
    console.warn('Error en registro de notificaciones:', error?.message || error);
    return null;
  }
}
