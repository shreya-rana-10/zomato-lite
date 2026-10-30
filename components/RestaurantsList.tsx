"use client";

// The index of all restaurants, for the home page. A display layer:
// fetches GET /api/restaurants and prints it. No adding, no dividing,
// no sorting here — the backend already computed and ordered everything.
import Link from "next/link";
import { useEffect, useState } from "react";

type RestaurantCard = {
  id: number;
  name: string;
  cuisine: string;
  area: string;
  totalReviews: number;
  averageRating: number | null;
  latestReviewComment: string | null;
};

export default function RestaurantsList() {
  const [restaurants, setRestaurants] = useState<RestaurantCard[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/restaurants")
      .then(async (response) => {
        const body = await response.json();
        if (alive) setRestaurants(body);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (failed) {
    return (
      <p className="mt-12 rounded-2xl bg-accent-soft px-5 py-4 text-sm font-medium text-accent">
        The kitchen did not answer. Refresh to ask again.
      </p>
    );
  }

  if (!restaurants) {
    return (
      <div className="mt-12 flex flex-col gap-4">
        {[0, 1, 2].map((index) => (
          <div key={index} className="animate-pulse border-t border-ink/10 py-6 first:border-t-0">
            <p className="h-6 w-1/2 rounded-full bg-ink/10" />
            <p className="mt-2 h-3 w-1/3 rounded-full bg-ink/10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ul>
      {restaurants.map((restaurant) => (
        <li key={restaurant.id} className="border-t border-ink/10 first:border-t-0">
          <Link
            href={`/restaurant/${restaurant.id}`}
            className="group block py-6"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <h2 className="font-display text-[26px] leading-tight transition-colors group-hover:text-accent">
                  {restaurant.name}
                </h2>
                <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.2em] text-muted">
                  {restaurant.cuisine} · {restaurant.area}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {restaurant.totalReviews === 0 ? (
                  <p className="text-sm font-medium text-muted">
                    No reviews yet
                  </p>
                ) : (
                  <>
                    {/* Printed exactly as the backend handed it over. */}
                    <p className="font-display text-4xl leading-none">
                      {restaurant.averageRating}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {restaurant.totalReviews}{" "}
                      {restaurant.totalReviews === 1 ? "review" : "reviews"}
                    </p>
                  </>
                )}
              </div>
            </div>
            {restaurant.latestReviewComment && (
              <p className="mt-3 truncate font-display text-[15px] text-ink/60 transition-colors group-hover:text-ink/80">
                “{restaurant.latestReviewComment}”
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
