export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024;
export const CLIENT_MAX_VIDEO_MB = Math.round(MAX_VIDEO_BYTES / (1024 * 1024));

const DEFAULT_MAX_PDF_BYTES = 20 * 1024 * 1024;

export function maxPdfBytes() {
  const fromEnv = Number(process.env.MAX_TECHNICAL_PDF_BYTES);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return Math.floor(fromEnv);
  return DEFAULT_MAX_PDF_BYTES;
}

export function maxPdfMb(bytes = maxPdfBytes()) {
  return Math.max(1, Math.round(bytes / (1024 * 1024)));
}

export const CLIENT_MAX_PDF_BYTES = DEFAULT_MAX_PDF_BYTES;
export const CLIENT_MAX_PDF_MB = Math.round(DEFAULT_MAX_PDF_BYTES / (1024 * 1024));

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isAllowedImage(file: File, buffer: Buffer) {
  if (!IMAGE_TYPES.has(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) return false;
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  if (buffer.length >= 8 && buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") return true;
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return true;
  }
  return false;
}
