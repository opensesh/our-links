"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { assetPath } from "@/lib/assetPath";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// ---------- Social pill icons (lifted from the now-removed OurLinks.tsx) ----------

function FigmaIcon() {
  return (
    <svg
      className="link-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
      <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
      <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
      <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
      <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      className="link-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function SubstackIcon() {
  return (
    <svg
      className="link-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16" />
      <path d="M4 10h16" />
      <path d="M4 14v8l8-4 8 4v-8" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      className="link-icon-svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath("/icons/social/linkedin.svg")}
      alt=""
      className="link-icon-svg"
    />
  );
}

function MediumIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assetPath("/icons/social/medium.svg")}
      alt=""
      className="link-icon-svg"
    />
  );
}

// ---------- Card data ----------

interface NavCard {
  id: string;
  label: string;
  href: string; // empty when disabled
  videoSrc: string; // public/videos/... — passed through assetPath()
  disabled?: boolean;
}

const navCards: NavCard[] = [
  {
    id: "projects",
    label: "Projects",
    href: "https://opensession.co/projects",
    videoSrc: "/videos/card-projects.mp4",
  },
  {
    id: "about",
    label: "About",
    href: "https://opensession.co/about",
    videoSrc: "/videos/card-about.mp4",
  },
  {
    id: "product",
    label: "Product*",
    href: "",
    videoSrc: "/videos/card-product.mp4",
    disabled: true,
  },
  {
    id: "contact",
    label: "Contact",
    href: "https://opensession.co/contact",
    videoSrc: "/videos/card-contact.mp4",
  },
];

interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const socialLinks: SocialLink[] = [
  {
    id: "github",
    label: "Github",
    href: "https://link.opensession.co/website-github",
    icon: <GitHubIcon />,
  },
  {
    id: "figma",
    label: "Figma",
    href: "https://link.opensession.co/website-figma",
    icon: <FigmaIcon />,
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://link.opensession.co/website-instagram",
    icon: <InstagramIcon />,
  },
  {
    id: "linkedin",
    label: "Linkedin",
    href: "https://www.linkedin.com/company/opensession/",
    icon: <LinkedInIcon />,
  },
  {
    id: "substack",
    label: "Substack",
    href: "https://link.opensession.co/website-substack",
    icon: <SubstackIcon />,
  },
  {
    id: "medium",
    label: "Medium",
    href: "https://link.opensession.co/website-medium",
    icon: <MediumIcon />,
  },
];

// ---------- NavCardItem (image card with hover-play + rewind loop) ----------

const REWIND_MS = 500;

interface NavCardItemProps {
  card: NavCard;
  hoverEnabled: boolean;
}

function NavCardItem({ card, hoverEnabled }: NavCardItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoveringRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const startPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      video.currentTime = 0;
    } catch {
      /* duration may not be ready yet */
    }
    void video.play().catch(() => {});
  };

  // Loop driver: on video end, tween currentTime back to 0 then replay.
  // Inlined inside the effect so React's exhaustive-deps lint stays happy
  // (everything it touches is a ref, so no dep array entries are needed).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnded = () => {
      if (!hoveringRef.current || !Number.isFinite(video.duration)) return;
      const from = video.duration;
      const startTs = performance.now();
      const tick = (now: number) => {
        if (!hoveringRef.current) return;
        const t = Math.min(1, (now - startTs) / REWIND_MS);
        video.currentTime = from * (1 - t);
        if (t < 1) {
          rafIdRef.current = requestAnimationFrame(tick);
        } else {
          try {
            video.currentTime = 0;
          } catch {
            /* ignore */
          }
          void video.play().catch(() => {});
        }
      };
      rafIdRef.current = requestAnimationFrame(tick);
    };

    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("ended", onEnded);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  const handleEnter = () => {
    if (!hoverEnabled) return;
    hoveringRef.current = true;
    startPlay();
  };

  const handleLeave = () => {
    hoveringRef.current = false;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    try {
      video.currentTime = 0;
    } catch {
      /* ignore */
    }
  };

  const sharedClassName = "nav-image-card group block";
  const sharedStyle = card.disabled ? undefined : undefined;

  const inner = (
    <>
      <video
        ref={videoRef}
        src={assetPath(card.videoSrc)}
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-hidden="true"
      />
      <span className="nav-image-card-gradient" aria-hidden="true" />
      <span className="nav-image-card-label font-display text-2xl sm:text-[28px] md:text-3xl">
        {card.label}
      </span>
    </>
  );

  if (card.disabled) {
    return (
      <button
        type="button"
        className={sharedClassName}
        style={sharedStyle}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        aria-label={`${card.label} (coming soon)`}
        aria-disabled="true"
      >
        {inner}
      </button>
    );
  }

  return (
    <a
      href={card.href}
      target="_blank"
      rel="noopener noreferrer"
      className={sharedClassName}
      style={sharedStyle}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
    >
      {inner}
    </a>
  );
}

