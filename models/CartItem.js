import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
    discountPrice: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: function () {
        return (this.price || 0) * (this.quantity || 1);
      }
    },
    discountTotal: {
      type: Number,
      default: function () {
        return (this.discountPrice || 0) * (this.quantity || 1);
      }
    }
  },
  { timestamps: true }
);

cartItemSchema.pre("validate", function (next) {
  if (this.price !== undefined) {
    this.total = this.price * (this.quantity || 1);
    this.discountTotal = (this.discountPrice || 0) * (this.quantity || 1);
  }
  return next();
});

cartItemSchema.pre("save", function (next) {
  this.total = this.price * (this.quantity || 1);
  this.discountTotal = (this.discountPrice || 0) * (this.quantity || 1);
  return next();
});

export default mongoose.model("CartItem", cartItemSchema);
