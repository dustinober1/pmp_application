// @vitest-environment node

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("PWA manifest", () => {
  it("exists and references valid icon files", () => {
    const publicDir = path.resolve(__dirname, "../public");
    const manifestPath = path.join(publicDir, "manifest.json");

    expect(fs.existsSync(manifestPath)).toBe(true);

    const raw = fs.readFileSync(manifestPath, "utf8");
    const manifest = JSON.parse(raw) as {
      name?: string;
      short_name?: string;
      start_url?: string;
      scope?: string;
      display?: string;
      icons?: Array<{ src?: string }>;
    };

    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBeTruthy();

    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons?.length).toBeGreaterThan(0);

    for (const icon of manifest.icons || []) {
      expect(icon.src).toBeTruthy();
      const normalized = String(icon.src).replace(/^\//, "");
      const iconPath = path.join(publicDir, normalized);
      expect(fs.existsSync(iconPath)).toBe(true);
    }
  });
});
