import React, { useContext, useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  IoClose,
  IoCamera,
  IoAdd,
  IoTrashOutline,
  IoPersonOutline,
  IoSchoolOutline,
  IoBriefcaseOutline,
  IoCodeSlashOutline,
  IoRibbonOutline,
  IoTrophyOutline,
  IoLanguageOutline,
  IoGlobeOutline,
  IoShieldCheckmarkOutline,
  IoHeartOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoDocumentTextOutline,
} from "react-icons/io5";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";

const SECTIONS = [
  { id: "basic", label: "Basic Info", icon: IoPersonOutline },
  { id: "about", label: "About Me", icon: IoDocumentTextOutline },
  { id: "education", label: "Education", icon: IoSchoolOutline },
  { id: "experience", label: "Experience", icon: IoBriefcaseOutline },
  { id: "skills", label: "Skills", icon: IoCodeSlashOutline },
  { id: "projects", label: "Projects", icon: IoCodeSlashOutline },
  { id: "certifications", label: "Certifications", icon: IoRibbonOutline },
  { id: "achievements", label: "Achievements", icon: IoTrophyOutline },
  { id: "languages", label: "Languages", icon: IoLanguageOutline },
  { id: "interests", label: "Interests", icon: IoHeartOutline },
  { id: "social", label: "Social Links", icon: IoGlobeOutline },
  { id: "privacy", label: "Privacy", icon: IoShieldCheckmarkOutline },
];

