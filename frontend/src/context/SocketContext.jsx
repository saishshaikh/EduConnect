import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import moment from "moment";
import { userDataContext } from "./UserContext";
import { authDataContext } from "./AuthContext";

export const SocketContext = createContext();

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {}
};

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeenMap, setLastSeenMap] = useState({}); // userId -> timestamp
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);

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

    // Real-time presence and last seen updates
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

    newSocket.on("userTyping", ({ conversationId, senderId }) => {
      if (senderId !== userData._id) {
        setTypingUsers((prev) => ({
          ...prev,
          [conversationId]: { senderId, isTyping: true },
        }));
      }
    });

    newSocket.on("userStopTyping", ({ conversationId }) => {
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
  }, [userData?._id, serverUrl]);

  // Typing helper with debouncing
  const typingTimeoutsRef = useRef({});

  const emitTyping = useCallback(
    (conversationId, receiverId) => {
      if (!socketRef.current || !conversationId || !receiverId) return;

      socketRef.current.emit("typing", { conversationId, receiverId });

      if (typingTimeoutsRef.current[conversationId]) {
        clearTimeout(typingTimeoutsRef.current[conversationId]);
      }

      typingTimeoutsRef.current[conversationId] = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("stopTyping", { conversationId, receiverId });
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
    socketRef.current.emit("stopTyping", { conversationId, receiverId });
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

  // Accurate human-readable presence status
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
    playNotificationSound,
    unreadTotal,
    setUnreadTotal,
    activeConversationId,
    setActiveConversationId,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
