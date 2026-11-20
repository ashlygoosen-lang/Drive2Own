import { useEffect } from "react";

/** Sets the browser tab title (and restores the default when the page unmounts). */
export function useTitle(title?: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | Drive2Own` : "Drive2Own | Rent a car for Uber, inDrive and Bolt";
    return () => { document.title = prev; };
  }, [title]);
}