export default function EditProfileModal({ isOpen, onClose }) {
  const { userData, setUserData, setProfileData, getCurrentUser } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);

  const [activeSection, setActiveSection] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // 1. Basic Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [headline, setHeadline] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [gender, setGender] = useState("other");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("India");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentSchool, setCurrentSchool] = useState("");

  // 2. About Me
  const [about, setAbout] = useState("");

  // 3. Education List
  const [education, setEducation] = useState([]);
  const [eduDraft, setEduDraft] = useState({
    college: "",
    degree: "",
    fieldOfStudy: "",
    startYear: "",
    endYear: "",
    grade: "",
    description: "",
    current: false,
  });

  // 4. Experience List
  const [experience, setExperience] = useState([]);
  const [expDraft, setExpDraft] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  // 5. Skills List
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  // 6. Projects List
  const [projects, setProjects] = useState([]);
  const [projDraft, setProjDraft] = useState({
    title: "",
    description: "",
    projectUrl: "",
    githubUrl: "",
    technologies: "",
    startDate: "",
    endDate: "",
  });

  // 7. Certifications List
  const [certifications, setCertifications] = useState([]);
  const [certDraft, setCertDraft] = useState({
    name: "",
    issuingOrganization: "",
    issueDate: "",
    expirationDate: "",
    credentialId: "",
    credentialUrl: "",
  });

  // 8. Achievements List
  const [achievements, setAchievements] = useState([]);
  const [achDraft, setAchDraft] = useState({
    title: "",
    issuer: "",
    date: "",
    description: "",
  });

  // 9. Languages List
  const [languages, setLanguages] = useState([]);
  const [langDraft, setLangDraft] = useState({
    language: "",
    proficiency: "Conversational",
  });

  // 10. Interests
  const [interests, setInterests] = useState([]);
  const [interestInput, setInterestInput] = useState("");

  // 11. Social Links
  const [socialLinks, setSocialLinks] = useState({
    github: "",
    linkedin: "",
    twitter: "",
    instagram: "",
    youtube: "",
    website: "",
    other: "",
  });

  // 12. Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    emailPrivacy: "connections",
    phonePrivacy: "connections",
    dobPrivacy: "only_me",
    locationPrivacy: "everyone",
    educationPrivacy: "everyone",
    experiencePrivacy: "everyone",
    socialPrivacy: "everyone",
  });

  // Images state
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Sync state with userData when modal opens
  useEffect(() => {
    if (isOpen && userData) {
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
      setUserName(userData.userName || "");
      setHeadline(userData.headline || "");
      setAbout(userData.about || "");
      setPronouns(userData.pronouns || "");
      setGender(userData.gender || "other");
      setDob(userData.dob || "");
      setPhone(userData.phone || "");
      setWebsite(userData.website || "");
      setLocation(userData.location || "India");
      setCity(userData.city || "");
      setCountry(userData.country || "");
      setCurrentRole(userData.currentRole || "");
      setCurrentCompany(userData.currentCompany || "");
      setCurrentSchool(userData.currentSchool || "");

      setEducation(Array.isArray(userData.education) ? [...userData.education] : []);
      setExperience(Array.isArray(userData.experience) ? [...userData.experience] : []);
      setSkills(Array.isArray(userData.skills) ? [...userData.skills] : []);
      setProjects(Array.isArray(userData.projects) ? [...userData.projects] : []);
      setCertifications(Array.isArray(userData.certifications) ? [...userData.certifications] : []);
      setAchievements(Array.isArray(userData.achievements) ? [...userData.achievements] : []);
      setLanguages(Array.isArray(userData.languages) ? [...userData.languages] : []);
      setInterests(Array.isArray(userData.interests) ? [...userData.interests] : []);

      setSocialLinks({
        github: userData.socialLinks?.github || "",
        linkedin: userData.socialLinks?.linkedin || "",
        twitter: userData.socialLinks?.twitter || "",
        instagram: userData.socialLinks?.instagram || "",
        youtube: userData.socialLinks?.youtube || "",
        website: userData.socialLinks?.website || "",
        other: userData.socialLinks?.other || "",
      });

      setPrivacySettings({
        emailPrivacy: userData.privacySettings?.emailPrivacy || "connections",
        phonePrivacy: userData.privacySettings?.phonePrivacy || "connections",
        dobPrivacy: userData.privacySettings?.dobPrivacy || "only_me",
        locationPrivacy: userData.privacySettings?.locationPrivacy || "everyone",
        educationPrivacy: userData.privacySettings?.educationPrivacy || "everyone",
        experiencePrivacy: userData.privacySettings?.experiencePrivacy || "everyone",
        socialPrivacy: userData.privacySettings?.socialPrivacy || "everyone",
      });

      setProfilePreview(userData.profileImage || "");
      setCoverPreview(userData.coverImage || "");
      setProfileImageFile(null);
      setCoverImageFile(null);
      setErrorMessage("");
      setSuccessMessage("");
      setIsDirty(false);
    }
  }, [isOpen, userData]);

  if (!isOpen) return null;

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Profile picture must be under 10MB");
      return;
    }
    setProfileImageFile(file);
    setProfilePreview(URL.createObjectURL(file));
    setIsDirty(true);
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("Cover image must be under 15MB");
      return;
    }
    setCoverImageFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setIsDirty(true);
  };

  // 1. Skill Actions
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    if (!skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setIsDirty(true);
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
    setIsDirty(true);
  };

  // 2. Interest Actions
  const handleAddInterest = () => {
    if (!interestInput.trim()) return;
    if (!interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setIsDirty(true);
    }
    setInterestInput("");
  };

  const handleRemoveInterest = (interest) => {
    setInterests(interests.filter((i) => i !== interest));
    setIsDirty(true);
  };

  // 3. Education Actions
  const handleAddEducation = () => {
    if (!eduDraft.college.trim()) return;
    setEducation([...education, { ...eduDraft }]);
    setEduDraft({
      college: "",
      degree: "",
      fieldOfStudy: "",
      startYear: "",
      endYear: "",
      grade: "",
      description: "",
      current: false,
    });
    setIsDirty(true);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // 4. Experience Actions
  const handleAddExperience = () => {
    if (!expDraft.title.trim() || !expDraft.company.trim()) return;
    setExperience([...experience, { ...expDraft }]);
    setExpDraft({
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    });
    setIsDirty(true);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // 5. Projects Actions
  const handleAddProject = () => {
    if (!projDraft.title.trim()) return;
    const techArray = typeof projDraft.technologies === "string"
      ? projDraft.technologies.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    setProjects([...projects, { ...projDraft, technologies: techArray }]);
    setProjDraft({
      title: "",
      description: "",
      projectUrl: "",
      githubUrl: "",
      technologies: "",
      startDate: "",
      endDate: "",
    });
    setIsDirty(true);
  };

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // 6. Certifications Actions
  const handleAddCertification = () => {
    if (!certDraft.name.trim()) return;
    setCertifications([...certifications, { ...certDraft }]);
    setCertDraft({
      name: "",
      issuingOrganization: "",
      issueDate: "",
      expirationDate: "",
      credentialId: "",
      credentialUrl: "",
    });
    setIsDirty(true);
  };

  const handleRemoveCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // 7. Achievements Actions
  const handleAddAchievement = () => {
    if (!achDraft.title.trim()) return;
    setAchievements([...achievements, { ...achDraft }]);
    setAchDraft({
      title: "",
      issuer: "",
      date: "",
      description: "",
    });
    setIsDirty(true);
  };

  const handleRemoveAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // 8. Languages Actions
  const handleAddLanguage = () => {
    if (!langDraft.language.trim()) return;
    setLanguages([...languages, { ...langDraft }]);
    setLangDraft({
      language: "",
      proficiency: "Conversational",
    });
    setIsDirty(true);
  };

  const handleRemoveLanguage = (index) => {
    setLanguages(languages.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // Safe Close
  const handleClose = () => {
    if (isDirty) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to exit?")) {
        return;
      }
    }
    onClose();
  };

  // Save All Profile Data
  const handleSave = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!firstName.trim() || !lastName.trim() || !userName.trim()) {
      setErrorMessage("First Name, Last Name, and Username are required.");
      setActiveSection("basic");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();

      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("userName", userName.trim());
      formData.append("headline", headline.trim());
      formData.append("about", about.trim());
      formData.append("pronouns", pronouns.trim());
      formData.append("gender", gender);
      formData.append("dob", dob.trim());
      formData.append("phone", phone.trim());
      formData.append("website", website.trim());
      formData.append("location", location.trim());
      formData.append("city", city.trim());
      formData.append("country", country.trim());
      formData.append("currentRole", currentRole.trim());
      formData.append("currentCompany", currentCompany.trim());
      formData.append("currentSchool", currentSchool.trim());

      formData.append("skills", JSON.stringify(skills));
      formData.append("education", JSON.stringify(education));
      formData.append("experience", JSON.stringify(experience));
      formData.append("projects", JSON.stringify(projects));
      formData.append("certifications", JSON.stringify(certifications));
      formData.append("achievements", JSON.stringify(achievements));
      formData.append("languages", JSON.stringify(languages));
      formData.append("interests", JSON.stringify(interests));
      formData.append("socialLinks", JSON.stringify(socialLinks));
      formData.append("privacySettings", JSON.stringify(privacySettings));

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }
      if (coverImageFile) {
        formData.append("coverImage", coverImageFile);
      }

      const res = await axios.put(`${serverUrl}/api/user/updateprofile`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data) {
        setUserData(res.data);
        setProfileData(res.data);
        setSuccessMessage("Profile updated successfully!");
        setIsDirty(false);
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err) {
      console.error("Update profile error:", err);
      setErrorMessage(err.response?.data?.message || "Failed to update profile. Please check your inputs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[860px] h-[92vh] max-h-[820px] bg-white dark:bg-[#121212] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#262626] flex flex-col animate-slideUp text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="h-[54px] px-5 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white transition"
            >
              Cancel
            </button>
            {isDirty && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-medium border border-amber-500/20">
                Unsaved changes
              </span>
            )}
          </div>

          <h3 className="text-sm font-bold bg-gradient-to-r from-[#e1306c] to-[#833ab4] bg-clip-text text-transparent">
            Edit Profile
          </h3>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#e1306c] to-[#833ab4] hover:opacity-90 text-white text-xs font-bold transition disabled:opacity-40 shadow-xs flex items-center gap-1.5"
          >
            {saving ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>

        {/* Feedback Alert Banners */}
        {errorMessage && (
          <div className="px-5 py-2 bg-rose-500/10 border-b border-rose-500/20 text-xs text-rose-500 font-medium flex items-center gap-2">
            <IoWarningOutline className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="px-5 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-xs text-emerald-500 font-medium flex items-center gap-2">
            <IoCheckmarkCircle className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Layout: Sidebar Navigation + Content Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Section Navigation Tabs (Horizontal on mobile, Vertical on desktop) */}
          <div className="w-full md:w-[220px] bg-gray-50 dark:bg-[#18181b] border-b md:border-b-0 md:border-r border-gray-100 dark:border-[#262626] flex md:flex-col overflow-x-auto md:overflow-y-auto no-scrollbar p-2 gap-1 flex-shrink-0">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                    isActive
                      ? "bg-white dark:bg-[#27272a] text-[#e1306c] font-bold shadow-xs border border-gray-200/60 dark:border-gray-700"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#202023] hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#e1306c]" : "text-gray-400"}`} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar flex flex-col gap-6">
            
            {/* 1. BASIC INFO */}
            {activeSection === "basic" && (
              <div className="flex flex-col gap-5 animate-fadeIn">
                
                {/* Cover & Avatar Upload Banner */}
                <div className="relative">
                  {/* Cover Photo */}
                  <div
                    onClick={() => coverInputRef.current?.click()}
                    className="relative w-full h-[120px] sm:h-[150px] rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 overflow-hidden cursor-pointer group border border-gray-200 dark:border-gray-800"
                  >
                    {coverPreview ? (
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-medium">
                        Click to add banner photo
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white gap-1.5 text-xs font-semibold">
                      <IoCamera className="w-4 h-4" />
                      <span>Change Banner</span>
                    </div>
                  </div>

                  {/* Profile Avatar */}
                  <div
                    onClick={() => profileInputRef.current?.click()}
                    className="absolute -bottom-6 left-5 w-20 h-20 rounded-full border-4 border-white dark:border-[#121212] overflow-hidden cursor-pointer group shadow-lg bg-gray-100 dark:bg-gray-800"
                  >
                    <img
                      src={profilePreview || dp}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <IoCamera className="w-5 h-5" />
                    </div>
                  </div>

                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageChange}
                    className="hidden"
                  />
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                </div>

                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Username *
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Pronouns
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. he/him, she/her, they/them"
                      value={pronouns}
                      onChange={(e) => {
                        setPronouns(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Headline / Tagline
                    </label>
                    <input
                      type="text"
                      maxLength={180}
                      placeholder="e.g. Computer Science Student @ MIT | Full Stack Developer"
                      value={headline}
                      onChange={(e) => {
                        setHeadline(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => {
                        setGender(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => {
                        setDob(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Location / Region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. San Francisco, California"
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Website / Portfolio URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://yourportfolio.com"
                      value={website}
                      onChange={(e) => {
                        setWebsite(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Current Job Title / Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer"
                      value={currentRole}
                      onChange={(e) => {
                        setCurrentRole(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Current Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Google, TechCorp"
                      value={currentCompany}
                      onChange={(e) => {
                        setCurrentCompany(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Current College / School
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stanford University"
                      value={currentSchool}
                      onChange={(e) => {
                        setCurrentSchool(e.target.value);
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                    />
                  </div>
                </div>

              </div>
            )}

            {/* 2. ABOUT ME */}
            {activeSection === "about" && (
              <div className="flex flex-col gap-4 animate-fadeIn text-xs">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    About You
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-3">
                    Write a comprehensive summary of your background, academic journey, ambitions, and passions.
                  </p>
                  <textarea
                    rows={8}
                    maxLength={3000}
                    value={about}
                    onChange={(e) => {
                      setAbout(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Hello! I am a passionate learner, tech enthusiast..."
                    className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-2xl p-4 text-gray-900 dark:text-white outline-none transition leading-relaxed resize-y"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block text-right font-mono">
                    {about.length}/3000 characters
                  </span>
                </div>
              </div>
            )}

            {/* 3. EDUCATION */}
            {activeSection === "education" && (
              <div className="flex flex-col gap-5 animate-fadeIn text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Education History ({education.length})
                    </h4>
                    <p className="text-gray-500 text-[11px]">
                      Add universities, colleges, degrees, and academic milestones.
                    </p>
                  </div>
                </div>

                {/* Existing Entries List */}
                <div className="flex flex-col gap-2.5">
                  {education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200/80 dark:border-gray-800 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-xs">
                          {edu.college || "College / University"}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                          {edu.degree} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ""}
                        </p>
                        {(edu.startYear || edu.endYear) && (
                          <p className="text-gray-400 text-[10px] mt-0.5">
                            {edu.startYear} - {edu.current ? "Present" : edu.endYear} {edu.grade ? `• Grade: ${edu.grade}` : ""}
                          </p>
                        )}
                        {edu.description && (
                          <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-1">
                            {edu.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                        title="Remove education"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Education Form */}
                <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#18181b]/50 flex flex-col gap-3">
                  <h5 className="font-bold text-gray-800 dark:text-gray-200 text-xs flex items-center gap-1.5">
                    <IoAdd className="w-4 h-4 text-[#e1306c]" />
                    Add Education Entry
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="School / College / University *"
                      value={eduDraft.college}
                      onChange={(e) => setEduDraft({ ...eduDraft, college: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#e1306c]"
                    />
                    <input
                      type="text"
                      placeholder="Degree (e.g. Bachelor of Science)"
                      value={eduDraft.degree}
                      onChange={(e) => setEduDraft({ ...eduDraft, degree: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#e1306c]"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study (e.g. Computer Science)"
                      value={eduDraft.fieldOfStudy}
                      onChange={(e) => setEduDraft({ ...eduDraft, fieldOfStudy: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#e1306c]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Start Year"
                        value={eduDraft.startYear}
                        onChange={(e) => setEduDraft({ ...eduDraft, startYear: e.target.value })}
                        className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#e1306c]"
                      />
                      <input
                        type="text"
                        placeholder="Graduation Year"
                        value={eduDraft.endYear}
                        disabled={eduDraft.current}
                        onChange={(e) => setEduDraft({ ...eduDraft, endYear: e.target.value })}
                        className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#e1306c] disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400">
                      <input
                        type="checkbox"
                        checked={eduDraft.current}
                        onChange={(e) => setEduDraft({ ...eduDraft, current: e.target.checked })}
                        className="accent-[#e1306c] rounded"
                      />
                      <span>Currently studying here</span>
                    </label>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Activities, societies, key coursework, or achievements..."
                    value={eduDraft.description}
                    onChange={(e) => setEduDraft({ ...eduDraft, description: e.target.value })}
                    className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl p-3 outline-none focus:border-[#e1306c] resize-none"
                  />

                  <button
                    type="button"
                    onClick={handleAddEducation}
                    disabled={!eduDraft.college.trim()}
                    className="self-end px-4 py-1.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 disabled:opacity-30 transition"
                  >
                    + Add to Education
                  </button>
                </div>
              </div>
            )}

            {/* 4. EXPERIENCE */}
            {activeSection === "experience" && (
              <div className="flex flex-col gap-5 animate-fadeIn text-xs">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Work & Professional Experience ({experience.length})
                  </h4>
                  <p className="text-gray-500 text-[11px]">
                    Highlight internships, research positions, full-time jobs, and freelance roles.
                  </p>
                </div>

                {/* Existing Entries List */}
                <div className="flex flex-col gap-2.5">
                  {experience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200/80 dark:border-gray-800 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-xs">
                          {exp.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                          {exp.company} {exp.location ? `• ${exp.location}` : ""}
                        </p>
                        {(exp.startDate || exp.endDate) && (
                          <p className="text-gray-400 text-[10px] mt-0.5">
                            {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                          </p>
                        )}
                        {exp.description && (
                          <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-1 whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                        title="Remove experience"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Experience Form */}
                <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#18181b]/50 flex flex-col gap-3">
                  <h5 className="font-bold text-gray-800 dark:text-gray-200 text-xs flex items-center gap-1.5">
                    <IoAdd className="w-4 h-4 text-[#0095f6]" />
                    Add Experience Entry
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Job Title / Role *"
                      value={expDraft.title}
                      onChange={(e) => setExpDraft({ ...expDraft, title: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#0095f6]"
                    />
                    <input
                      type="text"
                      placeholder="Company / Organization *"
                      value={expDraft.company}
                      onChange={(e) => setExpDraft({ ...expDraft, company: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#0095f6]"
                    />
                    <input
                      type="text"
                      placeholder="Location (e.g. Remote, New York)"
                      value={expDraft.location}
                      onChange={(e) => setExpDraft({ ...expDraft, location: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#0095f6]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Start Date (e.g. Jan 2023)"
                        value={expDraft.startDate}
                        onChange={(e) => setExpDraft({ ...expDraft, startDate: e.target.value })}
                        className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#0095f6]"
                      />
                      <input
                        type="text"
                        placeholder="End Date"
                        value={expDraft.endDate}
                        disabled={expDraft.current}
                        onChange={(e) => setExpDraft({ ...expDraft, endDate: e.target.value })}
                        className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#0095f6] disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400">
                      <input
                        type="checkbox"
                        checked={expDraft.current}
                        onChange={(e) => setExpDraft({ ...expDraft, current: e.target.checked })}
                        className="accent-[#0095f6] rounded"
                      />
                      <span>I currently work in this role</span>
                    </label>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Key responsibilities, leadership, and accomplishments..."
                    value={expDraft.description}
                    onChange={(e) => setExpDraft({ ...expDraft, description: e.target.value })}
                    className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl p-3 outline-none focus:border-[#0095f6] resize-none"
                  />

                  <button
                    type="button"
                    onClick={handleAddExperience}
                    disabled={!expDraft.title.trim() || !expDraft.company.trim()}
                    className="self-end px-4 py-1.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 disabled:opacity-30 transition"
                  >
                    + Add to Experience
                  </button>
                </div>
              </div>
            )}

            {/* 5. SKILLS */}
            {activeSection === "skills" && (
              <div className="flex flex-col gap-4 animate-fadeIn text-xs">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Skills & Competencies ({skills.length})
                  </h4>
                  <p className="text-gray-500 text-[11px]">
                    Add key programming languages, tools, frameworks, soft skills, or design proficiencies.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter (e.g. React, Node.js, Python, UI/UX)..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    className="flex-1 bg-gray-100 dark:bg-[#1c1c1e] rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-[#e1306c]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e1306c] to-[#833ab4] text-white font-bold transition hover:opacity-90"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#1c1c1e] border border-gray-200/80 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-medium"
                    >
                      <span>#{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-gray-400 hover:text-rose-500 transition"
                      >
                        <IoClose className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 6. PROJECTS */}
            {activeSection === "projects" && (
              <div className="flex flex-col gap-5 animate-fadeIn text-xs">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Projects & Portfolio ({projects.length})
                  </h4>
                  <p className="text-gray-500 text-[11px]">
                    Showcase open-source repositories, academic projects, hacks, or client work.
                  </p>
                </div>

                {/* Existing Projects */}
                <div className="flex flex-col gap-2.5">
                  {projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200/80 dark:border-gray-800 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-xs">
                          {proj.title}
                        </p>
                        {proj.description && (
                          <p className="text-gray-600 dark:text-gray-300 mt-1">
                            {proj.description}
                          </p>
                        )}
                        {proj.technologies?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {proj.technologies.map((t, tidx) => (
                              <span
                                key={tidx}
                                className="px-2 py-0.5 rounded-md bg-gray-200/70 dark:bg-gray-800 text-[10px] text-gray-700 dark:text-gray-300 font-mono"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-[11px]">
                          {proj.projectUrl && (
                            <a
                              href={proj.projectUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0095f6] hover:underline"
                            >
                              Live Demo ↗
                            </a>
                          )}
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-600 dark:text-gray-400 hover:underline"
                            >
                              GitHub ↗
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                        title="Remove project"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Project Form */}
                <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#18181b]/50 flex flex-col gap-3">
                  <h5 className="font-bold text-gray-800 dark:text-gray-200 text-xs flex items-center gap-1.5">
                    <IoAdd className="w-4 h-4 text-[#833ab4]" />
                    Add New Project
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Project Title *"
                      value={projDraft.title}
                      onChange={(e) => setProjDraft({ ...projDraft, title: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#833ab4]"
                    />
                    <input
                      type="text"
                      placeholder="Technologies (comma separated: React, Tailwind, Python)"
                      value={projDraft.technologies}
                      onChange={(e) => setProjDraft({ ...projDraft, technologies: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#833ab4]"
                    />
                    <input
                      type="url"
                      placeholder="Live Demo URL (e.g. https://myproject.com)"
                      value={projDraft.projectUrl}
                      onChange={(e) => setProjDraft({ ...projDraft, projectUrl: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#833ab4]"
                    />
                    <input
                      type="url"
                      placeholder="GitHub Repository URL"
                      value={projDraft.githubUrl}
                      onChange={(e) => setProjDraft({ ...projDraft, githubUrl: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-[#833ab4]"
                    />
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Brief description of the problem solved, architecture, and features..."
                    value={projDraft.description}
                    onChange={(e) => setProjDraft({ ...projDraft, description: e.target.value })}
                    className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl p-3 outline-none focus:border-[#833ab4] resize-none"
                  />

                  <button
                    type="button"
                    onClick={handleAddProject}
                    disabled={!projDraft.title.trim()}
                    className="self-end px-4 py-1.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 disabled:opacity-30 transition"
                  >
                    + Add to Projects
                  </button>
                </div>
              </div>
            )}

            {/* 7. CERTIFICATIONS */}
            {activeSection === "certifications" && (
              <div className="flex flex-col gap-5 animate-fadeIn text-xs">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Certifications & Licenses ({certifications.length})
                  </h4>
                  <p className="text-gray-500 text-[11px]">
                    Add industry certifications from AWS, Google, Microsoft, Coursera, etc.
                  </p>
                </div>

                {/* Existing Certifications */}
                <div className="flex flex-col gap-2.5">
                  {certifications.map((cert, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200/80 dark:border-gray-800 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-xs">
                          {cert.name}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                          {cert.issuingOrganization}
                        </p>
                        {cert.issueDate && (
                          <p className="text-gray-400 text-[10px] mt-0.5">
                            Issued: {cert.issueDate} {cert.credentialId ? `• ID: ${cert.credentialId}` : ""}
                          </p>
                        )}
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#0095f6] hover:underline text-[11px] mt-1 inline-block"
                          >
                            View Credential ↗
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Certification Form */}
                <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#18181b]/50 flex flex-col gap-3">
                  <h5 className="font-bold text-gray-800 dark:text-gray-200 text-xs flex items-center gap-1.5">
                    <IoAdd className="w-4 h-4 text-emerald-500" />
                    Add Certification
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Certification Name *"
                      value={certDraft.name}
                      onChange={(e) => setCertDraft({ ...certDraft, name: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Issuing Organization (e.g. AWS, Meta)"
                      value={certDraft.issuingOrganization}
                      onChange={(e) => setCertDraft({ ...certDraft, issuingOrganization: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Issue Date (e.g. May 2024)"
                      value={certDraft.issueDate}
                      onChange={(e) => setCertDraft({ ...certDraft, issueDate: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                    />
                    <input
                      type="url"
                      placeholder="Credential URL"
                      value={certDraft.credentialUrl}
                      onChange={(e) => setCertDraft({ ...certDraft, credentialUrl: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCertification}
                    disabled={!certDraft.name.trim()}
                    className="self-end px-4 py-1.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 disabled:opacity-30 transition"
                  >
                    + Add Certification
                  </button>
                </div>
              </div>
            )}

            {/* 8. ACHIEVEMENTS */}
            {activeSection === "achievements" && (
              <div className="flex flex-col gap-5 animate-fadeIn text-xs">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Honors & Achievements ({achievements.length})
                  </h4>
                  <p className="text-gray-500 text-[11px]">
                    Awards, hackathon wins, scholarships, competitive rankings, and publications.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {achievements.map((ach, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200/80 dark:border-gray-800 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white text-xs">
                          {ach.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-0.5">
                          {ach.issuer} {ach.date ? `• ${ach.date}` : ""}
                        </p>
                        {ach.description && (
                          <p className="text-gray-500 dark:text-gray-300 mt-1">
                            {ach.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAchievement(idx)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-500/10 transition"
                      >
                        <IoTrashOutline className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#18181b]/50 flex flex-col gap-3">
                  <h5 className="font-bold text-gray-800 dark:text-gray-200 text-xs flex items-center gap-1.5">
                    <IoAdd className="w-4 h-4 text-amber-500" />
                    Add Achievement
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Title / Award Name *"
                      value={achDraft.title}
                      onChange={(e) => setAchDraft({ ...achDraft, title: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Issuer / Event (e.g. HackMIT, Dean's List)"
                      value={achDraft.issuer}
                      onChange={(e) => setAchDraft({ ...achDraft, issuer: e.target.value })}
                      className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none focus:border-amber-500"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Details or impact of this achievement..."
                    value={achDraft.description}
                    onChange={(e) => setAchDraft({ ...achDraft, description: e.target.value })}
                    className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl p-3 outline-none focus:border-amber-500 resize-none"
                  />

                  <button
                    type="button"
                    onClick={handleAddAchievement}
                    disabled={!achDraft.title.trim()}
                    className="self-end px-4 py-1.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:opacity-90 disabled:opacity-30 transition"
                  >
                    + Add Achievement
                  </button>
                </div>
              </div>
            )}

            {/* 9. LANGUAGES */}
            {activeSection === "languages" && (
              <div className="flex flex-col gap-5 animate-fadeIn text-xs">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Languages Spoken ({languages.length})
                  </h4>
                  <p className="text-gray-500 text-[11px]">
                    Add languages you speak and your proficiency level.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {languages.map((lang, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200/80 dark:border-gray-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-gray-900 dark:text-white mr-2">
                          {lang.language}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#0095f6]/10 text-[#0095f6] font-semibold">
                          {lang.proficiency}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(idx)}
                        className="p-1 text-gray-400 hover:text-rose-500"
                      >
                        <IoClose className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-[#18181b]/50 flex items-center gap-3 flex-wrap">
                  <input
                    type="text"
                    placeholder="Language (e.g. English, Spanish, Hindi)"
                    value={langDraft.language}
                    onChange={(e) => setLangDraft({ ...langDraft, language: e.target.value })}
                    className="flex-1 min-w-[140px] bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none"
                  />
                  <select
                    value={langDraft.proficiency}
                    onChange={(e) => setLangDraft({ ...langDraft, proficiency: e.target.value })}
                    className="bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="Native">Native or Bilingual</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Professional working">Professional working</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Basic">Basic</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    disabled={!langDraft.language.trim()}
                    className="px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold disabled:opacity-30"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* 10. INTERESTS */}
            {activeSection === "interests" && (
              <div className="flex flex-col gap-4 animate-fadeIn text-xs">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Interests & Hobbies ({interests.length})
                  </h4>
                  <p className="text-gray-500 text-[11px]">
                    Share academic interests, extracurricular passions, and hobbies.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type an interest (e.g. Artificial Intelligence, Robotics, Photography)..."
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddInterest();
                      }
                    }}
                    className="flex-1 bg-gray-100 dark:bg-[#1c1c1e] rounded-xl px-3.5 py-2.5 outline-none focus:ring-1 focus:ring-[#e1306c]"
                  />
                  <button
                    type="button"
                    onClick={handleAddInterest}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e1306c] to-[#833ab4] text-white font-bold"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#1c1c1e] border border-gray-200/80 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-medium"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="text-gray-400 hover:text-rose-500"
                      >
                        <IoClose className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 11. SOCIAL LINKS */}
            {activeSection === "social" && (
              <div className="flex flex-col gap-4 animate-fadeIn text-xs">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Social & Professional Profiles
                  </h4>
                  <p className="text-gray-500 text-[11px]">
                    Connect your public online profiles across GitHub, LinkedIn, Twitter, etc.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={socialLinks.github}
                      onChange={(e) => {
                        setSocialLinks({ ...socialLinks, github: e.target.value });
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={socialLinks.linkedin}
                      onChange={(e) => {
                        setSocialLinks({ ...socialLinks, linkedin: e.target.value });
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Twitter / X URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://x.com/username"
                      value={socialLinks.twitter}
                      onChange={(e) => {
                        setSocialLinks({ ...socialLinks, twitter: e.target.value });
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/username"
                      value={socialLinks.instagram}
                      onChange={(e) => {
                        setSocialLinks({ ...socialLinks, instagram: e.target.value });
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      YouTube Channel URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/@channel"
                      value={socialLinks.youtube}
                      onChange={(e) => {
                        setSocialLinks({ ...socialLinks, youtube: e.target.value });
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                      Other / Personal Blog
                    </label>
                    <input
                      type="url"
                      placeholder="https://myblog.dev"
                      value={socialLinks.other}
                      onChange={(e) => {
                        setSocialLinks({ ...socialLinks, other: e.target.value });
                        setIsDirty(true);
                      }}
                      className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 12. PRIVACY CONTROLS */}
            {activeSection === "privacy" && (
              <div className="flex flex-col gap-4 animate-fadeIn text-xs">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <IoShieldCheckmarkOutline className="w-4 h-4 text-[#e1306c]" />
                    Profile Privacy & Visibility Controls
                  </h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    Configure who can see sensitive details on your profile. Privacy is strictly enforced on the server.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { key: "emailPrivacy", label: "Email Address Visibility", desc: "Controls who sees your email address on your profile" },
                    { key: "phonePrivacy", label: "Phone Number Visibility", desc: "Controls who sees your phone number on your profile" },
                    { key: "dobPrivacy", label: "Date of Birth Visibility", desc: "Controls who sees your birthdate on your profile" },
                    { key: "locationPrivacy", label: "Location & City Visibility", desc: "Controls who sees your city and country" },
                    { key: "educationPrivacy", label: "Education History Visibility", desc: "Controls who sees your schools and degrees" },
                    { key: "experiencePrivacy", label: "Work Experience Visibility", desc: "Controls who sees your past jobs and roles" },
                    { key: "socialPrivacy", label: "Social Links Visibility", desc: "Controls who sees your external links" },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200/80 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {item.label}
                        </p>
                        <p className="text-gray-500 text-[11px] mt-0.5">
                          {item.desc}
                        </p>
                      </div>

                      <select
                        value={privacySettings[item.key] || "everyone"}
                        onChange={(e) => {
                          setPrivacySettings({
                            ...privacySettings,
                            [item.key]: e.target.value,
                          });
                          setIsDirty(true);
                        }}
                        className="bg-white dark:bg-[#27272a] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 outline-none font-semibold text-gray-900 dark:text-white"
                      >
                        <option value="everyone">🌐 Everyone (Public)</option>
                        <option value="connections">👥 Connections Only</option>
                        <option value="only_me">🔒 Only Me (Private)</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
