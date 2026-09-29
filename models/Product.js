import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: 10,
      maxlength: 5000
    },
    price: {
      type: Number,
      required: [true, "Rental price per day is required"],
      min: 0
    },
    pricePerDay: {
      type: Number,
      min: 0
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: 0
    },
    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair"],
      default: "Good"
    },
    location: {
      type: String,
      trim: true,
      default: "On Campus"
    },
    discountPrice: {
      type: Number,
      min: 0
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"]
    },
    images: [
      {
        url: String,
        alt: String
      }
    ],
    sku: {
      type: String,
      uppercase: true,
      default: function() {
        return `RENT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      }
    },
    tags: [String],
    ratings: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product"
});

productSchema.pre("save", function(next) {
  if (this.price && !this.pricePerDay) {
    this.pricePerDay = this.price;
  }
  if (this.pricePerDay && !this.price) {
    this.price = this.pricePerDay;
  }
  if (this.createdBy && !this.owner) {
    this.owner = this.createdBy;
  }
  return next();
});

productSchema.index({ name: "text", description: "text", tags: "text" });

export default mongoose.model("Product", productSchema);
