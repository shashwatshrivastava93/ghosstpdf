"use client";

import { Ghost, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen px-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center animate-fade-in">
        <div className="rounded-3xl bg-red-500/10 p-6">
          <Ghost className="h-16 w-16 text-red-400" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-zinc-200">
            Something went wrong
          </h1>
          <p className="text-zinc-500">
            An unexpected error occurred. Please try again.
          </p>
        </div>

        <Button onClick={reset} variant="outline" size="lg" className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
