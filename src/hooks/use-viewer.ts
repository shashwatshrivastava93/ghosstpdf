"use client";

import { useCallback, useState } from "react";
import { decryptFile } from "@/lib/crypto";

export interface ViewerState {
  status:
    | "checking"
    | "decrypting"
    | "rendering"
    | "ready"
    | "expired"
    | "error";
  error: string | null;
  pdfUrl: string | null;
}

export function useViewer(id: string) {
  const [state, setState] = useState<ViewerState>({
    status: "checking",
    error: null,
    pdfUrl: null,
  });

  const load = useCallback(async () => {
    try {
      const viewRes = await fetch(`/api/view/${id}`);
      const viewData = await viewRes.json();

      if (!viewData.success) {
        setState({
          status: "expired",
          error: viewData.error || "Document not available",
          pdfUrl: null,
        });
        return;
      }

      setState((prev) => ({ ...prev, status: "decrypting" }));

      const keyRes = await fetch(`/api/key/${id}`);
      const keyData = await keyRes.json();

      if (!keyData.success) {
        setState({
          status: "expired",
          error: keyData.error || "Document not available",
          pdfUrl: null,
        });
        return;
      }

      const dataRes = await fetch(`/api/data/${id}`);
      if (!dataRes.ok) {
        setState({
          status: "error",
          error: "Failed to download encrypted data",
          pdfUrl: null,
        });
        return;
      }

      const encryptedBuffer = await dataRes.arrayBuffer();

      const decryptedBuffer = await decryptFile(
        encryptedBuffer,
        keyData.data.wrappedKey,
        keyData.data.iv
      );

      const blob = new Blob([decryptedBuffer], { type: "application/pdf" });

      setState((prev) => ({ ...prev, status: "rendering" }));

      const url = URL.createObjectURL(blob);

      setState({
        status: "ready",
        error: null,
        pdfUrl: url,
      });
    } catch (err) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "Failed to load document",
        pdfUrl: null,
      });
    }
  }, [id]);

  return { ...state, load };
}
