import { groupsToSpecs, type SpecGroup } from "@/lib/admin-content";
import { flattenSpecs, hasSpecValue, SPEC_KEYS, toStoredSpecGroups } from "@/lib/specs";
import type { ArmaTracFacts, ArmaTracSource } from "./catalog";

export type ProductSnapshot = {
  id: string;
  name: string;
  horsePower: number | null;
  stage: string | null;
  series: string;
  subcategory: string | null;
  hasCabin: boolean;
  shortDescription: string | null;
  specs: Record<string, string>;
  specGroups: SpecGroup[] | null;
  referenceUrl: string | null;
  status: string;
  template: string;
  featured: boolean;
  isNew: boolean;
  isCampaign: boolean;
  slug: string;
};

export type FieldChange = {
  field: string;
  from: string | null;
  to: string | null;
  status: "SAME" | "ADDED" | "KEPT" | "CONFLICT";
};

export type MergePlan = {
  source: ArmaTracSource;
  product: ProductSnapshot | null;
  result: "UPDATED" | "SKIPPED" | "NO MATCH";
  changes: FieldChange[];
  next: {
    specs: Record<string, string>;
    specGroups: SpecGroup[];
    shortDescription: string | null;
    referenceUrl: string | null;
  } | null;
};

function normalizeStage(value: string | null | undefined): string | null {
  if (!value) return null;
  const compact = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (compact === "stage3a" || compact === "stageiiia" || compact === "iiia" || compact === "3a") return "Stage IIIA";
  if (compact === "stage5" || compact === "stagev" || compact === "v" || compact === "5") return "Stage V";
  return value.trim();
}

function formatHp(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(value)) return null;
  return Number.isInteger(value) ? String(value) : String(value);
}

function mapAc(value: string | null): string | null {
  if (!value) return null;
  const lower = value.trim().toLowerCase();
  if (lower === "yes" || lower === "po") return "Po";
  if (lower === "no" || lower === "jo") return "Jo";
  return value.trim();
}

function isEmptyText(value: string | null | undefined) {
  return !value || !value.trim();
}

function sourceSpecMap(facts: ArmaTracFacts, product: ProductSnapshot, generationSafe: boolean): Record<string, string> {
  const out: Record<string, string> = {};
  if (!generationSafe) return out;

  const emission = normalizeStage(facts.emission);
  if (emission) out[SPEC_KEYS.emission] = emission;
  if (facts.usageType) out[SPEC_KEYS.usage] = facts.usageType;
  if (facts.engine) out[SPEC_KEYS.engine] = facts.engine;
  if (facts.torque) out[SPEC_KEYS.torque] = facts.torque;
  if (facts.axle) out[SPEC_KEYS.axle] = facts.axle;
  if (facts.gear) out[SPEC_KEYS.gear] = facts.gear;
  if (facts.liftingCapacity) out[SPEC_KEYS.lift] = facts.liftingCapacity;
  const ac = mapAc(facts.airConditioning);
  if (ac) out[SPEC_KEYS.ac] = ac;

  const hp = formatHp(product.horsePower);
  if (hp) out[SPEC_KEYS.power] = hp;
  if (product.series) out[SPEC_KEYS.series] = product.series;
  if (product.stage) out[SPEC_KEYS.emission] = normalizeStage(product.stage) ?? product.stage;
  out[SPEC_KEYS.cabin] = product.hasCabin ? "Po" : "Jo (Rops)";
  if (product.subcategory && !out[SPEC_KEYS.usage]) out[SPEC_KEYS.usage] = product.subcategory;
  return out;
}

