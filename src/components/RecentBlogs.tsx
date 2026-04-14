"use client";

import { useState, useEffect } from "react";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  imageUrl: string | null;
  link: string;
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="blog-card group flex flex-col sm:flex-row gap-3 sm:gap-4"
    >
      {/* Outer container - padding + background color */}
      <div className="w-full sm:w-48 flex-shrink-0 rounded-lg bg-[#2a2a2a] p-2 sm:p-3">
        {/* Inner container - true 16:9 aspect ratio with rounded corners */}
        <div className="w-full aspect-video rounded overflow-hidden">
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

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        {/* Title - truncate to 1 line on desktop, allow 2 lines on mobile */}
        <h4 className="blog-card-title font-accent font-bold text-[var(--color-vanilla)] line-clamp-2 sm:line-clamp-1 leading-tight">
          {post.title}
        </h4>

        {/* Author + Date - same line, wraps on mobile */}
        <div className="flex flex-wrap items-center gap-x-2 text-[var(--fg-quaternary)]">
          <span className="blog-card-author">by {post.author}</span>
          <span className="text-[var(--fg-tertiary)]">•</span>
          <span className="blog-card-date">{post.date}</span>
        </div>

        {/* Description */}
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
      <div className="w-full sm:w-48 aspect-video flex-shrink-0 rounded-lg bg-[#2a2a2a] animate-pulse" />
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

  useEffect(() => {
    async function loadPosts() {
      try {
        // Derive basePath from current URL for GitHub Pages compatibility
        // e.g., https://opensesh.github.io/our-links/ -> /our-links
        const basePath = window.location.pathname.replace(/\/$/, "") || "";
        const blogsUrl = `${basePath}/data/blogs.json`;

        // Fetch pre-built static JSON (generated at build time)
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

  // Don't render if error or no posts
  if (error || (!isLoading && posts.length === 0)) {
    return null;
  }

  return (
    <section className="w-full mt-6 sm:mt-8">
      {/* Container with max-width */}
      <div className="max-w-[var(--content-max-width)] mx-auto">
        {/* Heading - Neue Haas Grotesk */}
        <h2
          className="text-xl font-bold mb-3 sm:mb-4"
          style={{ color: "var(--color-vanilla)" }}
        >
          Recent Blogs
        </h2>

        {/* Subscribe form - right after heading */}
        <div className="mb-4 sm:mb-6">
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

        {/* Blog cards - vertical stack */}
        <div className="flex flex-col gap-3">
          {isLoading ? (
            <>
              <BlogCardSkeleton />
              <BlogCardSkeleton />
              <BlogCardSkeleton />
            </>
          ) : (
            posts.map((post) => <BlogCard key={post.id} post={post} />)
          )}
        </div>
      </div>
    </section>
  );
}
