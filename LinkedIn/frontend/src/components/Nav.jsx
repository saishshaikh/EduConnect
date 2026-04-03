import React, { useContext, useEffect, useState } from 'react'
import { IoSearchSharp } from "react-icons/io5";
import { TiHome } from "react-icons/ti";
import { FaUserGroup } from "react-icons/fa6";
import { IoNotificationsSharp } from "react-icons/io5";
import dp from "../assets/dp.webp"
import { userDataContext } from '../context/UserContext';
import { authDataContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Nav() {

  let [activeSearch, setActiveSearch] = useState(false)
  let { userData, setUserData, handleGetProfile } = useContext(userDataContext)
  let [showPopup, setShowPopup] = useState(false)

  let navigate = useNavigate()
  let { serverUrl } = useContext(authDataContext)

  let [searchInput, setSearchInput] = useState("")
  let [searchData, setSearchData] = useState([])

  const handleSignOut = async () => {
    try {
      await axios.get(serverUrl + "/api/auth/logout", { withCredentials: true })
      setUserData(null)
      navigate("/login")
    } catch (error) {
      console.log(error)
    }
  }

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setSearchData([])
      return
    }

    try {
      let result = await axios.get(
        `${serverUrl}/api/user/search?query=${searchInput}`,
        { withCredentials: true }
      )
      setSearchData(result.data)
    } catch (error) {
      setSearchData([])
    }
  }

  useEffect(() => {
    handleSearch()
  }, [searchInput])

  return (
    <div className='w-full h-[80px] bg-white fixed top-0 shadow-lg flex justify-between md:justify-around items-center px-[12px] z-[80]'>

      {/* LEFT */}
      <div className='flex items-center gap-[15px]'>

        {/* TEXT LOGO */}
        <div 
          className='cursor-pointer flex flex-col leading-none hover:scale-105 transition'
          onClick={() => {
            setActiveSearch(false)
            navigate("/")
          }}
        >
          <h1 className='text-[26px] font-extrabold text-black tracking-wide'>
            EduConnect
          </h1>
          <span className='text-[12px] text-gray-600 tracking-wider'>
            Learn. Connect. Grow.
          </span>
        </div>

        {!activeSearch && (
          <IoSearchSharp
            className='w-[23px] h-[23px] text-gray-600 lg:hidden cursor-pointer'
            onClick={() => setActiveSearch(true)}
          />
        )}

        {searchData.length > 0 && (
          <div className='absolute top-[90px] left-[0px] lg:left-[20px] shadow-xl w-[100%] lg:w-[700px] bg-white flex flex-col gap-[20px] p-[20px] overflow-auto h-[500px] rounded-lg'>

            {searchData.map((sea, index) => (
              <div
                key={sea._id || index}
                className='flex gap-[20px] items-center border-b p-[10px] hover:bg-gray-100 cursor-pointer rounded-lg transition'
                onClick={() => handleGetProfile(sea.userName)}
              >

                <div className='w-[70px] h-[70px] rounded-full overflow-hidden'>
                  <img src={sea.profileImage || dp} className='w-full h-full' />
                </div>

                <div>
                  <div className='text-[18px] font-semibold text-gray-700'>
                    {sea.firstName} {sea.lastName}
                  </div>
                  <div className='text-[14px] text-gray-600'>
                    {sea.headline}
                  </div>
                </div>

              </div>
            ))}

          </div>
        )}

        <form
          className={`w-[190px] lg:w-[350px] h-[40px] bg-[#f0efe7] flex items-center gap-[10px] px-[10px] rounded-md ${!activeSearch ? "hidden lg:flex" : "flex"}`}
          onSubmit={(e) => e.preventDefault()}
        >
          <IoSearchSharp className='w-[23px] h-[23px] text-gray-600' />
          <input
            type="text"
            className='w-[80%] h-full bg-transparent outline-none border-0'
            placeholder='Search users...'
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
          />
        </form>

      </div>

      {/* RIGHT */}
      <div className='flex items-center gap-[20px]'>

        {showPopup && userData && (
          <div className='w-[300px] bg-white shadow-xl absolute top-[75px] right-[20px] lg:right-[100px] rounded-lg flex flex-col items-center p-[20px] gap-[20px]'>

            <div className='w-[70px] h-[70px] rounded-full overflow-hidden'>
              <img src={userData.profileImage || dp} className='w-full h-full' />
            </div>

            <div className='text-[18px] font-semibold text-gray-700'>
              {userData.firstName} {userData.lastName}
            </div>

            <button
              className='w-full h-[40px] rounded-full border-2 border-black text-black hover:bg-black hover:text-white transition'
              onClick={() => handleGetProfile(userData.userName)}
            >
              View Profile
            </button>

            <div className='w-full h-[1px] bg-gray-300'></div>

            <div
              className='flex w-full items-center gap-[10px] cursor-pointer text-gray-600 hover:text-black transition'
              onClick={() => navigate("/network")}
            >
              <FaUserGroup className='w-[23px] h-[23px]' />
              <div>My Networks</div>
            </div>

            <button
              className='w-full h-[40px] rounded-full border-2 border-red-400 text-red-400 hover:bg-red-400 hover:text-white transition'
              onClick={handleSignOut}
            >
              Sign Out
            </button>

          </div>
        )}

        <div className='hidden lg:flex flex-col items-center cursor-pointer text-gray-600 hover:text-black transition' onClick={() => navigate("/")}>
          <TiHome className='w-[23px] h-[23px]' />
          <div>Home</div>
        </div>

        <div className='hidden md:flex flex-col items-center cursor-pointer text-gray-600 hover:text-black transition' onClick={() => navigate("/network")}>
          <FaUserGroup className='w-[23px] h-[23px]' />
          <div>My Networks</div>
        </div>

        <div className='flex flex-col items-center cursor-pointer text-gray-600 hover:text-black transition' onClick={() => navigate("/notification")}>
          <IoNotificationsSharp className='w-[23px] h-[23px]' />
          <div className='hidden md:block'>Notifications</div>
        </div>

        {userData && (
          <div
            className='w-[50px] h-[50px] rounded-full overflow-hidden cursor-pointer ring-2 ring-black'
            onClick={() => setShowPopup(prev => !prev)}
          >
            <img src={userData.profileImage || dp} className='w-full h-full' />
          </div>
        )}

      </div>
    </div>
  )
}

export default Nav
