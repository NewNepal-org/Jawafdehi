import { Button } from "@/components/ui/button";

interface SentryErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export function SentryErrorFallback({ error, resetError }: SentryErrorFallbackProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gray-100 px-4"
      role="alert"
    >
      <div className="max-w-md text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="mb-6 text-gray-600">
          An unexpected error occurred. Please try again.
        </p>
        {resetError && (
          <Button onClick={resetError} variant="default">
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
