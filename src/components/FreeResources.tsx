"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SubscribeModal, hasResourceAccess } from "./SubscribeModal";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Custom icon component - stroke-based for consistent outline style
function ExternalLinkIcon() {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

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
}

const resourceCards: ResourceCard[] = [
  // Page 1: Portfolio + Design Directory
  {
    id: "portfolio",
    badge: { text: "Live", variant: "live" },
    mediaDefault: "/our-links/images/portfolio-01.jpg",
    mediaType: "image",
    imageHover: "/our-links/images/portfolio-02.jpg",
    title: "Portfolio Template",
    description:
      "Our co-founder's portfolio that helped him land jobs at Google, Salesforce, and other Fortune 500 companies. Open source and ready to customize",
    href: "https://www.figma.com/community/file/1597821544420498783/portfolio-presentation-template-built-to-land-offers",
    buttonLabel: "Figma",
  },
  {
    id: "design-directory",
    badge: { text: "Live", variant: "live" },
    mediaDefault: "/our-links/images/design-directory-01.mp4",
    mediaType: "video",
    imageHover: "/our-links/images/design-directory-02.jpg",
    title: "Design Directory",
    description:
      "All of our favorite design tools in one interactive directory. Open-source and ready to adapt for your own creative workflow.",
    href: "https://design-directory-blue.vercel.app/",
    buttonLabel: "Website",
  },
  // Page 2: Brand Design System + Linktree Template
  {
    id: "brand-design-system",
    badge: { text: "Live", variant: "live" },
    mediaDefault: "/our-links/images/brand-design-system-01.jpg",
    mediaType: "image",
    imageHover: "/our-links/images/brand-design-system-02.jpg",
    title: "Brand Design System",
    description:
      "Comprehensive design system optimized for brand identity in the AI era. Fully configurable with connected variables and ready to customize.",
    href: "https://www.figma.com/community/file/1618448560463755361",
    buttonLabel: "Figma",
  },
  {
    id: "linktree-template",
    badge: { text: "Live", variant: "live" },
    mediaDefault: "/our-links/images/linktree-template-01.jpg",
    mediaType: "image",
    imageHover: "/our-links/images/linktree-template-02.jpg",
    title: "Linktree Template",
    description:
      "A beautiful, customizable link portal template built with Next.js. Open-source and ready to adapt for your own brand.",
    href: "https://github.com/opensesh/linktree-alternative",
    buttonLabel: "GitHub",
  },
  // Page 3: Karimo (last)
  {
    id: "karimo",
    badge: { text: "Live", variant: "live" },
    mediaDefault: "/our-links/images/karimo-01.jpg",
    mediaType: "image",
    imageHover: "/our-links/images/karimo-02.jpg",
    title: "KARIMO",
    description:
      "A framework and Claude Code plug-in for PRD-driven autonomous development. Think of it as plan mode on steroids.",
    href: "https://github.com/opensesh/KARIMO",
    buttonLabel: "GitHub",
  },
];

