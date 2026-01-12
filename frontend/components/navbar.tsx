import { IconBrandDatabricks, IconChevronsRight } from "@tabler/icons-react";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

function Navbar() {
  return (
    <div className="flex items-center justify-between mx-2 mt-4">
      <div className="flex items-center gap-2">
        <IconBrandDatabricks size={32} color="green" />
        <h1 className="text-2xl font-semibold lowercase font-mono">bazaar</h1>
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Find agents"
          className="w-64 font-mono hidden md:block"
        />
        <Button className="flex items-center justify-center gap-2 font-mono">
          Get Started
          <IconChevronsRight size={16} />
        </Button>
      </div>
    </div>
  );
}

export default Navbar;
