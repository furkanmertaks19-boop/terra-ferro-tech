export function withCloudinaryTransform(url: string, transform: string) {
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (url.includes(`/upload/${transform}/`)) return url;
  return url.replace("/upload/", `/upload/${transform}/`);
}

export function galleryGridUrl(url: string) {
  if (url.includes("/video/upload/")) {
    return withCloudinaryTransform(url.replace(/\.(mp4|webm|mov)(\?.*)?$/i, ".jpg"), "so_0,c_fill,g_auto,w_900,q_auto,f_jpg");
  }
  return withCloudinaryTransform(url, "c_fill,g_auto,w_1100,q_auto,f_auto");
}

export function cinematicHeroUrl(url: string) {
  return withCloudinaryTransform(url, "c_limit,w_2400,q_auto:best,f_auto");
}

export function cinematicGalleryUrl(url: string) {
  return withCloudinaryTransform(url, "c_limit,w_1600,q_auto,f_auto");
}

export function galleryLightboxUrl(url: string) {
  if (url.includes("/video/upload/")) return url;
  return withCloudinaryTransform(url, "c_limit,w_2200,q_auto:best,f_auto");
}

export function videoPosterFromMedia(url: string) {
  if (!url.includes("/video/upload/")) return url;
  return withCloudinaryTransform(url, "so_0,c_fill,g_auto,w_1400,q_auto,f_jpg").replace(/\.(mp4|webm|mov)(\?.*)?$/i, ".jpg");
}

export function publicGalleryThumb(item: { type: "IMAGE" | "VIDEO"; mediaUrl: string; thumbnailUrl?: string | null }) {
  if (item.thumbnailUrl) return galleryGridUrl(item.thumbnailUrl);
  if (item.type === "VIDEO") return videoPosterFromMedia(item.mediaUrl);
  return galleryGridUrl(item.mediaUrl);
}
