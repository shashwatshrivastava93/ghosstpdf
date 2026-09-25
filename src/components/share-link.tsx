"use client";

import { useState } from "react";
import { Copy, Check, RotateCcw, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ShareLinkProps {
  url: string;
  expiresAt: string | null;
  expiryMinutes: number;
  onReset: () => void;
}

export function ShareLink({ url, expiresAt, expiryMinutes, onReset }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-emerald-500/20 bg-emerald-500/5">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="rounded-2xl bg-emerald-500/10 p-4">
            <Check className="h-8 w-8 text-emerald-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-zinc-100">
              Your PDF is ready
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              Share this link. It will self-destruct {expiryMinutes} minutes
              after it is shared.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-800/40 px-3 py-2 text-xs text-zinc-400">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {expiresAt ? (
              <span>
                Self-destructs at{" "}
                {new Date(expiresAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ) : (
              <span>Self-destructs in {expiryMinutes} minutes</span>
            )}
          </div>

          <div className="w-full">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 p-3">
              <code className="flex-1 text-sm text-zinc-300 truncate font-mono">
                {url}
              </code>
              <Button
                onClick={handleCopy}
                variant="ghost"
                size="sm"
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              onClick={onReset}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Upload Another
            </Button>
            <Button
              onClick={() => window.open(url, "_blank")}
              variant="ghost"
              className="flex-1"
              size="lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </Button>
          </div>

          <div className="rounded-lg bg-zinc-800/50 p-3 w-full">
            <p className="text-xs text-zinc-500">
              Until the link expires, the PDF can be opened any number of
              times. After the time limit, it is permanently deleted from our
              servers.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
