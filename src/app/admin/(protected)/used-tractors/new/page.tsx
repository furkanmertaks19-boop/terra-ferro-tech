import UsedTractorEditor from "@/components/admin/used-tractors/UsedTractorEditor";

export default function NewUsedTractorPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Yeni 2. El Traktör</h1>
        <p className="mt-1 text-sm text-[var(--admin-text-2)]">Kayıt taslak olarak başlar. Public görünmesi için durumu Satışta yapın ve 2. el modülünü açın.</p>
      </div>
      <UsedTractorEditor />
    </div>
  );
}
