/**
 * Lazy loader for the Spotify Embed iFrame API.
 *
 * The script is only injected on the first call (typically the first tap on
 * the play button) so the portal ships zero third-party JS until a visitor
 * actually wants music. The returned promise is memoised — subsequent callers
 * get the same IFrameAPI instance.
 *
 * Docs: https://developer.spotify.com/documentation/embeds/references/iframe-api
 */

export interface SpotifyPlaybackState {
  isPaused: boolean;
  isBuffering: boolean;
  duration: number;
  position: number;
}

export interface SpotifyEmbedController {
  play(): void;
  pause(): void;
  resume(): void;
  togglePlay(): void;
  seek(seconds: number): void;
  loadUri(uri: string): void;
  destroy(): void;
  addListener(event: "ready", callback: () => void): void;
  addListener(
    event: "playback_update",
    callback: (event: { data: SpotifyPlaybackState }) => void
  ): void;
  removeListener(event: "ready" | "playback_update"): void;
}

export interface SpotifyControllerOptions {
  uri: string;
  width?: number | string;
  height?: number | string;
  theme?: "dark" | "light";
}

export interface SpotifyIFrameAPI {
  createController(
    element: HTMLElement,
    options: SpotifyControllerOptions,
    callback: (controller: SpotifyEmbedController) => void
  ): void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
  }
}

const SCRIPT_SRC = "https://open.spotify.com/embed/iframe-api/v1";

let apiPromise: Promise<SpotifyIFrameAPI> | null = null;

export function loadSpotifyIframeApi(timeoutMs = 8000): Promise<SpotifyIFrameAPI> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<SpotifyIFrameAPI>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Spotify iframe API needs a browser"));
      return;
    }

    const fail = (message: string) => {
      apiPromise = null; // allow a retry on the next call
      reject(new Error(message));
    };

    const timer = window.setTimeout(
      () => fail("Spotify iframe API timed out"),
      timeoutMs
    );

    window.onSpotifyIframeApiReady = (api) => {
      window.clearTimeout(timer);
      resolve(api);
    };

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timer);
      fail("Spotify iframe API failed to load");
    };
    document.head.appendChild(script);
  });

  return apiPromise;
}
