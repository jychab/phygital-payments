"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";
import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Return to owner dashboard — same journey only. */
export function BackToDashboard({ className }: { className?: string }) {
  return (
    <div className={cn("mb-4", galleryAnimate.fade, className)}>
      <Button type="button" variant="ghost" size="sm" className="gap-1.5" asChild>
        <Link href="/">
          <ArrowLeft className="size-4" aria-hidden />
          {copy.backToDashboard}
        </Link>
      </Button>
    </div>
  );
}
