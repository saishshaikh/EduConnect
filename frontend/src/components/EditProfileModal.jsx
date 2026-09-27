import React, { useContext, useState, useRef } from "react";
import axios from "axios";
import { IoClose, IoCamera, IoAdd, IoTrash } from "react-icons/io5";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";

export default function EditProfileModal({ isOpen, onClose }) {
  const { userData, setUserData, setProfileData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);

  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [userName, setUserName] = useState(userData?.userName || "");
  const [headline, setHeadline] = useState(userData?.headline || "");
  const [location, setLocation] = useState(userData?.location || "India");
  const [gender, setGender] = useState(userData?.gender || "other");

  const [skills, setSkills] = useState(userData?.skills || []);
  const [newSkill, setNewSkill] = useState("");

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(userData?.profileImage || "");

  const [saving, setSaving] = useState(false);
  const profileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleAddSkill = () => {
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("userName", userName);
      formData.append("headline", headline);
      formData.append("location", location);
      formData.append("gender", gender);
      formData.append("skills", JSON.stringify(skills));

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      const res = await axios.put(
        `${serverUrl}/api/user/updateprofile`,
        formData,
        { withCredentials: true }
      );

      if (res.data) {
        setUserData(res.data);
        setProfileData(res.data);
        onClose();
      }
    } catch (err) {
      console.error("Save profile error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div
        className="w-full max-w-[560px] bg-white dark:bg-[#121212] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#262626] flex flex-col max-h-[90vh] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-[52px] px-4 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-white"
          >
            Cancel
          </button>

          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Edit Profile
          </h3>

          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-bold text-[#0095f6] hover:text-[#0074cc] disabled:opacity-40"
          >
            {saving ? "Saving..." : "Done"}
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          
          {/* Avatar Change */}
          <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#1c1c1e] p-3.5 rounded-2xl">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 flex-shrink-0">
              <img
                src={profileImagePreview || dp}
                alt=""
                className="w-full h-full object-cover"
              />
              <div
                onClick={() => profileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center text-white cursor-pointer opacity-80 hover:opacity-100 transition"
              >
                <IoCamera className="w-5 h-5" />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {userData?.userName || "username"}
              </p>
              <button
                type="button"
                onClick={() => profileInputRef.current?.click()}
                className="text-xs font-bold text-[#0095f6] hover:text-[#0074cc] mt-0.5"
              >
                Change profile photo
              </button>
            </div>

            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-3 text-xs">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                Username
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
              />
            </div>

            <div>
              <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                Bio / Headline
              </label>
              <textarea
                rows={2}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Share your goals, studies, or interests..."
                className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-[#1c1c1e] border border-transparent focus:border-[#e1306c] rounded-xl px-3 py-2.5 text-gray-900 dark:text-white outline-none transition"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Prefer not to say / Other</option>
                </select>
              </div>
            </div>

            {/* Skills / Interests */}
            <div>
              <label className="font-semibold text-gray-600 dark:text-gray-400 mb-1 block">
                Skills & Interests
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. React, Python, UI/UX"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="w-full bg-gray-100 dark:bg-[#1c1c1e] rounded-xl px-3 py-2 text-gray-900 dark:text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 bg-[#0a66c2] text-white rounded-xl font-semibold hover:bg-[#004182]"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-gray-100 dark:bg-[#1c1c1e] text-gray-800 dark:text-gray-200 px-2.5 py-1 rounded-full text-[11px] font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-500"
                    >
                      <IoClose className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

          </div>

        </form>
      </div>
    </div>
  );
}
