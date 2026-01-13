import { IconPlus } from "@tabler/icons-react";
import Image from "next/image";
import React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  imageUrl: string;
}

function FeatureCard({ title, description, imageUrl }: FeatureCardProps) {
  return (
    <div className="border border-dashed relative p-4 w-full flex flex-col justify-between items-center">
      <IconPlus
        className=" m-4 absolute -top-7 -right-7.25 rotate-45"
        color="gray"
      />
      <IconPlus
        className=" m-4 absolute -bottom-7 -left-7 rotate-45"
        color="gray"
      />
      <IconPlus
        className=" m-4 absolute -top-7 -left-7 rotate-45"
        color="gray"
      />
      <IconPlus
        className=" m-4 absolute -bottom-7 -right-7.25 rotate-45"
        color="gray"
      />

      <Image
        src={imageUrl}
        alt={title}
        width={500}
        height={300}
        className="rounded-xs w-full h-[70%] object-cover"
      />
      <div className="mt-4">
        <h1 className="font-sans font-semibold text-sm">{title}</h1>
        <p className="mt-4 font-mono text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default FeatureCard;
