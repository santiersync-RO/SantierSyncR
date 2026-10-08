import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { siteMetadata } from "@/config/site";

/* eslint @next/next/no-img-element: off -- ImageResponse renders a pre-existing raster logo; next/image is unsupported in this metadata renderer. */
export const alt = "ȘantierSync — Mai puțin haos. Mai multă treabă dusă la capăt.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoPath = path.join(process.cwd(), "public", "brand", "logo-original.png");
  const logo = await readFile(logoPath);
  const logoData = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "66px 72px",
          color: "#152D4B",
          background: "#F7F4EC",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", width: 470, height: 120 }}>
          <img src={logoData} alt="" style={{ width: 460, height: "auto", objectFit: "contain" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, lineHeight: 1.05, fontWeight: 700 }}>{siteMetadata.openGraphTitle}</div>
          <div style={{ fontSize: 28, lineHeight: 1.3, color: "#334155" }}>
            {siteMetadata.openGraphDescription}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 23, fontWeight: 700, color: "#C2410C" }}>santiersync.ro</div>
      </div>
    ),
    size,
  );
}
