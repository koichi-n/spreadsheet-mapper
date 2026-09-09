import { getMunicipalitiesForPref, isPrefCode } from "@/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ prefCode: string }> },
) {
  const { prefCode } = await params;
  if (!isPrefCode(prefCode)) {
    return Response.json({ error: "invalid pref code" }, { status: 400 });
  }

  const records = await getMunicipalitiesForPref(prefCode);
  return Response.json({ records });
}
