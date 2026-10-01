import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import { sanitizeUrl, sanitizeString, safeJsonParse } from "../config/sanitize.js";

// Helper function to apply privacy rules to a user profile object
const applyPrivacyFilters = (userObj, viewerId) => {
    const raw = userObj.toObject ? userObj.toObject() : { ...userObj };
    delete raw.password;

    const isSelf = Boolean(viewerId && raw._id && raw._id.toString() === viewerId.toString());
    const connectionIds = (raw.connection || []).map(c => (c?._id ? c._id.toString() : c.toString()));
    const isConnected = Boolean(isSelf || (viewerId && connectionIds.includes(viewerId.toString())));

    const privacy = raw.privacySettings || {};

    // 1. Email Privacy
    const emailPrivacy = privacy.emailPrivacy || "connections";
    if (emailPrivacy === "only_me" && !isSelf) {
        delete raw.email;
    } else if (emailPrivacy === "connections" && !isConnected) {
        delete raw.email;
    }

    // 2. Phone Privacy
    const phonePrivacy = privacy.phonePrivacy || "connections";
    if (phonePrivacy === "only_me" && !isSelf) {
        delete raw.phone;
    } else if (phonePrivacy === "connections" && !isConnected) {
        delete raw.phone;
    }

    // 3. Date of Birth Privacy
    const dobPrivacy = privacy.dobPrivacy || "only_me";
    if (dobPrivacy === "only_me" && !isSelf) {
        delete raw.dob;
    } else if (dobPrivacy === "connections" && !isConnected) {
        delete raw.dob;
    }

    // 4. Location Privacy
    const locationPrivacy = privacy.locationPrivacy || "everyone";
    if (locationPrivacy === "only_me" && !isSelf) {
        raw.location = "";
        raw.country = "";
        raw.city = "";
    } else if (locationPrivacy === "connections" && !isConnected) {
        raw.location = "";
        raw.country = "";
        raw.city = "";
    }

    // 5. Education Privacy
    const educationPrivacy = privacy.educationPrivacy || "everyone";
    if (educationPrivacy === "only_me" && !isSelf) {
        raw.education = [];
    } else if (educationPrivacy === "connections" && !isConnected) {
        raw.education = [];
    }

    // 6. Experience Privacy
    const experiencePrivacy = privacy.experiencePrivacy || "everyone";
    if (experiencePrivacy === "only_me" && !isSelf) {
        raw.experience = [];
    } else if (experiencePrivacy === "connections" && !isConnected) {
        raw.experience = [];
    }

    // 7. Social Links Privacy
    const socialPrivacy = privacy.socialPrivacy || "everyone";
    if (socialPrivacy === "only_me" && !isSelf) {
        raw.socialLinks = {};
    } else if (socialPrivacy === "connections" && !isConnected) {
        raw.socialLinks = {};
    }

    return raw;
};

