import "dotenv/config";
import zingoo, {
  GroqProvider,
  GeminiProvider,
  LocalEmbedding,
  PineconeVectorStore,
  VectorRetriever
} from "zingoo";
import { Pinecone } from "@pinecone-database/pinecone";
import Product from "../models/Product.js";

class RentPeRagService {
  constructor() {
    this.app = null;
    this.embedding = null;
    this.pinecone = null;
    this.vectorStore = null;
    this.retriever = null;
    this.isInitialized = false;
  }

  getAIProvider() {
    if (process.env.GROQ_API_KEY) {
      return new GroqProvider({
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b"
      });
    }

    if (process.env.GEMINI_API_KEY) {
      return new GeminiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || "gemini-1.5-flash"
      });
    }

    return null;
  }

  async initRag() {
    if (this.isInitialized) {
      return;
    }

    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      console.warn(
        "Pinecone is not fully configured. PINECONE_API_KEY or PINECONE_INDEX_NAME is missing."
      );
    }

    this.app = zingoo();

    this.embedding = new LocalEmbedding({
      model: "Xenova/all-MiniLM-L6-v2"
    });

    if (process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_NAME) {
      this.pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
      });

      this.vectorStore = new PineconeVectorStore({
        client: this.pinecone,
        index: process.env.PINECONE_INDEX_NAME
      });

      this.retriever = new VectorRetriever({
        embedding: this.embedding,
        vectorStore: this.vectorStore
      });
    }

    this.isInitialized = true;
  }

  formatListingDocument(product) {
    const categoryName =
      product.category && typeof product.category === "object"
        ? product.category.name
        : product.category || "General";

    const tags = Array.isArray(product.tags) ? product.tags.join(", ") : "";

    const content = [
      `Title: ${product.name}`,
      `Category: ${categoryName}`,
      `Condition: ${product.condition || "Good"}`,
      `Location: ${product.location || "On Campus"}`,
      `Price: ₹${product.pricePerDay || product.price || 0}/day`,
      tags ? `Tags: ${tags}` : "",
      `Description: ${product.description || ""}`
    ]
      .filter(Boolean)
      .join("\n");

    return {
      id: product._id.toString(),
      content,
      metadata: {
        listingId: product._id.toString(),
        name: product.name,
        category: categoryName,
        price: product.pricePerDay || product.price || 0,
        type: "rentpe-listing"
      }
    };
  }

  async indexListing(product) {
    try {
      await this.initRag();
      if (!this.vectorStore || !this.embedding) return;

      const doc = this.formatListingDocument(product);
      const embeddingVector = await this.embedding.embed(doc.content);

      await this.vectorStore.add([
        {
          id: doc.id,
          content: doc.content,
          metadata: doc.metadata,
          embedding: embeddingVector
        }
      ]);
    } catch (error) {
      console.error(`Failed to index listing ${product?._id}:`, error.message);
    }
  }

  async indexAllListings(products) {
    await this.initRag();
    if (!this.vectorStore || !this.embedding) {
      throw new Error("Pinecone vector store or embedding is not initialized.");
    }

    let indexed = 0;
    let failed = 0;

    const BATCH_SIZE = 25;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      const docs = batch.map((p) => this.formatListingDocument(p));
      const texts = docs.map((d) => d.content);

      try {
        const vectors = await this.embedding.embedMany(texts);
        const embeddedChunks = docs.map((doc, idx) => ({
          id: doc.id,
          content: doc.content,
          metadata: doc.metadata,
          embedding: vectors[idx]
        }));

        await this.vectorStore.add(embeddedChunks);
        indexed += batch.length;
      } catch (err) {
        console.error(`Failed to index batch ${i}-${i + batch.length}:`, err);
        failed += batch.length;
      }
    }

    return {
      total: products.length,
      indexed,
      failed
    };
  }

 

  async deleteListingFromIndex(productId) {
    try {
      await this.initRag();
      if (this.pinecone && process.env.PINECONE_INDEX_NAME) {
        const index = this.pinecone.index(process.env.PINECONE_INDEX_NAME);
        if (typeof index.deleteOne === "function") {
          await index.deleteOne(productId.toString());
        }
      }
    } catch (error) {
      console.error(`Failed to delete listing ${productId} from Pinecone:`, error.message);
    }
  }

  // async searchCandidateListings(searchQuery, topK = 6) {
  //   await this.initRag();
  //   if (!this.retriever) {
  //     return [];
  //   }

  //   try {
  //     const results = await this.retriever.retrieve(searchQuery, { topK });
  //     if (!Array.isArray(results)) return [];

  //     // Filter candidates with an empirical similarity threshold
  //     // In cosine similarity (0 to 1), matches below 0.35 are random vector noise
  //     return results
  //       .filter((r) => {
  //         const id = r.id || r.metadata?.listingId;
  //         if (!id || typeof id !== "string") return false;
  //         if (typeof r.score === "number" && r.score < 0.35) return false;
  //         return true;
  //       })
  //       .map((r) => ({
  //         id: r.id || r.metadata?.listingId,
  //         score: typeof r.score === "number" ? r.score : 1.0,
  //         content: r.content || "",
  //         metadata: r.metadata || {}
  //       }));
  //   } catch (error) {
  //     console.error("Vector retrieval error for query:", searchQuery, error);
  //     return [];
  //   }
  // }

  async searchCandidateListings(searchQuery, topK = 6) {
  await this.initRag();

  if (!this.retriever) {
    console.warn("Retriever is not initialized");
    return [];
  }

  try {
    const results = await this.retriever.retrieve(searchQuery, { topK });

    if (!Array.isArray(results)) {
      return [];
    }

    return results
      .filter((r) => {
        const id = r.id || r.metadata?.listingId;

        if (!id || typeof id !== "string") {
          return false;
        }

        if (typeof r.score === "number" && r.score < 0.35) {
          return false;
        }

        return true;
      })
      .map((r) => ({
        id: r.id || r.metadata?.listingId,
        score: typeof r.score === "number" ? r.score : 1.0,
        content: r.content || "",
        metadata: r.metadata || {}
      }));
  } catch (error) {
    console.error(
      "Vector retrieval error for query:",
      searchQuery,
      error.message
    );

    return [];
  }
}

  async extractIntentAndRequirements(app, userMessage) {
    const provider = this.getAIProvider();
    if (!provider) {
      return {
        intent: userMessage,
        requirements: [
          {
            name: userMessage,
            searchQuery: userMessage,
            searchableOnRentPe: true
          }
        ]
      };
    }

    const extractionPrompt = `You are RentPe Smart Search Assistant for a student peer-to-peer equipment and items rental marketplace.

Analyze the user's natural language query, goal, or task.
1. Understand the user's actual intent and overall project.
2. Break down the requirements into individual physical items, equipment, tools, appliances, or components.
3. For each requirement, formulate a clean "searchQuery":
   - The searchQuery must focus primarily on the PHYSICAL ITEM ITSELF and its natural marketplace synonyms and equivalent terms.
   - Example 1: User asks "I need a portable power source to run my ESP32 project for a few hours without connecting it to a wall socket" -> requirement name: "Portable power source", searchQuery: "battery rechargeable battery battery pack portable power source power bank"
   - Example 2: User asks "I need something to measure voltage and current for my electronics project" -> requirement name: "Multimeter / electrical measuring device", searchQuery: "multimeter voltage meter current meter electrical tester"
   - Example 3: User asks "I need a device to capture stable video shots for my project" -> requirement name: "Camera / video recording equipment", searchQuery: "camera video camera recording camera"
   - CRITICAL: Do NOT dilute or pollute the searchQuery with unrelated project context words (e.g. do NOT put "ESP32 project" or "electronics project" into the search query for a power source or measuring tool, because it misleads vector search into matching the project name instead of the item).
4. Classify each requirement with "searchableOnRentPe":
   - Set "searchableOnRentPe": true for physical, reusable items, equipment, tools, appliances, electronics, hardware components, textbooks, lab kits, or whenever the user explicitly asks to search for an item.
   - Set "searchableOnRentPe": false ONLY for implicit single-use consumables, food ingredients, groceries, spices, or perishable supplies inferred from a broad task (e.g. eggs, cooking oil, salt, pepper when cooking an omelet).

User query:
"${userMessage}"

Respond ONLY with a valid JSON object in this exact format:
{
  "intent": "Clear summary of user's task and context",
  "requirements": [
    {
      "name": "Specific physical item name",
      "searchQuery": "Item name and semantic synonyms only",
      "searchableOnRentPe": true
    }
  ]
}

Do not wrap in markdown or backticks. Return raw JSON only.`;

    try {
      const response = await app.ai(provider).generate(extractionPrompt, {
        temperature: 0.1,
        maxTokens: 600
      });

      let text = (response?.text || "").trim();
      if (text.startsWith("```json")) {
        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(text);
      const reqList = Array.isArray(parsed.requirements)
        ? parsed.requirements
        : Array.isArray(parsed.items)
          ? parsed.items
          : [];

      if (reqList.length > 0) {
        return {
          intent: parsed.intent || userMessage,
          requirements: reqList
        };
      }
    } catch (err) {
      console.warn("AI intent extraction fallback:", err.message);
    }

    return {
      intent: userMessage,
      requirements: [
        {
          name: userMessage,
          searchQuery: userMessage,
          searchableOnRentPe: true
        }
      ]
    };
  }

  async validateCandidatesRelevance(app, userIntent, requirementName, candidates, userMessage = "") {
    if (!candidates || candidates.length === 0) {
      return [];
    }

    const provider = this.getAIProvider();
    if (!provider) {
      // Fallback: accept only candidates with high similarity score
      return candidates.filter((c) => c.score >= 0.55).map((c) => c.product._id.toString());
    }

    const candidateListText = candidates
      .map((c, index) => {
        const p = c.product;
        const catName = p.category?.name || p.category || "General";
        return `[ID: ${p._id.toString()}] Item: "${p.name}", Category: "${catName}", Description: "${(p.description || "").slice(0, 150)}"`;
      })
      .join("\n");

    const validationPrompt = `You are a strict relevance validator for RentPe rental marketplace.
User's request: "${userMessage || userIntent}"
Task/intent: "${userIntent}"
Required item: "${requirementName}"

Retrieved candidates from vector search:
${candidateListText}

Task:
Determine which of the retrieved candidates above are ACTUALLY and GENUINELY relevant and suitable for fulfilling the requirement "${requirementName}" for the user's task.
- If a candidate is completely unrelated or a different component type (e.g. an "ESP32 board" when looking for a "portable power source" or "frying pan"), REJECT IT.
- If a candidate genuinely provides what is needed (e.g. a "Battery", "Battery Pack", or "Power Bank" for a "portable power source"), ACCEPT IT.

Respond ONLY with a valid JSON object in this format:
{
  "relevantIds": ["id1", "id2"]
}
If none of the candidates are relevant, return:
{
  "relevantIds": []
}

Do not include markdown or backticks.`;

    try {
      const response = await app.ai(provider).generate(validationPrompt, {
        temperature: 0.0,
        maxTokens: 300
      });

      let text = (response?.text || "").trim();
      if (text.startsWith("```json")) {
        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.relevantIds)) {
        return parsed.relevantIds.map((id) => id.toString());
      }
    } catch (err) {
      console.warn("AI relevance validation fallback:", err.message);
    }

    // Safe fallback if LLM validation fails: only keep candidates with high score and keyword overlap
    return candidates
      .filter((c) => {
        const prodName = (c.product?.name || "").toLowerCase();
        const reqLower = requirementName.toLowerCase();
        const words = reqLower.split(/\s+/).filter((w) => w.length > 2);
        const hasKeywordMatch = words.some((w) => prodName.includes(w));
        return (c.score >= 0.65) || (c.score >= 0.45 && hasKeywordMatch);
      })
      .map((c) => c.product._id.toString());
  }

  
  async smartSearch(app, userMessage) {
    await this.initRag();
    

    // 1. Understand user intent and generate requirements with Zingoo AI
    const { intent, requirements } = await this.extractIntentAndRequirements(app, userMessage);

    // 2. Filter only searchable / rentable items (skip consumables/ingredients inferred from tasks)
    let searchableRequirements = requirements.filter((r) => r.searchableOnRentPe !== false);
    if (searchableRequirements.length === 0 && requirements.length > 0) {
      searchableRequirements = requirements;
    }

    // 3. Candidate Retrieval: For each searchable requirement, retrieve candidate matches from Pinecone
    const requirementCandidatesMap = new Map();
    const allCandidateIds = new Set();

    for (const req of searchableRequirements) {
      const query = req.searchQuery || req.name;
      const candidates = await this.searchCandidateListings(query, 6);

      candidates.forEach((c) => allCandidateIds.add(c.id));
      requirementCandidatesMap.set(req.name, candidates);
    }

    // 4. MongoDB Candidate Verification (MongoDB is source of truth)
    const productList = await Product.find({
      _id: { $in: Array.from(allCandidateIds) },
      isActive: true
    })
      .populate("category")
      .populate("owner", "name email collegeName");

    const productMap = new Map();
    productList.forEach((prod) => {
      productMap.set(prod._id.toString(), prod);
    });

    // 5. Relevance Filtering & LLM Validation per requirement
    const resultsByRequirement = [];
    const usedProductIds = new Set();

    for (const req of searchableRequirements) {
      const rawCandidates = requirementCandidatesMap.get(req.name) || [];

      // Attach MongoDB product entities
      const candidateListWithProducts = rawCandidates
        .map((c) => ({
          ...c,
          product: productMap.get(c.id)
        }))
        .filter((c) => Boolean(c.product));

      // Validate relevance with Zingoo AI to eliminate false positives
      const validatedIds = await this.validateCandidatesRelevance(
        app,
        intent,
        req.name,
        candidateListWithProducts,
        userMessage
      );

      const matchedProducts = [];
      for (const id of validatedIds) {
        const prod = productMap.get(id);
        if (prod && !usedProductIds.has(id)) {
          matchedProducts.push(prod);
          usedProductIds.add(id);
        }
      }

      resultsByRequirement.push({
        requirement: req.name,
        found: matchedProducts.length > 0,
        products: matchedProducts
      });
    }

    // 5. Construct user-friendly summary message
    const foundCount = resultsByRequirement.filter((r) => r.found).length;
    let message = "";

    if (foundCount === 0) {
      message = "I couldn't find any currently available listings matching your project requirements on RentPe.";
    } else if (foundCount === resultsByRequirement.length) {
      message = "I found these items on RentPe that match your requirements:";
    } else {
      message = "I found matches for some of your project requirements on RentPe:";
    }

    return {
      success: true,
      isSmartSearch: true,
      message,
      results: resultsByRequirement
    };
  }
}



export const rentpeRagService = new RentPeRagService();

