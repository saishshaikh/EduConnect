import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";
import Call from "../models/call.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "https://edu-connect-hzmh.vercel.app",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/.*\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

// Map of userId -> Set of socket IDs
class CompatibleUserSocketMap extends Map {
  get(userId) {
    if (!userId) return undefined;
    const sockets = super.get(userId.toString());
    if (!sockets) return undefined;
    if (sockets instanceof Set) {
      const arr = Array.from(sockets);
      return arr[arr.length - 1]; // Latest socket ID for string backward compatibility
    }
    return sockets;
  }
}

export const userSocketMap = new CompatibleUserSocketMap();
export const userLastSeenMap = new Map(); // userId -> Date
const disconnectGraceTimeouts = new Map(); // userId -> TimeoutId

// Active Call Session State
// callId -> { callId, callerId, receiverId, callType, conversationId, status, startedAt, answeredAt, timeoutTimer }
const activeCalls = new Map();
// userId -> callId
const userActiveCallMap = new Map();

export const getReceiverSocketIds = (userId) => {
  if (!userId) return [];
  const sockets = Map.prototype.get.call(userSocketMap, userId.toString());
  if (!sockets) return [];
  if (sockets instanceof Set) {
    return Array.from(sockets);
  }
  return [sockets];
};

export const emitToUser = (userId, event, data) => {
  const socketIds = getReceiverSocketIds(userId);
  socketIds.forEach((socketId) => {
    io.to(socketId).emit(event, data);
  });
};

export const getOnlineUserIds = () => {
  return Array.from(userSocketMap.keys());
};

