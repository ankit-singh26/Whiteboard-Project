import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: String,
  roomId: String,
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const Room = mongoose.model("Room", roomSchema);
export default Room;
