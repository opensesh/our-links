/**
 * RSS Pre-fetch Script
 *
 * Fetches RSS at build time and saves as JSON for static consumption.
 * Run with: bun run scripts/fetch-rss.ts
 *
 * This eliminates CORS issues and third-party proxy dependencies by
 * fetching directly from Substack in a Node.js environment.
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

const RSS_URL = "https://opensession.substack.com/feed";
const OUTPUT_DIR = join(process.cwd(), "public", "data");
const OUTPUT_FILE = join(OUTPUT_DIR, "blogs.json");

// Headers to avoid bot detection (Substack blocks requests without proper headers)
const FETCH_HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; OpenSession/1.0; +https://opensession.co)",
  "Accept": "application/rss+xml, application/xml, text/xml, */*",
};

interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  imageUrl: string | null;
  link: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function extractImageFromHtml(html: string): string | null {
  if (!html) return null;

  // Look for img tags with src attribute
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch?.[1]) {
    let url = imgMatch[1];
    // Normalize Substack CDN URLs to a reasonable size
    if (url.includes("substackcdn.com")) {
      url = url.replace(/\/w_\d+,c_limit\//, "/w_400,c_limit/");
    }
    return url;
  }

  return null;
}

function getTagContent(item: string, tagName: string): string {
  // Handle CDATA sections
  const cdataPattern = new RegExp(
    `<${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tagName}>`,
    "i"
  );
  const cdataMatch = item.match(cdataPattern);
  if (cdataMatch) return cdataMatch[1].trim();

  // Handle regular tags
  const pattern = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "i");
  const match = item.match(pattern);
  return match ? match[1].trim() : "";
}

function getNamespacedTagContent(item: string, ns: string, tagName: string): string {
  // Try namespace:tag format
  const nsPattern = new RegExp(
    `<${ns}:${tagName}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${ns}:${tagName}>`,
    "i"
  );
  const nsMatch = item.match(nsPattern);
  if (nsMatch) return nsMatch[1].trim();

  const nsPattern2 = new RegExp(`<${ns}:${tagName}[^>]*>([\\s\\S]*?)</${ns}:${tagName}>`, "i");
  const nsMatch2 = item.match(nsPattern2);
  return nsMatch2 ? nsMatch2[1].trim() : "";
}

function getAttributeValue(tag: string, attrName: string): string {
  const pattern = new RegExp(`${attrName}=["']([^"']+)["']`, "i");
  const match = tag.match(pattern);
  return match ? match[1] : "";
}

function parseRssXml(xmlText: string): BlogPost[] {
  const items: BlogPost[] = [];

  // Extract all <item> elements
  const itemPattern = /<item>([\s\S]*?)<\/item>/gi;
  let itemMatch;

  while ((itemMatch = itemPattern.exec(xmlText)) !== null) {
    const itemContent = itemMatch[1];

    const title = getTagContent(itemContent, "title");
    const link = getTagContent(itemContent, "link");
    const description = getTagContent(itemContent, "description");
    const pubDate = getTagContent(itemContent, "pubDate");

    // Get author from dc:creator or author tag
    let author = getNamespacedTagContent(itemContent, "dc", "creator");
    if (!author) author = getTagContent(itemContent, "author");
    if (!author) author = "Open Session";

    // Get content from content:encoded
    const content = getNamespacedTagContent(itemContent, "content", "encoded") || description;

    // Get image URL - try multiple sources
    let imageUrl: string | null = null;

    // 1. Try media:thumbnail
    const mediaThumbnailMatch = itemContent.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
    if (mediaThumbnailMatch) {
      imageUrl = mediaThumbnailMatch[1];
    }

    // 2. Try media:content
    if (!imageUrl) {
      const mediaContentMatch = itemContent.match(/<media:content[^>]+url=["']([^"']+)["']/i);
      if (mediaContentMatch) {
        imageUrl = mediaContentMatch[1];
      }
    }

    // 3. Try enclosure if it's an image
    if (!imageUrl) {
      const enclosureMatch = itemContent.match(/<enclosure[^>]+>/i);
      if (enclosureMatch) {
        const enclosureType = getAttributeValue(enclosureMatch[0], "type");
        if (enclosureType?.startsWith("image/")) {
          imageUrl = getAttributeValue(enclosureMatch[0], "url");
        }
      }
    }

    // 4. Extract from content HTML
    if (!imageUrl) {
      imageUrl = extractImageFromHtml(content);
    }

    // 5. Extract from description HTML
    if (!imageUrl) {
      imageUrl = extractImageFromHtml(description);
    }

    // Create unique ID
    const id = `blog-${items.length}-${new Date(pubDate).getTime()}`;

    // Clean and truncate description
    const cleanDescription = stripHtml(description).slice(0, 200) + (description.length > 200 ? "..." : "");

    items.push({
      id,
      title,
      description: cleanDescription,
      date: formatDate(pubDate),
      author,
      imageUrl,
      link,
    });
  }

  return items;
}

function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

interface OgMeta {
  image: string | null;
  description: string | null;
}

