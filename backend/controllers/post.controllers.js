import Post from "../models/post.model.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import { io, emitToUser } from "../index.js"
import Notification from "../models/notification.model.js"

export const createPost = async (req, res) => {
    try {
        const { description } = req.body
        let newPost

        if (req.file) {
            const result = await uploadOnCloudinary(req.file.path)
            newPost = await Post.create({
                author: req.userId,
                description,
                image: typeof result === "string" ? result : result?.secure_url
            })
        } else {
            newPost = await Post.create({
                author: req.userId,
                description
            })
        }

        await newPost.populate("author", "firstName lastName profileImage headline userName");

        return res.status(201).json(newPost)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `Create post error: ${error}` })
    }
}

export const getPost = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("author", "firstName lastName profileImage headline userName")
            .populate("comment.user", "firstName lastName profileImage headline")
            .sort({ createdAt: -1 })

        return res.status(200).json(posts)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Get post error" })
    }
}

export const like = async (req, res) => {
    try {
        const postId = req.params.id
        const userId = req.userId
        const post = await Post.findById(postId)

        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        if (post.like.includes(userId)) {
            post.like = post.like.filter((id) => id.toString() !== userId.toString())
        } else {
            post.like.push(userId)

            if (post.author.toString() !== userId.toString()) {
                const notif = await Notification.create({
                    receiver: post.author,
                    type: "like",
                    relatedUser: userId,
                    relatedPost: postId
                })
                const populatedNotif = await Notification.findById(notif._id)
                    .populate("relatedUser", "firstName lastName profileImage headline userName")
                    .populate("relatedPost", "description image");
                emitToUser(post.author.toString(), "newNotification", populatedNotif);
            }
        }

        await post.save()
        io.emit("likeUpdated", { postId, likes: post.like })

        return res.status(200).json(post)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `Like error: ${error}` })
    }
}

export const comment = async (req, res) => {
    try {
        const postId = req.params.id
        const userId = req.userId
        const { content } = req.body

        if (!content) {
            return res.status(400).json({ message: "Comment content is required" })
        }

        const post = await Post.findByIdAndUpdate(
            postId,
            { $push: { comment: { content, user: userId } } },
            { new: true }
        ).populate("comment.user", "firstName lastName profileImage headline")

        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        if (post.author.toString() !== userId.toString()) {
            const notif = await Notification.create({
                receiver: post.author,
                type: "comment",
                relatedUser: userId,
                relatedPost: postId
            })
            const populatedNotif = await Notification.findById(notif._id)
                .populate("relatedUser", "firstName lastName profileImage headline userName")
                .populate("relatedPost", "description image");
            emitToUser(post.author.toString(), "newNotification", populatedNotif);
        }

        io.emit("commentAdded", { postId, comm: post.comment })

        return res.status(200).json(post)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `Comment error: ${error}` })
    }
}