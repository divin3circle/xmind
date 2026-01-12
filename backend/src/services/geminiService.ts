import { geminiModel } from "../config/gemini";

export interface ProofVerificationResult {
  isValid: boolean;
  feedback: string;
  confidence: number;
}

export async function verifyProofWithGemini(
  proofContent: string,
  proofType: string,
  taskDescription: string
): Promise<ProofVerificationResult> {
  try {
    const prompt = `
You are a task completion verification agent. Review the following proof of work completion.

Task Description: ${taskDescription}
Proof Type: ${proofType}
Proof Content: ${proofContent}

Determine if this proof adequately demonstrates task completion. Respond with JSON only:
{
  "isValid": boolean,
  "feedback": "Brief assessment of the proof quality",
  "confidence": 0.0 to 1.0
}
`;

    const response = await geminiModel.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from Gemini");
    }
    const result = JSON.parse(responseText) as ProofVerificationResult;

    return result;
  } catch (error) {
    console.error("Gemini verification failed:", error);
    throw new Error("Failed to verify proof with Gemini");
  }
}
