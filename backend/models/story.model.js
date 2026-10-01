import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    mediaType: {
        type: String,
        enum: ["image", "video", "text"],
        required: true
    },
    mediaUrl: {
        type: String,
        default: ""
    },
    content: {
        type: String,
        default: "",
        maxlength: 1000
    },
    background: {
        type: String,
        default: "linear-gradient(135deg, #e1306c 0%, #833ab4 100%)"
    },
    textColor: {
        type: String,
        default: "#ffffff"
    },
    fontStyle: {
        type: String,
        default: "sans"
    },
    views: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    expiresAt: {
        type: Date,
        required: true,
        index: true
    }
}, { timestamps: true });

// Auto-clean expired stories index (MongoDB TTL Index)
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Story = mongoose.model("Story", storySchema);
export default Story;
