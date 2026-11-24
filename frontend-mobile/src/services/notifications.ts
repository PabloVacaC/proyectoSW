// frontend-mobile/src/services/notifications.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import axios from 'axios';

// Comportamiento de notificación en primer plano (Heads-up banner en la parte superior como WhatsApp)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
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
    // Canal prioritario estilo WhatsApp / Mensajería
    await Notifications.setNotificationChannelAsync('skylearn-whatsapp-alerts', {
      name: 'Mensajes y Bienvenida Skylearn',
      description: 'Notificaciones emergentes de alta prioridad estilo WhatsApp',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
      lightColor: '#25D366',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });

    // Canal para inscripciones de alumnos
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Inscripciones de Alumnos',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }
}

/**
 * Emite una notificación push local inmediata que aparece en la parte superior
 * de la pantalla como un mensaje emergente tipo WhatsApp.
 */
export async function sendWelcomePushNotification(teacherName?: string): Promise<void> {
  try {
    await setupNotificationChannelsAsync();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Permiso de notificaciones push no otorgado.');
      return;
    }

    const greeting = teacherName ? `¡Hola ${teacherName}! ` : '';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💬 Skylearn',
        subtitle: 'Nuevo mensaje',
        body: `¡Bienvenidos a Skylearn! 👋 ${greeting}Tu panel docente y tutor virtual están listos.`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        badge: 1,
        vibrate: [0, 250, 250, 250],
        data: {
          type: 'welcome',
          appName: 'Skylearn',
          timestamp: Date.now(),
        },
      },
      trigger: (Platform.OS === 'android'
        ? { channelId: 'skylearn-whatsapp-alerts' }
        : null) as any, // trigger inmediato con canal heads-up en Android
    });
  } catch (error) {
    console.error('Error al emitir notificación push de bienvenida:', error);
  }
}

/**
 * Emite una notificación personalizada tipo WhatsApp
 */
export async function sendCustomPushNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    await setupNotificationChannelsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        badge: 1,
        vibrate: [0, 250, 250, 250],
        data: data || {},
      },
      trigger: (Platform.OS === 'android'
        ? { channelId: 'skylearn-whatsapp-alerts' }
        : null) as any,
    });
  } catch (error) {
    console.error('Error al emitir notificación personalizada:', error);
  }
}

export async function registerForPushNotificationsAsync(teacherToken?: string): Promise<string | null> {
  let token: string | null = null;

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

  try {
    const pushTokenData = await Notifications.getExpoPushTokenAsync();
    token = pushTokenData.data;

    // Si contamos con sesión de docente, registrar el token en el backend
    if (teacherToken && token) {
      await axios.post(
        `${BACKEND_URL}/teacher/device-token`,
        { pushToken: token },
        { headers: { Authorization: `Bearer ${teacherToken}` } },
      );
    }
  } catch (error) {
    console.error('Error al obtener o registrar Expo Push Token:', error);
    return null;
  }

  return token;
}
