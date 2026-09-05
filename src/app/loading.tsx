export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-10 w-72 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-16 max-w-2xl animate-pulse rounded bg-slate-200" />
      <div className="mt-8 h-[28rem] animate-pulse rounded-2xl bg-slate-200" />
    </div>
  );
}