export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select("-password")
            .populate("connection", "firstName lastName userName profileImage headline");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error("Get current user error:", error);
        return res.status(500).json({ message: "Get current user error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const body = req.body || {};

        // 1. Basic Fields Sanitization
        const firstName = sanitizeString(body.firstName ?? currentUser.firstName, 50);
        const lastName = sanitizeString(body.lastName ?? currentUser.lastName, 50);
        let userName = sanitizeString(body.userName ?? currentUser.userName, 30).toLowerCase().replace(/\s+/g, "");
        const headline = sanitizeString(body.headline ?? currentUser.headline, 200);
        const about = sanitizeString(body.about ?? currentUser.about, 3000);
        const pronouns = sanitizeString(body.pronouns ?? currentUser.pronouns, 30);
        const gender = ["male", "female", "other", "prefer_not_to_say"].includes(body.gender) ? body.gender : (currentUser.gender || "other");
        const dob = sanitizeString(body.dob ?? currentUser.dob, 30);
        const phone = sanitizeString(body.phone ?? currentUser.phone, 30);
        const website = sanitizeUrl(body.website ?? currentUser.website);
        const location = sanitizeString(body.location ?? currentUser.location, 100);
        const country = sanitizeString(body.country ?? currentUser.country, 100);
        const city = sanitizeString(body.city ?? currentUser.city, 100);
        const currentCompany = sanitizeString(body.currentCompany ?? currentUser.currentCompany, 100);
        const currentRole = sanitizeString(body.currentRole ?? currentUser.currentRole, 100);
        const currentSchool = sanitizeString(body.currentSchool ?? currentUser.currentSchool, 100);

        // Check if username changed and is already taken
        if (userName && userName !== currentUser.userName) {
            const existingUsername = await User.findOne({ userName, _id: { $ne: userId } });
            if (existingUsername) {
                return res.status(400).json({ message: "Username is already taken by another user" });
            }
        } else if (!userName) {
            userName = currentUser.userName;
        }

        // 2. Structured Subdocument Collections
        const rawSkills = safeJsonParse(body.skills, currentUser.skills || []);
        const skills = Array.isArray(rawSkills)
            ? rawSkills.map(s => sanitizeString(typeof s === "string" ? s : s?.name, 60)).filter(Boolean)
            : [];

        const rawInterests = safeJsonParse(body.interests, currentUser.interests || []);
        const interests = Array.isArray(rawInterests)
            ? rawInterests.map(i => sanitizeString(i, 60)).filter(Boolean)
            : [];

        const rawEducation = safeJsonParse(body.education, currentUser.education || []);
        const education = Array.isArray(rawEducation) ? rawEducation.map(edu => ({
            college: sanitizeString(edu.college || edu.school, 150),
            school: sanitizeString(edu.school || edu.college, 150),
            degree: sanitizeString(edu.degree, 100),
            fieldOfStudy: sanitizeString(edu.fieldOfStudy, 100),
            startYear: sanitizeString(edu.startYear, 30),
            endYear: sanitizeString(edu.endYear || edu.graduationYear, 30),
            grade: sanitizeString(edu.grade, 30),
            description: sanitizeString(edu.description, 1000),
            current: Boolean(edu.current)
        })) : [];

        const rawExperience = safeJsonParse(body.experience, currentUser.experience || []);
        const experience = Array.isArray(rawExperience) ? rawExperience.map(exp => ({
            title: sanitizeString(exp.title, 120),
            company: sanitizeString(exp.company, 120),
            location: sanitizeString(exp.location, 100),
            startDate: sanitizeString(exp.startDate, 30),
            endDate: sanitizeString(exp.endDate, 30),
            current: Boolean(exp.current),
            description: sanitizeString(exp.description, 1500)
        })) : [];

        const rawProjects = safeJsonParse(body.projects, currentUser.projects || []);
        const projects = Array.isArray(rawProjects) ? rawProjects.map(proj => ({
            title: sanitizeString(proj.title, 150),
            description: sanitizeString(proj.description, 2000),
            projectUrl: sanitizeUrl(proj.projectUrl),
            githubUrl: sanitizeUrl(proj.githubUrl),
            technologies: Array.isArray(proj.technologies) ? proj.technologies.map(t => sanitizeString(t, 50)).filter(Boolean) : [],
            startDate: sanitizeString(proj.startDate, 30),
            endDate: sanitizeString(proj.endDate, 30)
        })) : [];

        const rawCertifications = safeJsonParse(body.certifications, currentUser.certifications || []);
        const certifications = Array.isArray(rawCertifications) ? rawCertifications.map(cert => ({
            name: sanitizeString(cert.name || cert.title, 150),
            issuingOrganization: sanitizeString(cert.issuingOrganization, 150),
            issueDate: sanitizeString(cert.issueDate, 30),
            expirationDate: sanitizeString(cert.expirationDate, 30),
            credentialId: sanitizeString(cert.credentialId, 100),
            credentialUrl: sanitizeUrl(cert.credentialUrl)
        })) : [];

        const rawAchievements = safeJsonParse(body.achievements, currentUser.achievements || []);
        const achievements = Array.isArray(rawAchievements) ? rawAchievements.map(ach => ({
            title: sanitizeString(ach.title, 150),
            issuer: sanitizeString(ach.issuer, 150),
            date: sanitizeString(ach.date, 30),
            description: sanitizeString(ach.description, 1000)
        })) : [];

        const rawLanguages = safeJsonParse(body.languages, currentUser.languages || []);
        const languages = Array.isArray(rawLanguages) ? rawLanguages.map(lang => ({
            language: sanitizeString(lang.language, 60),
            proficiency: ["Basic", "Conversational", "Fluent", "Native", "Professional working"].includes(lang.proficiency) ? lang.proficiency : "Conversational"
        })) : [];

        const rawSocial = safeJsonParse(body.socialLinks, currentUser.socialLinks || {});
        const socialLinks = {
            github: sanitizeUrl(rawSocial.github),
            linkedin: sanitizeUrl(rawSocial.linkedin),
            twitter: sanitizeUrl(rawSocial.twitter),
            instagram: sanitizeUrl(rawSocial.instagram),
            youtube: sanitizeUrl(rawSocial.youtube),
            website: sanitizeUrl(rawSocial.website),
            other: sanitizeUrl(rawSocial.other)
        };

        const rawPrivacy = safeJsonParse(body.privacySettings, currentUser.privacySettings || {});
        const validPrivacy = ["everyone", "connections", "only_me"];
        const privacySettings = {
            emailPrivacy: validPrivacy.includes(rawPrivacy.emailPrivacy) ? rawPrivacy.emailPrivacy : (currentUser.privacySettings?.emailPrivacy || "connections"),
            phonePrivacy: validPrivacy.includes(rawPrivacy.phonePrivacy) ? rawPrivacy.phonePrivacy : (currentUser.privacySettings?.phonePrivacy || "connections"),
            dobPrivacy: validPrivacy.includes(rawPrivacy.dobPrivacy) ? rawPrivacy.dobPrivacy : (currentUser.privacySettings?.dobPrivacy || "only_me"),
            locationPrivacy: validPrivacy.includes(rawPrivacy.locationPrivacy) ? rawPrivacy.locationPrivacy : (currentUser.privacySettings?.locationPrivacy || "everyone"),
            educationPrivacy: validPrivacy.includes(rawPrivacy.educationPrivacy) ? rawPrivacy.educationPrivacy : (currentUser.privacySettings?.educationPrivacy || "everyone"),
            experiencePrivacy: validPrivacy.includes(rawPrivacy.experiencePrivacy) ? rawPrivacy.experiencePrivacy : (currentUser.privacySettings?.experiencePrivacy || "everyone"),
            socialPrivacy: validPrivacy.includes(rawPrivacy.socialPrivacy) ? rawPrivacy.socialPrivacy : (currentUser.privacySettings?.socialPrivacy || "everyone")
        };

        // 3. Image Uploads
        let profileImage = currentUser.profileImage;
        let coverImage = currentUser.coverImage;

        if (req.files?.profileImage?.[0]) {
            const uploadedUrl = await uploadOnCloudinary(req.files.profileImage[0].path, "image");
            if (uploadedUrl) profileImage = uploadedUrl;
        }
        if (req.files?.coverImage?.[0]) {
            const uploadedUrl = await uploadOnCloudinary(req.files.coverImage[0].path, "image");
            if (uploadedUrl) coverImage = uploadedUrl;
        }

        // 4. Update Document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                firstName: firstName || currentUser.firstName,
                lastName: lastName || currentUser.lastName,
                userName: userName || currentUser.userName,
                headline,
                about,
                pronouns,
                gender,
                dob,
                phone,
                website,
                location,
                country,
                city,
                currentCompany,
                currentRole,
                currentSchool,
                skills,
                education,
                experience,
                projects,
                certifications,
                achievements,
                languages,
                interests,
                socialLinks,
                privacySettings,
                profileImage,
                coverImage
            },
            { new: true, runValidators: true }
        )
            .select("-password")
            .populate("connection", "firstName lastName userName profileImage headline");

        return res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ message: `Update profile error: ${error.message || error}` });
    }
};

