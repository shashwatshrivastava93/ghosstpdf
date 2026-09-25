"use client";

import { ViewerPage } from "@/components/viewer-page";
import { use } from "react";

export default function ViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ViewerPage id={id} />;
}
