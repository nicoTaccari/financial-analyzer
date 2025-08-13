import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  error: string;
  onDismiss: () => void;
}

export function ErrorState({ error, onDismiss }: ErrorStateProps) {
  const isRateLimit = error.includes("rate limit");

  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mb-8">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-red-900 mb-2">
            Analysis Error
          </h3>
          <p className="text-red-800 text-lg mb-3">{error}</p>

          {isRateLimit && (
            <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700 font-medium">
                💡 Rate limit reached. Please wait a moment and try again, or
                try a different ticker.
              </p>
            </div>
          )}

          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
