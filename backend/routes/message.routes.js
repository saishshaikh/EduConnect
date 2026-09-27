import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getOrCreateConversation,
  getUnreadCount,
  getUserPresence,
} from "../controllers/message.controllers.js";

const messageRouter = express.Router();

messageRouter.get("/conversations", isAuth, getConversations);
messageRouter.get("/unread", isAuth, getUnreadCount);
messageRouter.get("/presence/:targetUserId", isAuth, getUserPresence);
messageRouter.get("/:conversationId", isAuth, getMessages);
messageRouter.post("/send", isAuth, upload.single("image"), sendMessage);
messageRouter.post("/conversation/:targetUserId", isAuth, getOrCreateConversation);
messageRouter.put("/read/:conversationId", isAuth, markAsRead);

export default messageRouter;
