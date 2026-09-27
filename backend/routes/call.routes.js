import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getIceServers,
  getCallHistory,
  getConversationCalls,
} from "../controllers/call.controllers.js";

const callRouter = express.Router();

callRouter.get("/config", isAuth, getIceServers);
callRouter.get("/history", isAuth, getCallHistory);
callRouter.get("/conversation/:conversationId", isAuth, getConversationCalls);

export default callRouter;
