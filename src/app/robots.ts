import type { MetadataRoute } from "next";
import { SITE_URL, isProductionIndexingEnabled } from "@/lib/seo";
import { isUsedTractorsEnabled } from "@/lib/used-tractors";

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (!isProductionIndexingEnabled()) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  const usedEnabled = await isUsedTractorsEnabled();
  const disallow = ["/admin/", "/login/", "/api/", "/preview/", "/admin/preview/"];
  if (!usedEnabled) {
    disallow.push("/traktore-te-perdorur", "/traktore-te-perdorur/", "/en/used-tractors", "/tr/ikinci-el-traktorler");
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
