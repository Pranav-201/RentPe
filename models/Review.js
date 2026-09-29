import mongoose from "mongoose";
import { REVIEW_RATING } from "../config/constants.js";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: REVIEW_RATING.MIN,
      max: REVIEW_RATING.MAX
    },
    title: {
      type: String,
      required: [true, "Review title is required"],
      maxlength: 200
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      minlength: 10,
      maxlength: 2000
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
