/**
 * Build-time HTML mirror utility.
 *
 * Fetches a remote page (typically a sibling Odyssey-family site) and
 * extracts the inner HTML of its primary <article> tag, so a consuming
 * Astro page can re-render that body inside its own layout.
 *
 * The fetch happens during `astro build`, not at runtime — meaning the
 * mirrored content is baked into the static output. If the upstream is
 * later updated, the consumer redeploys to pick up changes.
 *
 * If the upstream is unreachable at build time, this throws — callers
 * can pass a `fallback` to render canned text instead of failing the
 * build. Use that for must-not-break-deploy pages like /privacy.
 */

export interface MirrorOptions {
  /** Override the user-agent sent in the fetch. */
  userAgent?: string;
  /** Tag to extract — defaults to "article". */
  selector?: 'article' | 'main';
  /** Strip these CSS classes from extracted output (regex on class attr). */
  stripClasses?: RegExp;
  /** If the fetch fails, return this instead of throwing. */
  fallback?: string;
  /** Max bytes to download (defends against runaway responses). */
  maxBytes?: number;
}

const DEFAULT_UA = 'OdysseyMirror/1.0 (+https://odysseyretold.com)';
const DEFAULT_MAX = 1_500_000; // 1.5 MB

export interface MirrorResult {
  /** Inner HTML of the matched element. */
  html: string;
  /** Page <title> if found, else null. */
  title: string | null;
  /** Source URL (echoed for traceability). */
  source: string;
  /** True if the fallback was used because the fetch failed. */
  fromFallback: boolean;
}

export async function fetchMirroredArticle(
  url: string,
  opts: MirrorOptions = {},
): Promise<MirrorResult> {
  const { userAgent = DEFAULT_UA, selector = 'article', fallback, maxBytes = DEFAULT_MAX } = opts;

  let html = '';
  try {
    const res = await fetch(url, { headers: { 'user-agent': userAgent, accept: 'text/html' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    if (buf.byteLength > maxBytes) throw new Error(`Response too large: ${buf.byteLength}`);
    html = new TextDecoder('utf-8').decode(buf);
  } catch (err) {
    if (fallback !== undefined) {
      return { html: fallback, title: null, source: url, fromFallback: true };
    }
    throw new Error(`fetchMirroredArticle(${url}): ${(err as Error).message}`);
  }

  const title = (html.match(/<title>([^<]+)<\/title>/i)?.[1] ?? null)?.trim() || null;

  const tagRe = new RegExp(`<${selector}\\b[^>]*>([\\s\\S]*?)<\\/${selector}>`, 'i');
  const m = html.match(tagRe);
  if (!m) {
    if (fallback !== undefined) {
      return { html: fallback, title, source: url, fromFallback: true };
    }
    throw new Error(`fetchMirroredArticle(${url}): no <${selector}> element found`);
  }

  let body = m[1];

  if (opts.stripClasses) {
    body = body.replace(/\sclass="([^"]*)"/g, (full, cls) =>
      opts.stripClasses!.test(cls) ? '' : full);
  }

  // Drop scripts/styles that might come along; we re-style at the consumer.
  body = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\sdata-astro-[a-z0-9-]+="[^"]*"/gi, '');

  return { html: body, title, source: url, fromFallback: false };
}
