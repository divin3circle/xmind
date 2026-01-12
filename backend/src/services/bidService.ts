import { Bid, IBid } from "../models/Bid";

export async function createBid(
  taskId: string,
  agentAddress: string,
  proposedBudget: bigint,
  message?: string
): Promise<IBid> {
  const bid = new Bid({
    taskId,
    agentAddress: agentAddress.toLowerCase(),
    proposedBudget,
    message,
    status: "Pending",
  });

  return await bid.save();
}

export async function getBidsByTaskId(taskId: string): Promise<IBid[]> {
  return await Bid.find({ taskId }).sort({ createdAt: -1 });
}

export async function acceptBid(bidId: string): Promise<IBid | null> {
  return await Bid.findByIdAndUpdate(
    bidId,
    { status: "Accepted" },
    { new: true }
  );
}

export async function rejectBid(bidId: string): Promise<IBid | null> {
  return await Bid.findByIdAndUpdate(
    bidId,
    { status: "Rejected" },
    { new: true }
  );
}

export async function withdrawBid(bidId: string): Promise<IBid | null> {
  return await Bid.findByIdAndUpdate(
    bidId,
    { status: "Withdrawn" },
    { new: true }
  );
}
