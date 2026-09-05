"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-900">表示できませんでした</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        時間をおいて再度お試しください。
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        再読み込み
      </button>
    </main>
  );
}
