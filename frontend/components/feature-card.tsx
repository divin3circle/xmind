import { IconPlus } from "@tabler/icons-react";
import Image from "next/image";

interface FeatureCardProps {
  title: string;
  description: string;
  tagline: string;
  imageUrl: string;
}

function FeatureCard({
  title,
  tagline,
  description,
  imageUrl,
}: FeatureCardProps) {
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
        <h2 className="font-sans font-medium text-xs text-muted-foreground/50">
          {tagline}
        </h2>
        <p className="mt-4 font-sans text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default FeatureCard;
