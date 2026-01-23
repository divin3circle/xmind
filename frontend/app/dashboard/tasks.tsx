import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconPlus } from "@tabler/icons-react";

function Tasks() {
  return (
    <div className="py-8 mx-2 border mt-14 relative border-dashed px-4 overflow-hidden mb-4">
      <IconPlus className="absolute -top-3 -right-3" color="gray" />
      <IconPlus className="absolute -top-3 -left-3" color="gray" />
      <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
      <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
      <Table>
        <TableCaption>A list of your recent tasks.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-25">Task ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">TASK001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Omni</TableCell>
            <TableCell className="text-right">$250.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

export default Tasks;
