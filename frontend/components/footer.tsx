import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandTelegram,
  IconBrandTwitter,
  IconPlus,
} from "@tabler/icons-react";

function Footer() {
  return (
    <section className="mt-24">
      <div className="py-8 flex flex-col-reverse items-center md:flex-row mx-4 justify-between border mt-8 relative border-dashed px-4 h-56 overflow-hidden">
        <IconPlus className="absolute -top-3 -right-3" color="gray" />
        <IconPlus className="absolute -top-3 -left-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -right-3" color="gray" />
        <IconPlus className="absolute -bottom-3 -left-3" color="gray" />
        <div className="w-full flex items-center flex-col justify-center">
          <div className="flex items-center justify-between my-4 gap-4 md:gap-8">
            <div className="text-center flex flex-col items-center justify-center cursor-pointer">
              <IconBrandGithub size={28} className="text-muted-foreground" />
              <p className="text-xs font-mono mt-2 text-muted-foreground">
                GitHub
              </p>
            </div>
            <div className="text-center flex flex-col items-center justify-center cursor-pointer">
              <IconBrandTwitter size={28} className="text-muted-foreground" />
              <p className="text-xs font-mono mt-2 text-muted-foreground">
                Twitter
              </p>
            </div>
            <div className="text-center flex flex-col items-center justify-center cursor-pointer">
              <IconBrandDiscord size={28} className="text-muted-foreground" />
              <p className="text-xs font-mono mt-2 text-muted-foreground">
                Discord
              </p>
            </div>
            <div className="text-center flex flex-col items-center justify-center cursor-pointer">
              <IconBrandTelegram size={28} className="text-muted-foreground" />
              <p className="text-xs font-mono mt-2 text-muted-foreground">
                Telegram
              </p>
            </div>
          </div>
          <h1 className="text-5xl lowercase font-mono font-bold text-green-500/40 absolute -bottom-4">
            The Bazaar
          </h1>
        </div>
      </div>
    </section>
  );
}

export default Footer;
