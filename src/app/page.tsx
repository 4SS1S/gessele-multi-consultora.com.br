import links from "./links.data.json";
import { getIcon, ArrowRightIcon } from "./components/icons";

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
    <div className="bg-gradient-main flex min-h-dvh items-center justify-center font-sans">
      <main className="relative z-10 flex w-full max-w-md flex-col items-center px-6 py-12">
        {/* Profile Section */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="avatar-ring">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#1a0a2e] text-3xl font-bold text-white">
              G
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Gessele Oliveira
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Consultora Madrejoy
            </p>
          </div>
        </div>

        {/* Links */}
        <div className="flex w-full flex-col gap-4">
          {data.map((item, index) => {
            const Icon = getIcon(item.icon);
            return (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card group flex items-center gap-4 rounded-2xl px-5 py-4 animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon */}
                <div
                  className="icon-dot flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${item.color}20`, color: item.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
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
        </div>

        {/* Footer */}
        <p className="mt-12 text-xs text-white/20">
          Gessele Multi Consultora
        </p>
      </main>
    </div>
  );
}
