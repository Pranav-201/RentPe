import { GroqProvider, GeminiProvider } from "zingoo";
import { rentpeRagService } from "../services/rentpeRagService.js";

const SYSTEM_INSTRUCTION = `You are RentPe AI Assistant.

RentPe is a student-to-student rental community.

Students can:
- Register using their college information
- List items they want to rent
- Browse items listed by other students
- Request rental items
- Contact item owners
- Manage their rental listings and requests

Answer questions clearly and concisely.

Help users understand how RentPe works and how to use the platform.

Do not invent RentPe features that do not exist.

If a user asks about something unrelated to RentPe, politely explain that you are the RentPe AI Assistant and redirect them toward RentPe-related questions.`;

export function createAIController(app) {
  return {
    async handleChat(req, res) {
      try {
        const { message, smartSearch, isSmartSearch } = req.body || {};

        if (!message || typeof message !== "string" || !message.trim()) {
          return res.badRequest({
            success: false,
            message: "Message is required."
          });
        }

        // Handle Smart Search mode with Zingoo RAG
        if (smartSearch || isSmartSearch) {
          try {
            const ragResult = await rentpeRagService.smartSearch(app, message.trim());
            return res.ok(ragResult);
          } catch (ragError) {
            console.error("Smart Search RAG Error:", ragError);
            return res.serverError({
              success: false,
              message: "Sorry, I couldn't perform smart search right now. Please try again."
            });
          }
        }

        // Standard Chatbot Mode
        const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

        if (!apiKey) {
          console.warn("AI API key (GROQ_API_KEY or GEMINI_API_KEY) is not configured.");
          return res.serverError({
            success: false,
            message: "Sorry, I couldn't process that request right now. Please try again."
          });
        }

        let ai;
        if (process.env.GROQ_API_KEY) {
          ai = new GroqProvider({
            apiKey: process.env.GROQ_API_KEY,
            model: process.env.GROQ_MODEL || "openai/gpt-oss-120b"
          });
        } else {
          ai = new GeminiProvider({
            apiKey: process.env.GEMINI_API_KEY,
            model: process.env.GEMINI_MODEL || "gemini-1.5-flash"
          });
        }

        const response = await app.ai(ai).generate(message.trim(), {
          temperature: 0.2,
          maxTokens: 1000,
          system: SYSTEM_INSTRUCTION
        });

        return res.ok({
          success: true,
          message: response.text || "I'm here to help with all your RentPe questions!"
        });
      } catch (error) {
        console.error("RentPe AI Error:", error);
        return res.serverError({
          success: false,
          message: "Sorry, I couldn't process that request right now. Please try again."
        });
      }
    }
  };
}

