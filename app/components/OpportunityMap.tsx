"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import * as d3 from "d3";
import { formatFullNumber } from "../lib/format";
import type { DistrictCount } from "../lib/explore-filters";

interface GeoProperties {
  geo_code: string;
  geo_name: string;
  geo_type: string;
}

interface LadFeature {
  type: "Feature";
  geometry: { type: string; coordinates: unknown };
  properties?: GeoProperties;
}

interface LadCollection {
  type: "FeatureCollection";
  features: LadFeature[];
}

interface OpportunityMapProps {
  districtCounts: DistrictCount[];
  scopeAreaNames: string[] | null;
  selectedDistrict: string | null;
  layout?: "default" | "immersive";
}

const GEOJSON_URL = "/api/boundaries";

/** Land silhouette under the choropleth */
const LAND_FILL = "#dce4ec";
const LAND_STROKE = "#a8b8c8";
const BASE_STROKE = "#8fa3b8";
/** Outside current filter */
const OUT_OF_SCOPE_FILL = "#e8edf2";
const OUT_OF_SCOPE_STROKE = "#c5ced8";
/** In scope, no count */
const NO_DATA_FILL = "#7fa8c9";
const FOCUS_STROKE = "#e21483";
const SELECTED_STROKE = "#223582";
const SELECTED_FILL_FALLBACK = "#009de1";

function getFitFeatures(
  features: LadFeature[],
  scopeSet: Set<string> | null,
  selectedDistrict: string | null
): LadFeature[] {
  if (selectedDistrict) {
    const match = features.filter(
      (f) => f.properties?.geo_name === selectedDistrict
    );
    if (match.length > 0) return match;
  }
  if (scopeSet && scopeSet.size > 0 && scopeSet.size <= 8) {
    const scoped = features.filter((f) =>
      scopeSet.has(f.properties?.geo_name ?? "")
    );
    if (scoped.length > 0) return scoped;
  }
  return features;
}

function scopeKey(
  scopeAreaNames: string[] | null,
  selectedDistrict: string | null
): string {
  return `${selectedDistrict ?? ""}|${scopeAreaNames?.join(",") ?? "all"}`;
}

function buildColorScale(counts: Map<string, number>) {
  const values = [...counts.values()].filter((v) => v > 0);
  const maxCount = values.length > 0 ? Math.max(...values) : 1;
  return d3
    .scaleSequential()
    .domain([0, maxCount])
    .interpolator((t) => {
      if (t <= 0.5) {
        return d3.interpolateRgb("#5eb8e8", "#009de1")(t * 2);
      }
      return d3.interpolateRgb("#009de1", "#223582")((t - 0.5) * 2);
    });
}

function fillForFeature(
  d: LadFeature,
  counts: Map<string, number>,
  color: d3.ScaleSequential<string, never>,
  scopeSet: Set<string> | null,
  selectedDistrict: string | null,
  isFocused: boolean
): string {
  const name = d.properties?.geo_name ?? "";
  const isSelected = name === selectedDistrict;
  const inScope = !scopeSet || scopeSet.has(name);

  if (!inScope) return OUT_OF_SCOPE_FILL;
  if (isSelected) {
    const count = counts.get(name) ?? 0;
    return count > 0 ? color(count) : SELECTED_FILL_FALLBACK;
  }
  if (isFocused && inScope) {
    const count = counts.get(name) ?? 0;
    if (count > 0) return color(count);
    return NO_DATA_FILL;
  }
  const count = counts.get(name) ?? 0;
  if (count > 0) return color(count);
  return NO_DATA_FILL;
}

function strokeForFeature(
  d: LadFeature,
  scopeSet: Set<string> | null,
  selectedDistrict: string | null
): string {
  const name = d.properties?.geo_name ?? "";
  if (name === selectedDistrict) return SELECTED_STROKE;
  const inScope = !scopeSet || scopeSet.has(name);
  return inScope ? BASE_STROKE : OUT_OF_SCOPE_STROKE;
}

function strokeWidthForFeature(
  d: LadFeature,
  scopeSet: Set<string> | null,
  selectedDistrict: string | null
): number {
  const name = d.properties?.geo_name ?? "";
  if (name === selectedDistrict) return 3;
  const inScope = !scopeSet || scopeSet.has(name);
  return inScope ? 0.85 : 0.5;
}

