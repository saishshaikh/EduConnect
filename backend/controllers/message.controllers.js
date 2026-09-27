import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import { emitToUser, userSocketMap, userLastSeenMap } from "../socket/socket.js";

// Helper to populate participant presence
const PARTICIPANT_FIELDS = "firstName lastName userName profileImage headline isOnline lastSeen";

// 1. Get or create conversation between current user and target user
export const getOrCreateConversation = async (req, res) => {
  try {
    const senderId = req.userId;
    const { targetUserId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }

    if (senderId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: "Cannot create conversation with yourself" });
    }

    const targetUser = await User.findById(targetUserId).select(PARTICIPANT_FIELDS);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, targetUserId] },
    })
      .populate("participants", PARTICIPANT_FIELDS)
      .populate("lastMessage");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, targetUserId],
      });

      conversation = await Conversation.findById(conversation._id).populate(
        "participants",
        PARTICIPANT_FIELDS
      );
    }

    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Error in getOrCreateConversation:", error);
    return res.status(500).json({ message: "Server error getting conversation" });
  }
};

// 2. Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", PARTICIPANT_FIELDS)
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          receiver: userId,
          isRead: false,
        });

        const convObj = conv.toObject();
        convObj.unreadCount = unreadCount;
        return convObj;
      })
    );

    return res.status(200).json(conversationsWithUnread);
  } catch (error) {
    console.error("Error in getConversations:", error);
    return res.status(500).json({ message: "Server error getting conversations" });
  }
};

// 3. Get messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Unauthorized access to conversation" });
    }

    const messages = await Message.find({
      conversationId,
      deletedAt: null,
    }).sort({ createdAt: 1 });

    // Mark unread messages received by this user as read
    const unreadMessages = messages.filter(
      (msg) => msg.receiver.toString() === userId.toString() && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      const now = new Date();
      await Message.updateMany(
        {
          conversationId,
          receiver: userId,
          isRead: false,
        },
        {
          $set: { isRead: true, readAt: now },
        }
      );

      const otherParticipantId = conversation.participants.find(
        (p) => p.toString() !== userId.toString()
      );

      if (otherParticipantId) {
        emitToUser(otherParticipantId.toString(), "messagesRead", {
          conversationId,
          readerId: userId,
          readAt: now,
        });
      }
    }

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({ message: "Server error fetching messages" });
  }
};

// 4. Send a message (Text or Camera / Image)
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId, content, conversationId } = req.body;
    let imageUrl = "";

    // Handle file upload via multer
    if (req.file) {
      const uploadRes = await uploadOnCloudinary(req.file.path);
      imageUrl = typeof uploadRes === "string" ? uploadRes : uploadRes?.secure_url || "";
    } else if (req.body.image && typeof req.body.image === "string" && req.body.image.startsWith("http")) {
      imageUrl = req.body.image;
    }

    const textContent = content ? content.trim() : "";

    if (!textContent && !imageUrl) {
      return res.status(400).json({ message: "Message content or photo required" });
    }

    if (!receiverId && !conversationId) {
      return res.status(400).json({ message: "Receiver ID or Conversation ID required" });
    }

    let targetReceiverId = receiverId;
    let targetConversation;

    if (conversationId) {
      targetConversation = await Conversation.findById(conversationId);
      if (!targetConversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const isParticipant = targetConversation.participants.some(
        (p) => p.toString() === senderId.toString()
      );
      if (!isParticipant) {
        return res.status(403).json({ message: "Unauthorized to send in this conversation" });
      }

      if (!targetReceiverId) {
        targetReceiverId = targetConversation.participants.find(
          (p) => p.toString() !== senderId.toString()
        );
      }
    } else {
      if (senderId.toString() === targetReceiverId.toString()) {
        return res.status(400).json({ message: "Cannot send message to yourself" });
      }

      targetConversation = await Conversation.findOne({
        participants: { $all: [senderId, targetReceiverId] },
      });

      if (!targetConversation) {
        targetConversation = await Conversation.create({
          participants: [senderId, targetReceiverId],
        });
      }
    }

    // Create message with photo / text
    const newMessage = await Message.create({
      conversationId: targetConversation._id,
      sender: senderId,
      receiver: targetReceiverId,
      content: textContent,
      image: imageUrl,
      messageType: imageUrl ? "image" : "text",
    });

    targetConversation.lastMessage = newMessage._id;
    await targetConversation.save();

    const populatedMessage = await Message.findById(newMessage._id).populate(
      "sender receiver",
      PARTICIPANT_FIELDS
    );

    const updatedConversation = await Conversation.findById(targetConversation._id)
      .populate("participants", PARTICIPANT_FIELDS)
      .populate("lastMessage");

    const messagePayload = {
      message: populatedMessage,
      conversation: updatedConversation,
    };

    // Emit in real time
    emitToUser(targetReceiverId.toString(), "newMessage", messagePayload);
    emitToUser(senderId.toString(), "messageSent", messagePayload);

    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({ message: "Server error sending message" });
  }
};

// 5. Mark messages in conversation as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const now = new Date();
    await Message.updateMany(
      {
        conversationId,
        receiver: userId,
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: now },
      }
    );

    const otherParticipantId = conversation.participants.find(
      (p) => p.toString() !== userId.toString()
    );

    if (otherParticipantId) {
      emitToUser(otherParticipantId.toString(), "messagesRead", {
        conversationId,
        readerId: userId,
        readAt: now,
      });
    }

    return res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error in markAsRead:", error);
    return res.status(500).json({ message: "Server error marking messages as read" });
  }
};

// 6. Get total unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;
    const unreadCount = await Message.countDocuments({
      receiver: userId,
      isRead: false,
      deletedAt: null,
    });

    return res.status(200).json({ unreadCount });
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    return res.status(500).json({ message: "Server error getting unread count" });
  }
};

// 7. Get accurate user presence & last-seen
export const getUserPresence = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const user = await User.findById(targetUserId).select("isOnline lastSeen");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isOnline = userSocketMap.has(targetUserId.toString());
    const lastSeen = userLastSeenMap.get(targetUserId.toString()) || user.lastSeen;

    return res.status(200).json({
      userId: targetUserId,
      isOnline,
      lastSeen,
    });
  } catch (error) {
    console.error("Error in getUserPresence:", error);
    return res.status(500).json({ message: "Server error getting presence" });
  }
};
