import { useEffect, useRef, useState } from "react";
import { getAllNHSTrusts } from "../services/nhs-trusts";
import type { ExplorerFilterOption } from "../lib/explore-filters";

export type NhsTrustOptionsStatus = "idle" | "loading" | "ready" | "error";

// Builds the picker's NHS Trust list, loaded lazily the first time the NHS
// screen opens so Local-Authority-only users never fetch it. Each option stores
// the trust code but shows its name.
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

    getAllNHSTrusts()
      .then((trusts) => {
        if (cancelled) return;
        setOptions(
          trusts.map((t) => ({ value: t.nhstrust_code, label: t.nhstrust_name }))
        );
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
