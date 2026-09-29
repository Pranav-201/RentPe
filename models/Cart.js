import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CartItem"
      }
    ],
    totalItems: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      default: 0
    },
    discountPrice: {
      type: Number,
      default: 0
    },
    finalPrice: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

cartSchema.methods.calculateTotals = async function () {
  await this.populate("items");

  this.totalItems = this.items.length;
  this.totalPrice = this.items.reduce((sum, item) => sum + item.total, 0);
  this.discountPrice = this.items.reduce(
    (sum, item) => sum + item.discountTotal,
    0
  );
  this.finalPrice = this.totalPrice - this.discountPrice;

  await this.save();
};

export default mongoose.model("Cart", cartSchema);
