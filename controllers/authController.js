import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { USER_ROLES } from "../config/constants.js";

export async function register(req, res) {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.conflict({ error: "Email already registered" });
    }

    const user = new User(req.body);
    await user.save();

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.created({
      message: "User registered successfully",
      user: userObj,
      token
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.unauthorized({ error: "Invalid credentials" });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.unauthorized({ error: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.forbidden({ error: "Account is inactive" });
    }

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.ok({
      message: "Login successful",
      user: userObj,
      token
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.notFound({ error: "User not found" });
    }

    res.ok({
      user
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.notFound({ error: "User not found" });
    }

    res.ok({
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}