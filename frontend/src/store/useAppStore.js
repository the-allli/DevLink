import { create } from "zustand";

// Global app store for cross-cutting state (Stream client, notifications, etc.)
export const useAppStore = create((set, get) => ({
  // Stream Chat client and a version to notify subscribers when it (re)initializes
  streamClient: null,
  streamClientVersion: 0,
  setStreamClient: (client) =>
    set((state) => ({
      streamClient: client,
      streamClientVersion: state.streamClientVersion + 1,
    })),

  // Server-backed notifications unread count
  notificationsUnreadCount: 0,
  setNotificationsUnreadCount: (count) => set({ notificationsUnreadCount: count || 0 }),

  // Aggregate unread messages count (optional; not yet used everywhere)
  totalUnreadMessages: 0,
  setTotalUnreadMessages: (count) => set({ totalUnreadMessages: count || 0 }),
}));
