"use client";

import { Ghost, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen px-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center animate-fade-in">
        <div className="rounded-3xl bg-zinc-800/50 p-6">
          <Ghost className="h-16 w-16 text-zinc-600" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-zinc-200">Page not found</h1>
          <p className="text-zinc-500">
            The page you are looking for does not exist or has been removed.
          </p>
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