import type { Metadata } from "next";
import { APP_CONFIG } from "@/lib/app-config";
import { getPrefectureData } from "@/lib/get-prefecture-data";
import { MapApp } from "@/components/MapApp";

export const runtime = "nodejs";
export const revalidate = 300;

export const metadata: Metadata = {
  title: APP_CONFIG.title,
  description: APP_CONFIG.description,
};

export default async function Page() {
  const data = await getPrefectureData();
  return <MapApp data={data} />;
}
