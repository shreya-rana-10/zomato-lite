"use client";

// Screen 1: write a review. This file's job is collection, not judgement —
// the backend validates again, and any refusal is displayed verbatim.
import { useRouter } from "next/navigation";
import { useState } from "react";
import StarIcon from "@/components/StarIcon";

const VERDICTS = ["", "Not good", "Underwhelming", "Fine", "Good", "Unreal"];

export default function ReviewForm({
  restaurantId,
  name,
  area,
}: {
  restaurantId: number;
  name: string;
  area: string;
}) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kindness for the keyboard-less: the button is only enabled when a rating
  // is chosen and the comment is not just spaces. The BACKEND still checks.
  const canSend = rating !== null && comment.trim() !== "" && !sending;

  const shown = hovered ?? rating;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, rating, comment }),
      });
      if (response.ok) {
        router.push(`/restaurant/${restaurantId}`);
        return;
      }
      const data = await response.json().catch(() => null);
      setError(
        data && typeof data.error === "string" && data.error
          ? data.error
          : `The backend refused this (HTTP ${response.status}).`
      );
      setSending(false);
    } catch {
      setError("Could not reach the backend. Is the server running?");
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted">
          You are reviewing
        </p>
        <h1 className="font-display text-4xl leading-tight">{name}</h1>
        <p className="text-sm text-muted">{area}</p>
      </header>

      <div className="flex flex-col gap-3">
        <div
          className="flex items-center justify-between"
          onMouseLeave={() => setHovered(null)}
        >
          {[1, 2, 3, 4, 5].map((value) => {
            const lit = shown !== null && value <= shown;
            return (
              <button
                key={value}
                type="button"
                aria-label={`Rate ${value} of 5`}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHovered(value)}
                className={`p-1 transition-all duration-150 ease-out hover:scale-110 active:scale-75 ${
                  lit ? "text-accent" : "text-ink/20 hover:text-accent/70"
                } ${shown === value ? "scale-125" : ""}`}
              >
                <StarIcon filled={lit} className="h-12 w-12" />
              </button>
            );
          })}
        </div>
        <p className="text-center text-sm text-muted" aria-live="polite">
          {rating === null
            ? "Pick a star. 1 is worst, 5 is unreal."
            : `${rating} / 5 — ${VERDICTS[rating]}`}
        </p>
      </div>

      <label className="flex flex-col gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-muted">
          What happened
        </span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={5}
          placeholder="Paneer burrito is unreal"
          className="min-h-[140px] w-full resize-none rounded-2xl border border-ink/15 bg-white/60 px-5 py-4 text-[15px] leading-relaxed text-ink placeholder:text-ink/30 focus:border-accent focus:outline-none"
        />
      </label>

      {error && (
        <p
          className="rounded-2xl bg-accent-soft px-5 py-4 text-sm font-medium leading-relaxed text-accent"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSend}
        className="rounded-full bg-ink px-8 py-4 text-sm font-bold uppercase tracking-widest text-paper transition-colors duration-200 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
      >
        {sending ? "Sending to the kitchen…" : "Submit review"}
      </button>
    </form>
  );
}
