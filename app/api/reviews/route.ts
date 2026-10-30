// POST /api/reviews — the door into the kitchen where a new review is handed in.
// The frontend is only one polite visitor: anyone with a terminal can talk
// to this endpoint directly, so every rule is re-checked here, in the backend.
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

// Never serve a cached answer: the database can have changed.
export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

type ReviewBody = {
  restaurantId?: unknown;
  rating?: unknown;
  comment?: unknown;
};

export async function POST(request: Request) {
  let body: ReviewBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "The request body must be valid JSON." },
      { status: 400 }
    );
  }

  // Check 1: rating is a whole number between 1 and 5.
  if (
    typeof body.rating !== "number" ||
    !Number.isInteger(body.rating) ||
    body.rating < 1 ||
    body.rating > 5
  ) {
    return NextResponse.json(
      { error: "Rating must be a whole number between 1 and 5." },
      { status: 400 }
    );
  }

  // Check 2: comment is a non-empty string after trimming whitespace.
  if (typeof body.comment !== "string" || body.comment.trim().length === 0) {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 }
    );
  }

  // Check 3: the restaurant actually exists — this one is a database lookup.
  if (
    typeof body.restaurantId !== "number" ||
    !Number.isInteger(body.restaurantId)
  ) {
    return NextResponse.json(
      { error: "restaurantId must be a whole number." },
      { status: 400 }
    );
  }
  const matches = await sql`SELECT id FROM restaurants WHERE id = ${body.restaurantId}`;
  if (matches.length === 0) {
    return NextResponse.json(
      { error: `Restaurant ${body.restaurantId} does not exist.` },
      { status: 400 }
    );
  }

  // All checks passed — store exactly one fact: exactly one row.
  const inserted = (await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${body.restaurantId}, ${body.rating}, ${body.comment.trim()})
    RETURNING id
  `) as unknown as Array<{ id: number }>;

  return NextResponse.json(
    { success: true, reviewId: inserted[0].id },
    { status: 201 }
  );
}
