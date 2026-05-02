"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown, ArrowUpRight, Figma, Github } from "lucide-react";
import { SubscribeModal, hasResourceAccess } from "./SubscribeModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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

function FilterIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

function CloseIcon() {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

type ResourceCategory = "creative" | "code";
type ResourceTool = "figma" | "github";
type SortOrder = "recent" | "oldest";

interface ResourceCard {
  id: string;
  badge: { text: string; variant: "coming-soon" | "live" };
  mediaDefault: string;
  mediaType: "image" | "video";
  imageHover: string;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
  categories: ResourceCategory[];
  tool: ResourceTool;
  dateAdded: string; // ISO YYYY-MM-DD
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
    title: "Brand Design System",
    description:
      "Comprehensive design system optimized for brand identity in the AI era. Fully configurable with connected variables and ready to customize.",
    href: "https://www.figma.com/community/file/1618448560463755361",
    buttonLabel: "Figma",
    categories: ["creative"],
    tool: "figma",
    dateAdded: "2026-03-26",
  },
  {
    id: "linktree-template",
    badge: { text: "Live", variant: "live" },
    mediaDefault: "/images/linktree-template-01.jpg",
    mediaType: "image",
    imageHover: "/images/linktree-template-02.jpg",
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
        {/* O1 - Default media (image or video) */}
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

        {/* O2 - Hover image with crossfade + subtle scale */}
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

        {/* Badge - Top Right */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
          <Badge text={card.badge.text} variant={card.badge.variant} />
        </div>
      </div>

      {/* Content Area */}
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

// Mobile pagination component
function MobilePagination({
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

// Group cards into pages of `size` (2 on tablet/mobile, 3 on desktop)
function getCardPages(cards: ResourceCard[], size: number): ResourceCard[][] {
  const pages: ResourceCard[][] = [];
  for (let i = 0; i < cards.length; i += size) {
    pages.push(cards.slice(i, i + size));
  }
  return pages;
}

const SORT_LABEL: Record<SortOrder, string> = {
  recent: "Recently added",
  oldest: "Oldest first",
};

type CategoryFilter = "all" | ResourceCategory;
type ToolFilter = "all" | ResourceTool;

type FilterPillVariant = "category" | "tool";

function FilterPills<T extends string>({
  options,
  value,
  onChange,
  variant,
}: {
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }> }[];
  value: T;
  onChange: (next: T) => void;
  variant: FilterPillVariant;
}) {
  return (
    <div className="resource-filter-pills">
      {options.map((opt) => {
        const selected = opt.value === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            className={`resource-filter-pill resource-filter-pill--${variant} ${selected ? "selected" : ""}`}
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
          >
            {Icon && <Icon className="resource-filter-pill-icon" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function FreeResources() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    card: ResourceCard | null;
  }>({ isOpen: false, card: null });

  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState<SortOrder>("recent");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [toolFilter, setToolFilter] = useState<ToolFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Reset to page 0 when filter/sort changes — render-time adjustment pattern.
  const filterSignature = `${categoryFilter}|${toolFilter}|${sortBy}`;
  const [lastFilterSignature, setLastFilterSignature] = useState(filterSignature);
  if (lastFilterSignature !== filterSignature) {
    setLastFilterSignature(filterSignature);
    setCurrentPage(0);
  }

  const isMobile = useMediaQuery("(max-width: 767px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const sortRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const visibleResources = useMemo(() => {
    const filtered = resourceCards.filter((r) => {
      if (categoryFilter !== "all" && !r.categories.includes(categoryFilter)) return false;
      if (toolFilter !== "all" && r.tool !== toolFilter) return false;
      return true;
    });
    return [...filtered].sort((a, b) =>
      sortBy === "recent"
        ? b.dateAdded.localeCompare(a.dateAdded)
        : a.dateAdded.localeCompare(b.dateAdded)
    );
  }, [categoryFilter, toolFilter, sortBy]);

  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) + (toolFilter !== "all" ? 1 : 0);

  const cardsPerPage = isDesktop ? 3 : 2;
  const cardPages = useMemo(
    () => getCardPages(visibleResources, cardsPerPage),
    [visibleResources, cardsPerPage]
  );
  const totalPages = Math.max(cardPages.length, 1);

  // Lock body scroll while the mobile filter sheet is open.
  useEffect(() => {
    if (filterOpen && isMobile) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [filterOpen, isMobile]);

  // ESC closes any open menu.
  useEffect(() => {
    if (!sortOpen && !filterOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSortOpen(false);
        setFilterOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sortOpen, filterOpen]);

  // Click outside closes the desktop popovers (sort + filter).
  useEffect(() => {
    if (isMobile) return;
    if (!sortOpen && !filterOpen) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (sortOpen && sortRef.current && !sortRef.current.contains(t)) {
        setSortOpen(false);
      }
      if (filterOpen && filterRef.current && !filterRef.current.contains(t)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [sortOpen, filterOpen, isMobile]);

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

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handleDotClick = (index: number) => {
    setCurrentPage(index);
  };

  const clearFilters = () => {
    setCategoryFilter("all");
    setToolFilter("all");
  };

  const isEmpty = visibleResources.length === 0;
  const safePageIndex = Math.min(currentPage, totalPages - 1);
  const currentPageCards = cardPages[safePageIndex] ?? [];

  const filterPanelBody = (
    <>
      <div className="resource-filter-section">
        <span className="resource-filter-label">Category</span>
        <FilterPills<CategoryFilter>
          variant="category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: "all", label: "All" },
            { value: "creative", label: "Creative" },
            { value: "code", label: "Code" },
          ]}
        />
      </div>
      <div className="resource-filter-section">
        <span className="resource-filter-label">Tool</span>
        <FilterPills<ToolFilter>
          variant="tool"
          value={toolFilter}
          onChange={setToolFilter}
          options={[
            { value: "all", label: "All" },
            { value: "figma", label: "Figma", icon: Figma },
            { value: "github", label: "GitHub", icon: Github },
          ]}
        />
      </div>
      <div className="resource-filter-footer">
        <button
          type="button"
          className="resource-filter-clear"
          onClick={clearFilters}
          disabled={activeFilterCount === 0}
        >
          Clear
        </button>
      </div>
    </>
  );

  return (
    <>
      <section className="w-full mt-14 sm:mt-18">
        <div className="max-w-[var(--content-max-width)] mx-auto">
          {/* Heading row: title left, sort + filter controls right */}
          <div className="resource-header">
            <h2
              className="font-sans text-[1.375rem] font-bold"
              style={{ color: "var(--color-vanilla)", fontFamily: "var(--font-sans)" }}
            >
              Free Resources
            </h2>

            <div className="resource-controls">
              <div className="resource-control-anchor" ref={sortRef}>
                <button
                  type="button"
                  className="resource-control-icon-button"
                  onClick={() => {
                    setSortOpen((v) => !v);
                    setFilterOpen(false);
                  }}
                  aria-haspopup="menu"
                  aria-expanded={sortOpen}
                  aria-label={`Sort: ${SORT_LABEL[sortBy]}`}
                  title={`Sort: ${SORT_LABEL[sortBy]}`}
                >
                  <ArrowUpDown className="resource-control-icon" />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      role="menu"
                      className="resource-control-popover right-0"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      <span className="resource-control-popover-label">Sort by</span>
                      {(["recent", "oldest"] as SortOrder[]).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          role="menuitemradio"
                          aria-checked={sortBy === opt}
                          className={`resource-control-popover-item ${sortBy === opt ? "selected" : ""}`}
                          onClick={() => {
                            setSortBy(opt);
                            setSortOpen(false);
                          }}
                        >
                          {SORT_LABEL[opt]}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="resource-control-anchor" ref={filterRef}>
                <button
                  type="button"
                  className={`resource-control-chip ${activeFilterCount > 0 ? "active" : ""} ${filterOpen ? "open" : ""}`}
                  onClick={() => {
                    setFilterOpen((v) => !v);
                    setSortOpen(false);
                  }}
                  aria-haspopup={isMobile ? "dialog" : "true"}
                  aria-expanded={filterOpen}
                >
                  <FilterIcon />
                  <span>
                    Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                  </span>
                </button>

                {/* Desktop: filter popover anchored to the button */}
                {!isMobile && (
                  <AnimatePresence>
                    {filterOpen && (
                      <motion.div
                        role="dialog"
                        aria-label="Filter resources"
                        className="resource-control-popover resource-filter-popover right-0"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        {filterPanelBody}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </div>

          {/* Mobile bottom sheet */}
          {isMobile && (
            <AnimatePresence>
              {filterOpen && (
                <>
                  <motion.div
                    className="resource-filter-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setFilterOpen(false)}
                  />
                  <motion.div
                    role="dialog"
                    aria-label="Filter resources"
                    className="resource-filter-sheet"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 32, stiffness: 320 }}
                  >
                    <div className="resource-filter-sheet-header">
                      <span className="resource-filter-sheet-title">Filter</span>
                      <button
                        type="button"
                        className="resource-filter-sheet-close"
                        onClick={() => setFilterOpen(false)}
                        aria-label="Close filter"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                    {filterPanelBody}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          )}

          {/* Card carousel — 2 cards per page on every viewport */}
          {isEmpty ? (
            <div className="resource-empty-state">
              <p className="resource-empty-state-text">
                No resources match these filters.
              </p>
              <button
                type="button"
                className="resource-empty-state-clear"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div
              className={`resource-carousel-wrapper ${cardPages.length > 1 ? "resource-carousel-wrapper--multi" : ""}`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${safePageIndex}-${categoryFilter}-${toolFilter}-${sortBy}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  drag={isMobile && cardPages.length > 1 ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    const swipeThreshold = 50;
                    if (info.offset.x < -swipeThreshold && safePageIndex < totalPages - 1) {
                      setCurrentPage(safePageIndex + 1);
                    } else if (info.offset.x > swipeThreshold && safePageIndex > 0) {
                      setCurrentPage(safePageIndex - 1);
                    }
                  }}
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

              <MobilePagination
                currentPage={safePageIndex}
                totalPages={totalPages}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onDotClick={handleDotClick}
              />
            </div>
          )}
        </div>
      </section>

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
