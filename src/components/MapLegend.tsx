import { STATUS_CONFIG, STATUS_ORDER } from "@/lib/status-config";

type MapLegendProps = {
  className?: string;
};

export function MapLegend({ className = "" }: MapLegendProps) {
  return (
    <section className={className} aria-labelledby="map-legend-heading">
      <h2 id="map-legend-heading" className="text-sm font-semibold text-slate-800">
        凡例
      </h2>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {STATUS_ORDER.map((key) => {
          const item = STATUS_CONFIG[key];
          return (
            <li key={key} className="flex items-center gap-2 text-sm text-slate-700">
              <span
                className="inline-block size-3.5 rounded-sm ring-1 ring-black/10"
                style={{ backgroundColor: item.fill }}
                aria-hidden="true"
              />
              <span>{item.legend}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
