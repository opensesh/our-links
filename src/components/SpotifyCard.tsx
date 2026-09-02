"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { assetPath } from "@/lib/assetPath";
import {
  loadSpotifyIframeApi,
  type SpotifyEmbedController,
} from "@/lib/spotifyEmbed";

const PLAYLIST_ID = "6womgBeE0Ag3dnfKZX31eM";
const PLAYLIST_URI = `spotify:playlist:${PLAYLIST_ID}`;
const EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;
const EMBED_HEIGHT = 152;
/** If the iframe API never reports ready, fall back to a plain embed. */
const READY_TIMEOUT_MS = 10000;

type Status = "loading" | "ready" | "fallback";

function Equalizer() {
  return (
    <span className="eq" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

/**
 * "Office Jams" — the studio playlist.
 *
 * The Spotify player mounts on its own once the page is idle (so it never
 * competes with the hero for first paint) and shows the full playlist. Our
 * vinyl + aperol button drive the same controller: the record spins with an
 * aperol glow only while audio is actually playing.
 */
export function SpotifyCard() {
  const [status, setStatus] = useState<Status>("loading");
  const [playing, setPlaying] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let readyTimer: number | null = null;

    const clearReadyTimer = () => {
      if (readyTimer !== null) {
        window.clearTimeout(readyTimer);
        readyTimer = null;
      }
    };

    const init = async () => {
      readyTimer = window.setTimeout(() => {
        if (!cancelled) setStatus((s) => (s === "loading" ? "fallback" : s));
      }, READY_TIMEOUT_MS);

      try {
        const api = await loadSpotifyIframeApi();
        if (cancelled) return;
        // The API replaces the element we hand it with an <iframe>, so give it
        // a node React doesn't own.
        const mount = document.createElement("div");
        host.replaceChildren(mount);

        api.createController(
          mount,
          { uri: PLAYLIST_URI, width: "100%", height: EMBED_HEIGHT, theme: "dark" },
          (controller) => {
            controllerRef.current = controller;
            controller.addListener("ready", () => {
              clearReadyTimer();
              if (!cancelled) setStatus("ready");
            });
            controller.addListener("playback_update", (e) => {
              clearReadyTimer();
              if (cancelled) return;
              setStatus("ready");
              setPlaying(!e.data.isPaused);
            });
          }
        );
      } catch {
        clearReadyTimer();
        if (!cancelled) setStatus("fallback");
      }
    };

    // Defer until the browser is idle so the hero paints first.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const handle = hasIdle
      ? window.requestIdleCallback(() => void init(), { timeout: 1500 })
      : window.setTimeout(() => void init(), 600);

    return () => {
      cancelled = true;
      clearReadyTimer();
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  const handleToggle = () => {
    if (status === "ready") controllerRef.current?.togglePlay();
  };

  const playLabel = playing ? "Pause Open Session Radio" : "Play Open Session Radio";
  const canToggle = status === "ready";

  return (
    <section className="w-full" aria-labelledby="office-jams-heading">
      <h2 id="office-jams-heading" className="section-label mb-2">
        Office Jams
      </h2>

      <div className="spotify-card">
        <div className="spotify-card-head">
          <button
            type="button"
            className="vinyl-button"
            data-playing={playing}
            onClick={handleToggle}
            disabled={!canToggle}
            aria-label={playLabel}
          >
            <span className="vinyl-glow" aria-hidden="true" />
            <img
              src={assetPath("/images/vinyl-cover.png")}
              alt=""
              className="vinyl"
              draggable={false}
            />
          </button>

          <div className="spotify-copy">
            <span className="spotify-eyebrow">
              {playing ? (
                <>
                  <Equalizer />
                  Now playing
                </>
              ) : (
                "On rotation"
              )}
            </span>
            {/* The embed carries the playlist name; keep it for assistive tech only. */}
            <h3 className="sr-only">Open Session Radio</h3>
            <p className="spotify-sub">The playlist we build to. A taste of our vibe.</p>
          </div>

          <button
            type="button"
            className="spotify-play"
            onClick={handleToggle}
            disabled={!canToggle}
            aria-label={playLabel}
            aria-pressed={playing}
          >
            {status === "loading" ? (
              <span className="spotify-spinner" aria-hidden="true" />
            ) : playing ? (
              <Pause size={16} fill="currentColor" strokeWidth={0} />
            ) : (
              <Play size={16} fill="currentColor" strokeWidth={0} className="ml-0.5" />
            )}
          </button>
        </div>

        <div className="spotify-embed" data-status={status}>
          <div ref={hostRef} className="spotify-embed-host" />

          {status === "loading" && <div className="spotify-embed-skeleton" aria-hidden="true" />}

          {status === "fallback" && (
            <iframe
              title="Open Session Radio on Spotify"
              src={EMBED_URL}
              height={EMBED_HEIGHT}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </section>
  );
}