// The Substack RSS feed caches its <description> field, so author edits don't
// surface for hours. The live post page's og:/twitter: meta tags update much
// faster, so we fetch them as the source of truth.
async function fetchOgMeta(postUrl: string): Promise<OgMeta> {
  try {
    const html = await fetchWithFallback(
      postUrl,
      (text) => text.includes("<meta"),
      "og"
    );
    if (!html) return { image: null, description: null };

    const ogImageMatch =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const twitterImageMatch =
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

    const ogDescMatch =
      html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
    const twitterDescMatch =
      html.match(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:description["']/i);

    const rawDesc = ogDescMatch?.[1] || twitterDescMatch?.[1] || null;

    return {
      image: ogImageMatch?.[1] || twitterImageMatch?.[1] || null,
      description: rawDesc ? decodeHtmlEntities(rawDesc).trim() : null,
    };
  } catch {
    return { image: null, description: null };
  }
}

/**
 * Substack answers 403 to datacentre IPs, so CI never gets a direct response.
 * Try direct first — it is the fast path on a normal network — then fall back
 * to the CORS proxies. Every Substack request goes through here; a request that
 * only tries direct will silently return nothing on the GitHub Actions runner.
 */
async function fetchWithFallback(
  url: string,
  isValid: (text: string) => boolean,
  label: string
): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(10000),
    });
    if (response.ok) {
      const text = await response.text();
      if (isValid(text)) return text;
      console.log(`  ${label}: direct fetch returned unusable content, trying proxies`);
    } else {
      console.log(
        `  ${label}: direct fetch failed (${response.status} ${response.statusText}), trying proxies`
      );
    }
  } catch (err) {
    console.log(`  ${label}: direct fetch error (${err}), trying proxies`);
  }

  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      const response = await fetch(proxyUrl, {
        headers: FETCH_HEADERS,
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok) {
        const text = await response.text();
        if (isValid(text)) return text;
      }
    } catch (err) {
      console.log(`  ${label}: proxy ${proxyUrl.split("?")[0]} failed (${err})`);
    }
  }

  return null;
}

async function fetchRss(): Promise<string | null> {
  console.log("Attempting direct fetch from Substack...");
  return fetchWithFallback(
    RSS_URL,
    (text) => text.includes("<rss") || text.includes("<?xml"),
    "RSS"
  );
}

async function main() {
  console.log("Fetching RSS from Substack...\n");

  const xmlText = await fetchRss();

  if (!xmlText) {
    // Check if we have existing data to fall back to
    if (existsSync(OUTPUT_FILE)) {
      console.log("\nFailed to fetch fresh RSS data.");
      console.log("Using existing blogs.json (build will continue with cached data)");
      const existing = JSON.parse(readFileSync(OUTPUT_FILE, "utf-8"));
      console.log(`\nExisting data has ${existing.length} posts:`);
      existing.forEach((post: BlogPost, i: number) => {
        console.log(`  ${i + 1}. ${post.title}`);
      });
      return; // Exit successfully with existing data
    }
    throw new Error("Failed to fetch RSS and no existing data available");
  }

  console.log(`\nReceived ${xmlText.length} bytes of XML`);

  const posts = parseRssXml(xmlText);
  console.log(`Parsed ${posts.length} blog posts`);

  // Last good values, keyed by post URL. A thumbnail we already have on disk is
  // better than the "OS" placeholder, so an upstream block degrades to stale
  // rather than blank.
  const cached = new Map<string, BlogPost>();
  if (existsSync(OUTPUT_FILE)) {
    try {
      const previous = JSON.parse(readFileSync(OUTPUT_FILE, "utf-8")) as BlogPost[];
      for (const post of previous) cached.set(post.link, post);
    } catch {
      console.log("Existing blogs.json could not be parsed; continuing without it");
    }
  }

  // Pull the live post page's og:image and og:description. The author-curated
  // og:image is preferred over content-extracted images, and og:description
  // updates faster than the RSS <description> field (which is cached upstream).
  // Spaced out because the CORS proxies rate-limit a rapid burst, and a
  // throttled proxy looks exactly like a post with no image.
  for (let index = 0; index < posts.length; index++) {
    const post = posts[index];
    if (index > 0) await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log(`Fetching og meta for: ${post.title.slice(0, 40)}...`);
    const og = await fetchOgMeta(post.link);
    if (og.image) {
      post.imageUrl = og.image;
    }
    if (og.description) {
      post.description = og.description;
    }

    if (!post.imageUrl) {
      const previousImage = cached.get(post.link)?.imageUrl;
      if (previousImage) {
        post.imageUrl = previousImage;
        console.log(`  no image found upstream — kept the cached thumbnail`);
      }
    }
  }

  const missing = posts.filter((post) => !post.imageUrl);
  if (missing.length > 0) {
    console.log(`\nWARNING: ${missing.length}/${posts.length} posts have no thumbnail:`);
    missing.forEach((post) => console.log(`  - ${post.title}`));
  }

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created directory: ${OUTPUT_DIR}`);
  }

  // Write JSON file
  writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2));
  console.log(`\nSaved ${posts.length} blog posts to ${OUTPUT_FILE}`);

  // Log post titles for verification
  console.log("\nBlog posts:");
  posts.forEach((post, i) => {
    console.log(`  ${i + 1}. ${post.title}`);
  });
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
