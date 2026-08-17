import { Category } from "@prisma/client";
import type { SpecGroup, SpecRow } from "@/lib/admin-content";
import { publicSubcategoryLabel } from "@/lib/product-path";
import type { PublicProduct } from "@/lib/types";

export const SPEC_KEYS = {
  model: "Modeli",
  power: "Fuqia",
  series: "Seria",
  usage: "Përdorimi",
  emission: "Standardi i emetimeve",
  engine: "Motori",
  torque: "Çifti rrotullues",
  axle: "Tërheqja",
  gear: "Transmisioni",
  lift: "Kapaciteti ngritës",
  cabin: "Tipi i kabinës",
  ac: "Kondicioneri",
} as const;

const INTERNAL_SPEC_KEYS = new Set(["Kaynak", "Source", "Kaynak dosyası"]);

const KEY_ALIASES: Record<string, string> = {
  "model name": SPEC_KEYS.model,
  model: SPEC_KEYS.model,
  modeli: SPEC_KEYS.model,
  "emission level": SPEC_KEYS.emission,
  stage: SPEC_KEYS.emission,
  "standardi i emetimeve": SPEC_KEYS.emission,
  "horse power": SPEC_KEYS.power,
  "fuqia (hp)": SPEC_KEYS.power,
  fuqia: SPEC_KEYS.power,
  serie: SPEC_KEYS.series,
  seria: SPEC_KEYS.series,
  "usage type": SPEC_KEYS.usage,
  përdorimi: SPEC_KEYS.usage,
  perdorimi: SPEC_KEYS.usage,
  "engine type": SPEC_KEYS.engine,
  motori: SPEC_KEYS.engine,
  torque: SPEC_KEYS.torque,
  "çifti rrotullues": SPEC_KEYS.torque,
  "cifti rrotullues": SPEC_KEYS.torque,
  axle: SPEC_KEYS.axle,
  tërheqja: SPEC_KEYS.axle,
  terheqja: SPEC_KEYS.axle,
  "cabin type": SPEC_KEYS.cabin,
  kabina: SPEC_KEYS.cabin,
  "tipi i kabinës": SPEC_KEYS.cabin,
  "tipi i kabines": SPEC_KEYS.cabin,
  gear: SPEC_KEYS.gear,
  transmisioni: SPEC_KEYS.gear,
  "lifting capacity": SPEC_KEYS.lift,
  "kapaciteti ngritës": SPEC_KEYS.lift,
  "kapaciteti ngrites": SPEC_KEYS.lift,
  hidraulika: SPEC_KEYS.lift,
  "air conditioning": SPEC_KEYS.ac,
  kondicioneri: SPEC_KEYS.ac,
};

export const SPEC_GROUP_DEFS: { id: string; title: string; keys: string[] }[] = [
  {
    id: "spec-group-permbledhje",
    title: "Përmbledhje",
    keys: [SPEC_KEYS.model, SPEC_KEYS.power, SPEC_KEYS.series, SPEC_KEYS.usage, SPEC_KEYS.emission],
  },
  {
    id: "spec-group-motori",
    title: "Motori",
    keys: [SPEC_KEYS.engine, SPEC_KEYS.torque],
  },
  {
    id: "spec-group-transmisioni",
    title: "Transmisioni",
    keys: [SPEC_KEYS.axle, SPEC_KEYS.gear],
  },
  {
    id: "spec-group-hidraulika",
    title: "Hidraulika",
    keys: [SPEC_KEYS.lift],
  },
  {
    id: "spec-group-komforti",
    title: "Komforti",
    keys: [SPEC_KEYS.cabin, SPEC_KEYS.ac],
  },
];

const EMPTY = /^(?:[-–—]|n\/a|na|null|undefined|yakında|coming soon)?$/i;

export function hasSpecValue(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed.length > 0 && !EMPTY.test(trimmed);
}

export function canonicalSpecKey(key: string): string {
  const normalized = key.trim().replace(/\s+/g, " ");
  return KEY_ALIASES[normalized.toLowerCase()] ?? normalized;
}

export function displaySpecValue(key: string, value: string): string {
  const canon = canonicalSpecKey(key);
  const raw = value.trim();
  const lower = raw.toLowerCase();

  if (canon === SPEC_KEYS.usage) {
    if (lower === "field" || lower === "tarla") return "Përdorim në fushë";
    if (lower === "orchard" || lower === "fruit garden" || lower === "bahçe" || lower === "bahce") return "Pemishte";
    return raw;
  }
  if (canon === SPEC_KEYS.ac) {
    if (lower === "yes" || lower === "po") return "Po";
    if (lower === "no" || lower === "jo") return "Jo";
    if (lower === "standard") return "Standard";
    return raw;
  }
  if (canon === SPEC_KEYS.axle) {
    if (/4\s*wd|four\s*whe+l/i.test(raw)) return "4 WD";
    return raw;
  }
  if (canon === SPEC_KEYS.emission) {
    const compact = lower.replace(/[^a-z0-9]/g, "");
    if (compact === "stage3a" || compact === "stageiiia" || compact === "iiia" || compact === "3a") return "Stage IIIA";
    if (compact === "stage5" || compact === "stagev" || compact === "v" || compact === "5") return "Stage V";
    return raw;
  }
  if (canon === SPEC_KEYS.cabin) {
    if (lower === "cabin" || lower === "kabinë" || lower === "kabine" || lower === "po") return "Cabin";
    if (lower === "rops" || lower === "jo" || lower.startsWith("jo ")) return "ROPS";
    if (lower === "orchard") return "ROPS";
    return raw;
  }
  return raw;
}

