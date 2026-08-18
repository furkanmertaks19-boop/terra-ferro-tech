import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: "Traktorë ArmaTrac dhe makineri bujqësore në Shqipëri.",
    start_url: "/",
    display: "standalone",
    background_color: "#101214",
    theme_color: "#101214",
    lang: "sq",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
