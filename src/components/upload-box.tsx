"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileText, X, Clock } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUpload } from "@/hooks/use-upload";
import { ALLOWED_EXPIRY_MINUTES, MAX_FILE_SIZE_MB } from "@/lib/constants";
import { ShareLink } from "./share-link";

export function UploadBox() {
  const {
    status,
    progress,
    error,
    shareUrl,
    expiresAt,
    expiryMinutes,
    upload,
    cancel,
    reset,
  } = useUpload();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedExpiry, setSelectedExpiry] = useState<number>(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === "application/pdf") {
          setSelectedFile(file);
        }
      }
    },
    []
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setSelectedFile(files[0]);
      }
    },
    []
  );

  const handleUpload = useCallback(() => {
    if (selectedFile) {
      upload(selectedFile, selectedExpiry);
    }
  }, [selectedFile, selectedExpiry, upload]);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setSelectedExpiry(10);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [reset]);

  if (shareUrl) {
    return (
      <ShareLink
        url={shareUrl}
        expiresAt={expiresAt}
        expiryMinutes={expiryMinutes}
        onReset={handleClear}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileSelect}
      />

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative group cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300",
            isDragOver
              ? "border-violet-500 bg-violet-500/10 scale-[1.02]"
              : "border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900/50"
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className={cn(
                "rounded-2xl p-4 transition-colors duration-300",
                isDragOver
                  ? "bg-violet-500/20 text-violet-400"
                  : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-300"
              )}
            >
              <Upload className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-medium text-zinc-200">
                {isDragOver ? "Drop your PDF here" : "Drop a PDF here"}
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                or click to browse
              </p>
            </div>
            <p className="text-xs text-zinc-600">
              Maximum file size: {MAX_FILE_SIZE_MB}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-violet-500/10 p-3">
              <FileText className="h-6 w-6 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                {formatBytes(selectedFile.size)}
              </p>
            </div>
            {status === "idle" && (
              <button
                onClick={handleClear}
                className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {(status === "encrypting" || status === "uploading") && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  {status === "encrypting"
                    ? "Encrypting..."
                    : "Uploading..."}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {status === "error" && (
            <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {status === "idle" && (
            <>
              <div className="mt-4">
                <p className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
                  <Clock className="h-3.5 w-3.5" />
                  Self-destruct after
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALLOWED_EXPIRY_MINUTES.map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSelectedExpiry(mins)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                        selectedExpiry === mins
                          ? "border-violet-500 bg-violet-500/10 text-violet-300"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {`${mins} min`}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button onClick={handleUpload} className="flex-1" size="lg">
                  Encrypt & Upload
                </Button>
              </div>
            </>
          )}

          {(status === "encrypting" || status === "uploading") && (
            <div className="mt-4">
              <Button
                onClick={cancel}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
