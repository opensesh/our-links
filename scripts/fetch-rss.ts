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
    const response = await fetch(postUrl, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return { image: null, description: null };

    const html = await response.text();

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

async function fetchRss(): Promise<string | null> {
  // Try direct fetch first
  try {
    console.log("Attempting direct fetch from Substack...");
    const response = await fetch(RSS_URL, { headers: FETCH_HEADERS });
    if (response.ok) {
      return await response.text();
    }
    console.log(`Direct fetch failed: ${response.status} ${response.statusText}`);
  } catch (err) {
    console.log(`Direct fetch error: ${err}`);
  }

  // Try with a CORS proxy (works in Node.js too)
  const proxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(RSS_URL)}`,
    `https://corsproxy.io/?${encodeURIComponent(RSS_URL)}`,
  ];

  for (const proxyUrl of proxies) {
    try {
      console.log(`Trying proxy: ${proxyUrl.split("?")[0]}...`);
      const response = await fetch(proxyUrl, {
        headers: FETCH_HEADERS,
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) {
        const text = await response.text();
        if (text.includes("<rss") || text.includes("<?xml")) {
          return text;
        }
      }
    } catch (err) {
      console.log(`Proxy failed: ${err}`);
    }
  }

  return null;
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

  // Pull the live post page's og:image and og:description. The author-curated
  // og:image is preferred over content-extracted images, and og:description
  // updates faster than the RSS <description> field (which is cached upstream).
  for (const post of posts) {
    console.log(`Fetching og meta for: ${post.title.slice(0, 40)}...`);
    const og = await fetchOgMeta(post.link);
    if (og.image) {
      post.imageUrl = og.image;
    }
    if (og.description) {
      post.description = og.description;
    }
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
