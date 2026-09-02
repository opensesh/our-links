"use client";

import { socialLinks } from "./CardNav";

/** Every channel as an equal-weight tile — the "ecosystem" bin. */
export function SocialLinksPanel() {
  return (
    <ul className="social-grid" aria-label="Social links">
      {socialLinks.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="social-tile"
          >
            <span className="social-tile-icon">{link.icon}</span>
            <span>{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
