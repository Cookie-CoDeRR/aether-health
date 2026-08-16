"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function DoctorsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const specialty = searchParams.get("specialty");
    if (specialty) {
      router.replace(`/discovery?tab=doctors&specialty=${encodeURIComponent(specialty)}`);
    } else {
      router.replace("/discovery?tab=doctors");
    }
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center p-12 text-xs text-[#64748B]">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1E5D57] border-t-transparent"></div>
        <span>Routing to Find Care portal...</span>
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#64748B]">Loading Find Care...</div>}>
      <DoctorsRedirect />
    </Suspense>
  );
}
