export default function AdminLoading() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="admin-skeleton h-32" />
      ))}
      <div className="admin-skeleton h-56 sm:col-span-2 xl:col-span-4" />
    </div>
  );
}
