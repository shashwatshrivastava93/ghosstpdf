"use client";

import { useCallback, useRef, useState } from "react";
import { encryptFile } from "@/lib/crypto";
import { DEFAULT_EXPIRY_MINUTES, MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from "@/lib/constants";

export interface UploadState {
  status: "idle" | "encrypting" | "uploading" | "complete" | "error";
  progress: number;
  error: string | null;
  fileId: string | null;
  shareUrl: string | null;
  expiresAt: string | null;
  expiryMinutes: number;
}

export function useUpload() {
  const [state, setState] = useState<UploadState>({
    status: "idle",
    progress: 0,
    error: null,
    fileId: null,
    shareUrl: null,
    expiresAt: null,
    expiryMinutes: DEFAULT_EXPIRY_MINUTES,
  });
  const abortRef = useRef<AbortController | null>(null);

  const upload = useCallback(async (file: File, expiryMinutes = DEFAULT_EXPIRY_MINUTES) => {
    if (file.type !== "application/pdf") {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: "Only PDF files are allowed.",
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
      }));
      return;
    }

    if (file.size === 0) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: "File is empty.",
      }));
      return;
    }

    // Validate PDF magic bytes before encryption
    try {
      const magicBytes = await file.slice(0, 8).arrayBuffer();
      const magicString = String.fromCharCode(...new Uint8Array(magicBytes));
      if (!magicString.startsWith("%PDF-")) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Invalid PDF file. The file appears to be corrupted.",
        }));
        return;
      }
    } catch {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: "Failed to read file.",
      }));
      return;
    }

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      setState({
        status: "encrypting",
        progress: 0,
        error: null,
        fileId: null,
        shareUrl: null,
        expiresAt: null,
        expiryMinutes,
      });

      const { encryptedBlob, wrappedKeyHex, ivHex } = await encryptFile(file);

      if (abortController.signal.aborted) return;

      setState((prev) => ({ ...prev, status: "uploading", progress: 10 }));

      const createRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wrappedKey: wrappedKeyHex,
          iv: ivHex,
          expiryMinutes,
          size: encryptedBlob.size,
        }),
      });

      const createData = await createRes.json();

      if (!createData.success || !createData.data?.uploadUrl) {
        throw new Error(createData.error || "Upload failed");
      }

      const { id, expiresAt, uploadUrl } = createData.data;

      const xhr = new XMLHttpRequest();

      await new Promise<{ success: boolean }>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setState((prev) => ({ ...prev, progress: 10 + percent * 0.9 }));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ success: true });
          } else {
            reject(new Error("Upload failed"));
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error during upload"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled"));
        });

        abortController.signal.addEventListener("abort", () => {
          xhr.abort();
        });

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", "application/octet-stream");
        xhr.send(encryptedBlob);
      });

      if (abortController.signal.aborted) return;

      const shareUrl = `${window.location.origin}/v/${id}`;

      setState({
        status: "complete",
        progress: 100,
        error: null,
        fileId: id,
        shareUrl,
        expiresAt,
        expiryMinutes,
      });
    } catch (err) {
      if (abortController.signal.aborted) return;
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "Upload failed",
      }));
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState({
      status: "idle",
      progress: 0,
      error: null,
      fileId: null,
      shareUrl: null,
      expiresAt: null,
      expiryMinutes: DEFAULT_EXPIRY_MINUTES,
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      status: "idle",
      progress: 0,
      error: null,
      fileId: null,
      shareUrl: null,
      expiresAt: null,
      expiryMinutes: DEFAULT_EXPIRY_MINUTES,
    });
  }, []);

  return { ...state, upload, cancel, reset };
}
