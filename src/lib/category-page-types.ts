import { Category } from "@prisma/client";

export type PublicCategoryPage = {
  category: Category;
  eyebrow: string;
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string | null;
  overlayOpacity: number;
  textPosition: "left" | "center";
};

export function isTextPosition(value: string): value is "left" | "center" {
  return value === "left" || value === "center";
}
