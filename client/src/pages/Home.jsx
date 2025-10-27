import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const backendURL = import.meta.env.VITE_BACKEND_URL;

export default function Home() {
  const { userToken, isAuthenticated } = useAuth();
  const [roomId, setRoomId] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const navigate = useNavigate();

  const createRoom = async () => {
    if (!isAuthenticated) {
      alert("You must be logged in to create a room!");
      return;
    }
    if (!newRoomName) {
      alert("Room name cannot be empty!");
      return;
    }

    try {
      const res = await axios.post(
        `${backendURL}/api/rooms/create`,
        { name: newRoomName },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      navigate(`/whiteboard/${res.data.roomId}`);
    } catch (err) {
      console.error("Error creating room:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to create room");
    }
  };

  const joinRoom = () => {
    if (!roomId) {
      alert("Please enter a room ID!");
      return;
    }
    navigate(`/whiteboard/${roomId}`);
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
          Create or Join a Room
        </h2>

        {/* Create Room */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm sm:text-base mb-1">Room Name</label>
            <input
              type="text"
              placeholder="Enter a room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none transition duration-200"
            />
            <button
              onClick={createRoom}
              className="w-full mt-3 bg-indigo-600 text-white font-semibold py-2 sm:py-3 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Create Room
            </button>
          </div>

          {/* Join Room */}
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-gray-700 text-sm sm:text-base mb-1">Room ID</label>
            <input
              type="text"
              placeholder="Enter room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:outline-none transition duration-200"
            />
            <button
              onClick={joinRoom}
              className="w-full mt-3 bg-purple-600 text-white font-semibold py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition duration-200"
            >
              Join Room
            </button>
          </div>
        </div>

        <p className="text-center text-sm sm:text-base text-gray-500">
          Secure collaborative whiteboard – powered by Socket.io
        </p>
      </div>
    </div>
    </>
  );
}
