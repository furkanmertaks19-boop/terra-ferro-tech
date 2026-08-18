import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME } from "@/lib/seo";

export const alt = "Terra Ferro Tech — Traktorë dhe Makineri Bujqësore në Shqipëri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#101214",
          color: "#f3f0e9",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(115deg, rgb(197 40 47 / 0.22) 0%, transparent 42%), linear-gradient(180deg, #171a1d 0%, #101214 100%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={148} height={148} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -0.5 }}>{SITE_NAME}</div>
              <div style={{ marginTop: 8, fontSize: 22, color: "#c6c4bd" }}>Lushnje, Shqipëri</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
            <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.2 }}>
              Traktorë dhe makineri bujqësore
            </div>
            <div style={{ marginTop: 18, fontSize: 28, color: "#c6c4bd" }}>ArmaTrac · pajisje · mbështetje teknike</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
