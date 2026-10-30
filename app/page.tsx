import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[560px] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-3xl leading-snug text-ink">
        One restaurant. Real facts. Nothing computed.{" "}
        <Link
          href="/restaurant/1"
          className="whitespace-nowrap text-accent underline decoration-dotted decoration-2 underline-offset-8 transition-colors hover:text-ink"
        >
          Open Ludhiana Burrito →
        </Link>
      </p>
    </main>
  );
}
