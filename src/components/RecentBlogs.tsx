"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpDown } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  imageUrl: string | null;
  link: string;
}

type SortOrder = "recent" | "oldest";

const SORT_LABEL: Record<SortOrder, string> = {
  recent: "Recently added",
  oldest: "Oldest first",
};

const PAGE_SIZE = 3;

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

function getPostTimestamp(post: BlogPost): number {
  // Blog IDs are formatted `blog-{index}-{epochMs}` by scripts/fetch-rss.ts.
  // Prefer that exact timestamp; fall back to parsing the display date.
  const fromId = Number(post.id.split("-").pop());
  if (Number.isFinite(fromId) && fromId > 0) return fromId;
  return new Date(post.date).getTime();
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="blog-card group flex flex-col sm:flex-row gap-3 sm:gap-4"
    >
      <div className="w-full sm:w-48 flex-shrink-0 rounded-lg bg-[#2a2a2a] p-3 sm:p-4">
        {/* Inner box matches Substack og:image aspect (2:1) so the thumbnail
            sits flush with no letterboxing or cropping. */}
        <div className="w-full aspect-[2/1] rounded overflow-hidden">
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt=""
              className="w-full h-full object-contain rounded"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--fg-quaternary)]">
              <span className="text-xl font-bold font-accent">OS</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <h4 className="blog-card-title font-accent font-bold text-[var(--color-vanilla)] line-clamp-2 sm:line-clamp-1 leading-tight">
          {post.title}
        </h4>

        <div className="flex flex-wrap items-center gap-x-2 text-[var(--fg-quaternary)]">
          <span className="blog-card-author">by {post.author}</span>
          <span className="text-[var(--fg-tertiary)]">•</span>
          <span className="blog-card-date">{post.date}</span>
        </div>

        <p className="blog-card-description text-[var(--fg-secondary)] line-clamp-3">
          {post.description}
        </p>
      </div>
    </a>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="blog-card flex flex-col sm:flex-row gap-3 sm:gap-4">
      <div className="w-full sm:w-48 aspect-[2/1] flex-shrink-0 rounded-lg bg-[#2a2a2a] animate-pulse" />
      <div className="flex-1 flex flex-col justify-center gap-2">
        <div className="h-4 w-3/4 bg-[#2a2a2a] rounded animate-pulse" />
        <div className="h-3 w-24 bg-[#2a2a2a] rounded animate-pulse" />
        <div className="h-3 w-full bg-[#2a2a2a] rounded animate-pulse" />
      </div>
    </div>
  );
}

export function RecentBlogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const [sortBy, setSortBy] = useState<SortOrder>("recent");
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const sortRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const basePath = window.location.pathname.replace(/\/$/, "") || "";
        const blogsUrl = `${basePath}/data/blogs.json`;
        const response = await fetch(blogsUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch blogs: ${response.status}`);
        }
        const data: BlogPost[] = await response.json();
        setPosts(data);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, []);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const ta = getPostTimestamp(a);
      const tb = getPostTimestamp(b);
      return sortBy === "recent" ? tb - ta : ta - tb;
    });
  }, [posts, sortBy]);

  const pages = useMemo(() => {
    const out: BlogPost[][] = [];
    for (let i = 0; i < sortedPosts.length; i += PAGE_SIZE) {
      out.push(sortedPosts.slice(i, i + PAGE_SIZE));
    }
    return out;
  }, [sortedPosts]);

  const totalPages = Math.max(pages.length, 1);

  // Reset to page 0 when sort changes — render-time adjustment pattern.
  const [lastSort, setLastSort] = useState<SortOrder>(sortBy);
  if (lastSort !== sortBy) {
    setLastSort(sortBy);
    setCurrentPage(0);
  }

  const safePageIndex = Math.min(currentPage, totalPages - 1);
  const currentPagePosts = pages[safePageIndex] ?? [];

  // ESC closes the sort menu.
  useEffect(() => {
    if (!sortOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSortOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sortOpen]);

  // Click outside closes the sort popover.
  useEffect(() => {
    if (!sortOpen) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (sortRef.current && !sortRef.current.contains(t)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [sortOpen]);

  if (error || (!isLoading && posts.length === 0)) {
    return null;
  }

  const handlePrevious = () => setCurrentPage((p) => Math.max(0, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <section className="w-full mt-12 sm:mt-16">
      <div className="max-w-[var(--content-max-width)] mx-auto">
        {/* Heading row: title + sort */}
        <div className="resource-header">
          <h2
            className="font-sans text-[1.375rem] font-bold"
            style={{ color: "var(--color-vanilla)", fontFamily: "var(--font-sans)" }}
          >
            Recent Blogs
          </h2>

          <div className="resource-controls">
            <div className="resource-control-anchor" ref={sortRef}>
              <button
                type="button"
                className="resource-control-icon-button"
                onClick={() => setSortOpen((v) => !v)}
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
          </div>
        </div>

        {/* Paginated card stack */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${safePageIndex}-${sortBy}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex flex-col gap-3"
            >
              {isLoading ? (
                <>
                  <BlogCardSkeleton />
                  <BlogCardSkeleton />
                  <BlogCardSkeleton />
                </>
              ) : (
                currentPagePosts.map((post) => <BlogCard key={post.id} post={post} />)
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination — only when there's more than one page */}
        {!isLoading && totalPages > 1 && (
          <div className="resource-pagination">
            <button
              className="resource-nav-arrow"
              onClick={handlePrevious}
              disabled={safePageIndex === 0}
              aria-label="Previous blogs"
            >
              <ChevronLeftIcon />
            </button>

            <div className="resource-dots">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`resource-pagination-dot ${safePageIndex === i ? "active" : ""}`}
                  onClick={() => setCurrentPage(i)}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>

            <button
              className="resource-nav-arrow"
              onClick={handleNext}
              disabled={safePageIndex === totalPages - 1}
              aria-label="Next blogs"
            >
              <ChevronRightIcon />
            </button>
          </div>
        )}

        {/* Subscribe form — moved below pagination */}
        <div className="mt-5 sm:mt-6">
          <form
            action="https://opensession.substack.com/api/v1/free?nojs=true"
            method="post"
            className="subscribe-form"
          >
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="subscribe-input"
            />
            <button type="submit" className="subscribe-button">
              Subscribe
            </button>
          </form>
          <p className="subscribe-hint">
            Get our latest posts delivered to your inbox
          </p>
        </div>
      </div>
    </section>
  );
}
