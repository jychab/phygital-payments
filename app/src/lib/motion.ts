/** Gallery motion tokens — compositor-friendly Tailwind arbitrary animations. */

export const STAGGER_STEP_MS = 40;
export const STAGGER_CAP = 6;

/** Cap stagger index so grids with many items don't cascade too long. */
export function staggerStyle(index: number): { animationDelay: string } {
  const capped = Math.min(index, STAGGER_CAP);
  return { animationDelay: `${capped * STAGGER_STEP_MS}ms` };
}

export const galleryAnimate = {
  rise: "motion-safe:animate-[gallery-rise_0.45s_cubic-bezier(0.22,1,0.36,1)_both]",
  fade: "motion-safe:animate-[gallery-fade_0.22s_ease-out_both]",
  scaleIn:
    "motion-safe:animate-[gallery-scale-in_0.4s_cubic-bezier(0.22,1,0.36,1)_both]",
  check:
    "motion-safe:animate-[gallery-check_0.35s_cubic-bezier(0.22,1,0.36,1)_both]",
  shimmer: "motion-safe:animate-[gallery-shimmer_1.4s_ease-in-out_infinite]",
  pulse: "motion-safe:animate-[gallery-pulse_1.4s_ease-out]",
  successRing:
    "motion-safe:animate-[gallery-rise_0.4s_cubic-bezier(0.22,1,0.36,1)]",
  slideUp:
    "motion-safe:animate-[gallery-slide-up_0.5s_cubic-bezier(0.22,1,0.36,1)_both]",
  stage:
    "motion-safe:animate-[gallery-stage_0.28s_cubic-bezier(0.22,1,0.36,1)_both]",
} as const;
