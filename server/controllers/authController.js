import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_KEY, { expiresIn: "7d" });

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ username, email, password });
  res.json({ token: generateToken(user._id), username: user.username });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({ token: generateToken(user._id), username: user.username, userId: user._id });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};
