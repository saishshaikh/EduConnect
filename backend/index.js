import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import connectionRouter from "./routes/connection.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import messageRouter from "./routes/message.routes.js";
import callRouter from "./routes/call.routes.js";
import { app, server, io, userSocketMap } from "./socket/socket.js";

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

const port = process.env.PORT || 8000;

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/connection", connectionRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/message", messageRouter);
app.use("/api/call", callRouter);

server.listen(port, () => {
  connectDb();
  console.log(`Server running on port ${port}`);
});

export { io, userSocketMap };
