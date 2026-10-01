import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import { sanitizeString } from "../config/sanitize.js";

export const createStory = async (req, res) => {
    try {
        const userId = req.userId;
        const { mediaType = "image", content = "", background = "", textColor = "", fontStyle = "" } = req.body;

        if (!["image", "video", "text"].includes(mediaType)) {
            return res.status(400).json({ message: "Invalid story media type. Must be image, video, or text." });
        }

        let mediaUrl = "";

        if (mediaType === "image" || mediaType === "video") {
            if (!req.file) {
                return res.status(400).json({ message: `A file is required for ${mediaType} story.` });
            }
            const uploadedUrl = await uploadOnCloudinary(req.file.path, mediaType === "video" ? "video" : "image");
            if (!uploadedUrl) {
                return res.status(500).json({ message: "Failed to upload story media" });
            }
            mediaUrl = uploadedUrl;
        } else if (mediaType === "text") {
            if (!content || !content.trim()) {
                return res.status(400).json({ message: "Text content is required for text story." });
            }
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours TTL

        const newStory = await Story.create({
            user: userId,
            mediaType,
            mediaUrl,
            content: sanitizeString(content, 1000),
            background: background || "linear-gradient(135deg, #e1306c 0%, #833ab4 100%)",
            textColor: textColor || "#ffffff",
            fontStyle: fontStyle || "sans",
            expiresAt
        });

        const populatedStory = await Story.findById(newStory._id)
            .populate("user", "firstName lastName userName profileImage headline");

        return res.status(201).json(populatedStory);

    } catch (error) {
        console.error("Create story error:", error);
        return res.status(500).json({ message: `Create story error: ${error.message || error}` });
    }
};

export const getStoriesFeed = async (req, res) => {
    try {
        const userId = req.userId;
        const now = new Date();

        // 1. Get current user's connections
        const currentUser = await User.findById(userId).select("connection");
        const rawConnections = currentUser?.connection || [];
        const connectionIds = rawConnections.map(c => (c?._id ? c._id : c));

        // Users whose stories we want to fetch: current user + connections
        const eligibleUserIds = [userId, ...connectionIds];

        // 2. Fetch all active stories from eligible users
        const activeStories = await Story.find({
            user: { $in: eligibleUserIds },
            expiresAt: { $gt: now }
        })
            .sort({ createdAt: 1 })
            .populate("user", "firstName lastName userName profileImage headline");

        // 3. Group stories by user
        const userStoriesMap = new Map();

        // Ensure current user is first in the list if they have stories or not
        for (const story of activeStories) {
            const storyUserId = story.user?._id?.toString();
            if (!storyUserId) continue;

            if (!userStoriesMap.has(storyUserId)) {
                userStoriesMap.set(storyUserId, {
                    user: story.user,
                    stories: [],
                    hasUnviewed: false,
                    isCurrentUser: storyUserId === userId.toString()
                });
            }

            const group = userStoriesMap.get(storyUserId);
            const isViewedByMe = story.views.some(v => v.user?.toString() === userId.toString());
            const viewCount = story.views.length;

            group.stories.push({
                _id: story._id,
                mediaType: story.mediaType,
                mediaUrl: story.mediaUrl,
                content: story.content,
                background: story.background,
                textColor: story.textColor,
                fontStyle: story.fontStyle,
                createdAt: story.createdAt,
                expiresAt: story.expiresAt,
                isViewed: isViewedByMe,
                viewCount: storyUserId === userId.toString() ? viewCount : undefined
            });

            if (!isViewedByMe && storyUserId !== userId.toString()) {
                group.hasUnviewed = true;
            }
        }

        // Convert map to array and sort so current user is first, then unviewed stories, then viewed stories
        const feed = Array.from(userStoriesMap.values()).sort((a, b) => {
            if (a.isCurrentUser) return -1;
            if (b.isCurrentUser) return 1;
            if (a.hasUnviewed && !b.hasUnviewed) return -1;
            if (!a.hasUnviewed && b.hasUnviewed) return 1;
            return 0;
        });

        return res.status(200).json(feed);

    } catch (error) {
        console.error("Get stories feed error:", error);
        return res.status(500).json({ message: "Failed to fetch stories feed" });
    }
};

export const getUserStories = async (req, res) => {
    try {
        const { targetUserId } = req.params;
        const now = new Date();

        let targetId = targetUserId;
        // If username passed instead of ObjectId
        if (!/^[0-9a-fA-F]{24}$/.test(targetUserId)) {
            const user = await User.findOne({ userName: targetUserId.toLowerCase() }).select("_id");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            targetId = user._id;
        }

        const stories = await Story.find({
            user: targetId,
            expiresAt: { $gt: now }
        })
            .sort({ createdAt: 1 })
            .populate("user", "firstName lastName userName profileImage headline");

        const userId = req.userId?.toString();
        const formattedStories = stories.map(story => {
            const isOwner = userId && story.user?._id?.toString() === userId;
            const isViewed = userId ? story.views.some(v => v.user?.toString() === userId) : false;
            return {
                _id: story._id,
                user: story.user,
                mediaType: story.mediaType,
                mediaUrl: story.mediaUrl,
                content: story.content,
                background: story.background,
                textColor: story.textColor,
                fontStyle: story.fontStyle,
                createdAt: story.createdAt,
                expiresAt: story.expiresAt,
                isViewed,
                viewCount: isOwner ? story.views.length : undefined
            };
        });

        return res.status(200).json(formattedStories);

    } catch (error) {
        console.error("Get user stories error:", error);
        return res.status(500).json({ message: "Failed to fetch user stories" });
    }
};

export const recordStoryView = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.userId;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        // Do not add view if viewer is the owner or already recorded
        const alreadyViewed = story.views.some(v => v.user?.toString() === userId.toString());
        if (!alreadyViewed && story.user.toString() !== userId.toString()) {
            story.views.push({ user: userId, viewedAt: new Date() });
            await story.save();
        }

        return res.status(200).json({ message: "View recorded", viewCount: story.views.length });

    } catch (error) {
        console.error("Record view error:", error);
        return res.status(500).json({ message: "Failed to record view" });
    }
};

export const getStoryViewers = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.userId;

        const story = await Story.findById(storyId)
            .populate("views.user", "firstName lastName userName profileImage headline");

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        // Authorization check: Only the owner can see viewers!
        if (story.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Forbidden: Only story author can view viewer list." });
        }

        return res.status(200).json(story.views);

    } catch (error) {
        console.error("Get story viewers error:", error);
        return res.status(500).json({ message: "Failed to fetch story viewers" });
    }
};

export const deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.userId;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        // Authorization check: Only the owner can delete their story!
        if (story.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Forbidden: You can only delete your own stories." });
        }

        await Story.findByIdAndDelete(storyId);

        return res.status(200).json({ message: "Story deleted successfully", storyId });

    } catch (error) {
        console.error("Delete story error:", error);
        return res.status(500).json({ message: "Failed to delete story" });
    }
};
