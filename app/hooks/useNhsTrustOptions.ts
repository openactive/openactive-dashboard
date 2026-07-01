import { useEffect, useRef, useState } from "react";
import { getAllNHSTrusts } from "../services/nhs-trusts";
import { loadNhsBasemap } from "../lib/nhs-basemap";
import type { ExplorerFilterOption } from "../lib/explore-filters";

export type NhsTrustOptionsStatus = "idle" | "loading" | "ready" | "error";

// Builds the picker's NHS Trust list, loaded lazily the first time the NHS
// screen opens so users who only use Local Authority boundaries never download
// the NHS data. Names from /nhs-trusts get their codes from the shared basemap,
// so each option stores a code but shows a name.
export function useNhsTrustOptions(enabled: boolean): {
  options: ExplorerFilterOption[];
  status: NhsTrustOptionsStatus;
} {
  const [options, setOptions] = useState<ExplorerFilterOption[]>([]);
  const [status, setStatus] = useState<NhsTrustOptionsStatus>("idle");
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    setStatus("loading");

    Promise.all([getAllNHSTrusts(), loadNhsBasemap()])
      .then(([names, basemap]) => {
        if (cancelled) return;
        const resolved = names
          .map((name) => {
            const code = basemap.nameToCode.get(name);
            return code ? { value: code, label: name } : null;
          })
          .filter((opt): opt is ExplorerFilterOption => opt !== null);
        setOptions(resolved);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
        // Let the next open retry the load.
        startedRef.current = false;
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { options, status };
}
