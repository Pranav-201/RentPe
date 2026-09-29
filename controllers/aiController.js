import { GroqProvider,GeminiProvider } from "zingoo";


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
        const { message } = req.body || {};

        if (!message || typeof message !== "string" || !message.trim()) {
          return res.badRequest({
            success: false,
            message: "Message is required."
          });
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
          console.warn("GROQ_API_KEY environment variable is not configured.");
          return res.serverError({
            success: false,
            message: "Sorry, I couldn't process that request right now. Please try again."
          });
        }

        const ai = new GroqProvider({
          apiKey,
          model: process.env.GROQ_MODEL || "openai/gpt-oss-120b"
        
        });
        

        // fallback to grok api
        // const fallback = new GeminiProvider({
        // apiKey,
        // model: "gemini-3.8-flash"
        // });
        
        

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
