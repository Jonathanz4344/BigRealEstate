import { create } from "zustand";
import type { INotification } from "../interfaces";

type NotificationStore = {
  notifications: INotification[];
  unreadCount: number;
  setNotifications: (notifications: INotification[]) => void;
  addNotification: (notification: INotification) => void;
  markAsRead: (notificationId: number) => void;
  removeNotification: (notificationId: number) => void;
  clearAll: () => void;
};

export const useNotificationStore = create<NotificationStore>()((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.viewed).length,
    }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.viewed ? 0 : 1),
    })),

  markAsRead: (notificationId) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.notification_id === notificationId ? { ...n, viewed: true } : n,
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.viewed).length,
      };
    }),

  removeNotification: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find(
        (n) => n.notification_id === notificationId,
      );
      const wasUnread = notification && !notification.viewed;
      return {
        notifications: state.notifications.filter(
          (n) => n.notification_id !== notificationId,
        ),
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      };
    }),

  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));
