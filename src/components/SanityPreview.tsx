"use client";

import { VisualEditing } from "@sanity/visual-editing/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export default function SanityPreview() {
  const router = useRouter();
  const refresh = useCallback(async () => {
    router.refresh();
  }, [router]);

  return <VisualEditing refresh={refresh} portal />;
}
