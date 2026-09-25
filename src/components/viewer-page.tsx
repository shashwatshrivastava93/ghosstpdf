"use client";

import { useEffect } from "react";
import { useViewer } from "@/hooks/use-viewer";
import { PdfViewer } from "@/components/pdf-viewer";
import { ExpiredPage } from "@/components/expired-page";
import { Logo } from "@/components/branding";
import { Loader2, KeyRound, FileSearch } from "lucide-react";

interface ViewerPageProps {
  id: string;
}

export function ViewerPage({ id }: ViewerPageProps) {
  const { status, error, pdfUrl, load } = useViewer(id);

  useEffect(() => {
    load();
  }, [load]);

  if (status === "expired" || status === "error") {
    return <ExpiredPage reason={error || "Document not available"} />;
  }

  if (status === "ready" && pdfUrl) {
    return (
      <div className="h-screen flex flex-col">
        <PdfViewer pdfUrl={pdfUrl} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <Logo />

        <div className="flex flex-col items-center gap-3">
          {status === "checking" && (
            <>
              <div className="relative">
                <FileSearch className="h-10 w-10 text-violet-400" />
                <Loader2 className="h-10 w-10 text-violet-400 absolute inset-0 animate-spin" />
              </div>
              <p className="text-sm text-zinc-400">Checking access...</p>
            </>
          )}

          {status === "decrypting" && (
            <>
              <div className="relative">
                <KeyRound className="h-10 w-10 text-violet-400" />
                <Loader2 className="h-10 w-10 text-violet-400 absolute inset-0 animate-spin" />
              </div>
              <p className="text-sm text-zinc-400">Decrypting document...</p>
            </>
          )}

          {status === "rendering" && (
            <>
              <div className="relative">
                <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
              </div>
              <p className="text-sm text-zinc-400">Rendering PDF...</p>
            </>
          )}
        </div>

        <div className="mt-8 rounded-full bg-violet-500/10 px-4 py-2">
          <p className="text-xs text-violet-400/60">
            This document self-destructs when the link expires
          </p>
        </div>
      </div>
    </div>
  );
}
