export default function Loading() {
  return (
    <main className="grid gap-3" aria-busy="true">
      <p className="text-sm text-muted">Chargement</p>
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="h-16 border-b border-line bg-sand/70" />
      ))}
    </main>
  );
}
