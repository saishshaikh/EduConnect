import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Feed from './pages/Feed'
import Signup from './pages/Signup'
import Login from './pages/Login'
import { userDataContext } from './context/UserContext'
import Network from './pages/Network'
import Profile from './pages/Profile'
import Notification from './pages/Notification'

import Chat from './pages/Chat'
import Explore from './pages/Explore'
import CallModal from './components/CallModal'

function App() {
  let {userData}=useContext(userDataContext)
  return (
    <>
      <CallModal />
      <Routes>
        <Route path='/' element={userData?<Home/>:<Navigate to="/login"/>}/>
        <Route path='/feed' element={userData?<Feed/>:<Navigate to="/login"/>}/>
        <Route path='/signup' element={userData?<Navigate to="/"/>:<Signup/>}/>
        <Route path='/login' element={userData?<Navigate to="/"/>:<Login/>}/>
        <Route path='/explore' element={userData?<Explore/>:<Navigate to="/login"/>}/>
        <Route path='/network' element={userData?<Network/>:<Navigate to="/login"/>}/>
        <Route path='/profile' element={userData?<Profile/>:<Navigate to="/login"/>}/>
        <Route path='/notification' element={userData?<Notification/>:<Navigate to="/login"/>}/>
        <Route path='/chat' element={userData?<Chat/>:<Navigate to="/login"/>}/>
        <Route path='/chat/:targetUserId' element={userData?<Chat/>:<Navigate to="/login"/>}/>
      </Routes>
    </>
  )
}

export default App
