import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1c1d20",
          color: "#f2f2f4",
          fontSize: 220,
          fontWeight: 600,
          letterSpacing: "-0.06em",
        }}
      >
        R
      </div>
    ),
    size,
  );
}
