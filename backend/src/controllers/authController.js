import { register, login } from "../services/authService.js";

export const registerUser = async (req, res) => {
  try {
    const response = await register(req.body);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const response = await login(req.body);
    res.json(response);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};