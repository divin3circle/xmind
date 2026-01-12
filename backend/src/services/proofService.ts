import { CompletionProof, ICompletionProof } from "../models/CompletionProof";
import { Task } from "../models/Task";

export async function createProof(
  taskId: string,
  submittedByAddress: string,
  proofUrl: string,
  proofType: ICompletionProof["proofType"]
): Promise<ICompletionProof> {
  const proof = new CompletionProof({
    taskId,
    submittedByAddress: submittedByAddress.toLowerCase(),
    proofUrl,
    proofType,
  });

  return await proof.save();
}

export async function getProofsByTaskId(
  taskId: string
): Promise<ICompletionProof[]> {
  return await CompletionProof.find({ taskId }).sort({ createdAt: -1 });
}

export async function updateProofWithGeminiResult(
  proofId: string,
  geminiResponse: {
    isValid: boolean;
    feedback: string;
    confidence: number;
  }
): Promise<ICompletionProof | null> {
  return await CompletionProof.findByIdAndUpdate(
    proofId,
    { geminiResponse },
    { new: true }
  );
}

export async function approveProof(
  proofId: string,
  approverAddress: string,
  txHash?: string
): Promise<ICompletionProof | null> {
  return await CompletionProof.findByIdAndUpdate(
    proofId,
    {
      isApproved: true,
      approvedByAddress: approverAddress.toLowerCase(),
      approvedAt: new Date(),
      txHash,
    },
    { new: true }
  );
}
