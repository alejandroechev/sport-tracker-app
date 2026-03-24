interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const config = {
  error: {
    bg: 'bg-red-50 border-red-200',
    icon: '❌',
    text: 'text-red-800',
    btn: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200',
    icon: '⚠️',
    text: 'text-amber-800',
    btn: 'bg-amber-600 hover:bg-amber-700',
  },
  info: {
    bg: 'bg-blue-50 border-blue-200',
    icon: 'ℹ️',
    text: 'text-blue-800',
    btn: 'bg-blue-600 hover:bg-blue-700',
  },
} as const;

function isRateLimitError(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('rate limit') || lower.includes('429');
}

export default function ErrorMessage({
  message,
  onRetry,
  type: typeProp,
}: ErrorMessageProps) {
  const isRateLimit = isRateLimitError(message);
  const type = typeProp ?? (isRateLimit ? 'warning' : 'error');
  const styles = config[type];

  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 rounded-xl border p-6 text-center ${styles.bg}`}
    >
      <span className="text-3xl">{styles.icon}</span>
      <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
      {isRateLimit && (
        <p className={`text-xs ${styles.text} opacity-75`}>
          API quota exceeded (100 requests/day). Try again later.
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className={`mt-1 rounded-lg px-4 py-2 text-sm font-medium text-white ${styles.btn}`}
        >
          Retry
        </button>
      )}
    </div>
  );
}
