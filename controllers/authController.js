import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { USER_ROLES } from "../config/constants.js";

function serializeUser(user) {
  const userObj = user.toObject({ virtuals: true });
  delete userObj.password;
  return userObj;
}

function firebaseDisplayName(name) {
  const normalizedName = typeof name === "string" ? name.trim().slice(0, 100) : "";
  return normalizedName.length >= 2 ? normalizedName : "RentPe User";
}

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
    const { name, phone, collegeName, collegeId, address } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (collegeName !== undefined) updateData.collegeName = collegeName;
    if (collegeId !== undefined) updateData.collegeId = collegeId;
    if (address !== undefined) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
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

export async function syncFirebaseAccount(req, res) {
  try {
    const { uid, email, emailVerified, name } = req.firebase;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.badRequest({ error: "Firebase account does not include an email address" });
    }

    const linkedUser = await User.findOne({ firebaseUid: uid });
    if (linkedUser) {
      if (!linkedUser.isActive) {
        return res.forbidden({ error: "Account is inactive" });
      }

      return res.ok({ user: serializeUser(linkedUser) });
    }

    const emailUser = await User.findOne({ email: normalizedEmail });
    if (emailUser) {
      if (emailUser.firebaseUid && emailUser.firebaseUid !== uid) {
        return res.conflict({ error: "Email is already linked to a different Firebase account" });
      }

      if (!emailVerified) {
        return res.forbidden({
          error: "Verify your Firebase email address before linking it to an existing RentPe account"
        });
      }

      if (!emailUser.isActive) {
        return res.forbidden({ error: "Account is inactive" });
      }

      emailUser.firebaseUid = uid;
      await emailUser.save();
      return res.ok({ user: serializeUser(emailUser) });
    }

    const user = await User.create({
      name: firebaseDisplayName(name),
      email: normalizedEmail,
      firebaseUid: uid
    });

    return res.created({ user: serializeUser(user) });
  } catch (error) {
    if (error?.code === 11000) {
      return res.conflict({ error: "Firebase account could not be synchronized. Please try again." });
    }

    if (error?.name === "ValidationError") {
      return res.badRequest({ error: "Unable to create the RentPe profile" });
    }

    return res.serverError({ error: "Unable to synchronize Firebase account" });
  }
}
