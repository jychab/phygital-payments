/** Shared layout tokens for AppShell — keep routes visually cohesive. */

/**
 * Column widths:
 * - gallery: Collection hub + card detail (binder needs room)
 * - compact: NFC ceremony, claim, Pay, Collect, accessory task (task focus)
 *
 * Both step up once at `md` so desktop doesn’t feel like a stretched phone
 * on one route and a fixed strip on another.
 */
export const shellLayoutClass = {
  gallery: "max-w-lg md:max-w-xl",
  compact: "max-w-md md:max-w-lg",
} as const;

export type ShellLayout = keyof typeof shellLayoutClass;

/** Horizontal + vertical chrome — identical on every route. */
export const shellPaddingClass = "px-5 pb-4 pt-5 sm:px-6 md:px-8";

/** Centered gate / loading blocks. */
export const centeredBlockClass =
  "flex flex-1 flex-col items-center justify-center gap-3 py-14 text-center";
