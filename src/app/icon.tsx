import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const alt = "Simbolul ȘantierSync";

/* eslint @next/next/no-img-element: off -- ImageResponse renders the supplied raster logo; next/image is unsupported in this metadata renderer. */
export default async function Icon() {
  const logoPath = path.join(process.cwd(), "public", "brand", "logo-original.png");
  const logo = await readFile(logoPath);
  const logoData = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: "#0B2D4D",
        }}
      >
        <img
          src={logoData}
          alt=""
          style={{
            position: "absolute",
            width: 158.1,
            height: 79.05,
            left: -8,
            top: -23.35,
            maxWidth: 158.1,
          }}
        />
      </div>
    ),
    size,
  );
}
