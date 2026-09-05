import type { ReactNode } from "react";
import { getStatusConfig } from "@/lib/status-config";
import type { PrefectureRecord } from "@/lib/types";

type PrefectureDetailProps = {
  record: PrefectureRecord | null | undefined;
};

export function PrefectureDetail({ record }: PrefectureDetailProps) {
  return (
    <section
      id="prefecture-detail"
      aria-labelledby="prefecture-detail-heading"
      aria-live="polite"
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80"
    >
      <h2
        id="prefecture-detail-heading"
        className="text-sm font-semibold text-slate-800"
      >
        選択した都道府県の詳細
      </h2>

      {!record ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">
          地図または一覧から都道府県を選ぶと、ここに詳細が表示されます。
        </p>
      ) : (
        <div className="mt-4">
          <h3 className="text-xl font-bold text-slate-900">{record.prefecture}</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <DetailItem label="ステータス">
              <StatusBadge record={record} />
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

function StatusBadge({ record }: { record: PrefectureRecord }) {
  const status = getStatusConfig(record.status);
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block size-3 rounded-sm ring-1 ring-black/10"
        style={{ backgroundColor: status.fill }}
        aria-hidden="true"
      />
      <span>{status.label}</span>
    </span>
  );
}
