import type { Metadata } from "next";
import { ExpiredPage } from "@/components/expired-page";

export const metadata: Metadata = {
  title: "GhostPDF - Document Expired",
  description: "This document is no longer available.",
};

export default function ExpiredRoute() {
  return <ExpiredPage />;
}
