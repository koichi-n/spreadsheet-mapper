import gridData from "@/data/japan.grid.json";

export type PrefectureShape = {
  prefCode: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const CELL = gridData.grid.cell_size;
const GAP = 0.85;

type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

function buildShapes(): PrefectureShape[] {
  const rows = gridData.rows;
  const legend = gridData.legend as Record<
    string,
    { code: string; name: string }
  >;
  const bounds = new Map<string, Bounds>();

  for (let y = 0; y < rows.length; y += 1) {
    const row = rows[y];
    for (let x = 0; x < row.length; x += 1) {
      const letter = row[x];
      if (letter === ".") continue;
      const current = bounds.get(letter);
      if (!current) {
        bounds.set(letter, { minX: x, minY: y, maxX: x, maxY: y });
      } else {
        current.minX = Math.min(current.minX, x);
        current.minY = Math.min(current.minY, y);
        current.maxX = Math.max(current.maxX, x);
        current.maxY = Math.max(current.maxY, y);
      }
    }
  }

  return [...bounds.entries()]
    .map(([letter, box]) => {
      const meta = legend[letter];
      return {
        prefCode: meta.code,
        name: meta.name,
        x: box.minX * CELL + GAP,
        y: box.minY * CELL + GAP,
        width: (box.maxX - box.minX + 1) * CELL - GAP * 2,
        height: (box.maxY - box.minY + 1) * CELL - GAP * 2,
      };
    })
    .sort((a, b) => a.prefCode.localeCompare(b.prefCode));
}

export const PREFECTURE_SHAPES = buildShapes();

if (PREFECTURE_SHAPES.length !== 47) {
  throw new Error(
    `Expected 47 prefecture shapes, got ${PREFECTURE_SHAPES.length}`,
  );
}

export const MAP_VIEWBOX = {
  minX: -6,
  minY: -6,
  width: gridData.grid.cols * CELL + 12,
  height: gridData.grid.rows * CELL + 12,
};

export const OKINAWA_BRACKET_POINTS = gridData.annotations.okinawa_bracket.points
  .map(([x, y]) => `${x * CELL},${y * CELL}`)
  .join(" ");
