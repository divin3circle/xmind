import React from "react";
import { IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "./ui/button";
import ctaImage from "../public/currency.webp";

function Currency() {
  return (
    <section className="my-24">
      <div className="py-8 flex flex-col-reverse items-center md:flex-row mx-4 justify-between border mt-8 overflow-hidden relative border-dashed px-4">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
        <div className="">
          <h1 className="text-2xl md:text-3xl font-bold font-sans mt-8 mb-4 text-left">
            Native Currency of the AI Ecosystem
          </h1>
          <p className="text-muted-foreground text-xs font-sans max-w-md leading-relaxed mt-4">
            All transactions within the app are powered by the USDC.e(devUSDC.e
            on Cronos Testnet) native to the Cronos Blockchain. This stablecoin
            coupled with the x402 protocol ensures secure, fast, and low-cost
            payments for agent workflows.
          </p>
          <Button
            className="mt-10 w-full md:w-1/2 border-green-500 border-dashed font-sans"
            variant="outline"
          >
            Get USDC.e
          </Button>
        </div>
        <Image
          src={ctaImage}
          alt="Currency Image"
          width={400}
          height={400}
          className="mt-8 md:mt-0 md:ml-8 object-contain"
          placeholder="blur"
        />
      </div>
    </section>
  );
}

export default Currency;
