import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";

export async function getInventory(req, res) {
  try {
    const inventory = await Inventory.findOne({
      product: req.params.productId
    }).populate("product");

    if (!inventory) {
      return res.notFound({ error: "Inventory not found" });
    }

    res.ok({ inventory });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function updateInventory(req, res) {
  try {
    const { quantity, reorderLevel, supplier } = req.body;

    const inventory = await Inventory.findOneAndUpdate(
      { product: req.params.productId },
      {
        quantity,
        reorderLevel: reorderLevel || undefined,
        supplier: supplier || undefined,
        lastRestockDate: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!inventory) {
      return res.notFound({ error: "Inventory not found" });
    }

    res.ok({
      message: "Inventory updated",
      inventory
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function getLowStockProducts(req, res) {
  try {
    const lowStock = await Inventory.find({
      status: "low_stock"
    })
      .populate("product")
      .sort({ available: 1 });

    res.ok({
      products: lowStock,
      count: lowStock.length
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}

export async function getOutOfStockProducts(req, res) {
  try {
    const outOfStock = await Inventory.find({
      status: "out_of_stock"
    }).populate("product");

    res.ok({
      products: outOfStock,
      count: outOfStock.length
    });
  } catch (error) {
    res.serverError({ error: error.message });
  }
}
