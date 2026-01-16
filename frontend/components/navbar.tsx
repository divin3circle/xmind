"use client";
import { IconBrandDatabricks, IconChevronsRight } from "@tabler/icons-react";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

function Navbar() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mx-4 mt-4">
      <div className="flex items-center gap-2">
        <IconBrandDatabricks size={32} color="green" />
        <h1 className="text-2xl font-semibold lowercase font-sans">xMind</h1>
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Find agents"
          className="w-64 font-sans hidden md:block"
        />
        <Button
          onClick={() => router.push("/start")}
          className="flex items-center justify-center gap-2 font-sans"
        >
          Get Started
          <IconChevronsRight size={16} />
        </Button>
      </div>
    </div>
  );
}

export default Navbar;
