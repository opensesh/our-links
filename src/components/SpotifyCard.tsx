"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { assetPath } from "@/lib/assetPath";
import {
  loadSpotifyIframeApi,
  type SpotifyEmbedController,
} from "@/lib/spotifyEmbed";

const PLAYLIST_ID = "6womgBeE0Ag3dnfKZX31eM";
const PLAYLIST_URI = `spotify:playlist:${PLAYLIST_ID}`;
const PLAYLIST_URL = `https://open.spotify.com/playlist/${PLAYLIST_ID}`;
const EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;
const EMBED_HEIGHT = 152;
/** If the iframe API never reports ready, fall back to a plain embed. */
const READY_TIMEOUT_MS = 10000;

type Status = "idle" | "loading" | "ready" | "fallback";

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
 * "Office Jams" — the studio playlist, above the fold.
 *
 * Nothing from Spotify loads until the first tap on play. That tap injects
 * the Embed iFrame API, mounts the player, and starts playback; from then on
 * the aperol button and the vinyl toggle the same controller, and the record
 * spins (with an aperol glow) only while audio is actually playing.
 */
export function SpotifyCard() {
  const [status, setStatus] = useState<Status>("idle");
  const [playing, setPlaying] = useState(false);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const readyTimerRef = useRef<number | null>(null);

  const clearReadyTimer = () => {
    if (readyTimerRef.current !== null) {
      window.clearTimeout(readyTimerRef.current);
      readyTimerRef.current = null;
    }
  };

  const initPlayer = useCallback(async () => {
    const host = hostRef.current;
    if (!host) return;
    setStatus("loading");

    readyTimerRef.current = window.setTimeout(() => {
      setStatus((s) => (s === "loading" ? "fallback" : s));
    }, READY_TIMEOUT_MS);

    try {
      const api = await loadSpotifyIframeApi();
      // The API replaces the element we hand it with an <iframe>, so give it a
      // node React doesn't own.
      const mount = document.createElement("div");
      host.replaceChildren(mount);

      api.createController(
        mount,
        { uri: PLAYLIST_URI, width: "100%", height: EMBED_HEIGHT, theme: "dark" },
        (controller) => {
          controllerRef.current = controller;
          controller.addListener("ready", () => {
            clearReadyTimer();
            setStatus("ready");
            controller.play();
          });
          controller.addListener("playback_update", (e) => {
            clearReadyTimer();
            setStatus((s) => (s === "ready" ? s : "ready"));
            setPlaying(!e.data.isPaused);
          });
        }
      );
    } catch {
      clearReadyTimer();
      setStatus("fallback");
    }
  }, []);

  const handlePlay = () => {
    if (status === "idle") {
      void initPlayer();
      return;
    }
    if (status === "ready" && controllerRef.current) {
      controllerRef.current.togglePlay();
    }
    // "loading": wait. "fallback": the plain embed has its own controls.
  };

  useEffect(() => {
    return () => {
      clearReadyTimer();
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  const playLabel = playing ? "Pause Open Session Radio" : "Play Open Session Radio";

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
            onClick={handlePlay}
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
            <h3 className="spotify-title">Open Session Radio</h3>
            <p className="spotify-sub">The playlist we build to. A taste of our vibe.</p>
          </div>

          <button
            type="button"
            className="spotify-play"
            onClick={handlePlay}
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

          {status === "fallback" && (
            <iframe
              title="Open Session Radio on Spotify"
              src={EMBED_URL}
              height={EMBED_HEIGHT}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          )}

          {(status === "idle" || status === "loading") && (
            <div className="spotify-embed-placeholder">
              <button type="button" className="spotify-embed-cta" onClick={handlePlay}>
                {status === "loading" ? "Loading the player…" : "Tap play to load the player"}
              </button>
              <a
                href={PLAYLIST_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="spotify-open-link"
              >
                Open in Spotify
                <ArrowUpRight size={12} aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
