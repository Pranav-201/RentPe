import mongoose from "mongoose";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Review from "../models/Review.js";
import { getPaginationParams } from "../utils/pagination.js";

export async function getAllProducts(req, res) {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { category, search, minPrice, maxPrice, condition, location, available, sort } = req.query;

    let filter = { isActive: true };

    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }
    if (available === "true") {
      filter.isAvailable = true;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } }
      ];
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    let sortObj = { createdAt: -1 };
    if (sort === "price-asc" || sort === "price_asc" || sort === "price_low") {
      sortObj = { price: 1 };
    } else if (sort === "price-desc" || sort === "price_desc" || sort === "price_high") {
      sortObj = { price: -1 };
    } else if (sort === "rating" || sort === "rating-desc" || sort === "rating_high") {
      sortObj = { "ratings.average": -1, "ratings.count": -1 };
    } else if (sort === "oldest") {
      sortObj = { createdAt: 1 };
    }

    let query = Product.find(filter)
      .populate("category")
      .populate("createdBy", "name email phone collegeId collegeName")
      .populate("owner", "name email phone collegeId collegeName")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);
    const products = await query;

    res.ok({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function getProductById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.notFound({ error: "Rental item not found" });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate("category")
      .populate("createdBy", "name email phone collegeId collegeName")
      .populate("owner", "name email phone collegeId collegeName");

    if (!product) {
      return res.notFound({ error: "Rental item not found" });
    }

    const [inventory, reviews] = await Promise.all([
      Inventory.findOne({ product: product._id }),
      Review.find({ product: product._id })
        .populate("user", "name email collegeId collegeName")
        .sort({ createdAt: -1 })
    ]);

    const productObj = product.toObject ? product.toObject() : product;
    productObj.reviews = reviews || [];

    res.ok({
      product: productObj,
      inventory
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function getMyListings(req, res) {
  try {
    const products = await Product.find({
      createdBy: req.user._id,
      isActive: true
    })
      .populate("category")
      .sort({ createdAt: -1 });

    res.ok({
      products,
      count: products.length
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function createProduct(req, res) {
  try {
    const { name, description, price, pricePerDay, securityDeposit, condition, location, category, sku, tags, images } = req.body;

    const finalPrice = pricePerDay !== undefined ? pricePerDay : (price !== undefined ? price : 50);
    const generatedSku = sku || `RENT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const product = new Product({
      name,
      description,
      price: finalPrice,
      pricePerDay: finalPrice,
      securityDeposit: securityDeposit || 0,
      condition: condition || "Good",
      location: location || req.user.collegeName || "On Campus",
      category,
      sku: generatedSku,
      tags: tags || [],
      images: images && images.length ? images : [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", alt: name }],
      isAvailable: true,
      createdBy: req.user._id,
      owner: req.user._id
    });

    await product.save();

    // Create default inventory
    const inventory = new Inventory({
      product: product._id,
      quantity: 1,
      available: 1
    });
    await inventory.save();

    res.created({
      message: "Rental item listed successfully",
      product
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function updateProduct(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.notFound({ error: "Rental item not found" });
    }

    const product = await Product.findOne({ _id: req.params.id, isActive: true });

    if (!product) {
      return res.notFound({ error: "Rental item not found" });
    }

    // Only owner or admin can update
    if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.forbidden({ error: "You can only update your own listings" });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate("category");

    res.ok({
      message: "Rental item updated successfully",
      product: updated
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.notFound({ error: "Rental item not found" });
    }

    const product = await Product.findOne({ _id: req.params.id, isActive: true });

    if (!product) {
      return res.notFound({ error: "Rental item not found" });
    }

    if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.forbidden({ error: "You can only delete your own listings" });
    }

    product.isActive = false;
    await product.save();

    res.ok({
      message: "Rental item removed successfully"
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}
