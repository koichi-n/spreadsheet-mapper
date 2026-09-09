"use client";

import { useMemo, useState } from "react";
import { getStatusConfig } from "../lib/status-config";
import type { AreaRecord } from "../lib/types";

type AreaListProps = {
  records: AreaRecord[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
  heading: string;
  description: string;
  searchable?: boolean;
};

export function AreaList({
  records,
  selectedCode,
  onSelect,
  heading,
  description,
  searchable = false,
}: AreaListProps) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const normalized = query.trim();
    if (!normalized) return records;
    return records.filter(
      (record) =>
        record.name.includes(normalized) || record.code.includes(normalized),
    );
  }, [query, records]);

  return (
    <section
      id="area-list"
      aria-labelledby="area-list-heading"
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80"
    >
      <h2
        id="area-list-heading"
        className="text-sm font-semibold text-slate-800"
      >
        {heading}
      </h2>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
      {searchable ? (
        <label className="mt-3 block">
          <span className="sr-only">一覧を絞り込み</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="名前またはコードで絞り込み"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-slate-400 placeholder:text-slate-400 focus:ring-2"
          />
        </label>
      ) : null}
      <ul className="mt-4 max-h-[28rem] space-y-1 overflow-y-auto pr-1">
        {visible.map((record) => {
          const status = getStatusConfig(record.status);
          const selected = selectedCode === record.code;
          return (
            <li key={record.code}>
              <button
                type="button"
                onClick={() => onSelect(record.code)}
                aria-current={selected ? "true" : undefined}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${
                  selected
                    ? "bg-slate-900 text-white"
                    : "text-slate-800 hover:bg-slate-100"
                }`}
              >
                <span className="font-medium">{record.name}</span>
                <span className="inline-flex shrink-0 items-center gap-2">
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
        {visible.length === 0 ? (
          <li className="px-1 py-2 text-sm text-slate-500">
            一致する地域がありません。
          </li>
        ) : null}
      </ul>
    </section>
  );
}
