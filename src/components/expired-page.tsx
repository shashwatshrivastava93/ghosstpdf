"use client";

import { Ghost, Timer, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ExpiredPageProps {
  reason?: string;
}

export function ExpiredPage({ reason }: ExpiredPageProps) {
  const router = useRouter();
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen px-4">
      <div className="flex flex-col items-center gap-8 max-w-md text-center animate-fade-in">
        <div className="relative">
          <div className="rounded-3xl bg-zinc-800/50 p-6">
            <Ghost className="h-16 w-16 text-zinc-600" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-violet-500/5 animate-pulse-glow" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-zinc-200">
            This PDF is no longer available
          </h1>
          <p className="text-zinc-500">
            {reason || "The document has been permanently deleted."}
          </p>
        </div>

        <div className="w-full space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-left">
            <Timer className="h-5 w-5 text-zinc-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-zinc-300">
                Expired
              </p>
              <p className="text-xs text-zinc-500">
                The link&apos;s time limit was reached and the document was
                auto-deleted.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => router.push("/")}
          variant="outline"
          size="lg"
          className="w-full"
        >
          <Home className="h-4 w-4 mr-2" />
          Back Home
        </Button>
      </div>
    </div>
  );
}
