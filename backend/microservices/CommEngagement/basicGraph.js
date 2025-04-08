// basicGraph.js (MongoDB version)
import dotenv from "dotenv";
import { z } from "zod";
import { StateGraph, START, END } from "@langchain/langgraph";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cosineSimilarity } from "./utils/cosineSimilarity.js";

import connectDB from './config/mongoose.js';

import ChatMemory from './models/ChatMemory.js';
import CommunityPost from "./models/CommunityPost.js";
import HelpRequest from "./models/HelpRequest.js";

dotenv.config();
console.log("Gemini API Key loaded ✅");

connectDB()

async function getChatHistory(sessionId) {
  const rows = await ChatMemory.find({ sessionId }).sort({ timestamp: 1 }).lean();
  return rows;
}

async function saveToChatMemory(sessionId, question, answer) {
  await ChatMemory.create({ sessionId, question, answer });
}

// Step 2: Define shared state schema using zod
const stateSchema = z.object({
  question: z.string(),
  sessionId: z.string(),
  answer: z.string().optional(),
  followUp: z.string().optional(),
});

// Step 3: Gemini model and embedding setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const embedModel = genAI.getGenerativeModel({ model: "embedding-001" });

async function invokeGemini(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.error("❌ Gemini error:", err.message);
    throw err;
  }
}

async function generateEmbedding(text) {
  console.log("Embedding generated: " + text)
  const res = await embedModel.embedContent({
    content: { parts: [{ text }] },
  });
  return res.embedding.values;
}

// Step 4: Load documents + embed
let embeddedStore = [];

async function loadAndEmbedDocuments() {
  const communityPosts = await CommunityPost.find({}).lean();
  const helpRequests = await HelpRequest.find({}).lean();

  const formattedCommunityPosts = communityPosts.map(post => 
    `On a ${post.category} community post this ${post.createdAt}, titled "${post.title}", the author says the following: ${post.content}`
  );
  
  const formattedHelpRequests = helpRequests.map(req => {
    const date = new Date(req.createdAt).toLocaleString(); // Format timestamp to human-readable
    const volunteerCount = req.volunteers?.length || 0;
    const status = req.isResolved ? "Resolved" : "Unresolved";
    const location = req.location || "an unspecified location";
  
    return `On a help request dated at ${date}, the user writes '${req.description}'. The requester is located at ${location} and it has ${volunteerCount} volunteer${volunteerCount !== 1 ? "s" : ""}. It is marked as ${status}.`;
  });

  const allPosts = [...formattedCommunityPosts, ...formattedHelpRequests]

  embeddedStore = await Promise.all(
    allPosts.map(async (text) => {
      const embedding = await generateEmbedding(text);
      return { text, embedding };
    })
  );

  console.log(`✅ Embedded ${embeddedStore.length} sections.`);
}

await loadAndEmbedDocuments();

function retrieveRelevantContext(query, topK = 3) {
  return (async () => {
    const queryEmbedding = await generateEmbedding(query);

    const ranked = embeddedStore
      .map(({ text, embedding }) => ({
        text,
        score: cosineSimilarity(queryEmbedding, embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((r) => r.text);

    return ranked;
  })();
}

// Step 5: Node logic with RAG + MongoDB ChatMemory
async function generate(state) {
  const { question, sessionId } = state;
  const context = await retrieveRelevantContext(question);
  const history = await getChatHistory(sessionId);

  const historyText = history
                      .map((h) => `User: ${h.question}\nBot: ${h.answer}`)
                      .join("\n");

  const prompt = `
        You are a helpful that has access to all help requests and community posts in the community website.
        You will not reiterate anything word-for-word, but instead create your own answers.
        Context: ${context.join("\n")}
        Conversation so far: ${historyText}
        Current question:${question}
        Answer with no formatting`;

  const answer = await invokeGemini(prompt);

  await saveToChatMemory(sessionId, question, answer);

  const followUpPrompt = `
        Based on the following conversation and your response, suggest 2 follow-up questions a user might ask next:
        Conversation: ${historyText}
        Current question: ${question}
        Your answer: ${answer}
        Only return the follow-up questions separated by new lines:`;

  const followUp = await invokeGemini(followUpPrompt);

  console.log("✅ Gemini answered:", answer);
  return { ...state, answer, followUp };
}

// Step 6: Create and compile graph
const builder = new StateGraph(stateSchema)
  .addNode("generate", generate)
  .addEdge(START, "generate")
  .addEdge("generate", END);

export const graph = builder.compile();
