export const dynamic = "force-dynamic";

// The page behind /review/[restaurantId]: looks up the restaurant's name from
// cold storage so the reviewer knows what they are reviewing, then hands over
// to the form. No logic beyond that lookup lives here.
import { neon } from "@neondatabase/serverless";
import ReviewForm from "@/components/ReviewForm";

type RestaurantRow = { id: number; name: string; cuisine: string; area: string };

const sql = neon(process.env.DATABASE_URL!);

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;
  const id = Number(restaurantId);
  const rows = Number.isInteger(id)
    ? ((await sql`SELECT id, name, cuisine, area FROM restaurants WHERE id = ${id}`) as unknown as RestaurantRow[])
    : [];

  if (rows.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-[560px] px-6 py-24">
        <p className="font-display text-2xl">
          There is no restaurant called “{restaurantId}”.
        </p>
      </main>
    );
  }

  const restaurant = rows[0];

  return (
    <main className="mx-auto min-h-screen max-w-[560px] px-6 pb-24 pt-12 sm:pt-16">
      <ReviewForm
        restaurantId={restaurant.id}
        name={restaurant.name}
        area={restaurant.area}
      />
    </main>
  );
}
