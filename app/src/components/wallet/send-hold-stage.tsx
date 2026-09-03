"use client";

import { AnimatePresence, LazyMotion, domAnimation, m } from "framer-motion";

import { NavBar } from "@/components/shared/nav-bar";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";

export function SendHoldStage({
  phase,
  imageSrc,
  onClose,
}: {
  phase: "holding" | "success";
  imageSrc?: string | null;
  onClose: () => void;
}) {
  return (
    <LazyMotion features={domAnimation}>
      <div className="flex flex-1 flex-col">
        <NavBar
          leading={
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              {copy.common.cancel}
            </Button>
          }
        />
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={phase}
            initial={{ opacity: 0, y: 10, scale: 0.995, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, scale: 0.995, filter: "blur(4px)" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-1 flex-col"
          >
            <NfcHoldStatus
              size="lg"
              pulsing={phase === "holding"}
              busy={phase === "holding"}
              tone={phase === "success" ? "success" : "default"}
              imageSrc={imageSrc}
              title={phase === "success" ? copy.wallet.sent : copy.wallet.holdToSend}
              body={phase === "success" ? undefined : copy.verify.holdStillBody}
              action={
                phase === "success" ? (
                  <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <Button type="button" size="lg" className="w-full" onClick={onClose}>
                      {copy.common.done}
                    </Button>
                  </m.div>
                ) : undefined
              }
            />
          </m.div>
        </AnimatePresence>
      </div>
    </LazyMotion>
  );
}

