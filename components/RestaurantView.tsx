"use client";

// Screen 2: the restaurant page. This file is a display layer.
// It calls GET /api/restaurants/[id], receives a shape ready to print —
// average, count, latest, list — and prints it. NO adding, NO dividing,
// NO sorting happens anywhere in this file.
import Link from "next/link";
import { useEffect, useState } from "react";
import StarIcon from "@/components/StarIcon";
import { formatWhen } from "@/lib/format";

type Review = { id: number; rating: number; comment: string; createdAt: string };
type RestaurantData = {
  id: number;
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

// Draws exactly `count` stars — a fact rendered, not calculated.
function Stars({ count, starClassName }: { count: number; starClassName?: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {Array.from({ length: count }, (_, index) => (
        <StarIcon key={index} filled className={starClassName ?? "h-4 w-4"} />
      ))}
    </span>
  );
}

// The hand-drawn underline under the restaurant name.
function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg width="132" height="10" viewBox="0 0 132 10" className={`text-accent ${className}`} fill="none" aria-hidden="true">
      <path
        d="M2 5.5c7-5 12 5 19 0s12 5 19 0 12 5 19 0 12 5 19 0 12 5 19 0 12 4 16 .5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function RestaurantView({ id }: { id: number }) {
  const [data, setData] = useState<RestaurantData | null>(null);
  const [missing, setMissing] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`/api/restaurants/${id}`)
      .then(async (response) => {
        if (response.status === 404) {
          if (alive) setMissing(true);
          return;
        }
        const body = await response.json();
        if (alive) setData(body);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (missing) {
    return (
      <main className="mx-auto min-h-screen max-w-[560px] px-6 py-24">
        <p className="font-display text-2xl">There is no restaurant called “{id}”.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-accent underline decoration-dotted underline-offset-4">
          ← Go home
        </Link>
      </main>
    );
  }

  if (failed) {
    return (
      <main className="mx-auto min-h-screen max-w-[560px] px-6 py-24">
        <p className="font-display text-2xl">The kitchen did not answer.</p>
        <p className="mt-2 text-sm text-muted">Refresh the page to ask again.</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto min-h-screen max-w-[560px] px-6 py-24">
        <p className="animate-pulse text-sm text-muted">Reading from cold storage…</p>
      </main>
    );
  }

  const { name, cuisine, area, averageRating, totalReviews, latestReview, reviews } = data;

  if (totalReviews === 0) {
    // Empty state: invite the first fact in.
    return (
      <main className="mx-auto min-h-screen max-w-[560px] px-6 pb-24 pt-12 sm:pt-16">
        <header>
          <h1 className="font-display text-[42px] leading-[1.05] sm:text-5xl">{name}</h1>
          <Squiggle className="mt-3" />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-muted">
            {cuisine} · {area}
          </p>
        </header>
        <section className="mt-12 rounded-3xl border-2 border-dashed border-ink/20 px-6 py-14 text-center">
          <p className="font-display text-2xl">Nobody has rated this place yet.</p>
          <p className="mt-2 text-sm text-muted">
            You could be the very first fact in this database.
          </p>
          <Link
            href={`/review/${id}`}
            className="mt-7 inline-block rounded-full bg-accent px-8 py-4 text-sm font-bold uppercase tracking-widest text-paper transition-colors duration-200 hover:bg-ink"
          >
            Be the first
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[560px] px-6 pb-24 pt-12 sm:pt-16">
      <header>
        <h1 className="font-display text-[42px] leading-[1.05] sm:text-5xl">{name}</h1>
        <Squiggle className="mt-3" />
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-muted">
          {cuisine} · {area}
        </p>
      </header>

      {/* The average, printed exactly as the backend handed it over. */}
      <section className="mt-10 flex items-end justify-between">
        <div>
          <span className="font-display text-[104px] leading-none tracking-tight">
            {averageRating}
          </span>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-muted">
            Average rating · out of 5
          </p>
        </div>
        <p className="pb-5 text-sm text-muted">
          {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
        </p>
      </section>

      <section className="mt-14">
        <span className="inline-block -rotate-2 rounded-full border-2 border-accent px-4 py-1 text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent">
          Latest
        </span>
        <figure className="mt-4 rounded-3xl bg-accent-soft px-7 py-8 sm:px-9">
          <blockquote className="font-display text-[26px] leading-snug">
            “{latestReview!.comment}”
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3 text-sm text-ink/70">
            <span className="text-accent">
              <Stars count={latestReview!.rating} />
            </span>
            <span>{formatWhen(latestReview!.createdAt)}</span>
          </figcaption>
        </figure>
      </section>

      {reviews.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-muted">
            Earlier reviews
          </h2>
          <ul className="mt-4">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="border-t border-ink/10 py-5 first:border-t-0 first:pt-0"
              >
                <p className="flex items-center gap-3 text-sm">
                  <span className="text-accent">
                    <Stars count={review.rating} />
                  </span>
                  <span className="text-muted">{formatWhen(review.createdAt)}</span>
                </p>
                <p className="mt-1.5 text-[15px] leading-relaxed">{review.comment}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-16 border-t border-ink/10 pt-10 text-center">
        <Link
          href={`/review/${id}`}
          className="inline-block rounded-full bg-ink px-9 py-4 text-sm font-bold uppercase tracking-widest text-paper transition-colors duration-200 hover:bg-accent"
        >
          Write a review
        </Link>
        <p className="mt-3 text-xs text-muted">
          Takes about twenty seconds. It lands in cold storage instantly.
        </p>
      </section>
    </main>
  );
}
