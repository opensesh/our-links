import { CardNav } from "@/components/CardNav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { PortalBins } from "@/components/PortalBins";
import { SpotifyCard } from "@/components/SpotifyCard";
import { TechStack } from "@/components/TechStack";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* NAVCARD - fixed layer outside clipper */}
      <div className="fixed left-0 right-0 top-4 z-50 px-[clamp(1rem,4vw,3rem)]">
        <CardNav />
      </div>

      {/* CLIPPER - clips content at NavCard bottom, scrollbar at viewport edge */}
      <div
        className="fixed left-0 right-0 z-10 overflow-clip"
        style={{ top: "var(--clip-top)", height: "calc(100% - var(--clip-top))" }}
      >
        {/* SCROLLER - handles scrolling, scrollbar at viewport edge */}
        <div className="h-full overflow-y-auto overflow-x-hidden px-[clamp(1rem,4vw,3rem)]">
          <main className="flex flex-col items-center pt-4 pb-8 gap-6 sm:gap-8 px-4 max-w-[var(--content-max-width)] mx-auto">
            <Hero />
            <PortalBins />
            <SpotifyCard />
            <TechStack />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
