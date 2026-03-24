interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="text-5xl">{icon}</span>
      <h3 className="text-base font-semibold text-gray-600">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-gray-400">{description}</p>
      )}
    </div>
  );
}
