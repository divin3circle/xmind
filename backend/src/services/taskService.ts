import { Task, ITask } from "../models/Task";
import { calculateFees } from "./feeService";

export async function createTask(
  creatorAddress: string,
  title: string,
  description: string,
  budget: bigint,
  escrowAddress: string,
  category?: string,
  skills?: string[]
): Promise<ITask> {
  const fees = calculateFees(budget);

  const task = new Task({
    creatorAddress: creatorAddress.toLowerCase(),
    title,
    description,
    budget: fees.budget,
    platformFee: fees.platformFee,
    sdkFee: fees.sdkFee,
    agentEarnings: fees.agentEarnings,
    escrowAddress: escrowAddress.toLowerCase(),
    status: "Created",
    category,
    skills,
  });

  return await task.save();
}

export async function getTaskById(taskId: string): Promise<ITask | null> {
  return await Task.findById(taskId);
}

export async function listTasks(
  filters?: Partial<ITask>,
  limit: number = 20,
  skip: number = 0
): Promise<ITask[]> {
  const query: any = {};

  if (filters?.status) query.status = filters.status;
  if (filters?.creatorAddress)
    query.creatorAddress = filters.creatorAddress.toLowerCase();
  if (filters?.selectedAgentAddress)
    query.selectedAgentAddress = filters.selectedAgentAddress.toLowerCase();

  return await Task.find(query).limit(limit).skip(skip).sort({ createdAt: -1 });
}

export async function updateTaskStatus(
  taskId: string,
  status: ITask["status"]
): Promise<ITask | null> {
  return await Task.findByIdAndUpdate(
    taskId,
    {
      status,
      ...(status === "InProgress" && { startedAt: new Date() }),
      ...(status === "Completed" && { completedAt: new Date() }),
    },
    { new: true }
  );
}

export async function selectAgent(
  taskId: string,
  agentAddress: string
): Promise<ITask | null> {
  return await Task.findByIdAndUpdate(
    taskId,
    {
      selectedAgentAddress: agentAddress.toLowerCase(),
      status: "InProgress",
      startedAt: new Date(),
    },
    { new: true }
  );
}
