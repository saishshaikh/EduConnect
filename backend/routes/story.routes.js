import express from "express";
import {
    createStory,
    getStoriesFeed,
    getUserStories,
    recordStoryView,
    getStoryViewers,
    deleteStory
} from "../controllers/story.controllers.js";
import { isAuth, optionalAuth } from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

const storyRouter = express.Router();

storyRouter.post("/create", isAuth, upload.single("media"), createStory);
storyRouter.get("/feed", isAuth, getStoriesFeed);
storyRouter.get("/user/:targetUserId", optionalAuth, getUserStories);
storyRouter.post("/view/:storyId", isAuth, recordStoryView);
storyRouter.get("/:storyId/viewers", isAuth, getStoryViewers);
storyRouter.delete("/:storyId", isAuth, deleteStory);

export default storyRouter;
