"use client";

type SpecRow = { key: string; value: string };

export default function SpecsEditor({
  rows,
  onChange,
}: {
  rows: SpecRow[];
  onChange: (rows: SpecRow[]) => void;
}) {
  function update(i: number, field: "key" | "value", val: string) {
    const next = rows.slice();
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  }

  function remove(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }

  function add() {
    onChange([...rows, { key: "", value: "" }]);
  }

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={row.key}
            onChange={(e) => update(i, "key", e.target.value)}
            placeholder="Özellik (örn: Motor Gücü)"
            className="w-1/2 rounded border border-black/15 px-3 py-2 text-sm"
          />
          <input
            value={row.value}
            onChange={(e) => update(i, "value", e.target.value)}
            placeholder="Değer (örn: 50 HP)"
            className="w-1/2 rounded border border-black/15 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="shrink-0 rounded border border-black/15 px-3 text-sm text-red-600 hover:bg-red-50"
          >
            Sil
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="rounded border border-dashed border-black/25 px-3 py-2 text-sm text-black/60 hover:border-black/40"
      >
        + Özellik Ekle
      </button>
    </div>
  );
}
