import axios from "axios";
import { config } from "./env";

const pinataApiUrl = "https://api.pinata.cloud";

export const pinataClient = axios.create({
  baseURL: pinataApiUrl,
  headers: {
    pinata_api_key: config.PINATA_API_KEY,
    pinata_secret_api_key: config.PINATA_API_SECRET,
  },
});

export async function uploadFileToPinata(
  file: Buffer,
  filename: string,
  metadata?: Record<string, any>
): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", new Blob([file]), filename);

    if (metadata) {
      formData.append(
        "pinataMetadata",
        JSON.stringify({
          name: filename,
          keyvalues: metadata,
        })
      );
    }

    const response = await pinataClient.post(
      "/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    return `${config.PINATA_GATEWAY}/ipfs/${ipfsHash}`;
  } catch (error) {
    console.error("Pinata upload failed:", error);
    throw new Error("Failed to upload file to IPFS");
  }
}

export default pinataClient;
