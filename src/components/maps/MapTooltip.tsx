import { getStatusConfig } from "../../lib/status-config";
import type { AreaRecord } from "../../lib/types";

type MapTooltipProps = {
  record: AreaRecord | null;
  position: { x: number; y: number } | null;
};

export function MapTooltip({ record, position }: MapTooltipProps) {
  if (!record || !position) return null;

  return (
    <div
      className="pointer-events-none absolute z-10 hidden -translate-x-1/2 -translate-y-full rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg [@media(hover:hover)_and_(pointer:fine)]:block"
      style={{ left: position.x, top: position.y - 8 }}
      role="tooltip"
    >
      <p className="font-semibold">{record.name}</p>
      <p className="text-slate-200">
        {getStatusConfig(record.status).label}
        {record.value !== null ? ` / ${record.value}` : ""}
      </p>
    </div>
  );
}

export function pointerPosition(
  event: {
    clientX: number;
    clientY: number;
    currentTarget: SVGGraphicsElement;
  },
  root?: HTMLElement | null,
): { x: number; y: number } | null {
  const svg = event.currentTarget.ownerSVGElement;
  const container = root ?? svg?.parentElement;
  if (!svg || !container) return null;
  const containerRect = container.getBoundingClientRect();
  return {
    x: event.clientX - containerRect.left,
    y: event.clientY - containerRect.top,
  };
}
