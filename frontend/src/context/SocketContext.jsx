import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import moment from "moment";
import { userDataContext } from "./UserContext";
import { authDataContext } from "./AuthContext";
import NotificationToast from "../components/NotificationToast";

export const SocketContext = createContext();

// Modern audio chimes generated via Web Audio API (100% offline & zero external dependency)
const playSound = (type = "message") => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "message") {
      // Instagram-style double chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "story") {
      // Sparkle chime
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.18); // C6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // General alert chime
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch {}
};

// Trigger mobile vibration if supported
const triggerVibration = (pattern = [100, 50, 100]) => {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  } catch {}
};

// Trigger Native Browser / OS Mobile Notification
const triggerNativeNotification = async (title, options = {}) => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
      // If service worker is registered, use showNotification for better mobile push behavior
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          registration.showNotification(title, {
            icon: "/pwa-192x192.png",
            badge: "/pwa-192x192.png",
            vibrate: [200, 100, 200],
            ...options,
          });
          return;
        }
      }

      new Notification(title, {
        icon: "/pwa-192x192.png",
        ...options,
      });
    }
  } catch (err) {
    console.warn("Native notification error:", err);
  }
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeenMap, setLastSeenMap] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeToast, setActiveToast] = useState(null);

  const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);

  // Request browser notification permission once user is authenticated
  useEffect(() => {
    if (userData?._id && typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, [userData?._id]);

  useEffect(() => {
    if (!userData?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setOnlineUsers([]);
      }
      return;
    }

    const newSocket = io(serverUrl || "http://localhost:8000", {
      query: { userId: userData._id },
      auth: { userId: userData._id },
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("register", userData._id);
    });

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    });

    newSocket.on("user_presence_update", ({ userId, isOnline, lastSeen }) => {
      if (!userId) return;
      const uid = userId.toString();

      if (isOnline) {
        setOnlineUsers((prev) => (prev.includes(uid) ? prev : [...prev, uid]));
      } else {
        setOnlineUsers((prev) => prev.filter((id) => id !== uid));
      }

      if (lastSeen) {
        setLastSeenMap((prev) => ({
          ...prev,
          [uid]: lastSeen,
        }));
      }
    });

    // 1. Real-Time Incoming Message Handler (Instagram-Style)
    newSocket.on("newMessage", (payload) => {
      const message = payload?.message || payload;
      const sender = message?.sender;
      const senderId = sender?._id ? sender._id.toString() : sender?.toString();

      // Don't notify if sent by me
      if (!senderId || senderId === userData._id.toString()) return;

      const senderName = `${sender?.firstName || ""} ${sender?.lastName || ""}`.trim() || sender?.userName || "Someone";
      const messagePreview = message?.messageType === "image" 
        ? "📷 Sent a photo" 
        : message?.messageType === "call"
        ? message?.content || "📞 Call event"
        : message?.content || "Sent a message";

      // If user is not currently in the open conversation with this sender, alert them
      const isViewingThisChat = activeConversationId && (
        activeConversationId === payload?.conversation?._id || 
        activeConversationId === payload?.conversationId
      );

      if (!isViewingThisChat) {
        playSound("message");
        triggerVibration([100, 50, 100]);

        // In-app Instagram-style toast
        setActiveToast({
          id: Date.now(),
          type: "message",
          title: senderName,
          subtitle: messagePreview,
          avatar: sender?.profileImage,
          senderName,
          targetPath: `/chat/${senderId}`,
        });

        // Native System / Mobile Push Notification
        triggerNativeNotification(`${senderName}`, {
          body: messagePreview,
          tag: `msg-${senderId}`,
          data: { url: `/chat/${senderId}` },
        });

        setUnreadTotal((prev) => prev + 1);
      }
    });

    // 2. Real-Time Activity & Social Notifications (Connections, Likes, Comments)
    newSocket.on("newNotification", (notification) => {
      if (!notification) return;
      const relatedUser = notification.relatedUser || {};
      const senderName = `${relatedUser.firstName || ""} ${relatedUser.lastName || ""}`.trim() || relatedUser.userName || "Someone";

      let title = senderName;
      let subtitle = "New notification";
      let targetPath = "/notification";

      if (notification.type === "connectionRequest") {
        title = "Connection Request";
        subtitle = `${senderName} sent you a connection request`;
        targetPath = "/network";
      } else if (notification.type === "connectionAccepted") {
        title = "Connection Accepted";
        subtitle = `${senderName} accepted your connection request`;
        targetPath = `/profile/${relatedUser._id || ""}`;
      } else if (notification.type === "like") {
        title = "New Like ❤️";
        subtitle = `${senderName} liked your post`;
        targetPath = "/feed";
      } else if (notification.type === "comment") {
        title = "New Comment 💬";
        subtitle = `${senderName} commented on your post`;
        targetPath = "/feed";
      }

      playSound("alert");
      triggerVibration([150, 80, 150]);

      setActiveToast({
        id: Date.now(),
        type: notification.type,
        title,
        subtitle,
        avatar: relatedUser.profileImage,
        senderName,
        targetPath,
      });

      triggerNativeNotification(title, {
        body: subtitle,
        tag: `notif-${notification._id || Date.now()}`,
        data: { url: targetPath },
      });
    });

    // 3. Real-Time Story Upload from Connections
    newSocket.on("newStory", (story) => {
      if (!story || story.user?._id === userData._id) return;
      const author = story.user || {};
      const authorName = `${author.firstName || ""} ${author.lastName || ""}`.trim() || author.userName || "A classmate";

      playSound("story");
      triggerVibration([80, 40, 80]);

      setActiveToast({
        id: Date.now(),
        type: "story",
        title: "New Story 📸",
        subtitle: `${authorName} posted a new 24h story`,
        avatar: author.profileImage,
        senderName: authorName,
        targetPath: "/feed",
      });

      triggerNativeNotification(`New Story from ${authorName}`, {
        body: "Tap to view the new story on EduConnect",
        tag: `story-${author._id}`,
        data: { url: "/feed" },
      });
    });

    // Typing handlers
    newSocket.on("user_typing", ({ conversationId, senderId }) => {
      if (senderId !== userData._id) {
        setTypingUsers((prev) => ({
          ...prev,
          [conversationId]: { senderId, isTyping: true },
        }));
      }
    });

    newSocket.on("user_stop_typing", ({ conversationId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    });

    // Heartbeat mechanism every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (newSocket && newSocket.connected) {
        newSocket.emit("heartbeat");
      }
    }, 30000);

    const handleWindowFocus = () => {
      if (newSocket && newSocket.connected) {
        newSocket.emit("heartbeat");
      }
    };
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("focus", handleWindowFocus);
      newSocket.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, [userData?._id, serverUrl, activeConversationId]);

  // Typing helper with debouncing
  const typingTimeoutsRef = useRef({});

  const emitTyping = useCallback(
    (conversationId, receiverId) => {
      if (!socketRef.current || !conversationId || !receiverId) return;

      socketRef.current.emit("typing_start", { conversationId, receiverId });

      if (typingTimeoutsRef.current[conversationId]) {
        clearTimeout(typingTimeoutsRef.current[conversationId]);
      }

      typingTimeoutsRef.current[conversationId] = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("typing_stop", { conversationId, receiverId });
        }
        delete typingTimeoutsRef.current[conversationId];
      }, 2000);
    },
    []
  );

  const emitStopTyping = useCallback((conversationId, receiverId) => {
    if (!socketRef.current || !conversationId || !receiverId) return;
    if (typingTimeoutsRef.current[conversationId]) {
      clearTimeout(typingTimeoutsRef.current[conversationId]);
      delete typingTimeoutsRef.current[conversationId];
    }
    socketRef.current.emit("typing_stop", { conversationId, receiverId });
  }, []);

  const markSocketRead = useCallback((conversationId, senderId) => {
    if (!socketRef.current || !conversationId || !senderId) return;
    socketRef.current.emit("markRead", { conversationId, senderId });
  }, []);

  const isUserOnline = useCallback(
    (targetUserId) => {
      if (!targetUserId) return false;
      return onlineUsers.includes(targetUserId.toString());
    },
    [onlineUsers]
  );

  const getPresenceText = useCallback(
    (targetUser) => {
      if (!targetUser) return "Offline";
      const targetId = targetUser._id ? targetUser._id.toString() : targetUser.toString();

      if (onlineUsers.includes(targetId)) {
        return "Active now";
      }

      const lastSeen = lastSeenMap[targetId] || targetUser.lastSeen;
      if (!lastSeen) return "Offline";

      const diffMinutes = moment().diff(moment(lastSeen), "minutes");
      if (diffMinutes < 1) {
        return "Active just now";
      } else if (diffMinutes < 60) {
        return `Active ${diffMinutes}m ago`;
      } else if (diffMinutes < 1440) {
        const hours = Math.floor(diffMinutes / 60);
        return `Active ${hours}h ago`;
      } else if (diffMinutes < 2880) {
        return "Active yesterday";
      } else {
        return `Active ${moment(lastSeen).format("MMM D")}`;
      }
    },
    [onlineUsers, lastSeenMap]
  );

  const value = {
    socket,
    onlineUsers,
    lastSeenMap,
    isUserOnline,
    getPresenceText,
    typingUsers,
    emitTyping,
    emitStopTyping,
    markSocketRead,
    playNotificationSound: playSound,
    unreadTotal,
    setUnreadTotal,
    activeConversationId,
    setActiveConversationId,
    triggerNativeNotification,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
      <NotificationToast 
        toast={activeToast} 
        onDismiss={() => setActiveToast(null)} 
      />
    </SocketContext.Provider>
  );
};

export default SocketProvider;
