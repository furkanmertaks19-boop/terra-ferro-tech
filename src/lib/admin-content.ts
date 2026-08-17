export type SpecRow = { id: string; key: string; value: string };
export type SpecGroup = { id: string; title: string; rows: SpecRow[] };

export type ContentBlock =
  | { id: string; type: "text"; html: string }
  | { id: string; type: "image"; url: string; alt: string }
  | { id: string; type: "image-text"; url: string; html: string }
  | { id: string; type: "highlight"; title: string; body: string }
  | { id: string; type: "features"; items: { id: string; title: string; body: string }[] }
  | { id: string; type: "cta"; title: string; body: string };

export function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2, 10)}`;
}

export function specsToGroups(specs: Record<string, string>, groups?: SpecGroup[] | null): SpecGroup[] {
  if (Array.isArray(groups) && groups.length > 0) return groups;
  const rows = Object.entries(specs).map(([key, value]) => ({ id: uid(), key, value }));
  return [{ id: uid(), title: "Genel", rows: rows.length ? rows : [{ id: uid(), key: "", value: "" }] }];
}

export function groupsToSpecs(groups: SpecGroup[]): Record<string, string> {
  const specs: Record<string, string> = {};
  for (const group of groups) {
    for (const row of group.rows) {
      const key = row.key.trim();
      if (key) specs[key] = row.value;
    }
  }
  return specs;
}

export function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function suggestedSpecGroups(category: "TRACTOR" | "EQUIPMENT"): SpecGroup[] {
  if (category === "TRACTOR") {
    return [
      {
        id: uid(),
        title: "Përmbledhje",
        rows: [
          { id: uid(), key: "Modeli", value: "" },
          { id: uid(), key: "Fuqia", value: "" },
          { id: uid(), key: "Seria", value: "" },
          { id: uid(), key: "Përdorimi", value: "" },
          { id: uid(), key: "Standardi i emetimeve", value: "" },
        ],
      },
      {
        id: uid(),
        title: "Motori",
        rows: [
          { id: uid(), key: "Motori", value: "" },
          { id: uid(), key: "Çifti rrotullues", value: "" },
        ],
      },
      {
        id: uid(),
        title: "Transmisioni",
        rows: [
          { id: uid(), key: "Tërheqja", value: "" },
          { id: uid(), key: "Transmisioni", value: "" },
        ],
      },
      {
        id: uid(),
        title: "Hidraulika",
        rows: [{ id: uid(), key: "Kapaciteti ngritës", value: "" }],
      },
      {
        id: uid(),
        title: "Komforti",
        rows: [
          { id: uid(), key: "Tipi i kabinës", value: "" },
          { id: uid(), key: "Kondicioneri", value: "" },
        ],
      },
    ];
  }
  return [
    {
      id: uid(),
      title: "Çalışma",
      rows: [
        { id: uid(), key: "Gjerësia e punës", value: "" },
        { id: uid(), key: "HP e nevojshme", value: "" },
        { id: uid(), key: "Kapaciteti", value: "" },
      ],
    },
    {
      id: uid(),
      title: "Boyutlar",
      rows: [
        { id: uid(), key: "Pesha", value: "" },
        { id: uid(), key: "Dimensionet", value: "" },
      ],
    },
    {
      id: uid(),
      title: "Bağlantı",
      rows: [{ id: uid(), key: "Lidhja", value: "" }],
    },
  ];
}
