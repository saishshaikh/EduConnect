import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
    college: { type: String, default: "" },
    school: { type: String, default: "" },
    degree: { type: String, default: "" },
    fieldOfStudy: { type: String, default: "" },
    startYear: { type: String, default: "" },
    endYear: { type: String, default: "" },
    grade: { type: String, default: "" },
    description: { type: String, default: "" },
    current: { type: Boolean, default: false }
}, { _id: true });

const experienceSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    company: { type: String, default: "" },
    location: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    current: { type: Boolean, default: false },
    description: { type: String, default: "" }
}, { _id: true });

const projectSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    projectUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    technologies: [{ type: String }],
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" }
}, { _id: true });

const certificationSchema = new mongoose.Schema({
    name: { type: String, default: "" },
    issuingOrganization: { type: String, default: "" },
    issueDate: { type: String, default: "" },
    expirationDate: { type: String, default: "" },
    credentialId: { type: String, default: "" },
    credentialUrl: { type: String, default: "" }
}, { _id: true });

const achievementSchema = new mongoose.Schema({
    title: { type: String, default: "" },
    issuer: { type: String, default: "" },
    date: { type: String, default: "" },
    description: { type: String, default: "" }
}, { _id: true });

const languageSchema = new mongoose.Schema({
    language: { type: String, default: "" },
    proficiency: {
        type: String,
        enum: ["Basic", "Conversational", "Fluent", "Native", "Professional working"],
        default: "Conversational"
    }
}, { _id: true });

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: ""
    },
    coverImage: {
        type: String,
        default: ""
    },
    headline: {
        type: String,
        default: "",
        trim: true
    },
    about: {
        type: String,
        default: "",
        trim: true
    },
    pronouns: {
        type: String,
        default: "",
        trim: true
    },
    gender: {
        type: String,
        enum: ["male", "female", "other", "prefer_not_to_say", ""],
        default: "other"
    },
    dob: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: "",
        trim: true
    },
    website: {
        type: String,
        default: "",
        trim: true
    },
    location: {
        type: String,
        default: "India",
        trim: true
    },
    country: {
        type: String,
        default: "",
        trim: true
    },
    city: {
        type: String,
        default: "",
        trim: true
    },
    currentCompany: {
        type: String,
        default: "",
        trim: true
    },
    currentRole: {
        type: String,
        default: "",
        trim: true
    },
    currentSchool: {
        type: String,
        default: "",
        trim: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    education: [educationSchema],
    experience: [experienceSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    achievements: [achievementSchema],
    languages: [languageSchema],
    interests: [{
        type: String,
        trim: true
    }],
    socialLinks: {
        github: { type: String, default: "", trim: true },
        linkedin: { type: String, default: "", trim: true },
        twitter: { type: String, default: "", trim: true },
        instagram: { type: String, default: "", trim: true },
        youtube: { type: String, default: "", trim: true },
        website: { type: String, default: "", trim: true },
        other: { type: String, default: "", trim: true }
    },
    privacySettings: {
        emailPrivacy: {
            type: String,
            enum: ["everyone", "connections", "only_me"],
            default: "connections"
        },
        phonePrivacy: {
            type: String,
            enum: ["everyone", "connections", "only_me"],
            default: "connections"
        },
        dobPrivacy: {
            type: String,
            enum: ["everyone", "connections", "only_me"],
            default: "only_me"
        },
        locationPrivacy: {
            type: String,
            enum: ["everyone", "connections", "only_me"],
            default: "everyone"
        },
        educationPrivacy: {
            type: String,
            enum: ["everyone", "connections", "only_me"],
            default: "everyone"
        },
        experiencePrivacy: {
            type: String,
            enum: ["everyone", "connections", "only_me"],
            default: "everyone"
        },
        socialPrivacy: {
            type: String,
            enum: ["everyone", "connections", "only_me"],
            default: "everyone"
        }
    },
    connection: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Indexes for fast lookup
userSchema.index({ userName: 1 });
userSchema.index({ email: 1 });
userSchema.index({ firstName: 1, lastName: 1 });

const User = mongoose.model("User", userSchema);
export default User;