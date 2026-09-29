import Category from "../models/Category.js";
import { getPaginationParams } from "../utils/pagination.js";

export async function getAllCategories(req, res) {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);

    const categories = await Category.find({ isActive: true })
      .skip(skip)
      .limit(limit);

    const total = await Category.countDocuments({ isActive: true });

    res.ok({
      categories,
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

export async function getCategoryById(req, res) {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!category) {
      return res.notFound({ error: "Category not found" });
    }

    res.ok({ category });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function createCategory(req, res) {
  try {
    const { name } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.conflict({ error: "Category already exists" });
    }

    const category = new Category({
      ...req.body,
      createdBy: req.user._id
    });

    await category.save();

    res.created({
      message: "Category created successfully",
      category
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function updateCategory(req, res) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!category) {
      return res.notFound({ error: "Category not found" });
    }

    res.ok({
      message: "Category updated successfully",
      category
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function deleteCategory(req, res) {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.notFound({ error: "Category not found" });
    }

    res.ok({
      message: "Category deleted successfully"
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}
