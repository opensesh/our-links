"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  imageUrl: string | null;
  link: string;
}

const PAGE_SIZE = 3;

/* Posts are fetched once per page load and shared across bin open/close
   cycles, so reopening the bin never flashes skeletons or resizes the
   panel while its height animation is still running. */
let postsCache: BlogPost[] | null = null;
let postsPromise: Promise<BlogPost[]> | null = null;

export function prefetchBlogPosts(): Promise<BlogPost[]> {
  if (postsCache) return Promise.resolve(postsCache);
  if (postsPromise) return postsPromise;
  postsPromise = (async () => {
    const basePath = window.location.pathname.replace(/\/$/, "") || "";
    const response = await fetch(`${basePath}/data/blogs.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.status}`);
    }
    const data: BlogPost[] = await response.json();
    postsCache = data;
    return data;
  })().catch((err) => {
    postsPromise = null; // allow a retry on the next call
    throw err;
  });
  return postsPromise;
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

/** Body of the "Our Blogs" bin: newest posts, paged, plus the Substack form. */
export function BlogsPanel() {
  const [posts, setPosts] = useState<BlogPost[]>(() => postsCache ?? []);
  const [isLoading, setIsLoading] = useState(() => postsCache === null);
  const [error, setError] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (postsCache) return;
    let cancelled = false;
    prefetchBlogPosts()
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const pages = useMemo(() => {
    const sorted = [...posts].sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a));
    const out: BlogPost[][] = [];
    for (let i = 0; i < sorted.length; i += PAGE_SIZE) {
      out.push(sorted.slice(i, i + PAGE_SIZE));
    }
    return out;
  }, [posts]);

  const totalPages = Math.max(pages.length, 1);
  const safePageIndex = Math.min(currentPage, totalPages - 1);
  const currentPagePosts = pages[safePageIndex] ?? [];

  const failed = error || (!isLoading && posts.length === 0);

  return (
    <div className="bin-panel-inner">
      {/* Subscribe leads: it's the one action we want from this bin. */}
      <form
        action="https://opensession.substack.com/api/v1/free?nojs=true"
        method="post"
        className="subscribe-form mb-4"
        aria-label="Subscribe to our Substack"
      >
        <input
          type="email"
          name="email"
          placeholder="Your email for new posts"
          required
          className="subscribe-input"
        />
        <button type="submit" className="subscribe-button">
          Subscribe
        </button>
      </form>

      {failed ? (
        <p className="text-sm text-[var(--fg-secondary)] py-2">
          Fresh posts live on{" "}
          <a
            href="https://opensession.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-aperol)] hover:underline underline-offset-2"
          >
            our Substack
          </a>
          .
        </p>
      ) : (
        <>
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={safePageIndex}
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

          {!isLoading && totalPages > 1 && (
            <div className="resource-pagination">
              <button
                className="resource-nav-arrow"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePageIndex === totalPages - 1}
                aria-label="Next blogs"
              >
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
}
