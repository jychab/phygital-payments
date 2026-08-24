"use client";

import { useMemo } from "react";
import { renderSVG } from "uqr";

/** Local QR — deposit address never leaves the device. */
export function AddressQr({
  value,
  size = 176,
}: {
  value: string;
  size?: number;
}) {
  const svg = useMemo(() => {
    if (!value) return "";
    return renderSVG(value, {
      ecc: "M",
      border: 2,
      blackColor: "#0a0a0a",
      whiteColor: "#ffffff",
      pixelSize: 4,
    });
  }, [value]);

  if (!value || !svg) return null;

  return (
    <div
      className="mx-auto overflow-hidden rounded-2xl bg-white p-2 [&_svg]:h-full [&_svg]:w-full"
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
