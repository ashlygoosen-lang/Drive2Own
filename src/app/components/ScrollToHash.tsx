import { useEffect } from "react";
import { useLocation } from "react-router";

/** Scrolls to #anchors (e.g. /#faq) and to the top on page changes. */
export function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 50);
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
