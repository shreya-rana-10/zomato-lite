// GET /api/restaurants — the index of every restaurant, with its stats
// computed fresh from the facts: COUNT(*), AVG(rating) rounded here, and
// each restaurant's newest review comment. LEFT JOIN so a restaurant with
// zero reviews still appears (with 0 and no average) instead of vanishing.
// The sort order is decided here too, in SQL — never in the browser.
import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

// Never serve a cached answer: the database can have changed.
export const dynamic = "force-dynamic";

const sql = neon(process.env.DATABASE_URL!);

type RestaurantListRow = {
  id: number;
  name: string;
  cuisine: string;
  area: string;
  total: number;
  average: unknown;
  latestReviewComment: string | null;
};

export async function GET() {
  const rows = (await sql`
    SELECT
      r.id,
      r.name,
      r.cuisine,
      r.area,
      COUNT(v.id)::int AS total,
      ROUND(AVG(v.rating)::numeric, 1) AS average,
      (
        SELECT comment
        FROM reviews
        WHERE restaurant_id = r.id
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      ) AS "latestReviewComment"
    FROM restaurants r
    LEFT JOIN reviews v ON v.restaurant_id = r.id
    GROUP BY r.id, r.name, r.cuisine, r.area
    ORDER BY total DESC, average DESC NULLS LAST, r.id ASC
  `) as unknown as RestaurantListRow[];

  return NextResponse.json(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      cuisine: row.cuisine,
      area: row.area,
      totalReviews: row.total,
      averageRating: row.average === null ? null : Number(row.average),
      latestReviewComment: row.latestReviewComment,
    }))
  );
}