/**
 * Choropleth map joined on geo_name ↔ district_name from the CSV.
 * Pan (drag), zoom (scroll/pinch), and a land background layer for context.
 */
export function OpportunityMap({
  districtCounts,
  scopeAreaNames,
  selectedDistrict,
  layout = "default",
}: OpportunityMapProps) {
  const isImmersive = layout === "immersive";
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<
    SVGSVGElement,
    unknown
  > | null>(null);
  const mapReadyRef = useRef(false);
  const lastScopeKeyRef = useRef<string>("");
  const tooltipId = useId();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [geojson, setGeojson] = useState<LadCollection | null>(null);
  const [focusedDistrict, setFocusedDistrict] = useState<string | null>(null);

  const countByDistrict = useRef(new Map<string, number>());
  countByDistrict.current = new Map(
    districtCounts.map((d) => [d.district, d.count])
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(GEOJSON_URL);
        if (!res.ok) throw new Error(`Failed to load map (${res.status})`);
        const data = (await res.json()) as LadCollection;
        if (!cancelled) {
          setGeojson(data);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyFills = useCallback(() => {
    if (!svgRef.current || !mapReadyRef.current) return;

    const counts = countByDistrict.current;
    const color = buildColorScale(counts);
    const scopeSet = scopeAreaNames ? new Set(scopeAreaNames) : null;
    const isFocused =
      Boolean(selectedDistrict) ||
      (scopeSet !== null && scopeSet.size > 0 && scopeSet.size <= 8);

    const dataLayer = d3.select(svgRef.current).select<SVGGElement>("g.data-layer");
    if (dataLayer.empty()) return;

    dataLayer
      .selectAll<SVGPathElement, LadFeature>("path")
      .attr("fill", (d) =>
        fillForFeature(d, counts, color, scopeSet, selectedDistrict, isFocused)
      )
      .attr("stroke", (d) => strokeForFeature(d, scopeSet, selectedDistrict))
      .attr("stroke-width", (d) =>
        strokeWidthForFeature(d, scopeSet, selectedDistrict)
      );
  }, [districtCounts, scopeAreaNames, selectedDistrict]);

  useEffect(() => {
    applyFills();
  }, [applyFills]);

  useEffect(() => {
    if (status !== "ready" || !geojson || !containerRef.current || !svgRef.current) {
      return;
    }

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    mapReadyRef.current = false;

    const counts = countByDistrict.current;
    const color = buildColorScale(counts);
    const scopeSet = scopeAreaNames ? new Set(scopeAreaNames) : null;
    const isFocused =
      Boolean(selectedDistrict) ||
      (scopeSet !== null && scopeSet.size > 0 && scopeSet.size <= 8);

    const allFeatures = geojson.features;
    const fitTargets = getFitFeatures(allFeatures, scopeSet, selectedDistrict);
    const fitCollection = {
      type: "FeatureCollection" as const,
      features: fitTargets,
    };

    const currentScopeKey = scopeKey(scopeAreaNames, selectedDistrict);
    const shouldResetZoom = lastScopeKeyRef.current !== currentScopeKey;
    lastScopeKeyRef.current = currentScopeKey;

    const { width, height } = container.getBoundingClientRect();
    const pad = isFocused ? 40 : 12;
    const projection = d3.geoMercator().fitExtent(
      [
        [pad, pad],
        [Math.max(width - pad, 100), Math.max(height - pad, 200)],
      ],
      fitCollection as d3.GeoPermissibleObjects
    );

    const path = d3.geoPath().projection(projection);

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", width)
      .attr("height", height);

    const zoomRoot = svg.append("g").attr("class", "zoom-root");

    const landLayer = zoomRoot.append("g").attr("class", "land-layer");
    landLayer
      .selectAll<SVGPathElement, LadFeature>("path")
      .data(allFeatures)
      .join("path")
      .attr("d", (d) => path(d as d3.GeoPermissibleObjects) ?? "")
      .attr("fill", LAND_FILL)
      .attr("stroke", LAND_STROKE)
      .attr("stroke-width", 0.6)
      .attr("pointer-events", "none");

    const dataLayer = zoomRoot.append("g").attr("class", "data-layer");
    dataLayer
      .selectAll<SVGPathElement, LadFeature>("path")
      .data(allFeatures)
      .join("path")
      .attr("d", (d) => path(d as d3.GeoPermissibleObjects) ?? "")
      .attr("fill", (d) =>
        fillForFeature(d, counts, color, scopeSet, selectedDistrict, isFocused)
      )
      .attr("stroke", (d) => strokeForFeature(d, scopeSet, selectedDistrict))
      .attr("stroke-width", (d) =>
        strokeWidthForFeature(d, scopeSet, selectedDistrict)
      )
      .style("cursor", "pointer")
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-describedby", tooltipId)
      .attr("aria-label", (d) => {
        const name = d.properties?.geo_name ?? "Unknown area";
        const count = counts.get(name) ?? 0;
        return count > 0
          ? `${name}: ${formatFullNumber(count)} opportunities`
          : `${name}: no opportunities in current selection`;
      })
      .on("focus", function (_, d) {
        const name = d.properties?.geo_name ?? null;
        setFocusedDistrict(name);
        if (name !== selectedDistrict) {
          d3.select(this).attr("stroke", FOCUS_STROKE).attr("stroke-width", 2);
        }
      })
      .on("blur", function (_, d) {
        setFocusedDistrict(null);
        d3.select(this)
          .attr("stroke", strokeForFeature(d, scopeSet, selectedDistrict))
          .attr("stroke-width", strokeWidthForFeature(d, scopeSet, selectedDistrict));
      })
      .on("mouseenter", function (_, d) {
        const name = d.properties?.geo_name ?? null;
        setFocusedDistrict(name);
        if (name !== selectedDistrict) {
          d3.select(this).attr("stroke", FOCUS_STROKE).attr("stroke-width", 2);
        }
      })
      .on("mouseleave", function (_, d) {
        setFocusedDistrict(null);
        d3.select(this)
          .attr("stroke", strokeForFeature(d, scopeSet, selectedDistrict))
          .attr("stroke-width", strokeWidthForFeature(d, scopeSet, selectedDistrict));
      });

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.6, 14])
      .on("zoom", (event) => {
        zoomRoot.attr("transform", event.transform.toString());
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom).on("dblclick.zoom", null);

    if (shouldResetZoom) {
      svg.call(zoom.transform, d3.zoomIdentity);
    }

    mapReadyRef.current = true;

    const refit = () => {
      const { width: w, height: h } = container.getBoundingClientRect();
      const p = isFocused ? 40 : 12;
      projection.fitExtent(
        [
          [p, p],
          [Math.max(w - p, 100), Math.max(h - p, 200)],
        ],
        fitCollection as d3.GeoPermissibleObjects
      );
      const updatePath = (d: LadFeature) =>
        path(d as d3.GeoPermissibleObjects) ?? "";
      landLayer.selectAll<SVGPathElement, LadFeature>("path").attr("d", updatePath);
      dataLayer.selectAll<SVGPathElement, LadFeature>("path").attr("d", updatePath);
      svg.attr("viewBox", `0 0 ${w} ${h}`).attr("width", w).attr("height", h);
    };

    const resizeObserver = new ResizeObserver(refit);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      mapReadyRef.current = false;
      zoomBehaviorRef.current = null;
    };
  }, [
    status,
    geojson,
    scopeAreaNames,
    selectedDistrict,
    tooltipId,
  ]);

  const zoomBy = useCallback((factor: number) => {
    const svg = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;
    d3.select(svg).transition().duration(200).call(zoom.scaleBy, factor);
  }, []);

  const resetView = useCallback(() => {
    const svg = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;
    d3.select(svg).transition().duration(400).call(zoom.transform, d3.zoomIdentity);
  }, []);

  const focusedCount = focusedDistrict
    ? countByDistrict.current.get(focusedDistrict)
    : undefined;

  const legendStops = [0, 0.25, 0.5, 0.75, 1];
  const isAutoFramed =
    Boolean(selectedDistrict) ||
    (scopeAreaNames && scopeAreaNames.length > 0 && scopeAreaNames.length <= 8);

  const zoomControlsClass = isImmersive
    ? "absolute bottom-4 right-4 z-30 flex flex-col gap-0.5 oa-glass rounded-lg p-1 shadow-sm sm:bottom-5 sm:right-5"
    : "absolute bottom-14 right-3 z-20 flex flex-col gap-0.5 oa-glass rounded-lg p-1 shadow-sm sm:bottom-16";

  return (
    <figure
      className={`flex flex-col ${isImmersive ? "relative h-full min-h-0 w-full" : ""}`}
    >
      <div
        ref={containerRef}
        className={`relative w-full touch-none ${
          isImmersive ? "h-full min-h-[480px] flex-1" : "min-h-[360px] sm:min-h-[440px]"
        }`}
        style={{
          background:
            "linear-gradient(165deg, #e4ecf4 0%, #d6e2ec 45%, #c8d6e2 100%)",
        }}
      >
        {isAutoFramed && selectedDistrict && (
          <p
            className={`absolute z-10 text-[10px] font-semibold uppercase tracking-wider text-oa-navy ${
              isImmersive
                ? "bottom-24 left-4 oa-glass rounded-lg px-3 py-1.5 lg:bottom-20"
                : "top-3 left-3 bg-oa-navy px-2.5 py-1 text-oa-aqua rounded-sm"
            }`}
            aria-hidden="true"
          >
            Framed on {selectedDistrict}
          </p>
        )}
        {status === "loading" && (
          <p
            className="absolute inset-0 flex items-center justify-center text-sm text-oa-grey-600"
            role="status"
            aria-live="polite"
          >
            Loading map…
          </p>
        )}
        {status === "error" && (
          <p
            className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-oa-scarlet"
            role="alert"
          >
            Unable to load map boundaries from app/data/combined-boundaries.geojson.
          </p>
        )}
        <svg
          ref={svgRef}
          className={`h-full w-full cursor-grab active:cursor-grabbing ${
            status !== "ready" ? "opacity-0" : ""
          }`}
          aria-labelledby="map-title"
          aria-describedby={tooltipId}
        />

        {status === "ready" && (
          <div className={zoomControlsClass} role="group" aria-label="Map zoom controls">
            <button
              type="button"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-lg font-medium text-oa-navy hover:bg-oa-grey-100 focus:outline-none focus:ring-2 focus:ring-oa-cyan"
              onClick={() => zoomBy(1.35)}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-lg font-medium text-oa-navy hover:bg-oa-grey-100 focus:outline-none focus:ring-2 focus:ring-oa-cyan"
              onClick={() => zoomBy(1 / 1.35)}
              aria-label="Zoom out"
            >
              −
            </button>
            <button
              type="button"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-xs font-semibold uppercase tracking-wide text-oa-navy hover:bg-oa-grey-100 focus:outline-none focus:ring-2 focus:ring-oa-cyan"
              onClick={resetView}
              aria-label="Reset map view"
              title="Reset view"
            >
              ⟲
            </button>
          </div>
        )}
      </div>

      <figcaption className="sr-only" id="map-title">
        Choropleth map of opportunities per local authority. Drag to pan and scroll
        or pinch to zoom.
      </figcaption>

      <div
        id={tooltipId}
        className={
          isImmersive
            ? "absolute bottom-4 left-4 z-10 hidden max-w-md flex-col gap-2 oa-glass rounded-xl p-3 lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:max-w-lg lg:bottom-5 lg:left-5"
            : "flex flex-col gap-3 border-t border-oa-grey-200 bg-oa-grey-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        }
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="min-h-5 text-sm text-oa-grey-700">
          {focusedDistrict ? (
            <>
              <span className="font-semibold text-oa-navy">{focusedDistrict}</span>
              {": "}
              {focusedCount != null && focusedCount > 0
                ? `${formatFullNumber(focusedCount)} opportunities`
                : "No opportunities in current selection"}
            </>
          ) : selectedDistrict ? (
            <>
              Viewing <span className="font-semibold text-oa-navy">{selectedDistrict}</span>
              . Drag to pan · scroll to zoom.
            </>
          ) : (
            <span className="text-oa-grey-600">
              Drag to pan · scroll or pinch to zoom. Hover an area for details.
            </span>
          )}
        </p>

        <div
          className="flex items-center gap-2 shrink-0"
          role="img"
          aria-label="Colour scale from fewer to more opportunities"
        >
          <span className="text-xs font-medium text-oa-grey-500">Fewer</span>
          <div className="flex h-2 w-28 overflow-hidden rounded-md border border-oa-grey-200/80">
            {legendStops.map((t) => (
              <div
                key={t}
                className="flex-1"
                style={{
                  background: d3.interpolate("#5eb8e8", "#223582")(t),
                }}
                aria-hidden="true"
              />
            ))}
          </div>
          <span className="text-xs font-medium text-oa-grey-500">More</span>
        </div>
      </div>
    </figure>
  );
}
