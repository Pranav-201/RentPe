import "dotenv/config";
import { connectDB, disconnectDB } from "../config/database.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js"; // Ensures Category model is registered
import { rentpeRagService } from "../services/rentpeRagService.js";

async function runIndexing() {
  console.log("-----------------------------------------");
  console.log("RentPe Smart Search Indexing...");
  console.log("-----------------------------------------");

  try {
    await connectDB();

    const listings = await Product.find({ isActive: true }).populate("category");
    console.log(`Listings found: ${listings.length}`);

    if (listings.length === 0) {
      console.log("No active listings found to index.");
      await disconnectDB();
      process.exit(0);
    }

    const { total, indexed, failed } = await rentpeRagService.indexAllListings(listings);

    console.log(`Total: ${total}`);
    console.log(`Indexed: ${indexed}`);
    console.log(`Failed: ${failed}`);
    console.log("-----------------------------------------");
    console.log("Indexing completed successfully.");
    console.log("-----------------------------------------");

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("Indexing failed with error:", error);
    await disconnectDB();
    process.exit(1);
  }
}

runIndexing();
