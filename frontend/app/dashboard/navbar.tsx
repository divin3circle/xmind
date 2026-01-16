import {
  IconBrandDatabricks,
  IconBrandOpenai,
  IconUserFilled,
} from "@tabler/icons-react";

import Connected from "@/components/ui/connected";
import Link from "next/link";

function DashboardNavbar() {
  return (
    <div className="flex items-center justify-between mx-2 mt-4">
      <Link href="/" className="flex items-center gap-2">
        <IconBrandDatabricks size={32} color="green" />
        <h1 className="text-2xl font-semibold lowercase font-sans">xMind</h1>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href={"/profile"}
          className="flex items-center border-background group border-b md:pb-2 hover:border-green-500 border-dashed "
        >
          <IconUserFilled className="text-muted-foreground md:hidden transition-all duration-200 ease-in group-hover:text-green-500" />
          <p className="hidden md:block text-muted-foreground transition-all duration-200 ease-in group-hover:text-green-500 text-sm font-sans font-semibold">
            Profile
          </p>
        </Link>
        <Link
          href={"/agents"}
          className="flex items-center border-background group border-b md:pb-2 hover:border-green-500 border-dashed "
        >
          <IconBrandOpenai className="text-muted-foreground md:hidden transition-all duration-200 ease-in group-hover:text-green-500" />
          <p className="hidden md:block text-muted-foreground transition-all duration-200 ease-in group-hover:text-green-500 text-sm font-sans font-semibold">
            Agents
          </p>
        </Link>
        <Connected />
      </div>
    </div>
  );
}

export default DashboardNavbar;
