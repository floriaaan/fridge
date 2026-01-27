import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions from the user
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#10b981",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Failed to get push notification permission");
    return null;
  }

  return "granted";
}

/**
 * Show a local notification for badge earned
 */
export async function showBadgeNotification(badgeName: string, badgeIcon: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🎉 New Badge Earned!`,
      body: `You've earned the "${badgeName}" badge! ${badgeIcon}`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Show immediately
  });
}

/**
 * Show a local notification for challenge progress
 */
export async function showChallengeProgressNotification(
  challengeTitle: string,
  progress: number,
  target: number
) {
  if (target === 0) {
    console.warn("Challenge target is 0, skipping notification");
    return;
  }
  
  const percentage = Math.round((progress / target) * 100);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `💪 Challenge Progress`,
      body: `${challengeTitle}: ${progress}/${target} (${percentage}%)`,
      sound: false,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
    trigger: null,
  });
}

/**
 * Show a local notification for completed challenge
 */
export async function showChallengeCompletedNotification(
  challengeTitle: string,
  rewardPoints: number
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🏆 Challenge Completed!`,
      body: `You completed "${challengeTitle}" and earned ${rewardPoints} points!`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null,
  });
}

/**
 * Show a local notification for active challenges reminder
 */
export async function showActiveChallengesReminder(count: number) {
  if (count === 0) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `🎯 Active Challenges`,
      body: `You have ${count} active challenge${count > 1 ? "s" : ""}. Keep going!`,
      sound: false,
      priority: Notifications.AndroidNotificationPriority.LOW,
    },
    trigger: {
      seconds: 60 * 60 * 24, // 24 hours
      repeats: true,
    },
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
