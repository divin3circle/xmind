export interface ITemplate {
  _id: string;
  templateName: string;
  description: string;
  image: string;
  creatorAddress: string; // e.g. Contract or Author address
  tagline: string;
  systemPrompt: string;
  totalEarned: string; // Represented as string to handle BigInts
  ratings: number[];
  usedBy: number;
}
