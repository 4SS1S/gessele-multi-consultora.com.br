import Image from "next/image";
import { AnimatedBackground } from "./components/animated-background";
import { ArrowRightIcon, getIcon } from "./components/icons";
import links from "./links.data.json";

interface LinkItem {
  id: string;
  type: string;
  title: string;
  description: string;
  service: string;
  icon: string;
  link: string;
  color: string;
}

export default function Home() {
  const data = links as LinkItem[];

  return (
    <>
      <AnimatedBackground />

      <div className="page-wrapper font-sans">
        {/* Header full-width with profile overlay */}
        <header className="relative w-full rounded-b-full animate-card-enter">
          <Image
            src="/header.webp"
            alt="Header"
            width={1080}
            height={480}
            className="h-52 w-full object-cover sm:h-64"
            priority
          />
          {/* Gradient fade into background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a2134dd] via-transparent to-transparent" />

          {/* Profile section positioned over the header */}
          <div className="absolute inset-x-0 bottom-0 translate-y-1/2 flex flex-col items-center gap-3 animate-float">
            <div className="avatar-ring animate-avatar-enter">
              <Image
                src="/avatar.jpg"
                alt="Gessele Oliveira"
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover"
                priority
              />
            </div>
          </div>
        </header>

        {/* Name + subtitle below avatar overflow */}
        <div className="mt-16 text-center">
          <h1 className="animate-name-enter text-2xl font-bold tracking-tight text-white">
            Gessele Oliveira
          </h1>
          <p className="animate-subtitle-enter mt-1 text-sm text-white/50">
            Consultora Madrejoy
          </p>
        </div>

        {/* Links */}
        <main className="relative z-10 mx-auto mt-8 flex w-full max-w-md flex-col items-center gap-4 px-6 pb-12">
          {data.map((item, index) => {
            const Icon = getIcon(item.icon);
            const delay = 0.8 + index * 0.25;
            return (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card group relative flex w-full items-center gap-4 rounded-2xl px-5 py-4 animate-card-enter"
                style={{ animationDelay: `${delay}s` }}
              >
                {/* Icon */}
                <div
                  className="icon-dot flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="truncate text-xs text-white/40">
                    {item.description}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRightIcon className="h-4 w-4 shrink-0 text-white/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white/60" />
              </a>
            );
          })}

          {/* Footer */}
          <p className="animate-footer-enter mt-8 text-xs text-white/20">
            Gessele Multi Consultora
          </p>
        </main>
      </div>
    </>
  );
}
