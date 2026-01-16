"use client";
import { IconArrowRightDashed, IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

function CTA() {
  const router = useRouter();
  return (
    <section className="my-24">
      <div className="py-8 flex flex-col-reverse overflow-hidden items-center md:flex-row mx-4 justify-between border mt-8 relative border-dashed px-4">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
        <div className="">
          <h1 className="text-2xl md:text-3xl font-bold font-sans mt-8 mb-4 text-left">
            Ready to Get Started?
          </h1>
          <p className="text-muted-foreground text-xs font-sans max-w-md leading-relaxed mt-4">
            Connect your wallet, choose an agent, and make your Web3 life easier
          </p>
          <Button
            onClick={() => {
              router.push("/start");
            }}
            className="mt-10 w-full flex md:w-1/2 border-green-500 border-dashed font-sans"
            variant="outline"
          >
            Get Started <IconArrowRightDashed className="ml-2" />
          </Button>
        </div>
        <Image
          src="/cta.png"
          alt="Currency Image"
          width={400}
          height={400}
          className="mt-8 md:mt-0 md:ml-8 object-contain"
        />
      </div>
    </section>
  );
}

export default CTA;
