export type AdminCategory = {
  id: string;
  kind: "TRACTOR" | "EQUIPMENT";
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
};

export type CategoryTree = {
  root: AdminCategory;
  children: AdminCategory[];
};
