import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    messageType: {
      type: String,
      enum: ["text", "image", "call"],
      default: "text",
    },
    callInfo: {
      type: {
        callId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Call",
        },
        callType: {
          type: String,
          enum: ["voice", "video"],
        },
        status: {
          type: String,
          enum: ["completed", "missed", "rejected", "cancelled", "failed"],
        },
        duration: {
          type: Number,
          default: 0,
        },
      },
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound index to quickly fetch chronological messages in a conversation
messageSchema.index({ conversationId: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
