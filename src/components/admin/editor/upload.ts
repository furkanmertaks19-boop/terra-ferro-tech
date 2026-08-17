export type MediaUploadOk = { url: string; publicId: string; posterUrl?: string };

export function uploadWithProgress(
  file: File,
  onProgress: (n: number) => void,
  folder?: "products" | "slides" | "category-pages" | "pages" | "gallery"
): Promise<string | null> {
  return uploadMediaWithProgress(file, onProgress, folder).then((result) => result?.url ?? null);
}

export function uploadMediaWithProgress(
  file: File,
  onProgress: (n: number) => void,
  folder?: "products" | "slides" | "category-pages" | "pages" | "gallery"
): Promise<MediaUploadOk | null> {
  return postWithProgress("/api/admin/upload", file, onProgress, folder);
}

export function uploadVideoWithProgress(file: File, onProgress: (n: number) => void): Promise<MediaUploadOk | null> {
  return postWithProgress("/api/admin/upload-video", file, onProgress);
}

function postWithProgress(
  endpoint: string,
  file: File,
  onProgress: (n: number) => void,
  folder?: string
): Promise<MediaUploadOk | null> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as {
          url?: string;
          publicId?: string;
          posterUrl?: string;
          error?: string;
        };
        if (xhr.status >= 200 && xhr.status < 300 && data.url) {
          resolve({ url: data.url, publicId: data.publicId ?? "", posterUrl: data.posterUrl });
          return;
        }
        resolve(null);
      } catch {
        resolve(null);
      }
    };
    xhr.onerror = () => resolve(null);
    const form = new FormData();
    form.append("file", file);
    if (folder) form.append("folder", folder);
    xhr.send(form);
  });
}

export type PdfUploadOk = {
  ok: true;
  url: string;
  publicId: string;
  name: string;
  size: number;
};

export type PdfUploadResult = PdfUploadOk | { ok: false; error: string };

export function uploadPdfWithProgress(file: File, onProgress: (n: number) => void): Promise<PdfUploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload-pdf");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText) as {
          url?: string;
          publicId?: string;
          name?: string;
          size?: number;
          error?: string;
        };
        if (xhr.status >= 200 && xhr.status < 300 && data.url && data.publicId) {
          resolve({
            ok: true,
            url: data.url,
            publicId: data.publicId,
            name: data.name || file.name,
            size: data.size ?? file.size,
          });
          return;
        }
        resolve({ ok: false, error: data.error || "Yükleme başarısız oldu." });
      } catch {
        resolve({ ok: false, error: "Yükleme başarısız oldu." });
      }
    };
    xhr.onerror = () => resolve({ ok: false, error: "Yükleme başarısız oldu." });
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}
