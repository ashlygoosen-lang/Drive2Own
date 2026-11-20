import { useCallback, useEffect, useState } from "react";

const KEY = "d2o_saved";
const EVENT = "d2o-saved-changed";

function read(): number[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => Number.isInteger(x)) : [];
  } catch { return []; }
}

/** Saved cars, kept in this browser and synced across components and tabs. */
export function useFavorites() {
  const [ids, setIds] = useState<number[]>(read);
  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const toggle = useCallback((id: number) => {
    const cur = read();
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
    setIds(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { ids, has: (id: number) => ids.includes(id), toggle };
}
