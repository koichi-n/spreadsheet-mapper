import type { ReactNode } from "react";
import { getStatusConfig, paintForStatus, type StatusPalette } from "../lib/status-config";
import type { AreaRecord, StatusKey } from "../lib/types";

type AreaDetailProps = {
  record: AreaRecord | null | undefined;
  emptyText: string;
  heading: string;
  action?: ReactNode;
  legendLabels?: Partial<Record<StatusKey, string>>;
  palette?: StatusPalette;
  /** false のとき、市区町村への絞り込みを促す文言を出さない */
  enableMunicipalities?: boolean;
};

export function AreaDetail({
  record,
  emptyText,
  heading,
  action,
  legendLabels,
  palette,
  enableMunicipalities = true,
}: AreaDetailProps) {
  return (
    <section
      id="area-detail"
      aria-labelledby="area-detail-heading"
      aria-live="polite"
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80"
    >
      <h2
        id="area-detail-heading"
        className="text-sm font-semibold text-slate-800"
      >
        {heading}
      </h2>

      {!record ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">{emptyText}</p>
      ) : (
        <div className="mt-4">
          <h3 className="text-xl font-bold text-slate-900">{record.name}</h3>
          {record.level === "municipality" ? (
            <p className="mt-1 text-xs text-slate-500">
              全国地方公共団体コード {record.code}
            </p>
          ) : record.aggregated ? (
            <p className="mt-1 text-xs text-slate-500">
              {enableMunicipalities
                ? "市区町村データの集計です。地図または一覧から市区町村を選ぶと、個別の状況を表示します。"
                : "市区町村データの集計です。"}
            </p>
          ) : null}
          <dl className="mt-4 grid gap-3 text-sm">
            <DetailItem label="ステータス">
              <StatusBadge
                record={record}
                legendLabels={legendLabels}
                palette={palette}
              />
            </DetailItem>
            <DetailItem label="数値">
              {record.value === null ? "—" : record.value.toLocaleString("ja-JP")}
            </DetailItem>
            <DetailItem label="説明">
              {record.description || "—"}
            </DetailItem>
            <DetailItem label="最終更新日">
              {record.updatedAt || "—"}
            </DetailItem>
            <DetailItem label="情報源">
              {record.sourceUrl ? (
                <a
                  href={record.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sky-800 underline decoration-sky-200 underline-offset-2 hover:text-sky-950"
                >
                  {record.sourceUrl}
                </a>
              ) : (
                "—"
              )}
            </DetailItem>
          </dl>
          {action ? <div className="mt-5">{action}</div> : null}
        </div>
      )}
    </section>
  );
}

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <dt className="font-medium text-slate-500">{label}</dt>
      <dd className="text-slate-800">{children}</dd>
    </div>
  );
}

function StatusBadge({
  record,
  legendLabels,
  palette,
}: {
  record: AreaRecord;
  legendLabels?: Partial<Record<StatusKey, string>>;
  palette?: StatusPalette;
}) {
  const status = getStatusConfig(record.status);
  const paint = paintForStatus(record.status, palette);
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block size-3 rounded-sm ring-1 ring-black/10"
        style={{ backgroundColor: paint.fill }}
        aria-hidden="true"
      />
      <span>{legendLabels?.[record.status] ?? status.label}</span>
    </span>
  );
}
