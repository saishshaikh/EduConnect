import React, { createContext, useContext, useEffect, useState } from 'react';
import { authDataContext } from './AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const userDataContext = createContext();

function UserContext({ children }) {
  const [userData, setUserData] = useState(null);
  const [edit, setEdit] = useState(false);
  const [postData, setPostData] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  // Get current logged-in user
  const getCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/currentuser`, {
        withCredentials: true,
      });
      setUserData(result.data);
    } catch (error) {
      console.error("Error fetching current user:", error);
      setUserData(null);
    }
  };

  // Get all posts
  const getPost = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/post/getpost`, {
        withCredentials: true,
      });
      setPostData(result.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Get profile by username or current user
  const handleGetProfile = async (userName) => {
    try {
      // If no userName provided, or matches logged-in user's username or ID
      if (!userName || (userData && (userName === userData.userName || userName === userData._id))) {
        setProfileData(userData);
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

  const value = {
    userData,
    setUserData,
    edit,
    setEdit,
    postData,
    setPostData,
    getPost,
    handleGetProfile,
    profileData,
    setProfileData,
  };

  return <userDataContext.Provider value={value}>{children}</userDataContext.Provider>;
}

export default UserContext;