// Desktop order: Portfolio, Design Directory, Brand Design System (full width), Linktree, Karimo
// We need to reorder for desktop grid where Brand Design System spans full width in middle
const desktopOrderedCards = [
  resourceCards[0], // Portfolio
  resourceCards[1], // Design Directory
  resourceCards[2], // Brand Design System
  resourceCards[4], // Karimo
  resourceCards[3], // Linktree Template
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
  index,
  onCardClick,
  isMobileView = false,
}: {
  card: ResourceCard;
  index: number;
  onCardClick: (card: ResourceCard) => void;
  isMobileView?: boolean;
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

  // Brand Design System (index 2) spans full width on desktop
  const isFullWidth = !isMobileView && index === 2;

  return (
    <motion.div
      className={`resource-card w-full flex flex-col ${isFullWidth ? "md:col-span-2" : ""} ${isLive ? "cursor-pointer" : ""}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isLive ? "button" : undefined}
      tabIndex={isLive ? 0 : undefined}
    >
      {/* Image/Video Area - rounded-t-[11px] to account for 1px border */}
      {/* Full-width card (Brand Design System) has shorter height on desktop to reduce empty space */}
      <div className={`relative bg-[#191919] rounded-t-[11px] overflow-hidden ${
        isFullWidth ? "h-48 md:h-36" : "h-48"
      }`}>
        {/* O1 - Default media (image or video) */}
        {card.mediaType === "video" ? (
          <motion.video
            src={card.mediaDefault}
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
            src={card.mediaDefault}
            alt={card.title}
            className={`absolute inset-0 w-full h-full object-cover ${isFullWidth ? "object-[center_25%]" : "object-top"}`}
            animate={{
              scale: isHovered ? 1.02 : 1,
              opacity: isHovered ? 0 : 1,
            }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          />
        )}

        {/* O2 - Hover image with crossfade + subtle scale */}
        <motion.img
          src={card.imageHover}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover ${isFullWidth ? "object-[center_25%]" : "object-top"}`}
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
        <h3 className="resource-card-title font-accent font-bold text-[var(--color-vanilla)] mb-1.5 sm:mb-2">
          {card.title}
        </h3>
        <p className="resource-card-description text-[var(--color-vanilla)]/70 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-grow">
          {card.description}
        </p>
        <span className="card-button inline-flex items-center gap-1.5 sm:gap-2 font-medium rounded-lg self-end">
          {card.buttonLabel}
          <ExternalLinkIcon />
        </span>
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

// Group cards into pages of 2 for mobile
function getCardPages(cards: ResourceCard[]): ResourceCard[][] {
  const pages: ResourceCard[][] = [];
  for (let i = 0; i < cards.length; i += 2) {
    pages.push(cards.slice(i, i + 2));
  }
  return pages;
}

export function FreeResources() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    card: ResourceCard | null;
  }>({ isOpen: false, card: null });

  const [currentPage, setCurrentPage] = useState(0);
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Mobile: 2 cards per page, 3 pages total (2+2+1)
  const mobilePages = getCardPages(resourceCards);
  const totalPages = mobilePages.length;

  const handleCardClick = (card: ResourceCard) => {
    // If user has already subscribed or skipped, open resource directly
    if (hasResourceAccess()) {
      window.open(card.href, "_blank", "noopener,noreferrer");
      return;
    }
    // Otherwise show the subscribe modal
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

  return (
    <>
      <section className="w-full mt-6 sm:mt-8">
        {/* Container with max-width */}
        <div className="max-w-[var(--content-max-width)] mx-auto">
          {/* Heading - Neue Haas Grotesk */}
          <h2
            className="text-xl font-bold mb-3 sm:mb-4"
            style={{ color: "var(--color-vanilla)" }}
          >
            Free Resources
          </h2>

          {/* Mobile: 2 cards per page stacked vertically with swipe + pagination */}
          {isMobile ? (
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    const swipeThreshold = 50;
                    if (info.offset.x < -swipeThreshold && currentPage < totalPages - 1) {
                      setCurrentPage(currentPage + 1);
                    } else if (info.offset.x > swipeThreshold && currentPage > 0) {
                      setCurrentPage(currentPage - 1);
                    }
                  }}
                  className="flex flex-col gap-4"
                >
                  {mobilePages[currentPage].map((card, idx) => (
                    <ResourceCardComponent
                      key={card.id}
                      card={card}
                      index={currentPage * 2 + idx}
                      onCardClick={handleCardClick}
                      isMobileView={true}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>

              <MobilePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onDotClick={handleDotClick}
              />
            </div>
          ) : (
            /* Desktop: Responsive grid - 2 cols with Brand Design System spanning both */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {desktopOrderedCards.map((card, index) => (
                <ResourceCardComponent
                  key={card.id}
                  card={card}
                  index={index}
                  onCardClick={handleCardClick}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe Modal */}
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
