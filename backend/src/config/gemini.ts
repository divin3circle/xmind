import { GoogleGenAI } from "@google/genai";
import { config } from "./env";

export const geminiClient = new GoogleGenAI({
  apiKey: config.GEMINI_API_KEY,
});

export const geminiModel = geminiClient.models;

export default geminiClient;
