"use client";

import { getStatusConfig } from "@/lib/status-config";
import type { PrefectureRecord } from "@/lib/types";

type PrefectureListProps = {
  records: PrefectureRecord[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
};

export function PrefectureList({
  records,
  selectedCode,
  onSelect,
}: PrefectureListProps) {
  return (
    <section
      id="prefecture-list"
      aria-labelledby="prefecture-list-heading"
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80"
    >
      <h2
        id="prefecture-list-heading"
        className="text-sm font-semibold text-slate-800"
      >
        都道府県一覧
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        地図の代わりに、ここから都道府県を選べます。
      </p>
      <ul className="mt-4 max-h-[28rem] space-y-1 overflow-y-auto pr-1">
        {records.map((record) => {
          const status = getStatusConfig(record.status);
          const selected = selectedCode === record.prefCode;
          return (
            <li key={record.prefCode}>
              <button
                type="button"
                onClick={() => onSelect(record.prefCode)}
                aria-current={selected ? "true" : undefined}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "bg-slate-900 text-white"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span className="font-medium">{record.prefecture}</span>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block size-2.5 rounded-sm ring-1 ring-black/10"
                    style={{ backgroundColor: status.fill }}
                    aria-hidden="true"
                  />
                  <span className={selected ? "text-slate-200" : "text-slate-500"}>
                    {status.label}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
