export default function Loading() {
  return (
    <main className="grid gap-3" aria-busy="true">
      <p className="text-sm text-muted">Chargement des offres</p>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="h-20 border-b border-line bg-sand/70" />
      ))}
    </main>
  );
}
