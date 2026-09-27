import Call from "../models/call.model.js";
import User from "../models/user.model.js";

// Get ICE Server configurations from environment
export const getIceServers = (req, res) => {
  const stunList = process.env.STUN_SERVERS
    ? process.env.STUN_SERVERS.split(",").map((url) => ({ urls: url.trim() }))
    : [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ];

  const iceServers = [...stunList];

  if (process.env.TURN_SERVERS && process.env.TURN_USERNAME && process.env.TURN_CREDENTIAL) {
    const turnList = process.env.TURN_SERVERS.split(",").map((url) => ({
      urls: url.trim(),
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL,
    }));
    iceServers.push(...turnList);
  }

  return res.status(200).json({ iceServers });
};

// Get user call history
export const getCallHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const calls = await Call.find({
      $or: [{ caller: userId }, { receiver: userId }],
    })
      .populate("caller receiver", "firstName lastName userName profileImage headline")
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json(calls);
  } catch (error) {
    console.error("Error getting call history:", error);
    return res.status(500).json({ message: "Server error fetching call history" });
  }
};

// Get calls for a specific conversation
export const getConversationCalls = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const calls = await Call.find({ conversation: conversationId })
      .populate("caller receiver", "firstName lastName userName profileImage headline")
      .sort({ createdAt: -1 });

    return res.status(200).json(calls);
  } catch (error) {
    console.error("Error getting conversation calls:", error);
    return res.status(500).json({ message: "Server error fetching conversation calls" });
  }
};
