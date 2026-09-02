"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowUpRight, Figma, Github } from "lucide-react";
import { SubscribeModal, hasResourceAccess } from "./SubscribeModal";
import { assetPath } from "@/lib/assetPath";

function ChevronLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

type ResourceCategory = "creative" | "code";
type ResourceTool = "figma" | "github";
type CategoryFilter = "all" | ResourceCategory;

interface ResourceCard {
  id: string;
  badge: { text: string; variant: "coming-soon" | "live" };
  mediaDefault: string;
  mediaType: "image" | "video";
  imageHover: string;
  /** Square-safe still used by the compact mobile row. */
  thumb: string;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  categories: ResourceCategory[];
  tool: ResourceTool;
  dateAdded: string; // ISO YYYY-MM-DD
  /** Pinned to the top of the list with a "Popular" badge. */
  featured?: boolean;
}

const CATEGORY_LABEL: Record<ResourceCategory, string> = {
  creative: "Creative",
  code: "Code",
};

const TOOL_LABEL: Record<ResourceTool, string> = {
  figma: "Figma",
  github: "GitHub",
};

const TOOL_ICON: Record<ResourceTool, React.ComponentType<{ className?: string }>> = {
  figma: Figma,
  github: Github,
};

function formatDateAdded(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const resourceCards: ResourceCard[] = [
  {
    id: "portfolio",
    badge: { text: "Live", variant: "live" },
    mediaDefault: "/images/portfolio-01.jpg",
    mediaType: "image",
    imageHover: "/images/portfolio-02.jpg",
    thumb: "/images/portfolio-01.jpg",
    title: "Portfolio Template",
    description:
      "Our co-founder's portfolio that helped him land jobs at Google, Salesforce, and other Fortune 500 companies. Open source and ready to customize",
    href: "https://www.figma.com/community/file/1597821544420498783/portfolio-presentation-template-built-to-land-offers",
    buttonLabel: "Figma",
    categories: ["creative"],
    tool: "figma",
    dateAdded: "2026-02-13",
  },
  {
    id: "design-directory",
    badge: { text: "Live", variant: "live" },
    mediaDefault: "/images/design-directory-01.mp4",
    mediaType: "video",
    imageHover: "/images/design-directory-02.jpg",
    thumb: "/images/design-directory-02.jpg",
    title: "Design Directory",
    description:
      "All of our favorite design tools in one interactive directory. Open-source and ready to adapt for your own creative workflow.",
    href: "https://design-directory-blue.vercel.app/",
    buttonLabel: "Website",
    categories: ["creative", "code"],
    tool: "github",
    dateAdded: "2026-03-03",
  },
  {
    id: "brand-design-system",
    badge: { text: "Live", variant: "live" },
    mediaDefault: "/images/brand-design-system-01.jpg",
    mediaType: "image",
    imageHover: "/images/brand-design-system-02.jpg",
    thumb: "/images/brand-design-system-01.jpg",
    title: "Brand Design System",
    description:
      "Comprehensive design system optimized for brand identity in the AI era. Fully configurable with connected variables and ready to customize.",
    href: "https://www.figma.com/community/file/1618448560463755361",
    buttonLabel: "Figma",
    categories: ["creative"],
    tool: "figma",
    dateAdded: "2026-03-26",
    featured: true,
  },
  {
    id: "linktree-template",
    badge: { text: "Live", variant: "live" },
    mediaDefault: "/images/linktree-template-01.jpg",
    mediaType: "image",
    imageHover: "/images/linktree-template-02.jpg",
    thumb: "/images/linktree-template-01.jpg",
    title: "Linktree Template",
    description:
      "A beautiful, customizable link portal template built with Next.js. Open-source and ready to adapt for your own brand.",
    href: "https://github.com/opensesh/linktree-alternative",
    buttonLabel: "GitHub",
    categories: ["code"],
    tool: "github",
    dateAdded: "2026-03-09",
  },
  {
    id: "karimo",
    badge: { text: "Live", variant: "live" },
    mediaDefault: "/images/karimo-01.gif",
    mediaType: "image",
    imageHover: "/images/karimo-02.jpg",
    thumb: "/images/karimo-02.jpg",
    title: "Claude Code Harness",
    description:
      "Karimo is a framework and Claude Code plugin for PRD-driven autonomous development. Think of it as plan mode on steroids.",
    href: "https://github.com/opensesh/KARIMO",
    buttonLabel: "GitHub",
    categories: ["code"],
    tool: "github",
    dateAdded: "2026-05-01",
  },
];

function Badge({ text, variant }: { text: string; variant: "coming-soon" | "live" }) {
  const badgeClass = variant === "coming-soon" ? "badge-coming-soon" : "badge-live";
  return (
    <span className={`resource-card-badge font-medium rounded-full ${badgeClass}`}>
      {text}
    </span>
  );
}

/* ---------- Desktop: visual card ---------- */

function ResourceCardComponent({
  card,
  onCardClick,
}: {
  card: ResourceCard;
  onCardClick: (card: ResourceCard) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const isLive = card.badge.variant === "live";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLive) {
      onCardClick(card);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && isLive) {
      e.preventDefault();
      onCardClick(card);
    }
  };

  return (
    <motion.div
      className={`resource-card w-full flex flex-col ${isLive ? "cursor-pointer" : ""}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isLive ? "button" : undefined}
      tabIndex={isLive ? 0 : undefined}
    >
      {/* Image/Video Area - rounded-t-[11px] to account for 1px border */}
      <div className="relative bg-[#191919] rounded-t-[11px] overflow-hidden h-48">
        {card.mediaType === "video" ? (
          <motion.video
            src={assetPath(card.mediaDefault)}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-top"
            animate={{
              scale: isHovered ? 1.02 : 1,
              opacity: isHovered ? 0 : 1,
            }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
        ) : (
          <motion.img
            src={assetPath(card.mediaDefault)}
            alt={card.title}
            className="absolute inset-0 w-full h-full object-cover object-top"
            animate={{
              scale: isHovered ? 1.02 : 1,
              opacity: isHovered ? 0 : 1,
            }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
        )}

        <motion.img
          src={assetPath(card.imageHover)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-top"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 1.05,
          }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        />

        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
          <Badge text={card.badge.text} variant={card.badge.variant} />
        </div>
      </div>

      <div className="resource-card-content flex flex-col flex-grow">
        <div className="resource-card-title-row">
          <h3 className="resource-card-title font-accent font-bold text-[var(--color-vanilla)]">
            {card.title}
          </h3>
          <span className="resource-card-date" aria-label={`Added ${formatDateAdded(card.dateAdded)}`}>
            {formatDateAdded(card.dateAdded)}
          </span>
        </div>
        <p className="resource-card-description text-[var(--color-vanilla)]/70 line-clamp-2 sm:line-clamp-3 flex-grow">
          {card.description}
        </p>
        <div className="resource-card-footer">
          <div className="resource-card-tags">
            {card.categories.map((c) => (
              <span key={c} className="resource-card-tag">
                {CATEGORY_LABEL[c]}
              </span>
            ))}
            <span className="resource-card-tag resource-card-tag--tool">
              {(() => {
                const Icon = TOOL_ICON[card.tool];
                return <Icon className="resource-card-tag-icon" />;
              })()}
              {TOOL_LABEL[card.tool]}
            </span>
          </div>
          <ArrowUpRight className="resource-card-arrow" aria-hidden="true" />
        </div>
      </div>
    </motion.div>
  );
}

function CarouselPagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onDotClick,
}: {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
}) {
  return (
    <div className="resource-pagination">
      <button
        className="resource-nav-arrow"
        onClick={onPrevious}
        disabled={currentPage === 0}
        aria-label="Previous resource"
      >
        <ChevronLeftIcon />
      </button>

      <div className="resource-dots">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            className={`resource-pagination-dot ${currentPage === index ? "active" : ""}`}
            onClick={() => onDotClick(index)}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>

      <button
        className="resource-nav-arrow"
        onClick={onNext}
        disabled={currentPage === totalPages - 1}
        aria-label="Next resource"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

function getCardPages(cards: ResourceCard[], size: number): ResourceCard[][] {
  const pages: ResourceCard[][] = [];
  for (let i = 0; i < cards.length; i += size) {
    pages.push(cards.slice(i, i + size));
  }
  return pages;
}

/* ---------- Mobile: compact row ---------- */

function ResourceRow({
  card,
  onClick,
}: {
  card: ResourceCard;
  onClick: (card: ResourceCard) => void;
}) {
  const meta = [
    card.categories.map((c) => CATEGORY_LABEL[c]).join(" + "),
    card.buttonLabel,
    formatDateAdded(card.dateAdded),
  ].join(" · ");

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <button type="button" className="resource-row" onClick={() => onClick(card)}>
        <img
          src={assetPath(card.thumb)}
          alt=""
          className="resource-row-thumb"
          loading="lazy"
          draggable={false}
        />
        <span className="resource-row-body">
          <span className="resource-row-title">{card.title}</span>
          <span className="resource-row-meta">{meta}</span>
        </span>
        {card.featured && <span className="resource-row-badge">Popular</span>}
        <ArrowUpRight className="resource-row-arrow" aria-hidden="true" />
      </button>
    </motion.li>
  );
}

/* ---------- Category chips ---------- */

const CHIP_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "creative", label: "Creative" },
  { value: "code", label: "Code" },
];

function ResourceChips({
  value,
  onChange,
}: {
  value: CategoryFilter;
  onChange: (next: CategoryFilter) => void;
}) {
  return (
    <div className="resource-chips" aria-label="Filter resources by category">
      {CHIP_OPTIONS.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`resource-chip ${selected ? "selected" : ""}`}
            aria-pressed={selected}
            onClick={() => onChange(opt.value)}
          >
            {selected && (
              <motion.span
                layoutId="resource-chip-active"
                className="resource-chip-bg"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="resource-chip-label">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Panel ---------- */

const CARDS_PER_PAGE = 3;

/**
 * Body of the Free Resources bin. Renders compact rows below `lg` and the
 * visual card carousel at `lg+` — both are in the DOM and toggled with CSS
 * so there's no layout flash on hydration.
 */
export function FreeResourcesPanel() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    card: ResourceCard | null;
  }>({ isOpen: false, card: null });

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [currentPage, setCurrentPage] = useState(0);

  const visibleResources = useMemo(() => {
    const filtered = resourceCards.filter(
      (r) => category === "all" || r.categories.includes(category)
    );
    // Featured first, then newest.
    return [...filtered].sort((a, b) => {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
      return b.dateAdded.localeCompare(a.dateAdded);
    });
  }, [category]);

  const cardPages = useMemo(
    () => getCardPages(visibleResources, CARDS_PER_PAGE),
    [visibleResources]
  );
  const totalPages = Math.max(cardPages.length, 1);
  const safePageIndex = Math.min(currentPage, totalPages - 1);
  const currentPageCards = cardPages[safePageIndex] ?? [];

  const handleCategoryChange = (next: CategoryFilter) => {
    setCategory(next);
    setCurrentPage(0);
  };

  const handleCardClick = (card: ResourceCard) => {
    if (hasResourceAccess()) {
      window.open(card.href, "_blank", "noopener,noreferrer");
      return;
    }
    setModalState({ isOpen: true, card });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, card: null });
  };

  return (
    <>
      <ResourceChips value={category} onChange={handleCategoryChange} />

      {/* Mobile / tablet: compact list — every resource visible at once */}
      <ul className="resource-rows lg:hidden">
        <AnimatePresence initial={false}>
          {visibleResources.map((card) => (
            <ResourceRow key={card.id} card={card} onClick={handleCardClick} />
          ))}
        </AnimatePresence>
      </ul>

      {/* Desktop: visual card carousel, 3 per page */}
      <div className="hidden lg:block px-[10px] pb-[10px]">
        <div
          className={`resource-carousel-wrapper ${cardPages.length > 1 ? "resource-carousel-wrapper--multi" : ""}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${safePageIndex}-${category}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="resource-card-page"
            >
              {currentPageCards.map((card) => (
                <ResourceCardComponent
                  key={card.id}
                  card={card}
                  onCardClick={handleCardClick}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {totalPages > 1 && (
            <CarouselPagination
              currentPage={safePageIndex}
              totalPages={totalPages}
              onPrevious={() => setCurrentPage((p) => Math.max(0, p - 1))}
              onNext={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              onDotClick={setCurrentPage}
            />
          )}
        </div>
      </div>

      <SubscribeModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSkip={handleCloseModal}
        resourceTitle={modalState.card?.title ?? ""}
        resourceHref={modalState.card?.href ?? "#"}
      />
    </>
  );
}