// Helper to record call event into Chat messages timeline
const recordCallInChat = async (callData, status, duration = 0) => {
  try {
    const { callerId, receiverId, conversationId, callType, callId } = callData;

    let contentText = "";
    if (status === "completed") {
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;
      const formattedDuration = `${mins > 0 ? `${mins}m ` : ""}${secs}s`;
      contentText = `${callType === "video" ? "🎥 Video call" : "📞 Voice call"} • ${formattedDuration}`;
    } else if (status === "missed") {
      contentText = `${callType === "video" ? "🎥 Missed video call" : "📞 Missed voice call"}`;
    } else if (status === "rejected") {
      contentText = `${callType === "video" ? "🎥 Video call declined" : "📞 Voice call declined"}`;
    } else if (status === "busy") {
      contentText = `${callType === "video" ? "🎥 Video call (User busy)" : "📞 Voice call (User busy)"}`;
    } else {
      contentText = `${callType === "video" ? "🎥 Video call cancelled" : "📞 Voice call cancelled"}`;
    }

    const message = await Message.create({
      conversationId,
      sender: callerId,
      receiver: receiverId,
      content: contentText,
      messageType: "call",
      callInfo: {
        callId,
        callType,
        status,
        duration,
      },
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "sender receiver",
      "firstName lastName userName profileImage headline isOnline lastSeen"
    );

    const payload = {
      message: populatedMessage,
      conversationId,
    };

    emitToUser(receiverId, "newMessage", payload);
    emitToUser(callerId, "messageSent", payload);
  } catch (err) {
    console.error("Error recording call in chat:", err);
  }
};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId || socket.handshake.auth.userId;

  const registerUser = async (uid) => {
    if (!uid) return;
    const uidStr = uid.toString();
    socket.userId = uidStr;

    if (disconnectGraceTimeouts.has(uidStr)) {
      clearTimeout(disconnectGraceTimeouts.get(uidStr));
      disconnectGraceTimeouts.delete(uidStr);
    }

    let userSockets = Map.prototype.get.call(userSocketMap, uidStr);
    if (!userSockets || !(userSockets instanceof Set)) {
      userSockets = new Set();
      Map.prototype.set.call(userSocketMap, uidStr, userSockets);
    }
    userSockets.add(socket.id);

    const now = new Date();
    userLastSeenMap.set(uidStr, now);

    try {
      await User.findByIdAndUpdate(uidStr, {
        isOnline: true,
        lastSeen: now,
      });
    } catch {}

    io.emit("getOnlineUsers", getOnlineUserIds());
    io.emit("user_presence_update", {
      userId: uidStr,
      isOnline: true,
      lastSeen: now,
    });
  };

  if (userId) {
    registerUser(userId);
  }

  socket.on("register", (uid) => {
    registerUser(uid);
  });

  socket.on("heartbeat", async () => {
    if (!socket.userId) return;
    const now = new Date();
    userLastSeenMap.set(socket.userId, now);
    try {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: true,
        lastSeen: now,
      });
    } catch {}
    io.emit("user_presence_update", {
      userId: socket.userId,
      isOnline: true,
      lastSeen: now,
    });
  });

  // ==========================================
  // REAL-TIME TYPING EVENTS (AUTHENTICATED)
  // ==========================================
  socket.on("typing_start", ({ conversationId, receiverId }) => {
    if (!socket.userId || !receiverId) return;
    emitToUser(receiverId, "user_typing", {
      conversationId,
      senderId: socket.userId,
      isTyping: true,
    });
  });

  socket.on("typing_stop", ({ conversationId, receiverId }) => {
    if (!socket.userId || !receiverId) return;
    emitToUser(receiverId, "user_stop_typing", {
      conversationId,
      senderId: socket.userId,
    });
  });

  socket.on("typing", ({ conversationId, receiverId }) => {
    if (!socket.userId || !receiverId) return;
    emitToUser(receiverId, "user_typing", {
      conversationId,
      senderId: socket.userId,
      isTyping: true,
    });
  });

  socket.on("stopTyping", ({ conversationId, receiverId }) => {
    if (!socket.userId || !receiverId) return;
    emitToUser(receiverId, "user_stop_typing", {
      conversationId,
      senderId: socket.userId,
    });
  });

  // Mark read event
  socket.on("markRead", ({ conversationId, senderId }) => {
    if (!socket.userId || !senderId) return;
    emitToUser(senderId, "messagesRead", {
      conversationId,
      readerId: socket.userId,
    });
  });

  // ==========================================
  // WEBRTC CALLING STATE MACHINE & SIGNALING
  // ==========================================

  // 1. Initiate Call
  socket.on("call_initiate", async ({ receiverId, callType = "voice", conversationId }) => {
    try {
      const callerId = socket.userId;
      if (!callerId) {
        return socket.emit("call_failed", { message: "Unauthorized caller" });
      }

      if (!receiverId || callerId.toString() === receiverId.toString()) {
        return socket.emit("call_failed", { message: "Invalid call receiver" });
      }

      // Check if caller is already in an active call
      if (userActiveCallMap.has(callerId)) {
        return socket.emit("call_failed", { message: "You are already in an active call" });
      }

      // Check if receiver is already on another call
      if (userActiveCallMap.has(receiverId.toString())) {
        // Record busy call
        const busyCall = await Call.create({
          caller: callerId,
          receiver: receiverId,
          conversation: conversationId,
          callType,
          status: "busy",
          startedAt: new Date(),
          endedAt: new Date(),
        });
        await recordCallInChat(
          { callerId, receiverId, conversationId, callType, callId: busyCall._id },
          "busy",
          0
        );

        socket.emit("call_busy", { message: "User is currently busy on another call", receiverId });
        emitToUser(receiverId, "call_missed_busy", { callerId, callType });
        return;
      }

      // Check if receiver is online
      const receiverSockets = getReceiverSocketIds(receiverId);
      if (receiverSockets.length === 0) {
        const offlineCall = await Call.create({
          caller: callerId,
          receiver: receiverId,
          conversation: conversationId,
          callType,
          status: "missed",
          startedAt: new Date(),
          endedAt: new Date(),
        });
        await recordCallInChat(
          { callerId, receiverId, conversationId, callType, callId: offlineCall._id },
          "missed",
          0
        );

        socket.emit("call_failed", { message: "User is currently offline" });
        return;
      }

      // Create Call in DB
      const newCall = await Call.create({
        caller: callerId,
        receiver: receiverId,
        conversation: conversationId,
        callType,
        status: "missed", // default until answered
        startedAt: new Date(),
      });

      const callId = newCall._id.toString();

      // Set timeout timer (35 seconds) for unanswered call
      const timeoutTimer = setTimeout(async () => {
        const callSession = activeCalls.get(callId);
        if (callSession && callSession.status === "calling") {
          activeCalls.delete(callId);
          userActiveCallMap.delete(callerId);
          userActiveCallMap.delete(receiverId.toString());

          await Call.findByIdAndUpdate(callId, {
            status: "missed",
            endedAt: new Date(),
          });

          await recordCallInChat(
            { callerId, receiverId, conversationId, callType, callId },
            "missed",
            0
          );

          emitToUser(callerId, "call_timeout", { callId, receiverId });
          emitToUser(receiverId, "call_missed", { callId, callerId, callType });
        }
      }, 35000);

      const callSession = {
        callId,
        callerId,
        receiverId: receiverId.toString(),
        callType,
        conversationId,
        status: "calling",
        startedAt: new Date(),
        answeredAt: null,
        timeoutTimer,
      };

      activeCalls.set(callId, callSession);
      userActiveCallMap.set(callerId, callId);
      userActiveCallMap.set(receiverId.toString(), callId);

      // Fetch caller details for incoming call overlay
      const callerUser = await User.findById(callerId).select(
        "firstName lastName userName profileImage headline"
      );

      // Notify receiver sockets
      emitToUser(receiverId, "call_incoming", {
        callId,
        caller: callerUser,
        callType,
        conversationId,
      });

      // Confirm to caller
      socket.emit("call_ringing", {
        callId,
        receiverId,
        callType,
        conversationId,
      });
    } catch (err) {
      console.error("Error in call_initiate:", err);
      socket.emit("call_failed", { message: "Server error initiating call" });
    }
  });

  // 2. Accept Call
  socket.on("call_accept", async ({ callId }) => {
    try {
      const callSession = activeCalls.get(callId);
      if (!callSession) {
        return socket.emit("call_failed", { message: "Call session not found or expired" });
      }

      if (socket.userId !== callSession.receiverId) {
        return socket.emit("call_failed", { message: "Unauthorized to accept this call" });
      }

      // Clear ringing timeout
      if (callSession.timeoutTimer) {
        clearTimeout(callSession.timeoutTimer);
        callSession.timeoutTimer = null;
      }

      const now = new Date();
      callSession.status = "connected";
      callSession.answeredAt = now;

      await Call.findByIdAndUpdate(callId, {
        status: "completed",
        answeredAt: now,
      });

      // Notify caller and receiver
      emitToUser(callSession.callerId, "call_accepted", {
        callId,
        receiverId: socket.userId,
      });

      socket.emit("call_connected", {
        callId,
        callerId: callSession.callerId,
      });
    } catch (err) {
      console.error("Error in call_accept:", err);
    }
  });

  // 3. Reject Call
  socket.on("call_reject", async ({ callId }) => {
    try {
      const callSession = activeCalls.get(callId);
      if (!callSession) return;

      if (socket.userId !== callSession.receiverId) return;

      if (callSession.timeoutTimer) {
        clearTimeout(callSession.timeoutTimer);
      }

      activeCalls.delete(callId);
      userActiveCallMap.delete(callSession.callerId);
      userActiveCallMap.delete(callSession.receiverId);

      await Call.findByIdAndUpdate(callId, {
        status: "rejected",
        endedAt: new Date(),
      });

      await recordCallInChat(callSession, "rejected", 0);

      emitToUser(callSession.callerId, "call_rejected", {
        callId,
        receiverId: socket.userId,
      });
    } catch (err) {
      console.error("Error in call_reject:", err);
    }
  });

  // 4. Cancel Call (by Caller before answered)
  socket.on("call_cancel", async ({ callId }) => {
    try {
      const callSession = activeCalls.get(callId);
      if (!callSession) return;

      if (socket.userId !== callSession.callerId) return;

      if (callSession.timeoutTimer) {
        clearTimeout(callSession.timeoutTimer);
      }

      activeCalls.delete(callId);
      userActiveCallMap.delete(callSession.callerId);
      userActiveCallMap.delete(callSession.receiverId);

      await Call.findByIdAndUpdate(callId, {
        status: "cancelled",
        endedAt: new Date(),
      });

      await recordCallInChat(callSession, "cancelled", 0);

      emitToUser(callSession.receiverId, "call_cancelled", {
        callId,
        callerId: socket.userId,
      });
    } catch (err) {
      console.error("Error in call_cancel:", err);
    }
  });

  // 5. End Call (during active connection)
  socket.on("call_end", async ({ callId, duration = 0 }) => {
    try {
      const callSession = activeCalls.get(callId);
      if (!callSession) return;

      if (socket.userId !== callSession.callerId && socket.userId !== callSession.receiverId) {
        return;
      }

      if (callSession.timeoutTimer) {
        clearTimeout(callSession.timeoutTimer);
      }

      activeCalls.delete(callId);
      userActiveCallMap.delete(callSession.callerId);
      userActiveCallMap.delete(callSession.receiverId);

      let finalDuration = duration;
      let finalStatus = "completed";
      if (!callSession.answeredAt) {
        finalStatus = socket.userId === callSession.callerId ? "cancelled" : "missed";
        finalDuration = 0;
      } else if (!finalDuration) {
        finalDuration = Math.round((Date.now() - new Date(callSession.answeredAt).getTime()) / 1000);
      }

      await Call.findByIdAndUpdate(callId, {
        status: finalStatus,
        endedAt: new Date(),
        duration: finalDuration,
      });

      await recordCallInChat(callSession, finalStatus, finalDuration);

      const otherUserId =
        socket.userId === callSession.callerId ? callSession.receiverId : callSession.callerId;

      emitToUser(otherUserId, "call_ended", {
        callId,
        duration: finalDuration,
      });
    } catch (err) {
      console.error("Error in call_end:", err);
    }
  });

  // 6. WebRTC SDP Offer
  socket.on("webrtc_offer", ({ callId, targetUserId, sdp }) => {
    if (!socket.userId || !targetUserId || !sdp) return;
    const callSession = activeCalls.get(callId);
    if (!callSession) return;

    emitToUser(targetUserId, "webrtc_offer", {
      callId,
      senderId: socket.userId,
      sdp,
    });
  });

  // 7. WebRTC SDP Answer
  socket.on("webrtc_answer", ({ callId, targetUserId, sdp }) => {
    if (!socket.userId || !targetUserId || !sdp) return;
    const callSession = activeCalls.get(callId);
    if (!callSession) return;

    emitToUser(targetUserId, "webrtc_answer", {
      callId,
      senderId: socket.userId,
      sdp,
    });
  });

  // 8. WebRTC ICE Candidate
  socket.on("webrtc_ice_candidate", ({ callId, targetUserId, candidate }) => {
    if (!socket.userId || !targetUserId || !candidate) return;
    const callSession = activeCalls.get(callId);
    if (!callSession) return;

    emitToUser(targetUserId, "webrtc_ice_candidate", {
      callId,
      senderId: socket.userId,
      candidate,
    });
  });

  // Disconnect Handler
  socket.on("disconnect", () => {
    const uidStr = socket.userId;
    if (!uidStr) return;

    // Check if user was in an active call
    if (userActiveCallMap.has(uidStr)) {
      const callId = userActiveCallMap.get(uidStr);
      const callSession = activeCalls.get(callId);

      if (callSession) {
        if (callSession.timeoutTimer) {
          clearTimeout(callSession.timeoutTimer);
        }

        activeCalls.delete(callId);
        userActiveCallMap.delete(callSession.callerId);
        userActiveCallMap.delete(callSession.receiverId);

        const otherUserId =
          uidStr === callSession.callerId ? callSession.receiverId : callSession.callerId;

        emitToUser(otherUserId, "call_ended", {
          callId,
          reason: "User disconnected",
        });

        Call.findByIdAndUpdate(callId, {
          status: callSession.status === "connected" ? "completed" : "cancelled",
          endedAt: new Date(),
        }).catch(() => {});
      }
    }

    const userSockets = Map.prototype.get.call(userSocketMap, uidStr);
    if (userSockets && userSockets instanceof Set) {
      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        const timeout = setTimeout(async () => {
          disconnectGraceTimeouts.delete(uidStr);
          const currentSockets = Map.prototype.get.call(userSocketMap, uidStr);
          if (!currentSockets || currentSockets.size === 0) {
            userSocketMap.delete(uidStr);
            const now = new Date();
            userLastSeenMap.set(uidStr, now);

            try {
              await User.findByIdAndUpdate(uidStr, {
                isOnline: false,
                lastSeen: now,
              });
            } catch {}

            io.emit("getOnlineUsers", getOnlineUserIds());
            io.emit("user_presence_update", {
              userId: uidStr,
              isOnline: false,
              lastSeen: now,
            });
          }
        }, 5000);

        disconnectGraceTimeouts.set(uidStr, timeout);
      }
    }
  });
});

export { app, io, server };
