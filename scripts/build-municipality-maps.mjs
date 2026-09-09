import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { geoPath } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const japan = require("jpn-atlas/japan/japan.json");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "src/data/municipality-catalog.json");
const mapsDir = join(root, "public/municipality-maps");
const namesUrl = "https://madefor.github.io/jisx0402/api/v1/all.json";

const path = geoPath().digits(1);

function padCode(value) {
  return String(value).padStart(5, "0");
}

function boundsOf(featureObject) {
  const [[x0, y0], [x1, y1]] = path.bounds(featureObject);
  return { x0, y0, x1, y1 };
}

function unionBounds(items) {
  return {
    x0: Math.min(...items.map((item) => item.bounds.x0)),
    y0: Math.min(...items.map((item) => item.bounds.y0)),
    x1: Math.max(...items.map((item) => item.bounds.x1)),
    y1: Math.max(...items.map((item) => item.bounds.y1)),
  };
}

function viewBoxFromBounds(bounds, paddingRatio = 0.06) {
  const width = Math.max(bounds.x1 - bounds.x0, 1);
  const height = Math.max(bounds.y1 - bounds.y0, 1);
  const pad = Math.max(width, height) * paddingRatio;
  const x = round(bounds.x0 - pad);
  const y = round(bounds.y0 - pad);
  return `${x} ${y} ${round(width + pad * 2)} ${round(height + pad * 2)}`;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function percentile(values, ratio) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(ratio * sorted.length) - 1),
  );
  return sorted[index];
}

function splitMainAndOutliers(locations) {
  if (locations.length <= 4) {
    return { main: locations, outliers: [] };
  }

  const points = locations.map((location) => ({
    location,
    x: (location.bounds.x0 + location.bounds.x1) / 2,
    y: (location.bounds.y0 + location.bounds.y1) / 2,
  }));
  const midX = median(points.map((point) => point.x));
  const midY = median(points.map((point) => point.y));
  const distances = points.map((point) =>
    Math.hypot(point.x - midX, point.y - midY),
  );
  const cutoff = Math.max(percentile(distances, 0.84) * 1.45, 1);

  const main = [];
  const outliers = [];
  for (const point of points) {
    const distance = Math.hypot(point.x - midX, point.y - midY);
    if (distance <= cutoff) main.push(point.location);
    else outliers.push(point.location);
  }

  if (main.length < Math.ceil(locations.length * 0.55)) {
    return { main: locations, outliers: [] };
  }

  return { main, outliers };
}

function toPublicLocation(location) {
  return {
    code: location.code,
    name: location.name,
    path: location.path,
  };
}

async function loadNames() {
  const names = new Map();
  try {
    const response = await fetch(namesUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const json = await response.json();
    for (const [code6, info] of Object.entries(json)) {
      if (typeof info !== "object" || info === null) continue;
      const city = "city" in info ? String(info.city ?? "") : "";
      if (!city) continue;
      names.set(code6.slice(0, 5), city);
    }
  } catch (error) {
    console.warn("市区町村名の取得に失敗したため、コードを名称として使います。", error);
  }
  return names;
}

async function main() {
  const names = await loadNames();
  const geometries = japan.objects.municipalities.geometries;
  /** @type {Map<string, { code: string, prefCode: string, name: string, pathParts: string[], bounds: {x0:number,y0:number,x1:number,y1:number} }>} */
  const byCode = new Map();

  for (const geometry of geometries) {
    const code = padCode(geometry.id);
    const prefCode = code.slice(0, 2);
    if (prefCode < "01" || prefCode > "47") continue;

    const feat = feature(japan, geometry);
    const d = path(feat);
    if (!d) continue;
    const geomBounds = boundsOf(feat);
    const current = byCode.get(code);
    if (!current) {
      byCode.set(code, {
        code,
        prefCode,
        name: names.get(code) ?? code,
        pathParts: [d],
        bounds: geomBounds,
      });
      continue;
    }
    current.pathParts.push(d);
    current.bounds = {
      x0: Math.min(current.bounds.x0, geomBounds.x0),
      y0: Math.min(current.bounds.y0, geomBounds.y0),
      x1: Math.max(current.bounds.x1, geomBounds.x1),
      y1: Math.max(current.bounds.y1, geomBounds.y1),
    };
  }

  const locations = [...byCode.values()]
    .map((item) => ({
      ...item,
      path: item.pathParts.join(""),
    }))
    .sort((a, b) => a.code.localeCompare(b.code, "en"));

  const catalog = locations.map((item) => ({
    code: item.code,
    prefCode: item.prefCode,
    name: item.name,
  }));

  const byPref = new Map();
  for (const location of locations) {
    const list = byPref.get(location.prefCode) ?? [];
    list.push(location);
    byPref.set(location.prefCode, list);
  }

  await mkdir(join(root, "src/data"), { recursive: true });
  await mkdir(mapsDir, { recursive: true });
  await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

  for (const [prefCode, prefLocations] of byPref) {
    const { main, outliers } = splitMainAndOutliers(prefLocations);
    const payload = {
      prefCode,
      viewBox: viewBoxFromBounds(unionBounds(main)),
      locations: main.map(toPublicLocation),
      inset:
        outliers.length > 0
          ? {
              viewBox: viewBoxFromBounds(unionBounds(outliers), 0.1),
              locations: outliers.map(toPublicLocation),
            }
          : null,
    };
    await writeFile(
      join(mapsDir, `${prefCode}.json`),
      `${JSON.stringify(payload)}\n`,
      "utf8",
    );
  }

  console.log(
    `Wrote ${catalog.length} municipalities across ${byPref.size} prefectures.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
