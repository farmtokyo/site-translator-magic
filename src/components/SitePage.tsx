import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

const BASE_SCRIPTS = ["/js/nav.js", "/js/main.js", "/chat/ai-chat.js", "/js/i18n.js"];

// Cache script source so we don't re-fetch on every navigation.
const scriptCache = new Map<string, Promise<string>>();

function fetchScript(src: string): Promise<string> {
  let p = scriptCache.get(src);
  if (!p) {
    p = fetch(src).then((r) => r.text());
    scriptCache.set(src, p);
  }
  return p;
}

function runScript(src: string): Promise<void> {
  return fetchScript(src)
    .then((code) => {
      try {
        // Execute in an isolated function scope so `const` / `let` declarations
        // don't collide on re-execution after client-side navigation.
        // Using indirect eval would pollute the global scope; new Function
        // gives us a fresh lexical scope while still letting the script
        // attach things to `window` explicitly when it needs to.
        // eslint-disable-next-line no-new-func
        new Function(code)();
      } catch (e) {
        console.error("Failed to run script", src, e);
      }
    })
    .catch((e) => {
      console.error("Failed to fetch script", src, e);
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
  const navigate = useNavigate();
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  // Intercept clicks on internal links so we use React Router navigation
  // instead of full-page reloads.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const link = target?.closest("a");
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href) return;
      if (link.target && link.target !== "_self") return;
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      ) {
        return;
      }
      // Internal link — route via React Router
      e.preventDefault();
      navigate(href);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [navigate]);

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
      // Re-apply current language to freshly rendered HTML
      try {
        // @ts-expect-error injected by /js/i18n.js
        if (window.MollaiI18n) window.MollaiI18n.apply();
      } catch {
        /* noop */
      }
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
