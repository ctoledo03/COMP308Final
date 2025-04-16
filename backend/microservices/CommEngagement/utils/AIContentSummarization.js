import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export const summarizePost = async (text) => {
    if (text.split(' ').length < 50) return null;

    const prompt = `Summarize this community post as concisely as you possible can:\n\n${text}`;

    const response = await model.generateContent(prompt);
    const result = response.response.text();

    return result;
}