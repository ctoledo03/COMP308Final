import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function analyzeComments(comments) {
  const commentText = comments.map(c => `- ${c.text}`).join("\n");
  const prompt = `
    Given these user comments on a business deal, summarize what users are saying and describe the overall sentiment (Positive, Neutral, or Negative).

    Comments:
    ${commentText}

    Respond in this format:
    Summary: <short summary>
    Sentiment: <Positive/Neutral/Negative>
  `;

  const response = await model.generateContent(prompt);
  const result = response.response.text();

  const [_, summary = "", sentiment = ""] = result.match(/Summary:\s*(.*)\nSentiment:\s*(.*)/) || [];
  return { summary, sentiment };
}