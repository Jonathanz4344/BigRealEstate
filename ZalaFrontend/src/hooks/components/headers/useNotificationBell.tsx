import { useState, useEffect, useRef, useCallback } from "react";
import {
  useAuthStore,
  useNotificationStore,
  useTeamsStore,
} from "../../../stores";
import { useApi } from "../../api";
import { useSnack } from "../../utils";
import { wsManager } from "../../../utils";
import { CONFIG } from "../../../config";
import type { INotification, ITeam } from "../../../interfaces";

export const useNotificationBell = () => {
  const user = useAuthStore((state) => state.user);
  const {
    notifications,
    unreadCount,
    setNotifications,
    addNotification,
    markAsRead,
    removeNotification,
  } = useNotificationStore();
  const { teams, addTeam, removeTeam, setTeams } = useTeamsStore();
  const api = useApi();
  const [, errorMsg] = useSnack();

  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasFetchedNotifications = useRef(false);
  const wsConnected = useRef(false);
  const isProduction = CONFIG.env === "production";
  const POLL_INTERVAL = 1000; // 1 seconds

  // Constants
  const PREVIEW_COUNT = 3;
  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, PREVIEW_COUNT);
  const hasMoreNotifications = notifications.length > PREVIEW_COUNT;

  // Load notifications on mount - only once
  useEffect(() => {
    if (!user || hasFetchedNotifications.current) return;

    hasFetchedNotifications.current = true;
    const loadNotifications = async () => {
      const response = await api.getNotifications(user.userId);
      if (response.data) {
        setNotifications(response.data);
      }
    };
    loadNotifications();
  }, [user]);

  // Polling fallback for production (no WSS support without a domain)
  const pollNotifications = useCallback(async () => {
    if (!user) return;
    const response = await api.getNotifications(user.userId);
    if (response.data) {
      setNotifications(response.data);
    }
    const teamsResponse = await api.getTeamsByUser(user.userId);
    if (teamsResponse.data) {
      setTeams(teamsResponse.data);
    }
  }, [user]);

  // Production: poll every 15s | Dev: use WebSocket
  useEffect(() => {
    if (!user) return;

    if (isProduction) {
      const interval = setInterval(pollNotifications, POLL_INTERVAL);
      return () => clearInterval(interval);
    }

    // Dev: WebSocket connection for real-time notifications
    if (wsConnected.current) return;
    const wsProtocol = CONFIG.api.startsWith("https") ? "wss" : "ws";
    const wsHost = CONFIG.api.replace(/^https?:\/\//, "");
    const wsUrl = `${wsProtocol}://${wsHost}/ws/notifications/${user.userId}`;

    wsManager.connect(wsUrl);
    wsConnected.current = true;

    const unsubscribe = wsManager.on<INotification>(
      "notification",
      (message) => {
        addNotification(message.data as INotification);
      },
    );

    const unsubscribeTeamDeleted = wsManager.on<{
      team_id: number;
      team_name: string;
    }>("team_deleted", (message) => {
      removeTeam(message.data.team_id);
    });

    const unsubscribeTeamJoined = wsManager.on<ITeam>(
      "team_joined",
      (message) => {
        addTeam(message.data);
      },
    );

    const unsubscribeMemberKicked = wsManager.on<{
      team_id: number;
      team_name: string;
    }>("member_kicked", (message) => {
      removeTeam(message.data.team_id);
    });

    return () => {
      unsubscribe();
      unsubscribeTeamDeleted();
      unsubscribeTeamJoined();
      unsubscribeMemberKicked();
      wsManager.disconnect();
      wsConnected.current = false;
    };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Actions
  const onMarkAsRead = async (notificationId: number) => {
    const response = await api.markNotificationRead(notificationId);
    if (response.data) {
      markAsRead(notificationId);
    }
  };

  const onMarkAllAsRead = async () => {
    for (const notif of displayedNotifications.filter((n) => !n.viewed)) {
      await onMarkAsRead(notif.notification_id);
    }
  };

  const onRespondToInvitation = async (
    invitationId: number,
    accept: boolean,
    notificationId: number,
    _teamId?: number,
  ) => {
    if (!user) return;

    // Check if user is already in a team before accepting (users can only join 1 team)
    if (accept && teams.length > 0) {
      errorMsg(
        "You're already on a team. Leave your current team first to join another.",
      );
      return;
    }

    const response = await api.respondToInvitation({
      invitation_id: invitationId,
      accept,
      user_id: user.userId,
    });

    if (response.err) {
      errorMsg(response.err);
      return;
    }

    markAsRead(notificationId);

    // Refresh notifications after accepting/declining
    const refreshResponse = await api.getNotifications(user.userId);
    if (refreshResponse.data) {
      setNotifications(refreshResponse.data);
    }

    // If accepted, reload teams so the dashboard gets full team data (properties, boards, etc.)
    if (accept) {
      const teamsResponse = await api.getTeamsByUser(user.userId);
      if (teamsResponse.data) {
        setTeams(teamsResponse.data);
      }
    }
  };

  const onClearNotification = async (notificationId: number) => {
    const response = await api.deleteNotification(notificationId);
    if (!response.err) {
      removeNotification(notificationId);
    }
  };

  // UI Controls
  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);
  const toggleShowAll = () => setShowAll(!showAll);

  // Helpers
  const getNotificationStyle = (type: string | undefined | null) => {
    switch (type) {
      case "team_invite":
        return { icon: "📨", color: "bg-blue-500", label: "Invitation" };
      case "team_invite_accepted":
        return { icon: "✅", color: "bg-green-500", label: "Accepted" };
      case "team_invite_declined":
        return { icon: "❌", color: "bg-red-500", label: "Declined" };
      case "team_removed":
        return { icon: "🚫", color: "bg-orange-500", label: "Removed" };
      default:
        return { icon: "🔔", color: "bg-accent", label: null };
    }
  };

  const isInvitePending = (notif: INotification) =>
    notif.type === "team_invite" && notif.invitation_id && !notif.viewed;

  const isInviteResponded = (notif: INotification) =>
    notif.type === "team_invite_accepted" ||
    notif.type === "team_invite_declined";

  const isRemoved = (notif: INotification) => notif.type === "team_removed";

  // User can only join one team
  const canJoinTeam = teams.length === 0;

  return {
    // User
    user,

    // Refs
    dropdownRef,

    // Data
    notifications,
    displayedNotifications,
    unreadCount,
    hasMoreNotifications,
    canJoinTeam,

    // UI State
    isOpen,
    showAll,

    // Actions
    actions: {
      onMarkAsRead,
      onMarkAllAsRead,
      onRespondToInvitation,
      onClearNotification,
    },

    // UI Controls
    controls: {
      toggleDropdown,
      closeDropdown,
      toggleShowAll,
    },

    // Helpers
    helpers: {
      getNotificationStyle,
      isInvitePending,
      isInviteResponded,
      isRemoved,
    },
  };
};
