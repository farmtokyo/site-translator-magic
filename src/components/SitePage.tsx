import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Renders a static HTML page from /public/site/* and runs the original
 * vanilla JS scripts (nav.js, main.js, optionally blog.js / shop.js / ai-chat.js).
 *
 * The original site was built with plain HTML+CSS+JS. To preserve the design
 * and behavior 1:1 we simply mount the original HTML and (re)execute the
 * scripts after each navigation.
 */

type Props = {
  /** Path relative to /public/site, e.g. "index.html" or "pages/about.html" */
  htmlPath: string;
  /** Extra page-specific scripts to run after the page mounts */
  extraScripts?: string[];
  /** Document title */
  title?: string;
};

const BASE_SCRIPTS = ["/js/nav.js", "/js/main.js", "/chat/ai-chat.js"];

// Track which script URLs have been injected, so we don't re-add <script> tags.
const injected = new Set<string>();

function runScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (injected.has(src)) {
      // Re-execute by re-fetching and eval'ing, so DOMContentLoaded handlers
      // re-bind after route change.
      fetch(src)
        .then((r) => r.text())
        .then((code) => {
          try {
            // eslint-disable-next-line no-new-func
            new Function(code)();
          } catch (e) {
            console.error("Failed to re-run script", src, e);
          }
          resolve();
        })
        .catch(() => resolve());
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => {
      injected.add(src);
      resolve();
    };
    s.onerror = () => resolve();
    document.body.appendChild(s);
  });
}

function fireDomReady() {
  // Many original handlers were attached to DOMContentLoaded. Fire it again
  // so freshly re-evaluated scripts wire up to the new DOM.
  try {
    document.dispatchEvent(new Event("DOMContentLoaded"));
  } catch {
    /* noop */
  }
}

export default function SitePage({ htmlPath, extraScripts = [], title }: Props) {
  const location = useLocation();
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  // Load the static HTML for this route
  useEffect(() => {
    let cancelled = false;
    fetch(`/site/${htmlPath}`)
      .then((r) => r.text())
      .then((text) => {
        if (!cancelled) setHtml(text);
      });
    return () => {
      cancelled = true;
    };
  }, [htmlPath]);

  // After HTML mounts, run the scripts
  useEffect(() => {
    if (!html) return;
    let cancelled = false;
    (async () => {
      const scripts = [...BASE_SCRIPTS, ...extraScripts];
      for (const src of scripts) {
        if (cancelled) return;
        await runScript(src);
      }
      if (!cancelled) fireDomReady();
      // Scroll to hash if present
      if (location.hash) {
        const el = document.getElementById(location.hash.slice(1));
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [html, extraScripts, location.hash]);

  return (
    <>
      <div id="nav-container" />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
