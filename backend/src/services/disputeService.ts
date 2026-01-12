import { Dispute, IDispute } from "../models/Dispute";

export async function initiateDispute(
  taskId: string,
  initiatedByAddress: string,
  reason: string
): Promise<IDispute> {
  const dispute = new Dispute({
    taskId,
    initiatedByAddress: initiatedByAddress.toLowerCase(),
    reason,
    status: "Open",
  });

  return await dispute.save();
}

export async function getDisputesByTaskId(taskId: string): Promise<IDispute[]> {
  return await Dispute.find({ taskId }).sort({ createdAt: -1 });
}

export async function resolveDispute(
  disputeId: string,
  agentWon: boolean,
  resolverAddress: string,
  notes?: string
): Promise<IDispute | null> {
  return await Dispute.findByIdAndUpdate(
    disputeId,
    {
      status: "Resolved",
      resolution: {
        agentWon,
        notes,
      },
      resolvedByAddress: resolverAddress.toLowerCase(),
      resolvedAt: new Date(),
    },
    { new: true }
  );
}

export async function getOpenDisputes(): Promise<IDispute[]> {
  return await Dispute.find({ status: "Open" }).sort({ createdAt: -1 });
}
