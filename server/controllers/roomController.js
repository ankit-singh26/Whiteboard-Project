import Room from "../models/Room.js";
import { v4 as uuidv4 } from "uuid";

export const createRoom = async (req, res) => {
  const { name } = req.body;
  const room = await Room.create({ name, roomId: uuidv4(), users: [req.user._id] });
  res.json(room);
};

export const joinRoom = async (req, res) => {
  const { roomId } = req.body;
  const room = await Room.findOne({ roomId });
  if (!room) return res.status(404).json({ message: "Room not found" });
  if (!room.users.includes(req.user._id)) room.users.push(req.user._id);
  await room.save();
  res.json(room);
};
