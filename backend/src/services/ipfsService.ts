import { uploadFileToPinata } from "../config/pinata";

export async function uploadProofToIPFS(
  fileBuffer: Buffer,
  filename: string,
  taskId: string,
  proofType: string
): Promise<string> {
  return await uploadFileToPinata(fileBuffer, filename, {
    taskId,
    proofType,
    uploadedAt: new Date().toISOString(),
  });
}
