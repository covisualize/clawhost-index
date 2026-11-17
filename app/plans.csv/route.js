import { plansCsv } from "../../lib/plans";

// Built once at export time into out/plans.csv. See /data/ for what the columns mean.
export const dynamic = "force-static";

export function GET() {
  return new Response(plansCsv(), { headers: { "Content-Type": "text/csv; charset=utf-8" } });
}
