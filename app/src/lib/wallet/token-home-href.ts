/** Deep-link to a token wallet (`/token?address=`). */
export function tokenHomeHref(phygitalToken: string): string {
  return `/token?address=${encodeURIComponent(phygitalToken)}`;
}
