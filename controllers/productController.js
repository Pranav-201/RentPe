import mongoose from "mongoose";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Review from "../models/Review.js";
import { getPaginationParams } from "../utils/pagination.js";
import { rentpeRagService } from "../services/rentpeRagService.js";
import { uploadProductImage, uploadProductImageBuffer } from "../services/cloudinaryService.js";

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function resolveProductImages(req, name) {
  const existingImages = Array.isArray(req.body.images) ? req.body.images : [];
  const files = req.files || [];
  const legacyImages = req.legacyImageSources || [];
  const remoteImageUrls = req.remoteImageUrls || [];

  if (!files.length && !legacyImages.length && !remoteImageUrls.length) {
    return existingImages;
  }

  const uploadedFileImages = await Promise.all(
    files.map(async (file) => ({
      url: await uploadProductImageBuffer(file.buffer),
      alt: name || file.originalname || "Rental Item"
    }))
  );

  const migratedLegacyImages = await Promise.all(
    legacyImages.map(async (image) => ({
      url: await uploadProductImage(image.url),
      alt: image.alt || name || "Rental Item"
    }))
  );

  const uploadedRemoteImages = await Promise.all(
    remoteImageUrls.map(async (url) => {
      if (!isHttpUrl(url)) throw new Error("Image URLs must use HTTP or HTTPS");
      return {
        url: await uploadProductImage(url),
        alt: name || "Rental Item"
      };
    })
  );

  return [...existingImages, ...migratedLegacyImages, ...uploadedRemoteImages, ...uploadedFileImages];
}

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

    // College/campus filter — join on owner's collegeName or product.location
    const { college } = req.query;
    if (college) {
      const User = mongoose.model("User");
      const matchingUsers = await User.find(
        { collegeName: { $regex: college, $options: "i" } },
        "_id"
      );
      const userIds = matchingUsers.map((u) => u._id);
      const collegeOr = [
        { owner: { $in: userIds } },
        { location: { $regex: college, $options: "i" } }
      ];

      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: collegeOr }
        ];
        delete filter.$or;
      } else {
        filter.$or = collegeOr;
      }
    }

    if (available === "true" || req.query.inStock === "true") {
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { status: "Available" },
            { status: { $exists: false }, isAvailable: true }
          ]
        }
      ];
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
    const resolvedImages = await resolveProductImages(req, name);

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
      images: resolvedImages.length ? resolvedImages : [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", alt: name }],
      isAvailable: true,
      status: "Available",
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

    // Sync listing with vector store (non-blocking)
    Product.findById(product._id).populate("category").then((populated) => {
      if (populated) rentpeRagService.indexListing(populated);
    }).catch((err) => console.warn("Vector sync error on create:", err.message));

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

    const resolvedImages = await resolveProductImages(req, req.body.name || product.name);
    const updateData = { ...req.body };
    if (resolvedImages.length) updateData.images = resolvedImages;
    else delete updateData.images;

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate("category");

    // Sync updated listing with vector store (non-blocking)
    if (updated) {
      rentpeRagService.indexListing(updated).catch((err) => console.warn("Vector sync error on update:", err.message));
    }

    res.ok({
      message: "Rental item updated successfully",
      product: updated
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function updateProductStatus(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.notFound({ error: "Rental item not found" });
    }

    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) {
      return res.notFound({ error: "Rental item not found" });
    }

    if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.forbidden({ error: "You can only update your own listings" });
    }

    product.status = req.body.status;
    product.isAvailable = req.body.status === "Available";
    await product.save();

    res.ok({
      message: "Rental item status updated successfully",
      product
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

    // Remove from vector store (non-blocking)
    rentpeRagService.deleteListingFromIndex(product._id).catch((err) => console.warn("Vector delete sync error:", err.message));

    res.ok({
      message: "Rental item removed successfully"
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function getCampuses(req, res) {
  try {
    const User = mongoose.model("User");

    // Get all active product owner/createdBy/location (lean for performance)
    const activeProducts = await Product.find({ isActive: true }, "owner createdBy location").lean();

    // Collect owner IDs
    const ownerIds = [];
    activeProducts.forEach((p) => {
      if (p.owner) ownerIds.push(p.owner.toString());
      else if (p.createdBy) ownerIds.push(p.createdBy.toString());
    });

    // Map userId -> collegeName
    const uniqueOwnerIds = [...new Set(ownerIds)];
    const users = await User.find(
      { _id: { $in: uniqueOwnerIds }, collegeName: { $exists: true, $ne: "" } },
      "_id collegeName"
    ).lean();
    const userCollegeMap = {};
    users.forEach((u) => {
      userCollegeMap[u._id.toString()] = u.collegeName;
    });

    // Count products per college
    const collegeCounts = {};
    activeProducts.forEach((p) => {
      const ownerId = p.owner
        ? p.owner.toString()
        : p.createdBy
          ? p.createdBy.toString()
          : null;

      const productLoc = p.location && p.location !== "On Campus" ? p.location : null;
      const collegeName = productLoc || (ownerId ? userCollegeMap[ownerId] : null);
      if (!collegeName) return;
      collegeCounts[collegeName] = (collegeCounts[collegeName] || 0) + 1;
    });

    const campuses = Object.entries(collegeCounts)
      .map(([college, count]) => ({ college, count }))
      .sort((a, b) => b.count - a.count);

    res.ok({ campuses });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}
