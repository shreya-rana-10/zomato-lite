// The page behind /restaurant/[id]: a thin wrapper that hands the restaurant
// id to the display layer. All actual work — fetching and printing — happens
// in the display layer via the API.
import RestaurantView from "@/components/RestaurantView";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RestaurantView id={Number(id)} />;
}
