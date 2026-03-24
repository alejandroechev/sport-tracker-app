export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 h-3 w-1/3 rounded bg-gray-200" />
      <div className="mb-2 flex items-center justify-between">
        <div className="h-4 w-2/5 rounded bg-gray-200" />
        <div className="h-5 w-12 rounded bg-gray-200" />
        <div className="h-4 w-2/5 rounded bg-gray-200" />
      </div>
      <div className="mt-3 h-3 w-1/4 rounded bg-gray-200" />
    </div>
  );
}