export function flattenSpecs(specs: Record<string, string> | null | undefined, groups?: SpecGroup[] | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (specs) {
    for (const [key, value] of Object.entries(specs)) {
      if (!hasSpecValue(value)) continue;
      out[canonicalSpecKey(key)] = value.trim();
    }
  }
  if (Array.isArray(groups)) {
    for (const group of groups) {
      for (const row of group.rows ?? []) {
        const key = canonicalSpecKey(row.key ?? "");
        if (!key || !hasSpecValue(row.value)) continue;
        if (!out[key]) out[key] = row.value.trim();
      }
    }
  }
  return out;
}

export type VisibleSpecGroup = { title: string; rows: { key: string; value: string }[] };

export function visibleSpecGroups(product: {
  specs?: Record<string, string> | null;
  specGroups?: SpecGroup[] | null | unknown;
}): VisibleSpecGroup[] {
  const stored = Array.isArray(product.specGroups) ? (product.specGroups as SpecGroup[]) : null;
  const flat = flattenSpecs(product.specs ?? {}, stored);
  const used = new Set<string>();
  const groups: VisibleSpecGroup[] = [];

  for (const def of SPEC_GROUP_DEFS) {
    const rows = def.keys
      .map((key) => {
        const value = flat[key];
        if (!hasSpecValue(value)) return null;
        used.add(key);
        return { key, value: displaySpecValue(key, value) };
      })
      .filter((row): row is { key: string; value: string } => row != null);
    if (rows.length) groups.push({ title: def.title, rows });
  }

  const extra = Object.entries(flat)
    .filter(([key]) => !used.has(key) && !INTERNAL_SPEC_KEYS.has(key))
    .filter(([, value]) => hasSpecValue(value))
    .map(([key, value]) => ({ key, value: displaySpecValue(key, value) }));
  if (extra.length) groups.push({ title: "Të tjera", rows: extra });
  return groups;
}

export function tractorHighlights(product: PublicProduct): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = [];
  if (product.horsePower != null) items.push({ label: "Fuqia", value: `${product.horsePower} HP` });
  if (hasSpecValue(product.stage)) {
    items.push({ label: "Standardi i emetimeve", value: displaySpecValue(SPEC_KEYS.emission, product.stage!.trim()) });
  }
  items.push({ label: "Tipi i kabinës", value: product.hasCabin ? "Cabin" : "ROPS" });
  if (hasSpecValue(product.series)) items.push({ label: "Seria", value: product.series.trim() });
  return items.slice(0, 4);
}

/** @deprecated Use productHighlights */
export const cinematicHighlights = tractorHighlights;

export function productHighlights(product: PublicProduct): { label: string; value: string }[] {
  if (product.category !== Category.EQUIPMENT) return tractorHighlights(product);

  const flat = flattenSpecs(product.specs, product.specGroups);
  const items: { label: string; value: string }[] = [];
  const category = publicSubcategoryLabel(product.subcategory) || (hasSpecValue(product.series) ? product.series.trim() : "");
  if (category) items.push({ label: "Kategoria", value: category });
  const width = flat["Gjerësia e punës"];
  if (hasSpecValue(width)) items.push({ label: "Gjerësia e punës", value: width });
  const capacity = flat["Kapaciteti"];
  if (hasSpecValue(capacity)) items.push({ label: "Kapaciteti", value: capacity });
  const connection = flat["Lidhja"];
  if (hasSpecValue(connection)) items.push({ label: "Lidhja", value: connection });
  const requiredHp = flat["HP e nevojshme"];
  if (items.length < 4 && hasSpecValue(requiredHp)) items.push({ label: "HP e nevojshme", value: requiredHp });
  return items.slice(0, 4);
}

export function toStoredSpecGroups(flat: Record<string, string>): SpecGroup[] {
  const used = new Set<string>();
  const groups: SpecGroup[] = [];

  for (const def of SPEC_GROUP_DEFS) {
    const rows: SpecRow[] = def.keys
      .map((key) => {
        const value = flat[key];
        if (!hasSpecValue(value)) return null;
        used.add(key);
        return { id: `spec-row-${slugId(key)}`, key, value: value.trim() };
      })
      .filter((row): row is SpecRow => row != null);
    if (rows.length) groups.push({ id: def.id, title: def.title, rows });
  }

  const extra = Object.entries(flat)
    .filter(([key]) => !used.has(key))
    .filter(([, value]) => hasSpecValue(value))
    .map(([key, value]) => ({ id: `spec-row-${slugId(key)}`, key, value: value.trim() }));
  if (extra.length) {
    groups.push({ id: "spec-group-te-tjera", title: "Të tjera", rows: extra });
  }
  return groups;
}

function slugId(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
