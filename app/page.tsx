// Home: the index. One tagline, then every restaurant with its computed
// stats — click any card to open that restaurant, with all of its reviews.
import RestaurantsList from "@/components/RestaurantsList";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-[560px] px-6 pb-24 pt-12 sm:pt-16">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted">
          zomato-lite
        </p>
        <h1 className="mt-3 font-display text-[42px] leading-[1.05] sm:text-5xl">
          One database.
          <br />
          Real facts.
          <br />
          <span className="text-accent">Nothing computed.</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Pick a restaurant. Every rating shown is computed fresh from the
          stored facts, the moment you ask — never stored, never stale.
        </p>
      </header>

      <div className="mt-10">
        <RestaurantsList />
      </div>
    </main>
  );
}