export const getprofile = async (req, res) => {
    try {
        const { userName } = req.params;
        if (!userName) {
            return res.status(400).json({ message: "Username or ID is required" });
        }

        const isObjectId = /^[0-9a-fA-F]{24}$/.test(userName.trim());
        const user = await User.findOne({
            $or: [
                { userName: { $regex: new RegExp(`^${userName.trim()}$`, "i") } },
                ...(isObjectId ? [{ _id: userName.trim() }] : [])
            ]
        })
            .select("-password")
            .populate("connection", "firstName lastName userName profileImage headline");

        if (!user) {
            return res.status(404).json({ message: "User does not exist" });
        }

        // Apply server-side privacy filtering based on viewer's relationship
        const filteredProfile = applyPrivacyFilters(user, req.userId);

        return res.status(200).json(filteredProfile);
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({ message: `Get profile error: ${error.message || error}` });
    }
};

export const search = async (req, res) => {
    try {
        const { query } = req.query;
        let users = [];
        if (!query || !query.trim()) {
            users = await User.find({ _id: { $ne: req.userId } })
                .select("firstName lastName userName profileImage headline skills location")
                .limit(40);
            return res.status(200).json(users);
        }

        const cleanQuery = query.trim();
        const safeRegex = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        users = await User.find({
            _id: { $ne: req.userId },
            $or: [
                { firstName: { $regex: safeRegex, $options: "i" } },
                { lastName: { $regex: safeRegex, $options: "i" } },
                { userName: { $regex: safeRegex, $options: "i" } },
                { headline: { $regex: safeRegex, $options: "i" } },
                { skills: { $in: [new RegExp(safeRegex, "i")] } }
            ]
        })
            .select("firstName lastName userName profileImage headline skills location")
            .limit(40);

        return res.status(200).json(users);

    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ message: "Search failed" });
    }
};

export const getSuggestedUser = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId).select("connection");
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const rawConnections = currentUser.connection || [];
        const connectionIds = rawConnections.map((c) => (c?._id ? c._id : c));

        let suggestedUsers = await User.find({
            _id: {
                $ne: currentUser._id,
                $nin: connectionIds
            }
        })
            .select("firstName lastName userName profileImage headline location")
            .limit(10);

        if (suggestedUsers.length === 0) {
            suggestedUsers = await User.find({
                _id: { $ne: currentUser._id }
            })
                .select("firstName lastName userName profileImage headline location")
                .limit(10);
        }

        return res.status(200).json(suggestedUsers);

    } catch (error) {
        console.error("Suggested user error:", error);
        return res.status(500).json({ message: "Suggested user error" });
    }
};