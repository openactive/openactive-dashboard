/** @vitest-environment jsdom */

import { describe, expect, it, vi } from "vitest";
import {
  focusAdjacentFeedQualityNav,
  focusFirstFeedQualityNav,
  getFeedQualityNavTargets,
} from "../feed-quality-table-nav";
import { afterEach } from "node:test";

function visibleNavButton(label: string) {
  const button = document.createElement("button");
  button.setAttribute("data-feed-quality-nav", "");
  button.textContent = label;
  vi.spyOn(button, "getClientRects").mockReturnValue([
    {} as DOMRect,
  ] as unknown as DOMRectList);
  return button;
}

describe("feed-quality table nav", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("getFeedQualityNavTargets", () => {
    it("returns an empty list when the container is missing", () => {
      expect(getFeedQualityNavTargets(null)).toEqual([]);
    });

    it("returns only visible nav cells inside the container", () => {
      const container = document.createElement("div");
      const visible = visibleNavButton("Visible");
      const hidden = document.createElement("button");
      hidden.setAttribute("data-feed-quality-nav", "");
      vi.spyOn(hidden, "getClientRects").mockReturnValue(
        [] as unknown as DOMRectList,
      );

      container.append(visible, hidden);
      document.body.append(container);

      expect(getFeedQualityNavTargets(container)).toEqual([visible]);
    });
  });

  describe("focusFirstFeedQualityNav", () => {
    it("focuses the first visible nav cell", () => {
      const container = document.createElement("div");
      const first = visibleNavButton("First");
      const second = visibleNavButton("Second");
      container.append(first, second);
      document.body.append(container);

      first.scrollIntoView = vi.fn();
      const focusSpy = vi.spyOn(first, "focus");

      expect(focusFirstFeedQualityNav(container)).toBe(true);
      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
      expect(first.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    });

    it("returns false when there are no nav cells", () => {
      expect(focusFirstFeedQualityNav(document.createElement("div"))).toBe(
        false,
      );
    });
  });

  describe("focusAdjacentFeedQualityNav", () => {
    it("moves focus to the next nav cell", () => {
      const container = document.createElement("div");
      const first = visibleNavButton("First");
      const second = visibleNavButton("Second");
      container.append(first, second);
      document.body.append(container);

      second.scrollIntoView = vi.fn();
      const focusSpy = vi.spyOn(second, "focus");

      expect(focusAdjacentFeedQualityNav(container, first, "next")).toBe(true);
      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    });

    it("returns false when there is no next cell", () => {
      const container = document.createElement("div");
      const only = visibleNavButton("Only");
      container.append(only);
      document.body.append(container);

      expect(focusAdjacentFeedQualityNav(container, only, "next")).toBe(false);
    });
  });
});
