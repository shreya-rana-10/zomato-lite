// Prints a timestamp as "28 Oct, 7:03 pm".
// Pure formatting of one fact — no facts are created, combined or computed here.
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const clock = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${dayMonth.format(date)}, ${clock.format(date).toLowerCase()}`;
}
