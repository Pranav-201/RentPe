import { createAIController } from "../controllers/aiController.js";

export function setupAIRoutes(app) {
  const aiController = createAIController(app);

  app.post("/api/ai/chat", aiController.handleChat);
}
