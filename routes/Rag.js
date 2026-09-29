import "dotenv/config";

import zingoo, {
  GeminiProvider,
  PDFLoader,
  RecursiveChunker,
  LocalEmbedding,
  PineconeVectorStore,
  VectorRetriever,
  ContextBuilder,
  AILLM
} from "zingoo";

import { Pinecone } from "@pinecone-database/pinecone";

const app = zingoo();

const loader = new PDFLoader();

const chunker = new RecursiveChunker({
  chunkSize: 500,
  overlap: 100
});

const embedding = new LocalEmbedding({
  model: "Xenova/all-MiniLM-L6-v2"
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const vectorStore = new PineconeVectorStore({
  client: pinecone,
  index: process.env.PINECONE_INDEX_NAME
});

const retriever = new VectorRetriever({
  embedding,
  vectorStore
});


const contextBuilder = new ContextBuilder();

const gemini = new GeminiProvider({
  apiKey: process.env.GEMINI_API_KEY,
  model: "gemini-3.6-flash"
});

const llm = new AILLM(gemini);

const rag = app.rag({
  loader,
  chunker,
  embedding,
  vectorStore,
  retriever,
  contextBuilder,
  llm
});

await rag.ingest("./documents/manual.pdf");

const question =
  "What are the main topics discussed in this document?";

const answer = await rag.ask(question, {
  topK: 5
});

console.log("Question:", question);
console.log("Answer:", answer);