// ---------- CardNav ----------

export function CardNav() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Hover-only on devices with a fine pointer (desktop). Touch devices skip
  // video playback entirely — taps navigate immediately.
  const hoverCapable = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const videoEnabled = hoverCapable && !reducedMotion;

  // Open / close timeline
  useEffect(() => {
    if (!containerRef.current || !cardsRef.current) return;

    const tl = gsap.timeline();
    const staggerTargets = cardsRef.current.querySelectorAll<HTMLElement>(
      ".gsap-stagger"
    );

    if (isOpen) {
      tl.to(containerRef.current, {
        height: "auto",
        duration: 0.4,
        ease: "power2.out",
      }).fromTo(
        staggerTargets,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.06,
          ease: "power2.out",
        },
        "-=0.2"
      );
    } else {
      tl.to(staggerTargets, {
        opacity: 0,
        y: 10,
        duration: 0.2,
        stagger: 0.02,
        ease: "power2.in",
      }).to(containerRef.current, {
        height: 60,
        duration: 0.3,
        ease: "power2.inOut",
      });
    }

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  // Hamburger ↔ X
  useEffect(() => {
    if (!hamburgerRef.current) return;
    const lines = hamburgerRef.current.querySelectorAll("span");

    if (isOpen) {
      gsap.to(lines[0], {
        rotation: 45,
        y: 8,
        transformOrigin: "center",
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(lines[1], {
        opacity: 0,
        scaleX: 0,
        duration: 0.2,
        ease: "power2.out",
      });
      gsap.to(lines[2], {
        rotation: -45,
        y: -8,
        transformOrigin: "center",
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(lines[0], {
        rotation: 0,
        y: 0,
        transformOrigin: "center",
        duration: 0.3,
        ease: "power2.out",
      });
      gsap.to(lines[1], {
        opacity: 1,
        scaleX: 1,
        duration: 0.3,
        delay: 0.1,
        ease: "power2.out",
      });
      gsap.to(lines[2], {
        rotation: 0,
        y: 0,
        transformOrigin: "center",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isOpen]);

  // Backdrop blur fade
  useEffect(() => {
    if (!overlayRef.current) return;

    if (isOpen) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        visibility: "visible",
        pointerEvents: "auto",
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          if (overlayRef.current) {
            gsap.set(overlayRef.current, {
              visibility: "hidden",
              pointerEvents: "none",
            });
          }
        },
      });
    }
  }, [isOpen]);

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: "rgba(25, 25, 25, 0.3)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: 0,
          visibility: "hidden",
          pointerEvents: "none",
        }}
        onClick={() => setIsOpen(false)}
      />

      <nav className="w-full relative z-50">
        <div className="max-w-[var(--content-max-width)] mx-auto">
          <div
            ref={containerRef}
            className="overflow-hidden rounded-2xl shadow-md"
            style={{
              background: "var(--color-vanilla)",
              border: "1px solid var(--border-secondary)",
              height: 60,
            }}
          >
            {/* Header row */}
            <div className="relative flex items-center justify-between h-[60px] px-4">
              <button
                ref={hamburgerRef}
                onClick={() => setIsOpen(!isOpen)}
                className="relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 flex-shrink-0"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
              >
                <span
                  className="block w-5 h-0.5 origin-center"
                  style={{ background: "var(--color-charcoal)" }}
                />
                <span
                  className="block w-5 h-0.5 origin-center"
                  style={{ background: "var(--color-charcoal)" }}
                />
                <span
                  className="block w-5 h-0.5 origin-center"
                  style={{ background: "var(--color-charcoal)" }}
                />
              </button>

              <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
                <img
                  src={assetPath("/images/logo_wordmark_charcoal.svg")}
                  alt="Open Session"
                  className="h-[32px] sm:h-[36px] w-auto"
                />
              </div>

              <a
                href="https://opensession.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-10 h-10 transition-opacity hover:opacity-70 flex-shrink-0"
                aria-label="Visit website"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-charcoal)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
              </a>
            </div>

            {/* Expanded body: cards + pills.
                px-14 (56px) aligns the card edge with the inner edge of
                the close (X) and globe buttons in the header — the
                buttons are w-10 (40px) sitting inside the header's
                px-4 (16px) gutter, so 16 + 40 = 56px. */}
            <div ref={cardsRef} className="overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-14 pb-3 sm:pb-4">
                {navCards.map((card) => (
                  <div key={card.id} className="gsap-stagger">
                    <NavCardItem card={card} hoverEnabled={videoEnabled} />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-2 px-16 sm:px-20 pb-5 sm:pb-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-pill gsap-stagger"
                  >
                    <span className="nav-pill-icon">{link.icon}</span>
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
