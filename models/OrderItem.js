import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true
    },
    discountTotal: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

orderItemSchema.pre("save", function (next) {
  this.total = this.price * this.quantity;
  this.discountTotal = (this.discountPrice || 0) * this.quantity;
  return next();
});

export default mongoose.model("OrderItem", orderItemSchema);
