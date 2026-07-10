"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { boundaryNoun, type BoundaryType, type DistrictCount } from "../lib/explore-filters";
import {
  GEOJSON_URL,
  LAND_FILL,
  LAND_STROKE,
  FOCUS_STROKE,
  buildColorScale,
  computeTranslateExtent,
  fillForFeature,
  strokeForFeature,
  strokeWidthForFeature,
  getFitFeatures,
  scopeKey,
  type FeatureJoinKey,
  type LadFeature,
  type LadCollection,
} from "../lib/map-styles";
import { loadNhsBasemap } from "../lib/nhs-basemap";
import { MapZoomControls } from "./MapZoomControls";
import { MapLegend } from "./MapLegend";

/** Fired when the user clicks (or taps) a choropleth area, not when they pan. */
export type MapAreaSelectPayload = {
  key: string;
  name: string;
  boundaryType: BoundaryType;
};

interface OpportunityMapProps {
  districtCounts: DistrictCount[];
  scopeAreaNames: string[] | null;
  selectedDistrict: string | null;
  boundaryType?: BoundaryType;
  isLoading?: boolean;
  onReset?: () => void;
  onAreaSelect?: (payload: MapAreaSelectPayload) => void;
}

const CLICK_DRAG_THRESHOLD_PX = 6;

