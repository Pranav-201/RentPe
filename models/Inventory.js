import mongoose from "mongoose";
import { INVENTORY_STATUS } from "../config/constants.js";

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      default: 0,
      min: 0
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0
    },
    available: {
      type: Number,
      default: 0
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: 0
    },
    status: {
      type: String,
      enum: Object.values(INVENTORY_STATUS),
      default: INVENTORY_STATUS.OUT_OF_STOCK
    },
    lastRestockDate: Date,
    supplier: String
  },
  { timestamps: true }
);

inventorySchema.pre("save", function (next) {
  this.available = this.quantity - this.reserved;

  if (this.available === 0) {
    this.status = INVENTORY_STATUS.OUT_OF_STOCK;
  } else if (this.available <= this.reorderLevel) {
    this.status = INVENTORY_STATUS.LOW_STOCK;
  } else {
    this.status = INVENTORY_STATUS.IN_STOCK;
  }

  return next();
});

export default mongoose.model("Inventory", inventorySchema);
