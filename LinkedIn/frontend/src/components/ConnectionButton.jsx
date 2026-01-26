import React, { useContext, useEffect, useState } from 'react'
import { authDataContext } from '../context/AuthContext'
import axios from 'axios'
import io from "socket.io-client"
import { userDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'

const socket = io("http://localhost:8000")

function ConnectionButton({ userId }) {
  let { serverUrl } = useContext(authDataContext)
  let { userData } = useContext(userDataContext)
  let [status, setStatus] = useState("")
  let navigate = useNavigate()

  // Send connection request
  const handleSendConnection = async () => {
    if (!userId) return
    try {
      let result = await axios.post(`${serverUrl}/api/connection/send/${userId}`, {}, { withCredentials: true })
      console.log(result)
    } catch (error) {
      console.log(error)
    }
  }

  // Remove connection
  const handleRemoveConnection = async () => {
    if (!userId) return
    try {
      let result = await axios.delete(`${serverUrl}/api/connection/remove/${userId}`, { withCredentials: true })
      console.log(result)
    } catch (error) {
      console.log(error)
    }
  }

  // Get current connection status
  const handleGetStatus = async () => {
    if (!userId) return
    try {
      let result = await axios.get(`${serverUrl}/api/connection/getStatus/${userId}`, { withCredentials: true })
      console.log(result)
      setStatus(result.data.status || "disconnect")
    } catch (error) {
      console.log("Failed to get connection status:", error)
      setStatus("disconnect") // fallback
    }
  }

  // Initialize socket and status
  useEffect(() => {
    if (!userData?._id || !userId) return

    socket.emit("register", userData._id)
    handleGetStatus()

    socket.on("statusUpdate", ({ updatedUserId, newStatus }) => {
      if (updatedUserId === userId) {
        setStatus(newStatus)
      }
    })

    return () => {
      socket.off("statusUpdate")
    }
  }, [userId, userData?._id])

  // Button click handler
  const handleClick = async () => {
    if (!userId) return

    if (status === "disconnect") {
      await handleRemoveConnection()
    } else if (status === "received") {
      navigate("/network")
    } else {
      await handleSendConnection()
    }
  }

  return (
    <button
      className='min-w-[100px] h-[40px] rounded-full border-2 border-[#2dc0ff] text-[#2dc0ff]'
      onClick={handleClick}
      disabled={status === "pending" || !userId}
    >
      {status || "connect"}
    </button>
  )
}

export default ConnectionButton
