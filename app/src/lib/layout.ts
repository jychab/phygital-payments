/** Shared layout tokens for AppShell — keep routes visually cohesive. */

/**
 * Column widths:
 * - gallery: Collection hub + card detail (binder needs room)
 * - compact: NFC ceremony, claim, Pay, Collect, accessory task (task focus)
 *
 * Gallery steps up at `md` / `lg` so desktop is a real grid, not a stretched
 * phone. Compact stays task-narrow on every breakpoint.
 */
export const shellLayoutClass = {
  gallery: "max-w-lg md:max-w-3xl lg:max-w-5xl",
  compact: "max-w-md md:max-w-lg",
} as const;

export type ShellLayout = keyof typeof shellLayoutClass;

/**
 * Horizontal + vertical chrome — identical on every route.
 * `max()` keeps iOS notches / home-indicator landscape insets from clipping.
 */
export const shellPaddingClass = [
  "pt-[max(1.25rem,env(safe-area-inset-top))]",
  "pb-[max(1rem,env(safe-area-inset-bottom))]",
  "pl-[max(1rem,env(safe-area-inset-left))]",
  "pr-[max(1rem,env(safe-area-inset-right))]",
  "sm:pl-[max(1.5rem,env(safe-area-inset-left))]",
  "sm:pr-[max(1.5rem,env(safe-area-inset-right))]",
  "md:pl-[max(2rem,env(safe-area-inset-left))]",
  "md:pr-[max(2rem,env(safe-area-inset-right))]",
  "lg:pl-[max(2.5rem,env(safe-area-inset-left))]",
  "lg:pr-[max(2.5rem,env(safe-area-inset-right))]",
].join(" ");

/** Sticky dock — spans the full shell column width. */
export const stickyDockClass = "w-full max-w-full self-stretch";

/** Centered ceremony / gate copy blocks. */
export const copyBlockClass = "w-full max-w-72 mx-auto";

/** Centered single-action blocks below ceremony copy. */
export const ctaBlockClass = "w-full max-w-xs mx-auto";

/** Centered gate / loading blocks. */
export const centeredBlockClass =
  "flex flex-1 flex-col items-center justify-center gap-3 py-10 sm:py-14 text-center";

/**
 * Minted card detail: stacked art → dossier on the phone, side-by-side
 * marketplace layout from `lg` up.
 */
export const detailSplitClass =
  "flex flex-1 flex-col gap-6 lg:grid lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(18rem,26rem)_minmax(0,1fr)]";

/** Collection card grid — scales with the gallery shell. */
export const collectionGridClass =
  "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5";

/** Accessory list — single column on phone, two-up on desktop. */
export const accessoryListClass = "flex flex-col gap-2 lg:grid lg:grid-cols-2";
