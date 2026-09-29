import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { getPaginationParams } from "../utils/pagination.js";

export async function getProductReviews(req, res) {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.notFound({ error: "Product not found" });
    }

    const reviews = await Review.find({ product: productId })
      .populate("user", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ product: productId });

    res.ok({
      reviews,
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

export async function createReview(req, res) {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.notFound({ error: "Product not found" });
    }

    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (existingReview) {
      return res.conflict({
        error: "You have already reviewed this product"
      });
    }

    const review = new Review({
      product: productId,
      user: req.user._id,
      rating,
      title,
      comment
    });

    await review.save();

    const allReviews = await Review.find({ product: productId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    product.ratings.average = avgRating;
    product.ratings.count = allReviews.length;
    await product.save();

    res.created({
      message: "Review created successfully",
      review
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function updateReview(req, res) {
  try {
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.notFound({ error: "Review not found" });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;

    await review.save();

    const allReviews = await Review.find({ product: review.product });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(review.product, {
      "ratings.average": avgRating,
      "ratings.count": allReviews.length
    });

    res.ok({
      message: "Review updated successfully",
      review
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function deleteReview(req, res) {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.notFound({ error: "Review not found" });
    }

    await Review.findByIdAndDelete(req.params.id);

    const allReviews = await Review.find({ product: review.product });
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    await Product.findByIdAndUpdate(review.product, {
      "ratings.average": avgRating,
      "ratings.count": allReviews.length
    });

    res.ok({
      message: "Review deleted successfully"
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}
