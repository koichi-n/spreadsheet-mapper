import { paintForStatus, type StatusPalette } from "../lib/status-config";
import type { LegendItem } from "../lib/types";

type MapLegendProps = {
  className?: string;
  items: LegendItem[];
  palette?: StatusPalette;
};

export function MapLegend({ className = "", items, palette }: MapLegendProps) {
  if (items.length === 0) return null;

  return (
    <section className={className} aria-labelledby="map-legend-heading">
      <h2 id="map-legend-heading" className="text-sm font-semibold text-slate-800">
        凡例
      </h2>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {items.map((item) => {
          const colors = paintForStatus(item.status, palette);
          return (
            <li
              key={item.status}
              className="flex max-w-full items-center gap-2 text-sm text-slate-700"
            >
              <span
                className="inline-block size-3.5 shrink-0 rounded-sm ring-1 ring-black/10"
                style={{ backgroundColor: colors.fill }}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
