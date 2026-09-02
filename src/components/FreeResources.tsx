"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ArrowUpRight, Figma, Github, Globe } from "lucide-react";
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
type ResourceLink = "figma" | "github" | "website";
type CategoryFilter = "all" | ResourceCategory;

interface Resource {
  id: string;
  title: string;
  description: string;
  href: string;
  /** Desktop card artwork (may be a gif or mp4). */
  cover: string;
  coverType: "image" | "video";
  /** Desktop hover artwork. */
  coverHover: string;
  /** Square-safe still for the compact mobile row. */
  thumb: string;
  categories: ResourceCategory[];
  link: ResourceLink;
  dateAdded: string; // ISO YYYY-MM-DD
  /** Pinned to the top with a "Popular" badge. */
  featured?: boolean;
}

const CATEGORY_LABEL: Record<ResourceCategory, string> = {
  creative: "Creative",
  code: "Code",
};

const LINK_LABEL: Record<ResourceLink, string> = {
  figma: "Figma",
  github: "GitHub",
  website: "Website",
};

const LINK_ICON: Record<ResourceLink, React.ComponentType<{ className?: string }>> = {
  figma: Figma,
  github: Github,
  website: Globe,
};

function formatDateAdded(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const resources: Resource[] = [
  {
    id: "portfolio",
    title: "Portfolio Template",
    description:
      "Our co-founder's portfolio that helped him land jobs at Google, Salesforce, and other Fortune 500 companies. Open source and ready to customize",
    href: "https://www.figma.com/community/file/1597821544420498783/portfolio-presentation-template-built-to-land-offers",
    cover: "/images/portfolio-01.jpg",
    coverType: "image",
    coverHover: "/images/portfolio-02.jpg",
    thumb: "/images/portfolio-01.jpg",
    categories: ["creative"],
    link: "figma",
    dateAdded: "2026-02-13",
  },
  {
    id: "design-directory",
    title: "Design Directory",
    description:
      "All of our favorite design tools in one interactive directory. Open-source and ready to adapt for your own creative workflow.",
    href: "https://design-directory-blue.vercel.app/",
    cover: "/images/design-directory-01.mp4",
    coverType: "video",
    coverHover: "/images/design-directory-02.jpg",
    thumb: "/images/design-directory-02.jpg",
    categories: ["creative", "code"],
    link: "website",
    dateAdded: "2026-03-03",
  },
  {
    id: "brand-design-system",
    title: "Brand Design System",
    description:
      "Comprehensive design system optimized for brand identity in the AI era. Fully configurable with connected variables and ready to customize.",
    href: "https://www.figma.com/community/file/1618448560463755361",
    cover: "/images/brand-design-system-01.jpg",
    coverType: "image",
    coverHover: "/images/brand-design-system-02.jpg",
    thumb: "/images/brand-design-system-01.jpg",
    categories: ["creative"],
    link: "figma",
    dateAdded: "2026-03-26",
    featured: true,
  },
  {
    id: "linktree-template",
    title: "Linktree Template",
    description:
      "A beautiful, customizable link portal template built with Next.js. Open-source and ready to adapt for your own brand.",
    href: "https://github.com/opensesh/linktree-alternative",
    cover: "/images/linktree-template-01.jpg",
    coverType: "image",
    coverHover: "/images/linktree-template-02.jpg",
    thumb: "/images/linktree-template-01.jpg",
    categories: ["code"],
    link: "github",
    dateAdded: "2026-03-09",
  },
  {
    id: "karimo",
    title: "Claude Code Harness",
    description:
      "Karimo is a framework and Claude Code plugin for PRD-driven autonomous development. Think of it as plan mode on steroids.",
    href: "https://github.com/opensesh/KARIMO",
    cover: "/images/karimo-01.gif",
    coverType: "image",
    coverHover: "/images/karimo-02.jpg",
    thumb: "/images/karimo-02.jpg",
    categories: ["code"],
    link: "github",
    dateAdded: "2026-05-01",
  },
];

/* ---------- Resource item — one component, two layouts ----------
   Below `lg` the CSS lays it out as a compact row (thumb · title · meta).
   At `lg+` the same markup becomes the visual card (cover · title · date ·
   description · meta). Nothing is duplicated; only the stylesheet changes. */

function ResourceItem({
  resource,
  onPage,
  onSelect,
}: {
  resource: Resource;
  onPage: boolean;
  onSelect: (resource: Resource) => void;
}) {
  const LinkIcon = LINK_ICON[resource.link];
  const date = formatDateAdded(resource.dateAdded);

  return (
    <li className="resource-item" data-offpage={!onPage}>
      <button
        type="button"
        className="resource-item-button"
        onClick={() => onSelect(resource)}
      >
        <span className="resource-item-media">
          <img
            src={assetPath(resource.thumb)}
            alt=""
            className="resource-item-thumb"
            loading="lazy"
            draggable={false}
          />
          {resource.coverType === "video" ? (
            <video
              src={assetPath(resource.cover)}
              className="resource-item-cover"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={assetPath(resource.cover)}
              alt=""
              className="resource-item-cover"
              loading="lazy"
              draggable={false}
            />
          )}
          <img
            src={assetPath(resource.coverHover)}
            alt=""
            className="resource-item-cover-hover"
            loading="lazy"
            draggable={false}
          />
        </span>

        <span className="resource-item-body">
          <span className="resource-item-title-row">
            <span className="resource-item-title">{resource.title}</span>
            <span className="resource-item-date">{date}</span>
          </span>
          <span className="resource-item-description">{resource.description}</span>
          <span className="resource-item-meta">
            <span>{resource.categories.map((c) => CATEGORY_LABEL[c]).join(" + ")}</span>
            <span className="resource-item-meta-dot">·</span>
            <LinkIcon className="resource-item-meta-icon" />
            <span>{LINK_LABEL[resource.link]}</span>
            <span className="resource-item-meta-date">
              <span className="resource-item-meta-dot">·</span>
              {date}
            </span>
          </span>
        </span>

        {resource.featured && <span className="resource-item-badge">Popular</span>}
        <ArrowUpRight className="resource-item-arrow" aria-hidden="true" />
      </button>
    </li>
  );
}

/* ---------- Toolbar: chips (+ desktop pagination) ---------- */

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
                transition={{ type: "spring", stiffness: 520, damping: 42, mass: 0.8 }}
              />
            )}
            <span className="resource-chip-label">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const single = totalPages <= 1;
  return (
    <div
      className="resource-pagination resource-toolbar-pagination"
      data-disabled={single}
      aria-disabled={single}
    >
      <button
        type="button"
        className="resource-nav-arrow"
        onClick={() => onChange(Math.max(0, currentPage - 1))}
        disabled={single || currentPage === 0}
        aria-label="Previous resources"
      >
        <ChevronLeftIcon />
      </button>

      <div className="resource-dots">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            type="button"
            className={`resource-pagination-dot ${currentPage === index ? "active" : ""}`}
            onClick={() => onChange(index)}
            disabled={single}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>

      <button
        type="button"
        className="resource-nav-arrow"
        onClick={() => onChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={single || currentPage === totalPages - 1}
        aria-label="Next resources"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}

/* ---------- Panel ---------- */

/** Desktop cards per page. Below lg every item is visible, so paging is moot. */
const PAGE_SIZE = 3;

export function FreeResourcesPanel() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    resource: Resource | null;
  }>({ isOpen: false, resource: null });

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [page, setPage] = useState(0);

  const visible = useMemo(() => {
    const filtered = resources.filter(
      (r) => category === "all" || r.categories.includes(category)
    );
    // Featured first, then newest.
    return [...filtered].sort((a, b) => {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
      return b.dateAdded.localeCompare(a.dateAdded);
    });
  }, [category]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  const handleCategoryChange = (next: CategoryFilter) => {
    setCategory(next);
    setPage(0);
  };

  const handleSelect = (resource: Resource) => {
    if (hasResourceAccess()) {
      window.open(resource.href, "_blank", "noopener,noreferrer");
      return;
    }
    setModalState({ isOpen: true, resource });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, resource: null });
  };

  return (
    <>
      <div className="resource-toolbar">
        <ResourceChips value={category} onChange={handleCategoryChange} />
        <Pagination currentPage={safePage} totalPages={totalPages} onChange={setPage} />
      </div>

      <div className="bin-panel">
        <motion.ul
          key={`${category}-${safePage}`}
          className="resource-list"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          {visible.map((resource, index) => (
            <ResourceItem
              key={resource.id}
              resource={resource}
              onPage={Math.floor(index / PAGE_SIZE) === safePage}
              onSelect={handleSelect}
            />
          ))}
        </motion.ul>
      </div>

      <SubscribeModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSkip={handleCloseModal}
        resourceTitle={modalState.resource?.title ?? ""}
        resourceHref={modalState.resource?.href ?? "#"}
      />
    </>
  );
}
