/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { getFocusableElements } from "../focusable";
import { type } from "os";

describe("getFocusableElements", () => {
  it("returns buttons, links, and form fields that can take focus", () => {
    const root = document.createElement("div");
    root.innerHTML = `
        <button type="button">Save</button>
        <a href="/about">About</a>
        <input type="text" />
        <select><option>One</option></select>
        <textarea></textarea>
        <div tabindex="0">Custom</div>
        `;
    expect(getFocusableElements(root)).toHaveLength(6);
  });

  it("skips disabled controls and aria-hidden elements", () => {
    const root = document.createElement("div");
    root.innerHTML = `
        <button type="button">Visible</button>
        <button type="button" disabled>Disabled</button>
        <a href="/hidden" aria-hidden="true">Hidden</a>
        <div tabindex="-1">Not in tab order</div>
        `;

    const focusable = getFocusableElements(root);
    expect(focusable).toHaveLength(1);
    expect(focusable[0]?.textContent).toBe("Visible");
  });
});