export function planMerge(source: ArmaTracSource, product: ProductSnapshot | null): MergePlan {
  if (!product || source.match === "NO MATCH") {
    return { source, product, result: "NO MATCH", changes: [], next: null };
  }
  if (source.match === "CONFLICT") {
    return {
      source,
      product,
      result: "SKIPPED",
      changes: source.identityConflicts.map((item) => ({
        field: item.split(":")[0]?.trim() || "identity",
        from: item,
        to: null,
        status: "CONFLICT",
      })),
      next: null,
    };
  }

  const existing = flattenSpecs(product.specs, product.specGroups);
  if (hasSpecValue(product.stage) && !existing[SPEC_KEYS.emission]) {
    existing[SPEC_KEYS.emission] = normalizeStage(product.stage) ?? product.stage;
  }
  if (product.horsePower != null && !existing[SPEC_KEYS.power]) {
    existing[SPEC_KEYS.power] = formatHp(product.horsePower) ?? String(product.horsePower);
  }
  if (product.series && !existing[SPEC_KEYS.series]) existing[SPEC_KEYS.series] = product.series;
  if (!existing[SPEC_KEYS.cabin]) existing[SPEC_KEYS.cabin] = product.hasCabin ? "Po" : "Jo (Rops)";
  if (product.subcategory && !existing[SPEC_KEYS.usage]) existing[SPEC_KEYS.usage] = product.subcategory;

  const incoming = sourceSpecMap(source.facts, product, source.generationSafe);
  const nextFlat = { ...existing };
  const changes: FieldChange[] = [];

  for (const [key, incomingValue] of Object.entries(incoming)) {
    const current = existing[key];
    if (!hasSpecValue(incomingValue)) continue;
    if (!hasSpecValue(current)) {
      nextFlat[key] = incomingValue;
      changes.push({ field: key, from: null, to: incomingValue, status: "ADDED" });
      continue;
    }
    if (current.trim() === incomingValue.trim()) {
      changes.push({ field: key, from: current, to: incomingValue, status: "SAME" });
      continue;
    }
    if (key === SPEC_KEYS.emission && normalizeStage(current) === normalizeStage(incomingValue)) {
      nextFlat[key] = normalizeStage(current) ?? current;
      changes.push({ field: key, from: current, to: nextFlat[key], status: "SAME" });
      continue;
    }
    changes.push({ field: key, from: current, to: incomingValue, status: "KEPT" });
  }

  if (source.facts.horsePower != null && product.horsePower != null && source.facts.horsePower !== product.horsePower) {
    changes.push({
      field: "horsePower",
      from: formatHp(product.horsePower),
      to: formatHp(source.facts.horsePower),
      status: "CONFLICT",
    });
  }
  if (source.facts.emission && product.stage && normalizeStage(source.facts.emission) !== normalizeStage(product.stage)) {
    if (!changes.some((change) => change.field === "stage" || (change.field === SPEC_KEYS.emission && change.status === "CONFLICT"))) {
      changes.push({
        field: "stage",
        from: product.stage,
        to: normalizeStage(source.facts.emission),
        status: "CONFLICT",
      });
    }
  }

  const nextDescription = isEmptyText(product.shortDescription) ? source.description : product.shortDescription;
  if (nextDescription && nextDescription !== (product.shortDescription ?? "").trim()) {
    changes.push({
      field: "shortDescription",
      from: product.shortDescription,
      to: nextDescription,
      status: isEmptyText(product.shortDescription) ? "ADDED" : "KEPT",
    });
  }

  if (product.referenceUrl !== source.url) {
    changes.push({
      field: "referenceUrl",
      from: product.referenceUrl,
      to: source.url,
      status: product.referenceUrl ? "KEPT" : "ADDED",
    });
  }

  const specGroups = toStoredSpecGroups(nextFlat);
  const specs = groupsToSpecs(specGroups);
  const currentFlat = flattenSpecs(product.specs, product.specGroups);
  const nextCanon = JSON.stringify(Object.keys(nextFlat).sort().map((key) => [key, nextFlat[key]]));
  const currentCanon = JSON.stringify(Object.keys(currentFlat).sort().map((key) => [key, currentFlat[key]]));
  const willWrite =
    nextCanon !== currentCanon ||
    (nextDescription ?? null) !== (product.shortDescription ?? null) ||
    product.referenceUrl !== source.url;

  return {
    source,
    product,
    result: willWrite ? "UPDATED" : "SKIPPED",
    changes,
    next: {
      specs,
      specGroups,
      shortDescription: nextDescription ?? null,
      referenceUrl: source.url,
    },
  };
}
