/**
 * Provider-agnostischer Video-Player für Academy-Lektionen.
 * Erkennt YouTube (→ datenschutzfreundliches youtube-nocookie-Embed),
 * Vimeo (→ player.vimeo.com) und spielt alles andere als direkte
 * Videodatei ab (MP4, Vercel Blob, …). Reine Server-Komponente.
 */

function youtubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
  if (host === "youtube.com" || host === "youtube-nocookie.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const m = url.pathname.match(/^\/(embed|shorts|live)\/([\w-]{6,})/);
    if (m) return m[2];
  }
  return null;
}

function vimeoId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null;
  const m = url.pathname.match(/(\d{6,})/);
  return m ? m[1] : null;
}

export function LessonPlayer({ videoUrl, title }: { videoUrl: string; title: string }) {
  let url: URL | null = null;
  try {
    url = new URL(videoUrl);
  } catch {
    return null;
  }

  const yt = youtubeId(url);
  const vimeo = yt ? null : vimeoId(url);

  const frameClass =
    "aspect-video w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-black";

  if (yt) {
    return (
      <div className={frameClass}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${yt}?rel=0`}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (vimeo) {
    return (
      <div className={frameClass}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeo}?dnt=1`}
          title={title}
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={frameClass}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video src={videoUrl} controls className="h-full w-full" preload="metadata" />
    </div>
  );
}
