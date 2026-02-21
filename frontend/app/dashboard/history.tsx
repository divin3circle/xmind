"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconPlus, IconLoader2 } from "@tabler/icons-react";
import { useActiveAccount } from "thirdweb/react";

interface ActionRecord {
  _id: string;
  actionType: string;
  status: string;
  reasoning: string;
  createdAt: string;
}

function History() {
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const activeAccount = useActiveAccount();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/agent/history");
        const data = await response.json();
        if (data.success) {
          setActions(data.actions);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="py-8 mx-2 border mt-14 relative border-dashed px-4 overflow-hidden mb-4">
      <IconPlus className="absolute -top-3 -right-3" color="gray" />
      <IconPlus className="absolute -top-3 -left-3" color="gray" />
      <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
      <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
      
      <h2 className="text-lg font-bold mb-4 font-sans">Audit Trail (AI Actions)</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <IconLoader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableCaption>A live audit log of autonomous AI portfolio actions.</TableCaption>
          <TableHeader>
            <TableRow className="border-dashed">
              <TableHead className="w-32">Action</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Reasoning</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.length > 0 ? (
              actions.map((action) => (
                <TableRow key={action._id} className="border-dashed">
                  <TableCell className="font-bold uppercase text-xs">{action.actionType}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-0.5 text-[10px] font-bold border border-dashed ${
                      action.status === 'executed' ? 'text-green-500 border-green-500' : 
                      action.status === 'failed' ? 'text-red-500 border-red-500' : 
                      'text-yellow-500 border-yellow-500'
                    }`}>
                      {action.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-xs truncate">
                    {action.reasoning}
                  </TableCell>
                  <TableCell className="text-right text-[10px] font-mono opacity-50">
                    {new Date(action.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs font-sans">
                  No actions logged yet. Your AI agents will appear here once they start managing your portfolio.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default History;
