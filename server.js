import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB, disconnectDB } from "./config/database.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    const app = createApp();

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════╗
║   Zingoo E-commerce Backend API       ║
║   Running on port ${PORT}              ║
║   Environment: ${process.env.NODE_ENV || "development"}         ║
╚═══════════════════════════════════════╝
      `);
    });

    process.on("SIGINT", async () => {
      console.log("\nShutting down gracefully...");
      await disconnectDB();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
