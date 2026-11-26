import { plansJson } from "../../lib/plans";

export const dynamic = "force-static";

export function GET() {
  return new Response(plansJson(), { headers: { "Content-Type": "application/json; charset=utf-8" } });
}
