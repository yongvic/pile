import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-lg content-center gap-3 px-4">
      <h1 className="font-serif text-3xl">Page introuvable</h1>
      <Link className="text-green" href="/">
        Retour à Pile
      </Link>
    </main>
  );
}
