interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
  /** Override the leading sentence. Defaults to a generic phrase. */
  heading?: string;
  /** Override the retry button label. Defaults to "Try again". */
  retryLabel?: string;
}

export function ErrorBanner({
  message,
  onRetry,
  heading = "Something went wrong.",
  retryLabel = "Try again",
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-2xl bg-red-50 p-6 text-sm text-red-800 ring-1 ring-red-200"
    >
      <p>
        <span className="font-semibold">{heading}</span> {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="cursor-pointer rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
      >
        {retryLabel}
      </button>
    </div>
  );
}
