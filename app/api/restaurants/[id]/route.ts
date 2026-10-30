// GET /api/restaurants/[id] — the kitchen's answer to "load the restaurant page".
// Nothing here is stored: the average and the count are computed from facts
// (AVG, COUNT) at the moment this endpoint is asked. That is the whole lesson.
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

// Never serve a cached answer: the database can have changed.
export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

type RestaurantRow = { id: number; name: string; cuisine: string; area: string };
type ReviewRow = { id: number; rating: number; comment: string; created_at: string | Date };
type Review = { id: number; rating: number; comment: string; createdAt: string };

function toIso(value: string | Date): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    return NextResponse.json(
      { error: `No restaurant called "${rawId}".` },
      { status: 404 }
    );
  }

  const restaurantRows = (await sql`
    SELECT id, name, cuisine, area FROM restaurants WHERE id = ${id}
  `) as unknown as RestaurantRow[];
  if (restaurantRows.length === 0) {
    return NextResponse.json(
      { error: `Restaurant ${rawId} does not exist.` },
      { status: 404 }
    );
  }
  const restaurant = restaurantRows[0];

  // The average: computed fresh from the facts, rounded to 1 decimal here in
  // the backend. There is no average_rating column — there will never be one.
  const averageRows = (await sql`
    SELECT ROUND(AVG(rating)::numeric, 1) AS average FROM reviews WHERE restaurant_id = ${id}
  `) as unknown as Array<{ average: unknown }>;
  const averageRaw = averageRows[0].average;

  const countRows = (await sql`
    SELECT COUNT(*)::int AS total FROM reviews WHERE restaurant_id = ${id}
  `) as unknown as Array<{ total: number }>;

  const reviewRows = (await sql`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${id}
    ORDER BY created_at DESC, id DESC
  `) as unknown as ReviewRow[];

  // Newest first. The first row becomes the highlighted "latest review";
  // all older rows go into the plain list, so nothing is printed twice.
  const reviews: Review[] = reviewRows.map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: toIso(row.created_at),
  }));

  // Empty case, decided out loud: with no reviews yet, the honest answers are
  // "no average exists" (null), "0 reviews", "no latest" (null), "no list" ([]).
  // We never want to display a fake 0.0 average for a restaurant nobody rated.
  return NextResponse.json({
    id: restaurant.id,
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating: averageRaw === null ? null : Number(averageRaw),
    totalReviews: countRows[0].total,
    latestReview: reviews[0] ?? null,
    reviews: reviews.slice(1),
  });
}
