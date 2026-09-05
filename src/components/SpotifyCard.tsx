"use client";

import { useState } from "react";

const PLAYLIST_ID = "6womgBeE0Ag3dnfKZX31eM";
const EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;

/**
 * "Office Jams" — the studio playlist, straight from Spotify's own embed.
 * The player already shows the cover, name, and tracklist, so the card is
 * just a frame around it with a shimmer until the iframe paints.
 */
export function SpotifyCard() {
  const [loaded, setLoaded] = useState(false);

  return (
    <section className="w-full" aria-labelledby="office-jams-heading">
      <h2 id="office-jams-heading" className="section-title mb-2">
        Office Jams
      </h2>

      <div className="spotify-card">
        <div className="spotify-embed" data-loaded={loaded}>
          {!loaded && <div className="spotify-embed-skeleton" aria-hidden="true" />}
          <iframe
            title="Open Session Radio on Spotify"
            src={EMBED_URL}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
    </section>
  );
}