export function OpportunityMap({
  districtCounts,
  scopeAreaNames,
  selectedDistrict,
  boundaryType = "lad",
  isLoading = false,
  onReset,
  onAreaSelect,
}: OpportunityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const mapReadyRef = useRef(false);
  // Signature of the last frame we drew: "<joinKey>|<dataFitKey>". Including
  // the join key means a basemap swap re-frames even if the data keys match.
  const lastFrameSigRef = useRef<string>("");
  const tooltipId = useId();

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [geojson, setGeojson] = useState<LadCollection | null>(null);
  const [focusedDistrict, setFocusedDistrict] = useState<string | null>(null);
  const [focusedCount, setFocusedCount] = useState<number | undefined>(undefined);
  // Which boundary type the loaded shapes belong to.
  const [loadedBoundaryType, setLoadedBoundaryType] =
    useState<BoundaryType>("lad");

  // Local Authority features join the data by name; NHS Trusts join by code.
  const joinKey: FeatureJoinKey =
    loadedBoundaryType === "nhs" ? "geo_code" : "geo_name";

  // selectedDistrict is a trust code in NHS mode (the map joins by code), so
  // resolve it to the trust name for the legend's "Viewing …" line.
  const selectedLabel = useMemo(() => {
    if (!selectedDistrict || loadedBoundaryType !== "nhs") return selectedDistrict;
    const match = geojson?.features.find(
      (f) => f.properties?.geo_code === selectedDistrict,
    );
    return match?.properties?.geo_name ?? selectedDistrict;
  }, [selectedDistrict, loadedBoundaryType, geojson]);

  const countByDistrict = useRef(new Map<string, number>());
  countByDistrict.current = new Map(
    districtCounts.map((d) => [d.district, d.count])
  );

  /** Stable key representing which districts currently have data. */
  const dataFitKey = useMemo(
    () => scopeKey(new Map(districtCounts.map((d) => [d.district, d.count]))),
    [districtCounts],
  );

  // Keep the latest selection in refs so the d3 handlers below always read current values.
  const scopeSetRef = useRef<Set<string> | null>(null);
  const selectedDistrictRef = useRef<string | null>(null);
  const dataFitKeyRef = useRef("all");
  const joinKeyRef = useRef<FeatureJoinKey>("geo_name");
  const onAreaSelectRef = useRef(onAreaSelect);
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    scopeSetRef.current = scopeAreaNames ? new Set(scopeAreaNames) : null;
    selectedDistrictRef.current = selectedDistrict;
    dataFitKeyRef.current = dataFitKey;
    joinKeyRef.current = joinKey;
  });

  useEffect(() => {
    onAreaSelectRef.current = onAreaSelect;
  }, [onAreaSelect]);

  // Load the boundary shapes for the current mode, reloading when it changes.
  // NHS uses the shared cached basemap so the map and picker share one download.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        let data: LadCollection;
        if (boundaryType === "nhs") {
          data = (await loadNhsBasemap()).collection;
        } else {
          const res = await fetch(GEOJSON_URL);
          if (!res.ok) throw new Error(`Failed to load map (${res.status})`);
          data = (await res.json()) as LadCollection;
        }
        if (!cancelled) {
          setGeojson(data);
          setLoadedBoundaryType(boundaryType);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    load();
    return () => { cancelled = true; };
  }, [boundaryType]);

  const applyFills = useCallback(() => {
    if (!svgRef.current) return;

    const counts = countByDistrict.current;
    const color = buildColorScale(counts);
    const scopeSet = scopeAreaNames ? new Set(scopeAreaNames) : null;
    const isFocused =
      Boolean(selectedDistrict) ||
      (scopeSet !== null && scopeSet.size > 0 && scopeSet.size <= 8);

    // The paths only exist once the SVG has been built; skip until then.
    const dataLayer = d3.select(svgRef.current).select<SVGGElement>("g.data-layer");
    if (dataLayer.empty()) return;

    dataLayer
      .selectAll<SVGPathElement, LadFeature>("path")
      .attr("fill", (d) => fillForFeature(d, counts, color, scopeSet, selectedDistrict, isFocused, joinKey))
      .attr("stroke", (d) => strokeForFeature(d, scopeSet, selectedDistrict, joinKey))
      .attr("stroke-width", (d) => strokeWidthForFeature(d, scopeSet, selectedDistrict, joinKey));
  }, [districtCounts, scopeAreaNames, selectedDistrict, joinKey]);

  useEffect(() => { applyFills(); }, [applyFills]);

  /**
   * Recompute the projection for the current data, redraw path geometry in
   * place and recolour. Reused on first build, on data changes and on resize,
   * so the SVG is never torn down once it exists.
   */
  const renderData = useCallback(
    (resetZoom: boolean) => {
      const svgEl = svgRef.current;
      const container = containerRef.current;
      if (!svgEl || !container || !geojson) return;

      const svg = d3.select(svgEl);
      const counts = countByDistrict.current;
      const color = buildColorScale(counts);
      const scopeSet = scopeSetRef.current;
      const selected = selectedDistrictRef.current;
      const isFocused =
        Boolean(selected) ||
        (scopeSet !== null && scopeSet.size > 0 && scopeSet.size <= 8);

      const allFeatures = geojson.features;
      const fitTargets = getFitFeatures(allFeatures, counts, joinKey);
      const fitCollection = {
        type: "FeatureCollection" as const,
        features: fitTargets,
      };
      const isFitToSubset = fitTargets.length < allFeatures.length;

      const { width, height } = container.getBoundingClientRect();
      const pad = isFitToSubset ? 40 : 12;
      const projection = d3.geoMercator().fitExtent(
        [[pad, pad], [Math.max(width - pad, 100), Math.max(height - pad, 200)]],
        fitCollection as d3.GeoPermissibleObjects
      );
      const path = d3.geoPath().projection(projection);
      const drawPath = (d: LadFeature) =>
        path(d as d3.GeoPermissibleObjects) ?? "";

      svg
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", width)
        .attr("height", height);

      svg
        .select("g.land-layer")
        .selectAll<SVGPathElement, LadFeature>("path")
        .attr("d", drawPath);

      svg
        .select("g.data-layer")
        .selectAll<SVGPathElement, LadFeature>("path")
        .attr("d", drawPath)
        .attr("fill", (d) =>
          fillForFeature(d, counts, color, scopeSet, selected, isFocused, joinKey)
        )
        .attr("stroke", (d) => strokeForFeature(d, scopeSet, selected, joinKey))
        .attr("stroke-width", (d) =>
          strokeWidthForFeature(d, scopeSet, selected, joinKey)
        );

      const zoom = zoomBehaviorRef.current;
      if (zoom) {
        zoom.translateExtent(
          computeTranslateExtent(path, fitCollection, width, height)
        );
        if (resetZoom) svg.call(zoom.transform, d3.zoomIdentity);
      }
    },
    [geojson, joinKey]
  );

  // Let the build effect call the latest renderData without depending on its
  // identity — otherwise a joinKey change would tear down and rebuild the SVG.
  const renderDataRef = useRef(renderData);
  useEffect(() => {
    renderDataRef.current = renderData;
  }, [renderData]);
  // Build the SVG structure once per map load: bind the land + data paths,
  // hover and zoom. The handlers read selection from the refs above so they
  // always use current values, and renderData does all the geometry and
  // colour, so this effect does not re-run when the data changes (which would
  // rebuild the map from scratch and lose the user's zoom).
  useEffect(() => {
    if (status !== "ready" || !geojson || !containerRef.current || !svgRef.current)
      return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    mapReadyRef.current = false;

    const allFeatures = geojson.features;
    const zoomRoot = svg.append("g").attr("class", "zoom-root");

    zoomRoot
      .append("g")
      .attr("class", "land-layer")
      .selectAll<SVGPathElement, LadFeature>("path")
      .data(allFeatures)
      .join("path")
      .attr("fill", LAND_FILL)
      .attr("stroke", LAND_STROKE)
      .attr("stroke-width", 0.6)
      .attr("pointer-events", "none");

    const dataLayer = zoomRoot
      .append("g")
      .attr("class", "data-layer")
      .attr("role", "group")
      .attr("aria-label", `${boundaryNoun(loadedBoundaryType)} areas`);

    dataLayer
      .selectAll<SVGPathElement, LadFeature>("path")
      .data(allFeatures)
      .join("path")
      .style("cursor", "pointer")
      .attr("tabindex", -1)
      .attr("aria-hidden", "true")
      .on("pointerdown", (event: PointerEvent) => {
        pointerDownRef.current = { x: event.clientX, y: event.clientY };
      })
      .on("click", (event: MouseEvent, d) => {
        // Ignore clicks that are really the end of a pan/drag.
        const start = pointerDownRef.current;
        pointerDownRef.current = null;
        if (start) {
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          if (dx * dx + dy * dy > CLICK_DRAG_THRESHOLD_PX ** 2) return;
        }

        const key = d.properties?.[joinKeyRef.current];
        const name = d.properties?.geo_name;
        if (!key || !name) return;

        onAreaSelectRef.current?.({
          key,
          name,
          boundaryType: loadedBoundaryType,
        });
      })
      .on("mouseenter", function (_, d) {
        const name = d.properties?.geo_name ?? null;
        const key = d.properties?.[joinKeyRef.current] ?? null;
        setFocusedDistrict(name);
        setFocusedCount(key ? countByDistrict.current.get(key) : undefined);
        if (key !== selectedDistrictRef.current) {
          d3.select(this).attr("stroke", FOCUS_STROKE).attr("stroke-width", 2);
        }
      })
      .on("mouseleave", function (_, d) {
        setFocusedDistrict(null);
        setFocusedCount(undefined);
        d3.select(this)
          .attr("stroke", strokeForFeature(d, scopeSetRef.current, selectedDistrictRef.current, joinKeyRef.current))
          .attr("stroke-width", strokeWidthForFeature(d, scopeSetRef.current, selectedDistrictRef.current, joinKeyRef.current));
      });

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 14])
      .on("zoom", (event) => {
        zoomRoot.attr("transform", event.transform.toString());
      });
    zoomBehaviorRef.current = zoom;
    svg.call(zoom).on("dblclick.zoom", null);

    renderDataRef.current(true);
    lastFrameSigRef.current = `${joinKeyRef.current}|${dataFitKeyRef.current}`;
    mapReadyRef.current = true;

    const resizeObserver = new ResizeObserver(() => renderDataRef.current(false));
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      mapReadyRef.current = false;
      zoomBehaviorRef.current = null;
    };
    // Rebuild only when the shapes change; renderData is called via its ref so
    // a joinKey change recolours in place instead of tearing down the SVG.
    // loadedBoundaryType flips together with geojson, so it adds no extra
    // rebuilds and just keeps the layer's aria-label in step with the shapes.
  }, [status, geojson, tooltipId, loadedBoundaryType]);

  // Update geometry + colour in place when the data scope changes, reusing the
  // existing SVG, zoom behaviour and hover handlers, and re-framing on the new
  // data.
  // Re-frame and recolour whenever the data (dataFitKey) or the basemap
  // (joinKey) changes, so a trust always zooms to its shape even if the shapes
  // and the numbers arrive in separate renders. renderData runs via its ref so
  // it's always bound to the current shapes.
  useEffect(() => {
    if (!mapReadyRef.current) return;
    const frameSig = `${joinKey}|${dataFitKey}`;
    if (lastFrameSigRef.current === frameSig) return;
    lastFrameSigRef.current = frameSig;
    renderDataRef.current(true);
  }, [dataFitKey, joinKey]);

  const zoomBy = useCallback((factor: number) => {
    const svg = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom) return;
    d3.select(svg).transition().duration(200).call(zoom.scaleBy, factor);
  }, []);

  const resetView = useCallback(() => {
    const svg = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (svg && zoom) {
      d3.select(svg).transition().duration(400).call(zoom.transform, d3.zoomIdentity);
    }
    onReset?.();
  }, [onReset]);

  const isAutoFramed = dataFitKey !== "all";

  const zoomControlsClass =
    "absolute top-3 right-3 z-30 flex flex-col gap-0.5 oa-glass rounded-md p-0.5 shadow-sm sm:top-4 sm:right-4 lg:top-auto lg:bottom-5 lg:right-5 lg:rounded-lg lg:p-1";

  const legendClass =
    "absolute bottom-4 left-4 z-10 hidden max-w-md flex-col gap-2 oa-glass rounded-xl p-3 lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:max-w-lg lg:bottom-5 lg:left-5";

  return (
    <figure className="relative flex h-full min-h-0 w-full flex-col">
      <div
        ref={containerRef}
        className="relative h-full min-h-[480px] w-full flex-1 touch-none outline-none [-webkit-tap-highlight-color:transparent] [&_svg]:outline-none [&_svg:focus]:outline-none [&_path]:outline-none"
        style={{ background: "linear-gradient(165deg, #e4ecf4 0%, #d6e2ec 45%, #c8d6e2 100%)" }}
      >
        {isAutoFramed && (
          <p
            className="absolute bottom-42 left-4 z-10 rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-oa-navy oa-glass lg:hidden"
            aria-hidden="true"
          >
            Framed on filtered data
          </p>
        )}

        {status === "loading" && (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-oa-grey-600" role="status" aria-live="polite">
            Loading map…
          </p>
        )}

        {status === "error" && (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-oa-scarlet" role="alert">
            Unable to load map boundaries.
          </p>
        )}

        {/* Non-blocking refetch hint: the map stays pannable while new data loads. */}
        {status === "ready" && isLoading && (
          <div
            className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2"
            role="status"
            aria-live="polite"
          >
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-oa-navy shadow-sm oa-glass">
              <span
                className="h-3 w-3 animate-spin rounded-full border-2 border-oa-grey-300 border-t-oa-cyan"
                aria-hidden="true"
              />
              Updating…
            </span>
          </div>
        )}

        <svg
          ref={svgRef}
          className={`h-full w-full touch-none cursor-grab outline-none focus:outline-none active:cursor-grabbing ${status !== "ready" ? "opacity-0" : ""}`}
          aria-labelledby="map-title"
          aria-describedby={tooltipId}
          tabIndex={-1}
          focusable="false"
        />

        {status === "ready" && (
          <MapZoomControls
            className={zoomControlsClass}
            compact
            onZoomIn={() => zoomBy(1.35)}
            onZoomOut={() => zoomBy(1 / 1.35)}
            onReset={resetView}
          />
        )}
      </div>

      <figcaption className="sr-only" id="map-title">
        Choropleth map of opportunities per {boundaryNoun(loadedBoundaryType)}.
        Click an area to filter by that location, or use the location filter.
        Drag to pan and scroll or pinch to zoom; zoom buttons are available
        after the filters in the tab order.
      </figcaption>

      <MapLegend
        id={tooltipId}
        className={legendClass}
        focusedDistrict={focusedDistrict}
        focusedCount={focusedCount}
        selectedLabel={selectedLabel}
        boundaryType={loadedBoundaryType}
      />
    </figure>
  );
}
