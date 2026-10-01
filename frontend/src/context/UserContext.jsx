import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authDataContext } from './AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const userDataContext = createContext();

function UserContext({ children }) {
  const [userData, setUserData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [postData, setPostData] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [storiesFeed, setStoriesFeed] = useState([]);
  const [loadingStories, setLoadingStories] = useState(false);

  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  // Set up Authorization header from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  // Get current logged-in user
  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const result = await axios.get(`${serverUrl}/api/user/currentuser`, {
        headers,
        withCredentials: true,
      });
      setUserData(result.data);
      return result.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      setUserData(null);
      return null;
    }
  };

  // Get all posts
  const getPost = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/post/getpost`, {
        withCredentials: true,
      });
      setPostData(result.data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Fetch stories feed
  const fetchStoriesFeed = useCallback(async () => {
    try {
      setLoadingStories(true);
      const result = await axios.get(`${serverUrl}/api/story/feed`, {
        withCredentials: true,
      });
      setStoriesFeed(result.data || []);
    } catch (error) {
      console.error("Error fetching stories feed:", error);
      setStoriesFeed([]);
    } finally {
      setLoadingStories(false);
    }
  }, [serverUrl]);

  // Fetch stories for a specific user
  const fetchUserStories = useCallback(async (targetUserId) => {
    try {
      if (!targetUserId) return [];
      const result = await axios.get(`${serverUrl}/api/story/user/${targetUserId}`, {
        withCredentials: true,
      });
      return result.data || [];
    } catch (error) {
      console.error("Error fetching user stories:", error);
      return [];
    }
  }, [serverUrl]);

  // Record a view on a story
  const recordStoryView = async (storyId) => {
    try {
      if (!storyId) return;
      await axios.post(`${serverUrl}/api/story/view/${storyId}`, {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error("Error recording story view:", error);
    }
  };

  // Delete a story
  const deleteStory = async (storyId) => {
    try {
      await axios.delete(`${serverUrl}/api/story/${storyId}`, {
        withCredentials: true,
      });
      await fetchStoriesFeed();
      return true;
    } catch (error) {
      console.error("Error deleting story:", error);
      throw error;
    }
  };

  // Get profile by username or current user
  const handleGetProfile = async (userName) => {
    try {
      // If no userName provided, or matches logged-in user's username or ID
      if (!userName || (userData && (userName === userData.userName || userName === userData._id))) {
        // Refetch current user to ensure latest profile data
        const freshUser = await getCurrentUser();
        setProfileData(freshUser || userData);
        navigate("/profile");
        return;
      }

      const result = await axios.get(`${serverUrl}/api/user/profile/${encodeURIComponent(userName)}`, {
        withCredentials: true,
      });
      setProfileData(result.data);
      navigate("/profile");
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (userData) {
        setProfileData(userData);
        navigate("/profile");
      }
    }
  };

  // Load initial data
  useEffect(() => {
    getCurrentUser();
    getPost();
  }, []);

  // Fetch stories when user is logged in
  useEffect(() => {
    if (userData?._id) {
      fetchStoriesFeed();
    }
  }, [userData?._id, fetchStoriesFeed]);

  const value = {
    userData,
    setUserData,
    getCurrentUser,
    edit,
    setEdit,
    postData,
    setPostData,
    getPost,
    handleGetProfile,
    profileData,
    setProfileData,
    storiesFeed,
    fetchStoriesFeed,
    fetchUserStories,
    recordStoryView,
    deleteStory,
    loadingStories,
  };

  return <userDataContext.Provider value={value}>{children}</userDataContext.Provider>;
}

export default UserContext;
