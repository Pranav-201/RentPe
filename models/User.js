import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { USER_ROLES } from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email"
      ]
    },
    firebaseUid: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    password: {
      type: String,
      minlength: 6,
      select: false
    },
    phone: {
      type: String,
      trim: true
    },
    collegeId: {
      type: String,
      trim: true
    },
    collegeName: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    return next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

userSchema.virtual("profileComplete").get(function () {
  return Boolean(
    this.name?.trim() &&
    this.phone?.trim() &&
    this.collegeId?.trim() &&
    this.collegeName?.trim()
  );
});

export default mongoose.model("User", userSchema);
