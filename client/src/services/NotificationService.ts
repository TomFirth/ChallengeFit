import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === 'expo';

let Notifications: typeof import('expo-notifications') | null = null;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications?.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (error) {
    console.warn('Failed to initialize notification handler:', error);
  }
}

class NotificationService {
  async registerForPushNotificationsAsync() {
    if (isExpoGo || !Notifications) {
      console.warn('Push notifications are removed from Expo Go on SDK 53+. Use a development build for push functionality.');
      return false;
    }

    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('missions', {
          name: 'Missions',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (error) {
      console.warn('Error registering for push notifications:', error);
      return false;
    }
  }

  async missionNotification(id: string, exerciseName: string, startTime: string) {
    await this.scheduleMissionNotification(id, exerciseName, startTime);
  }

  async scheduleMissionNotification(id: string, exerciseName: string, startTime: string) {
    if (isExpoGo || !Notifications) {
      return;
    }

    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const trigger = new Date();
      trigger.setHours(hours, minutes, 0, 0);

      // If the time has already passed today, don't schedule
      if (trigger.getTime() < Date.now()) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Exercise Required!",
          body: `Time for ${exerciseName.replace('-', ' ')}!`,
          data: { missionId: id },
        },
        trigger,
      });
    } catch (error) {
      console.warn('Failed to schedule mission notification:', error);
    }
  }

  async cancelAllNotifications() {
    if (isExpoGo || !Notifications) {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.warn('Failed to cancel notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
